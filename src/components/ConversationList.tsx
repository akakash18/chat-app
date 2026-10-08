import { useState } from "react";
import { Search, LogOut } from "lucide-react";
import Avatar from "./Avatar";
import type { Conversation } from "../types";
import { formatDay } from "../utils";

type Props = {
  conversations: Conversation[];
  activeId: number | null;
  onOpen: (id: number) => void;
  username: string;
  onLogout: () => void;
};

export default function ConversationList({
  conversations,
  activeId,
  onOpen,
  username,
  onLogout,
}: Props) {
  const [search, setSearch] = useState("");

  // Filter conversations by name or message
  const filteredChats = conversations.filter((chat) => {
    const text = search.toLowerCase().trim();
    // console.log(chat.name);
    // console.log(chat.messages);

    return (
      chat.name.toLowerCase().includes(text) ||
      chat.messages.some((message) => message.text.toLowerCase().includes(text))
    );
  });

  return (
    <div
      className={`${
        activeId === null ? "flex" : "hidden"
      } min-h-0 w-full shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm md:flex md:w-85`}
    >
      {/* Header */}
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-[#9552e3]">
            All Conversations
          </h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#9552e3]" />

          <input
            type="search"
            placeholder="Search conversations"
            aria-label="Search conversations"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#9552e3] py-2.5 pl-10 pr-3"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-2">
        {filteredChats.length === 0 && (
          <p className="p-4 text-center text-[#77736c]">
            No conversations found.
          </p>
        )}

        {filteredChats.map((chat) => {
          const lastMessage = chat.messages.at(-1);

          return (
            <button
              key={chat.id}
              onClick={() => onOpen(chat.id)}
              className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left hover:bg-[#ebe8e2] ${
                activeId === chat.id ? "bg-[#e3def2]" : ""
              }`}
            >
              <Avatar contact={chat} />

              <div className="min-w-0 flex-1">
                {/* Name and date */}
                <div className="flex justify-between gap-2">
                  <span className="truncate font-medium text-[#9552e3]">
                    {chat.name}
                  </span>

                  {lastMessage && (
                    <span className="text-xs text-[#77736c]">
                      {formatDay(lastMessage.timestamp)}
                    </span>
                  )}
                </div>

                {/* Last message and unread count */}
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm text-[#77736c]">
                    {chat.isTyping
                      ? "Typing..."
                      : lastMessage?.sender === "me"
                        ? `You: ${lastMessage.text}`
                        : lastMessage?.text}
                  </span>

                  {chat.unreadCount > 0 && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#d95757] px-1 text-xs font-bold text-white">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <button
        onClick={onLogout}
        title={`Log out (${username})`}
        aria-label={`Log out ${username}`}
        className="mx-auto my-4 flex items-center justify-center gap-1 rounded-full border border-[#9552e3] px-4 py-2 text-[#9552e3] hover:bg-[#ebe8e2]"
      >
        <LogOut className="size-5" />
        <span>Logout</span>
      </button>
    </div>
  );
}
