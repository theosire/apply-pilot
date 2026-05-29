import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        await login(email, password);
        navigate("/board");
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-4">
            <input 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded border p-2"
            />

            <input 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                className="w-full rounded border p-2"
            />

            <button type="submit" className="w-full rounded bg-black px-4 py-2 text-white">Login</button>
        </form>
    );
};