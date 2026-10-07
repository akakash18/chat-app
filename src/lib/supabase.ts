import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Keep the Supabase session across reloads without browser local storage.
const storage = {
  getItem(key: string) {
    const cookies = document.cookie.split("; ");
    let value = "";

    for (let index = 0; ; index++) {
      const prefix = `${key}.${index}=`;
      const cookie = cookies.find((cookie) => cookie.startsWith(prefix));

      if (!cookie) break;
      value += cookie.slice(prefix.length);
    }

    return value ? decodeURIComponent(value) : null;
  },
  setItem(key: string, value: string) {
    this.removeItem(key);
    const encoded = encodeURIComponent(value);
    const secure = location.protocol === "https:" ? "; Secure" : "";

    for (let index = 0; index * 3000 < encoded.length; index++) {
      document.cookie = `${key}.${index}=${encoded.slice(index * 3000, (index + 1) * 3000)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
    }
  },
  removeItem(key: string) {
    for (const cookie of document.cookie.split("; ")) {
      const name = cookie.split("=")[0];

      if (name.startsWith(`${key}.`)) {
        document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
      }
    }
  },
};

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  { auth: { storage } },
);
