
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Mail, Lock, User, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    };

    // Validate username
    if (!username.trim()) {
      newErrors.username = "Username is required.";
      valid = false;
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters.";
      valid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required.";
      valid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email.";
      valid = false;
    }

    // Validate password
    if (!password) {
      newErrors.password = "Password is required.";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
      valid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
      valid = false;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      const { error } = await signUp(email, password, username);
      
      if (error) {
        if (error.message.includes("already registered")) {
          setErrors({
            ...errors,
            email: "This email is already registered."
          });
        } else if (error.message.includes("username")) {
          setErrors({
            ...errors,
            username: "This username is already taken."
          });
        } else {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive"
          });
        }
        setIsLoading(false);
      } else {
        toast({
          title: "Sign up successful!",
          description: "Check your email for the confirmation link.",
        });
        navigate("/login");
      }
    }
  }

  return (
    <section className="flex flex-col items-center min-h-screen justify-center bg-gradient-to-br from-[#f1f0fb] via-[#e5deff] to-[#d3e4fd] animate-fade-in">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md flex flex-col items-center gap-4">
        <h2 className="text-2xl font-extrabold text-[#9b87f5] mb-2 flex items-center gap-2">
          <FileText size={24} /> Sign Up
        </h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="space-y-1">
            <label className="font-medium text-gray-700 flex items-center gap-2">
              <User size={18} /> Username
            </label>
            <Input
              value={username}
              placeholder="Choose a unique username"
              onChange={e => {
                setUsername(e.target.value);
                if (errors.username) setErrors({...errors, username: ""});
              }}
              className={errors.username ? "border-red-400" : ""}
              disabled={isLoading}
            />
            {errors.username && <span className="text-sm text-red-500">{errors.username}</span>}
          </div>
          
          <div className="space-y-1">
            <label className="font-medium text-gray-700 flex items-center gap-2">
              <Mail size={18} /> Email
            </label>
            <Input
              value={email}
              type="email"
              placeholder="Enter your email address"
              onChange={e => {
                setEmail(e.target.value);
                if (errors.email) setErrors({...errors, email: ""});
              }}
              className={errors.email ? "border-red-400" : ""}
              disabled={isLoading}
            />
            {errors.email && <span className="text-sm text-red-500">{errors.email}</span>}
          </div>
          
          <div className="space-y-1">
            <label className="font-medium text-gray-700 flex items-center gap-2">
              <Lock size={18} /> Password
            </label>
            <Input
              value={password}
              type="password"
              placeholder="Create a password"
              onChange={e => {
                setPassword(e.target.value);
                if (errors.password) setErrors({...errors, password: ""});
              }}
              className={errors.password ? "border-red-400" : ""}
              disabled={isLoading}
            />
            {errors.password && <span className="text-sm text-red-500">{errors.password}</span>}
          </div>
          
          <div className="space-y-1">
            <label className="font-medium text-gray-700 flex items-center gap-2">
              <Check size={18} /> Confirm Password
            </label>
            <Input
              value={confirmPassword}
              type="password"
              placeholder="Confirm your password"
              onChange={e => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({...errors, confirmPassword: ""});
              }}
              className={errors.confirmPassword ? "border-red-400" : ""}
              disabled={isLoading}
            />
            {errors.confirmPassword && <span className="text-sm text-red-500">{errors.confirmPassword}</span>}
          </div>
          
          <Button 
            type="submit" 
            className="mt-4 bg-[#9b87f5] hover:bg-[#7E69AB] text-white font-bold w-full rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? "Signing up..." : "Sign Up"}
          </Button>
          
          <div className="text-center mt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SignUp;
