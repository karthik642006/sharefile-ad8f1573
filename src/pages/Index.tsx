
import React, { useState, useEffect } from "react";
import { Search, File, Folder, User as UserIcon, Lock, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useUserSearch } from "@/hooks/useUserSearch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { shareApp } from "@/utils/shareUtils";

const Index = () => {
  const [userSearch, setUserSearch] = useState("");
  const [fileSearch, setFileSearch] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<{id: string, username: string} | null>(null);
  const [profilePassword, setProfilePassword] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const { searchUsers, results, isSearching, error } = useUserSearch();
  const navigate = useNavigate();

  // Force refresh app version on first load
  useEffect(() => {
    // Add timestamp parameter to force reload assets
    if (window.performance && window.performance.navigation.type === 0) {
      // This is a fresh page load, not a refresh
      const cacheBuster = `?v=${new Date().getTime()}`;
      const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
      const scriptElements = document.querySelectorAll('script[src]');
      
      // Update CSS links
      linkElements.forEach(link => {
        const elem = link as HTMLLinkElement;
        if (elem.href && !elem.href.includes('?v=')) {
          elem.href = `${elem.href}${cacheBuster}`;
        }
      });
      
      // Update JS scripts
      scriptElements.forEach(script => {
        const elem = script as HTMLScriptElement;
        if (elem.src && !elem.src.includes('?v=')) {
          // Create a new script element
          const newScript = document.createElement('script');
          newScript.src = `${elem.src}${cacheBuster}`;
          elem.parentNode?.replaceChild(newScript, elem);
        }
      });
    }
  }, []);

  useEffect(() => {
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

  const handleShareAppLink = async () => {
    const shared = await shareApp();
    if (!shared) {
      // Fallback to clipboard if Web Share API is not available
      await navigator.clipboard.writeText(window.location.origin);
      toast({
        title: "App Link Copied!",
        description: "The link to sharefile.lovable.app has been copied to your clipboard",
      });
    }
  };

  return (
    <section className="min-h-screen flex flex-col md:flex-row items-stretch bg-gradient-to-br from-[#f1f0fb] via-[#e5deff] to-[#d3e4fd] animate-fade-in transition-all w-full">
      <div className="flex flex-1 flex-col items-center justify-start md:justify-center mt-10 md:mt-0 p-4 w-full">
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
                  <div key={profile.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b last:border-b-0">
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
        <form className="w-full max-w-xl mt-4 mb-10">
          <label className="block mb-1 font-semibold text-gray-600 text-lg">
            Search Files, Folders, or Documents
          </label>
          <div className="flex items-center bg-white rounded-lg border shadow-sm px-3 py-2">
            <Folder className="text-[#33C3F0] mr-2" size={22} />
            <input
              type="text"
              className="flex-1 bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
              placeholder="Search files, folders, documents..."
              value={fileSearch}
              onChange={e => setFileSearch(e.target.value)}
            />
            <File className="ml-2 text-[#7E69AB]" size={20} />
          </div>
        </form>
        <div className="w-full max-w-xl mt-2 mb-16">
          <div className="rounded-xl bg-white/90 shadow-md p-6 flex flex-col items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#9b87f5] mb-2">
              Share Files Securely & Instantly
            </h1>
            <p className="text-lg text-gray-700 mb-2">
              <span className="font-semibold">sharefile.lovable.app</span> enables anyone to download files instantly — sign up to upload and share yours with unique links!
            </p>
            <ul className="flex flex-wrap gap-x-7 gap-y-2 items-center justify-center mt-3 text-base text-gray-600">
              <li className="flex items-center gap-2"><File size={18} className="text-[#9b87f5]" /> Single file sharing</li>
              <li className="flex items-center gap-2"><Folder size={18} className="text-[#33C3F0]" /> Secure file transfer</li>
              <li className="flex items-center gap-2"><Search size={18} className="text-[#7E69AB]" /> Public search & download</li>
            </ul>
            <div className="w-full flex flex-col md:flex-row justify-center items-center gap-4 mt-4">
              <RouterLink to="/signup" className="w-full md:w-auto">
                <Button size="lg" className="w-full md:w-auto bg-[#9b87f5] hover:bg-[#7E69AB] text-white rounded-lg shadow-lg transition hover-scale font-bold">
                  Get Started
                </Button>
              </RouterLink>
              <Button 
                variant="outline" 
                size="lg"
                className="w-full md:w-auto flex items-center gap-2"
                onClick={handleShareAppLink}
              >
                <Link size={18} />
                Share App Link
              </Button>
            </div>
          </div>
        </div>
      </div>
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
    </section>
  );
};

export default Index;
