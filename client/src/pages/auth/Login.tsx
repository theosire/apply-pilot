import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { PasswordInput } from "../../components/forms/PasswordInput";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
        await login(email, password);
        toast.success("Logged in successfully");
        navigate("/board", { replace: true });
    } catch (error: any) {
        setMessage(error.response?.data?.message || "Login failed.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-lg border bg-white p-6 shadow-sm"
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold">ApplyPilot</h1>
          <p className="text-sm text-gray-500">Log in to track your job search</p>
        </div>

        {message && (
          <p className="rounded border bg-gray-50 p-2 text-sm text-gray-700">
            {message}
          </p>
        )}

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded border p-2"
        />

        <PasswordInput value={password} onChange={setPassword} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm text-gray-500">
          No account?{" "}
          <Link to="/register" className="text-black underline">
            Register
          </Link>
        </p>
      </form>
    </main>
  );
};