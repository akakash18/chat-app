import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(isLogin ? "register" : "login");
    setError("");
    setPassword("");
  }

  return (
    <div className="chat-window grid h-full place-items-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-md"
      >
        <h1 className="mb-1 text-2xl font-bold text-[#9552e3]">
          {isLogin ? "Login" : "Create Account"}
        </h1>

        <p className="mb-5 text-sm text-[#77736c]">
          {isLogin
            ? "Enter your details to continue."
            : "Create an account to start chatting."}
        </p>

        <label className="mb-1 block text-sm font-medium" htmlFor="username">
          Username
        </label>

        <input
          id="username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="mb-4 w-full rounded-xl border border-[#9552e3] px-3 py-2"
          required
        />

        <label className="mb-1 block text-sm font-medium" htmlFor="password">
          Password
        </label>

        <input
          id="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mb-4 w-full rounded-xl border border-[#9552e3] px-3 py-2"
          required
        />

        {error && (
          <p role="alert" className="mb-4 text-sm text-[#d95757]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !username.trim() || !password}
          className="w-full rounded-full bg-[#6654a8] py-2.5 text-white disabled:opacity-40"
        >
          {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
        </button>

        <button
          type="button"
          onClick={switchMode}
          className="mt-4 w-full text-center text-sm text-[#6654a8] underline"
        >
          {isLogin ? "Create a new account" : "Already have an account? Login"}
        </button>
      </form>
    </div>
  );
}
