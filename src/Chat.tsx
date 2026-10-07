import { useEffect, useRef, useState } from "react";
import ConversationList from "./components/ConversationList";
import ChatWindow from "./components/ChatWindow";
import { supabase } from "./lib/supabase";
import { getReply, type Reply } from "./replies";
import type { Conversation } from "./types";

type Props = {
  username: string;
  onLogout: () => void;
};

export default function Chat({ username, onLogout }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const ownerId = useRef<string | null>(null);
  const replies = useRef<Reply[]>([]);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  const [activeId, setActiveId] = useState<number | null>(null);

  const activeIdRef = useRef<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const messageId = useRef(
    Math.max(
      0,
      ...conversations.flatMap((chat) =>
        chat.messages.map((message) => message.id),
      ),
    ) + 1,
  );

  // console.log("Next message ID:", messageId.current);

  // Load conversations and reply rules
  useEffect(() => {
    let cancelled = false;

    async function loadConversations() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Please log in again.");

      const [chats, rules] = await Promise.all([
        supabase.from("conversations").select("data").eq("user_id", user.id).maybeSingle(),
        supabase.from("replies").select("contactId, keywords, message").order("id"),
      ]);

      if (chats.error) throw chats.error;
      if (rules.error) throw rules.error;
      if (cancelled) return;

      const saved: Conversation[] = chats.data?.data ?? [];
      let nextId = Math.max(0, ...saved.flatMap((chat) => chat.messages.map((message) => message.id))) + 1;
      const usedIds = new Set<number>();
      const conversations = saved.map((chat) => ({
        ...chat,
        isTyping: false,
        messages: chat.messages.map((message) => {
          const id = usedIds.has(message.id) ? nextId++ : message.id;
          usedIds.add(id);
          return { ...message, id };
        }),
      }));

      ownerId.current = user.id;
      replies.current = rules.data ?? [];
      messageId.current = nextId;
      setConversations(conversations);
      setLoaded(true);
    }

    loadConversations().catch((error) => {
      if (!cancelled) setError(error.message);
    });

    return () => { cancelled = true; };
  }, [username]);

  // Save conversations in order
  useEffect(() => {
    if (!loaded || !ownerId.current) return;

    const userId = ownerId.current;
    const data = conversations.map((chat) => ({ ...chat, isTyping: false }));

    saveQueue.current = saveQueue.current.then(async () => {
      const { error } = await supabase.from("conversations").upsert({
        user_id: userId,
        data,
      });

      setError(error ? error.message : "");
    }).catch((error) => setError(error.message));
  }, [conversations, loaded]);

  // Clear timers
  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []);

  // Update one conversation
  function updateChat(
    id: number,
    update: (chat: Conversation) => Conversation,
  ) {
    setConversations((chats) =>
      chats.map((chat) => (chat.id === id ? update(chat) : chat)),
    );
  }

  // Open conversation
  function openChat(id: number) {
    setActiveId(id);
    activeIdRef.current = id;
    // console.log("Opened conversation:", id);

    updateChat(id, (chat) => ({
      ...chat,
      unreadCount: 0,
    }));
  }

  // Close conversation
  function closeChat() {
    setActiveId(null);
    activeIdRef.current = null;
  }

  // Add message
  function addMessage(chatId: number, sender: "me" | "them", text: string) {
    const newMessage = {
      id: messageId.current++,
      sender,
      text,
      timestamp: Date.now(),
    };

    updateChat(chatId, (chat) => ({
      ...chat,
      messages: [...chat.messages, newMessage],
      unreadCount:
        sender === "them" && activeIdRef.current !== chatId
          ? chat.unreadCount + 1
          : chat.unreadCount,
    }));
  }

  // Send message
  function sendMessage(text: string) {
    const message = text.trim();

    if (!message || activeId === null) return;

    const chat = conversations.find((chat) => chat.id === activeId);

    if (!chat) return;

    addMessage(chat.id, "me", message);

    if (!chat.isOnline) return;

    const reply = getReply(chat.id, message, replies.current);

    if (!reply) return;

    // Show typing
    const typingTimer = setTimeout(() => {
      updateChat(chat.id, (chat) => ({
        ...chat,
        isTyping: true,
      }));
    }, 700);

    timers.current.push(typingTimer);

    // Send reply
    const replyTimer = setTimeout(() => {
      updateChat(chat.id, (chat) => ({
        ...chat,
        isTyping: false,
      }));

      addMessage(chat.id, "them", reply);
    }, 2500);

    timers.current.push(replyTimer);
  }

  const activeChat = conversations.find((chat) => chat.id === activeId);

  return (
    <div className="flex h-full w-full bg-[#faf9f6]">
      {error && (
        <p role="alert" className="absolute bottom-4 left-4 z-10 rounded-xl bg-white p-3 text-sm text-[#d95757]">
          {error}
        </p>
      )}
      <ConversationList
        conversations={conversations}
        activeId={activeId}
        onOpen={openChat}
        username={username}
        onLogout={onLogout}
      />

      {activeChat ? (
        <ChatWindow
          key={activeChat.id}
          conversation={activeChat}
          onSend={sendMessage}
          onClose={closeChat}
        />
      ) : (
        <div className="chat-window hidden flex-1 place-items-center md:grid">
          <div className="text-center">
            <p className="text-lg font-medium text-[#9552e3]">
              Choose a conversation
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Select a chat from the list to start messaging.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
