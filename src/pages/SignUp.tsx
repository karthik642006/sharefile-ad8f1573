import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Mail, Lock, User, Check, KeyRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [confirmProfilePassword, setConfirmProfilePassword] = useState("");
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePassword: "",
    confirmProfilePassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { signUp, checkUsernameAvailability } = useAuth();

  // Handle username availability check
  useEffect(() => {
    const delayTimer = setTimeout(async () => {
      if (username && username.length >= 3) {
        setIsCheckingUsername(true);
        const available = await checkUsernameAvailability(username);
        setUsernameAvailable(available);
        setIsCheckingUsername(false);
        
        if (!available) {
          setErrors(prev => ({...prev, username: "This username is already taken."}));
        } else {
          setErrors(prev => ({...prev, username: ""}));
        }
      }
    }, 500);
    
    return () => clearTimeout(delayTimer);
  }, [username, checkUsernameAvailability]);

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      profilePassword: "",
      confirmProfilePassword: ""
    };

    if (!username.trim()) {
      newErrors.username = "Username is required.";
      valid = false;
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters.";
      valid = false;
    } else if (usernameAvailable === false) {
      newErrors.username = "This username is already taken.";
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required.";
      valid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email.";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Password is required.";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
      valid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
      valid = false;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match.";
      valid = false;
    }

    if (!profilePassword) {
      newErrors.profilePassword = "Profile password is required.";
      valid = false;
    } else if (profilePassword.length < 4) {
      newErrors.profilePassword = "Profile password must be at least 4 characters.";
      valid = false;
    }

    if (!confirmProfilePassword) {
      newErrors.confirmProfilePassword = "Please confirm your profile password.";
      valid = false;
    } else if (confirmProfilePassword !== profilePassword) {
      newErrors.confirmProfilePassword = "Profile passwords do not match.";
      valid = false;
    }

    setErrors({...errors, ...newErrors});
    return valid;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      const { error } = await signUp(email, password, username, profilePassword);
      
      if (error) {
        if (error.code === "USERNAME_TAKEN") {
          setErrors({
            ...errors,
            username: error.message
          });
          setUsernameAvailable(false);
        } else if (error.message?.includes("already registered")) {
          setErrors({
            ...errors,
            email: "This email is already registered."
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
          description: "Your account is ready. You can now log in.",
        });
        navigate("/login");
      }
    }
  }

  const renderUsernameStatus = () => {
    if (isCheckingUsername) {
      return <span className="text-sm text-yellow-500">Checking availability...</span>;
    } else if (usernameAvailable === true && username.length >= 3) {
      return <span className="text-sm text-green-500 flex items-center gap-1"><Check size={14} /> Username is available</span>;
    }
    return null;
  };

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
                setUsernameAvailable(null);
                if (errors.username) setErrors({...errors, username: ""});
              }}
              className={errors.username ? "border-red-400" : usernameAvailable ? "border-green-400" : ""}
              disabled={isLoading}
            />
            {errors.username ? (
              <span className="text-sm text-red-500">{errors.username}</span>
            ) : (
              renderUsernameStatus()
            )}
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
          
          <div className="space-y-1">
            <label className="font-medium text-gray-700 flex items-center gap-2">
              <KeyRound size={18} /> Profile Password
            </label>
            <Input
              value={profilePassword}
              type="password"
              placeholder="Create a profile password"
              onChange={e => {
                setProfilePassword(e.target.value);
                if (errors.profilePassword) setErrors({...errors, profilePassword: ""});
              }}
              className={errors.profilePassword ? "border-red-400" : ""}
              disabled={isLoading}
            />
            {errors.profilePassword && <span className="text-sm text-red-500">{errors.profilePassword}</span>}
          </div>
          
          <div className="space-y-1">
            <label className="font-medium text-gray-700 flex items-center gap-2">
              <Check size={18} /> Confirm Profile Password
            </label>
            <Input
              value={confirmProfilePassword}
              type="password"
              placeholder="Confirm profile password"
              onChange={e => {
                setConfirmProfilePassword(e.target.value);
                if (errors.confirmProfilePassword) setErrors({...errors, confirmProfilePassword: ""});
              }}
              className={errors.confirmProfilePassword ? "border-red-400" : ""}
              disabled={isLoading}
            />
            {errors.confirmProfilePassword && <span className="text-sm text-red-500">{errors.confirmProfilePassword}</span>}
          </div>
          
          <Button 
            type="submit" 
            className="mt-4 bg-[#9b87f5] hover:bg-[#7E69AB] text-white font-bold w-full rounded-lg"
            disabled={isLoading || isCheckingUsername}
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
