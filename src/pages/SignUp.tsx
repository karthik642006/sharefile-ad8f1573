
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const usedUsernames = ["johndoe", "janedoe"]; // For mock validation

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [password, setPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) {
      setUsernameError("Username is required.");
      return;
    }
    if (usedUsernames.includes(username.trim().toLowerCase())) {
      setUsernameError("That username is already taken.");
      return;
    }
    setUsernameError("");
    setShowSuccess(true);
    setTimeout(() => {
      navigate("/profile");
    }, 1200);
  }

  return (
    <section className="flex flex-col items-center min-h-screen justify-center bg-gradient-to-br from-[#f1f0fb] via-[#e5deff] to-[#d3e4fd] animate-fade-in">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md flex flex-col items-center gap-4">
        <h2 className="text-2xl font-extrabold text-[#9b87f5] mb-2 flex items-center gap-2">
          <FileText size={24} /> Sign Up
        </h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <label className="font-medium text-gray-700">Username</label>
          <Input
            value={username}
            placeholder="Choose a unique username"
            onChange={e => {
              setUsername(e.target.value);
              setUsernameError("");
            }}
            className={usernameError ? "border-red-400" : ""}
          />
          {usernameError && <span className="text-sm text-red-500">{usernameError}</span>}
          <label className="font-medium text-gray-700 mt-2">Password</label>
          <Input
            value={password}
            type="password"
            placeholder="Password"
            onChange={e => setPassword(e.target.value)}
          />
          <Button type="submit" className="mt-4 bg-[#9b87f5] hover:bg-[#7E69AB] text-white font-bold w-full rounded-lg">
            Sign Up
          </Button>
          <div className="text-center mt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
          </div>
          {showSuccess && <div className="text-green-600 text-center mt-2">Sign up successful! Redirecting…</div>}
        </form>
      </div>
    </section>
  );
};

export default SignUp;
