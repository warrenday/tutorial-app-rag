import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAI } from "openai";
import { v4 as uuid } from "uuid";
import chunkText from "../helpers/chunkText";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const embeddingModel = "text-embedding-3-small";

const fetchIndex = async () => {
  const indexName = "chat-index";

  const { indexes = [] } = await pinecone.listIndexes();
  if (indexes.some((index) => index.name === indexName)) {
    return pinecone.index<IndexDocumentRequest["metadata"]>(indexName);
  }

  const newIndex = await pinecone.createIndex({
    name: indexName,
    dimension: 1536, // Set this to the dimension of OpenAI's `text-embedding-3-small`
    spec: {
      serverless: {
        cloud: "aws",
        region: "eu-west-1",
      },
    },
  });
  if (!newIndex) {
    throw new Error("Failed to create index");
  }

  return pinecone.index<IndexDocumentRequest["metadata"]>(newIndex.name);
};

interface IndexDocumentRequest {
  id: string;
  values: number[];
  metadata: {
    text: string;
    chatId: string;
  };
}

const chatService = {
  indexDocument: async (text: string): Promise<string> => {
    const chatId = uuid();

    // 1. Chunk text
    const chunks = chunkText(text, 1000, 200);

    // 2. Embed chunks
    const indexRequests: IndexDocumentRequest[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const res = await openai.embeddings.create({
        input: chunk,
        model: embeddingModel,
      });

      indexRequests.push({
        id: `chunk-${i}`,
        metadata: {
          text: chunk,
          chatId,
        },
        values: res.data[0].embedding,
      });
    }

    // 3. Upsert chunks
    const pcIndex = await fetchIndex();
    await pcIndex.upsert(indexRequests);

    return chatId;
  },
  sendMessage: async (chatId: string, message: string): Promise<string> => {
    const embeddingResponse = await openai.embeddings.create({
      input: message,
      model: embeddingModel,
    });

    const pcIndex = await fetchIndex();
    const queryResponse = await pcIndex.query({
      vector: embeddingResponse.data[0].embedding,
      topK: 10,
      includeMetadata: true,
      filter: {
        chatId: {
          $eq: chatId || "unknown",
        },
      },
    });

    const prompt = `
      You are a helpful assistant please answer the following question:

      ${message}

      Here are the relevant chunks of information with their scores. Please prioritize results with higher scores when answering the question.
      
      ${queryResponse.matches.map(
        (match) =>
          `<chunk score="${match.score}">
            ${match.metadata?.text}
          </chunk>`
      )}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content!;
  },
};

export default chatService;
