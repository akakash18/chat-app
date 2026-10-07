import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Avatar from "./Avatar";
import type { Conversation } from "../types";
import { formatTime } from "../utils";

type Props = {
  conversation: Conversation;
  onSend: (text: string) => void;
  onClose: () => void;
};

export default function ChatWindow({ conversation, onSend, onClose }: Props) {
  const [message, setMessage] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest message
  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
    });
  }, [conversation.messages, conversation.isTyping]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const text = message.trim();

    if (!text) return;

    onSend(text);
    setMessage("");
  }

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col chat-window">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-[#dedbd5] bg-[#faf9f6]/85 p-3 shadow-sm backdrop-blur-md">
        <Avatar contact={conversation} />

        <div className="flex-1">
          <h2 className="font-medium">{conversation.name}</h2>

          <p className="text-sm text-[#77736c]">
            {conversation.isTyping
              ? "Typing..."
              : conversation.isOnline
                ? "Online"
                : "Offline"}
          </p>
        </div>

        <button
          onClick={onClose}
          aria-label="Back to conversations"
          className="px-3 py-2 text-xl text-[#9552e3]"
        >
          ✕
        </button>
      </header>

      {/* Messages */}
      <div
        ref={messagesRef}
        role="log"
        aria-label="Messages"
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4"
      >
        {conversation.messages.map((item) => (
          <div
            key={item.id}
            className={`max-w-[85%] rounded-xl p-3 sm:max-w-[75%] ${
              item.sender === "me"
                ? "self-end bg-[#6654a8] text-white"
                : "self-start bg-[#faf9f6]"
            }`}
          >
            <p className="whitespace-pre-wrap [wrap:anywhere]">{item.text}</p>

            <small className="block text-right text-xs opacity-60">
              {formatTime(item.timestamp)}
            </small>
          </div>
        ))}

        {conversation.isTyping && (
          <div role="status" className="self-start rounded-xl bg-[#faf9f6] p-3">
            Typing...
          </div>
        )}
      </div>

      {/* Message input */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-[#dedbd5] bg-[#faf9f6]/85 p-3 py-6 backdrop-blur-md"
      >
        <input
          type="text"
          aria-label="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a message..."
          className="min-w-0 flex-1 rounded-full border border-[#9552e3] bg-[#f3edfa]/80 px-4 py-2"
        />

        <button
          type="submit"
          disabled={!message.trim()}
          className="rounded-full bg-[#6654a8] px-5 text-white disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </main>
  );
}
