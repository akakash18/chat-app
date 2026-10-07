import type { Conversation } from "../types";
import { getInitials } from "../utils";

type Props = {
  contact: Conversation;
};

export default function Avatar({ contact }: Props) {
  // console.log(contact);
  return (
    <div
      className={`relative flex h-11 w-11 items-center justify-center rounded-full font-bold text-white ${contact.avatarClass}`}
    >
      {/* Contact initials */}
      {getInitials(contact.name)}

      {/* Online / offline status */}
      <span
        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#faf9f6] ${
          contact.isOnline ? "bg-[#3aa76d]" : "bg-[#77736c]"
        }`}
      />
    </div>
  );
}
