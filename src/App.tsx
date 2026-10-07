import Chat from "./Chat";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";

function Auth() {
  const { user, logout } = useAuth();

  if (!user) return <Login />;

  return <Chat key={user} username={user} onLogout={logout} />;
}

export default function App() {
  return (
    <AuthProvider>
      <Auth />
    </AuthProvider>
  );
}