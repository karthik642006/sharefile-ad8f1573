
import React, { useState } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export const PasswordSection = () => {
  const [newProfilePassword, setNewProfilePassword] = useState("");
  const [profilePasswordMode, setProfilePasswordMode] = useState<'view' | 'edit'>('view');
  const { updateProfilePassword } = useAuth();

  async function handleProfilePasswordEdit() {
    if (!newProfilePassword) {
      toast({
        title: "Error",
        description: "New profile password cannot be empty",
        variant: "destructive"
      });
      return;
    }

    const { error } = await updateProfilePassword(newProfilePassword);

    if (!error) {
      toast({
        title: "Success",
        description: "Profile password updated successfully",
      });
      setProfilePasswordMode('view');
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <KeyRound className="mr-2 text-[#9b87f5]" size={20} /> 
        Profile Password
      </h3>
      {profilePasswordMode === 'view' ? (
        <div className="flex items-center justify-between">
          <span className="text-gray-600">********</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setProfilePasswordMode('edit')}
            className="text-[#9b87f5]"
          >
            Change Password
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Input
            type="password"
            placeholder="Enter new profile password"
            value={newProfilePassword}
            onChange={(e) => setNewProfilePassword(e.target.value)}
            className="w-full"
          />
          <div className="flex gap-2">
            <Button 
              onClick={handleProfilePasswordEdit} 
              className="bg-[#9b87f5] hover:bg-[#7E69AB]"
            >
              Save New Password
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setProfilePasswordMode('view')}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
