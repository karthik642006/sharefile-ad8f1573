
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Both fields are required.");
      return;
    }
    setError("");
    // Normally, authentication logic goes here
    navigate("/dashboard");
  }

  return (
    <section className="flex flex-col items-center min-h-screen justify-center bg-gradient-to-br from-[#f1f0fb] via-[#e5deff] to-[#d3e4fd] animate-fade-in">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md flex flex-col items-center gap-4">
        <h2 className="text-2xl font-extrabold text-[#9b87f5] mb-2 flex items-center gap-2">
          <FileText size={24} /> Login
        </h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <label className="font-medium text-gray-700">Username</label>
          <Input
            value={username}
            placeholder="Enter your username"
            onChange={e => setUsername(e.target.value)}
          />
          <label className="font-medium text-gray-700 mt-2">Password</label>
          <Input
            value={password}
            type="password"
            placeholder="Password"
            onChange={e => setPassword(e.target.value)}
          />
          <Button type="submit" className="mt-4 bg-[#9b87f5] hover:bg-[#7E69AB] text-white font-bold w-full rounded-lg">
            Login
          </Button>
          {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
          <div className="text-center mt-2">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-500 hover:underline">Sign Up</Link>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Login;
