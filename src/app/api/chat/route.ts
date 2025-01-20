import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import chatService from "@/services/chatService";

export interface SendMessageRequest {
  chatId: string;
  message: string;
}

export interface SendMessageResponse {
  id: string;
  content: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SendMessageRequest;

    const content = await chatService.sendMessage(body.chatId, body.message);

    const response: SendMessageResponse = {
      id: uuidv4(),
      content,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Failed to process message" },
        { status: 500 }
      );
    }
  }
}
