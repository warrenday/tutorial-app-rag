import { NextResponse } from "next/server";
import pdf from "pdf-parse";
import chatService from "@/services/chatService";

export async function POST(req: Request) {
  try {
    // 1. Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 2. Save file to a temporary directory
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdf(buffer);
    const text = data.text;
    const chatId = await chatService.indexDocument(text);

    const response = {
      chatId,
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
