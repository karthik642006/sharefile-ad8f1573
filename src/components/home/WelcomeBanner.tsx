
import React from "react";
import { File, Folder, Share, Instagram, Facebook, Whatsapp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { shareApp } from "@/utils/shareUtils";

export const WelcomeBanner = () => {
  const handleInviteFriends = async () => {
    try {
      // Try to use navigator.share with specific text to encourage sharing to social apps
      if (navigator.share) {
        await navigator.share({
          title: "ShareFile - Securely share your files",
          text: "Check out this amazing file sharing app!",
          url: window.location.origin
        });
        
        toast({
          title: "Share Options Displayed",
          description: "Choose an app to share with your friends",
        });
      } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(window.location.origin).then(() => {
          toast({
            title: "Link Copied",
            description: "App link copied to clipboard",
          });
        });
      }
    } catch (error) {
      console.error("Error sharing app:", error);
      
      // Final fallback to clipboard
      navigator.clipboard.writeText(window.location.origin).then(() => {
        toast({
          title: "Link Copied",
          description: "App link copied to clipboard",
        });
      });
    }
  };

  return (
    <div className="w-full max-w-xl mt-2 mb-16">
      <div className="rounded-xl bg-white/90 shadow-md p-6 flex flex-col items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#9b87f5] mb-2">
          Share Files Securely & Instantly
        </h1>
        <p className="text-lg text-gray-700 mb-2">
          <span className="font-semibold">sharefile.lovable.app</span> enables anyone to download files instantly — sign up to upload and share yours with unique links!
        </p>
        <p className="text-center text-gray-600 mb-4">Upload user files through online</p>
        <ul className="flex flex-wrap gap-x-7 gap-y-2 items-center justify-center mt-3 text-base text-gray-600">
          <li className="flex items-center gap-2"><File size={18} className="text-[#9b87f5]" /> Single file sharing</li>
          <li className="flex items-center gap-2"><Folder size={18} className="text-[#33C3F0]" /> Secure file transfer</li>
        </ul>
        <div className="w-full flex flex-col md:flex-row justify-center items-center gap-4 mt-4">
          <RouterLink to="/signup" className="w-full md:w-auto">
            <Button size="lg" className="w-full md:w-auto bg-[#9b87f5] hover:bg-[#7E69AB] text-white rounded-lg shadow-lg transition hover-scale font-bold">
              Get Started
            </Button>
          </RouterLink>
          <div className="w-full md:w-auto flex gap-2">
            <Button 
              variant="outline" 
              size="lg"
              className="flex items-center gap-2 w-full md:w-auto"
              onClick={handleInviteFriends}
            >
              <Share size={18} />
              Invite Friends
            </Button>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <Button variant="outline" size="icon" onClick={handleInviteFriends} className="rounded-full bg-white shadow-sm">
              <Whatsapp className="h-5 w-5 text-green-500" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleInviteFriends} className="rounded-full bg-white shadow-sm">
              <Facebook className="h-5 w-5 text-blue-600" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleInviteFriends} className="rounded-full bg-white shadow-sm">
              <Instagram className="h-5 w-5 text-pink-500" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
