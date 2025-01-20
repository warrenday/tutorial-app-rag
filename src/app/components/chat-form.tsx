"use client";

import { AutoResizeTextarea } from "./autoresize-textarea";
import ArrowUp from "../icons/ArrowUp";
import useChat from "../hooks/useChat";

interface ChatFormProps {
  chatId?: string;
}

export function ChatForm({ chatId }: ChatFormProps) {
  const { messages, value, onChange, handleSubmit } = useChat({
    api: "/api/chat",
    chatId,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            data-role={message.role}
            className="max-w-[80%] rounded-xl px-3 py-2 text-sm data-[role=assistant]:self-start data-[role=user]:self-end data-[role=assistant]:bg-gray-100 data-[role=user]:bg-blue-500 data-[role=assistant]:text-black data-[role=user]:text-white"
          >
            {message.content}
          </div>
        ))}
      </div>
      <form
        onSubmit={handleSubmit}
        className="border-input bg-background focus-within:ring-ring/10 relative mx-6 mb-6 flex items-center rounded-[16px] border px-3 py-1.5 pr-8 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-0"
      >
        <AutoResizeTextarea
          onKeyDown={handleKeyDown}
          onChange={onChange}
          value={value}
          placeholder="Enter a message"
          className="placeholder:text-muted-foreground flex-1 bg-transparent focus:outline-none"
        />
        <button
          type="submit"
          className="absolute right-1 bg-black text-white px-3 py-1 rounded-full"
        >
          <ArrowUp className="size-4" />
        </button>
      </form>
    </div>
  );
}
