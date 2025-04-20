
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Mock authentication data
const validUsers = [
  { email: "john@example.com", password: "password123" },
  { email: "jane@example.com", password: "password456" }
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email.trim() || !password) {
      setError("Both fields are required.");
      return;
    }
    
    // Check if user exists and password matches
    const user = validUsers.find(u => u.email === email.trim().toLowerCase());
    
    if (!user) {
      setError("No account found with this email.");
      return;
    }
    
    if (user.password !== password) {
      setError("Incorrect password.");
      return;
    }
    
    setError("");
    // In a real app, we would set the authenticated user in context/state here
    navigate("/dashboard");
  }

  return (
    <section className="flex flex-col items-center min-h-screen justify-center bg-gradient-to-br from-[#f1f0fb] via-[#e5deff] to-[#d3e4fd] animate-fade-in">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md flex flex-col items-center gap-4">
        <h2 className="text-2xl font-extrabold text-[#9b87f5] mb-2 flex items-center gap-2">
          <FileText size={24} /> Login
        </h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="space-y-1">
            <label className="font-medium text-gray-700 flex items-center gap-2">
              <Mail size={18} /> Email
            </label>
            <Input
              value={email}
              type="email"
              placeholder="Enter your email"
              onChange={e => {
                setEmail(e.target.value);
                setError("");
              }}
              className={error ? "border-red-400" : ""}
            />
          </div>
          
          <div className="space-y-1">
            <label className="font-medium text-gray-700 flex items-center gap-2">
              <Lock size={18} /> Password
            </label>
            <Input
              value={password}
              type="password"
              placeholder="Enter your password"
              onChange={e => {
                setPassword(e.target.value);
                setError("");
              }}
              className={error ? "border-red-400" : ""}
            />
          </div>
          
          <Button 
            type="submit" 
            className="mt-4 bg-[#9b87f5] hover:bg-[#7E69AB] text-white font-bold w-full rounded-lg"
          >
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
