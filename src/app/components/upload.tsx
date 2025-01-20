"use client";

import { useState } from "react";

interface UploadProps {
  onUpload: (chatId: string) => void;
}

const statusMap = {
  success: "Upload successful. Chat ready.",
  error: "Upload failed",
  uploading: "Uploading...",
};

export default function Upload({ onUpload }: UploadProps) {
  const [status, setStatus] = useState<
    "success" | "error" | "uploading" | null
  >(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setStatus("uploading");
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const { chatId } = await response.json();
      onUpload(chatId);
      setStatus("success");
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="mb-6 flex flex-col items-center gap-4">
      <label className="flex w-full cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 transition-colors hover:bg-gray-100">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-gray-600">
            Click to upload a PDF
          </span>
        </div>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>
      {status && (
        <p
          className={`text-sm ${(() => {
            if (status === "error") return "text-red-500";
            if (status === "success") return "text-green-500";
            return "text-gray-500";
          })()}`}
        >
          {statusMap[status]}
        </p>
      )}
    </div>
  );
}
