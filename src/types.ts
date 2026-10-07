export type ChatMessage = {
  id: number;
  text: string;
  sender: string;
  timestamp: number;
};

export type Conversation = {
  id: number;
  name: string;
  avatarClass: string;
  isOnline: boolean;
  unreadCount: number;
  isTyping: boolean;
  messages: ChatMessage[];
};