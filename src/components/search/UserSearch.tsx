
import React, { useState, useEffect } from "react";
import { Search, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserSearch } from "@/hooks/useUserSearch";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  username: string;
  created_at: string;
  avatar_url?: string | null;
}

export const UserSearch = () => {
  const [userSearch, setUserSearch] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<{id: string, username: string} | null>(null);
  const [profilePassword, setProfilePassword] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const { searchUsers, results, isSearching, error } = useUserSearch();
  const navigate = useNavigate();

  useEffect(() => {
    // Add debounce to prevent constant re-rendering during typing
    const timer = setTimeout(() => {
      if (userSearch) {
        searchUsers(userSearch);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [userSearch, searchUsers]);

  const handleViewProfile = async (profile: {id: string, username: string}) => {
    setSelectedProfile(profile);
    setIsPasswordDialogOpen(true);
  };

  const verifyProfilePassword = async () => {
    if (!selectedProfile) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_password')
        .eq('id', selectedProfile.id)
        .single();

      if (error) throw error;

      if (data.profile_password === profilePassword) {
        setIsPasswordDialogOpen(false);
        navigate(`/profile?id=${selectedProfile.id}`);
      } else {
        toast({
          title: "Access Denied",
          description: "Incorrect profile password",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not verify profile password",
        variant: "destructive"
      });
    }
  };

  // Use a stable key for list items to prevent flickering
  const getProfileKey = (profile: Profile) => `profile-${profile.id}`;

  return (
    <>
      <form className="w-full max-w-xl mb-8" onSubmit={(e) => e.preventDefault()}>
        <label className="block mb-1 font-semibold text-gray-600 text-lg">
          Search Usernames
        </label>
        <div className="flex items-center bg-white rounded-lg border shadow-sm px-3 py-2">
          <Search className="text-[#9b87f5] mr-2" size={22} />
          <input
            type="text"
            className="flex-1 bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
            placeholder="Search by username..."
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
          />
        </div>
        {isSearching && <div className="mt-2 text-sm text-gray-500">Searching...</div>}
        {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
        
        {results.length > 0 && (
          <div className="mt-3 bg-white border rounded-lg shadow-sm overflow-hidden">
            <h3 className="px-4 py-2 bg-gray-50 font-medium text-gray-700 border-b">Users</h3>
            <div className="max-h-60 overflow-y-auto">
              {results.map((profile) => (
                <div 
                  key={getProfileKey(profile)} 
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                >
                  <Avatar className="h-8 w-8 bg-[#9b87f5]">
                    {profile.avatar_url ? (
                      <AvatarImage 
                        src={supabase.storage.from('shared-files').getPublicUrl(profile.avatar_url).data.publicUrl} 
                        alt={profile.username} 
                      />
                    ) : (
                      <AvatarFallback className="text-white">
                        {profile.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{profile.username}</p>
                    <p className="text-xs text-gray-500">
                      Joined {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-[#9b87f5]"
                    onClick={() => handleViewProfile(profile)}
                  >
                    <UserIcon size={14} className="mr-1" /> View
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Profile Password</DialogTitle>
            <DialogDescription>
              Enter the profile password to view {selectedProfile?.username}'s profile
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Profile Password"
              value={profilePassword}
              onChange={(e) => setProfilePassword(e.target.value)}
            />
            <Button 
              onClick={verifyProfilePassword} 
              className="w-full bg-[#9b87f5] hover:bg-[#7E69AB]"
            >
              Verify Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
