
import React from "react";
import { File, Folder, Search, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { shareApp } from "@/utils/shareUtils";

export const WelcomeBanner = () => {
  const handleInviteFriends = async () => {
    try {
      const result = await shareApp();
      if (result.success) {
        toast({
          title: "App Shared!",
          description: result.message,
        });
      } else {
        toast({
          title: "Sharing Failed",
          description: "Could not share app, the link has been copied to clipboard instead",
        });
      }
    } catch (error) {
      console.error("Error sharing app:", error);
      // Final fallback
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
            onClick={handleInviteFriends}
          >
            <Share size={18} />
            Invite Friends
          </Button>
        </div>
      </div>
    </div>
  );
};
