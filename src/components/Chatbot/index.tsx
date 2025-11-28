/** biome-ignore-all assist/source/useSortedAttributes: <explanation> */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { RenderUI } from "~/components/RenderUI";

function ChatInput({
  value,
  onChange,
  onSend,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) {
          onSend();
        }
      }}
      className="flex border-t border-gray-300 p-2"
    >
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Type a message..."
        className="flex-grow border border-gray-300 rounded px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Chat input"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:bg-blue-300"
      >
        Send
      </button>
    </form>
  );
}

export default function Chatbot() {
  const { messages, sendMessage } = useChat();
  const [input, setInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage({
      text: input,
    });
    setInput("");
  };

  return (
    <div className="flex flex-col mx-auto h-screen p-4">
      <div className="flex-grow overflow-auto space-y-4 mb-4">
        {messages.map((message) => {
          console.log("message", message);

          return (
            <div
              key={message.id}
              className={`break-words rounded p-3 ${
                message.role === "user"
                  ? "bg-blue-100 self-end"
                  : "bg-gray-100 self-start"
              }`}
            >
              {message.parts.map((part, i) => {
                if (part.type === "text") {
                  return <span key={i}>{part.text}</span>;
                } else if (
                  part.type === "tool-generateUI" &&
                  part.output &&
                  "result" in part?.output
                ) {
                  return (
                    <RenderUI
                      key={i}
                      code={part.output?.result?.code}
                      metadata={{ deps: part.output?.result.deps }}
                    />
                  );
                }
                return null;
              })}
            </div>
          );
        })}
      </div>

      <ChatInput
        value={input}
        onChange={handleInputChange}
        onSend={handleSend}
      />
    </div>
  );
}
