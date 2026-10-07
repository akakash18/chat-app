export type Reply = {
  keywords: string[];
  message: string;
  contactId?: number | null;
};

function cleanText(text: string): string {
  return text
    .toLowerCase()
    .replace(/['\u2019]/g, '') //"What's up" → "whats up"
    .replace(/[^a-z0-9]+/g, ' ') //"how are you?" → "how are you"
    .trim();
}

export function getReply(contactId: number, userMessage: string, replies: Reply[]): string | null {
  const message = ` ${cleanText(userMessage)} `;

  for (const reply of replies) {
    if (reply.contactId === contactId) {
      for (const keyword of reply.keywords) {
        if (message.includes(` ${cleanText(keyword)} `)) {
          return reply.message;
        }
      }
    }
  }

  for (const reply of replies) {
    if (!reply.contactId) {
      for (const keyword of reply.keywords) {
        if (message.includes(` ${cleanText(keyword)} `)) {
          return reply.message;
        }
      }
    }
  }

  return null;
}
