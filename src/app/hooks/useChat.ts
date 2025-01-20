import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
interface UseChatProps {
  chatId?: string;
  api: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const useChat = ({ chatId, api }: UseChatProps) => {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setValue("");

    setMessages((prevMessages) => [
      ...prevMessages,
      { id: uuidv4(), role: "user", content: value },
    ]);

    const response = await fetch(api, {
      method: "POST",
      body: JSON.stringify({ chatId, message: value }),
    });
    const data = await response.json();

    setMessages((prevMessages) => [
      ...prevMessages,
      { id: data.id, role: "assistant", content: data.content },
    ]);
  };

  return {
    messages,
    value,
    onChange: setValue,
    handleSubmit,
  };
};

export default useChat;
