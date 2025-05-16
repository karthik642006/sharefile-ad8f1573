
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { KeyRound } from "lucide-react";

interface ProfilePasswordAccessProps {
  onProfileAccessed: (profileData: any) => void;
}

export const ProfilePasswordAccess: React.FC<ProfilePasswordAccessProps> = ({ 
  onProfileAccessed 
}) => {
  const [profilePassword, setProfilePassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { accessProfileWithPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profilePassword.trim()) {
      toast({
        title: "Error",
        description: "Please enter a profile password",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await accessProfileWithPassword(profilePassword);
      
      if (error || !data) {
        toast({
          title: "Access Denied",
          description: error?.message || "Invalid profile password",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Access Granted",
        description: `Viewing ${data.username}'s profile`,
      });
      
      onProfileAccessed(data);
    } catch (err) {
      console.error("Error accessing profile:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#e5deff] to-[#f1f1f1] p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-[#f0ebff] rounded-full flex items-center justify-center mb-4">
            <KeyRound className="text-[#9b87f5]" size={28} />
          </div>
          <h2 className="text-2xl font-bold text-[#9b87f5] mb-2">Access Profile</h2>
          <p className="text-center text-gray-600">
            Enter a profile password to view shared files and information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Enter profile password"
              value={profilePassword}
              onChange={(e) => setProfilePassword(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#9b87f5] hover:bg-[#7E69AB]"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 w-4 h-4 border-t-2 border-b-2 border-white rounded-full"></span>
                Accessing...
              </span>
            ) : (
              "Access Profile"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
