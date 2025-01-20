"use client";

import { useEffect, useState } from "react";
import { ChatForm } from "./components/chat-form";
import Upload from "./components/upload";

export default function Page() {
  const [chatId, setChatId] = useState<string | undefined>(undefined);

  // Sync chatId with query param
  useEffect(() => {
    const chatId = new URLSearchParams(window.location.search).get("chatId");
    if (chatId) {
      setChatId(chatId);
    }
  }, []);

  useEffect(() => {
    if (chatId) {
      window.history.pushState({}, "", `?chatId=${chatId}`);
    }
  }, [chatId]);

  return (
    <div className="flex flex-col h-screen max-w-xl mx-auto p-6">
      <Upload onUpload={setChatId} />
      <ChatForm chatId={chatId} />
    </div>
  );
}
