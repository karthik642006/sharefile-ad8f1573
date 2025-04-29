
import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ProfileHeaderProps {
  profileData: {
    id: string;
    username: string;
    created_at: string;
    avatar_url?: string;
  };
  profileImg?: string;
  setProfileImg: (url: string) => void;
}

export const ProfileHeader = ({ profileData, profileImg, setProfileImg }: ProfileHeaderProps) => {
  const [bio, setBio] = useState("I share photos, docs, and more!");
  const [editingBio, setEditingBio] = useState(false);
  const imgInput = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const isCurrentUser = user && user.id === profileData.id;

  function handleBioEdit() {
    if (isCurrentUser) {
      setEditingBio(true);
    } else {
      toast({
        title: "Unauthorized",
        description: "You can only edit your own profile",
        variant: "destructive"
      });
    }
  }

  function handleBioSave() {
    setEditingBio(false);
  }

  async function handleProfileImgChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    const file = e.target.files[0];
    
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImg(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      const filePath = `avatars/${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('shared-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Profile updated",
        description: "Your profile picture has been updated"
      });
      
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`relative group ${isCurrentUser ? 'cursor-pointer' : ''}`}
        onClick={() => isCurrentUser && imgInput.current?.click()}
        tabIndex={isCurrentUser ? 0 : undefined}
      >
        <div className="rounded-full overflow-hidden w-24 h-24 border-4 border-[#dfd8fc] bg-gray-50 flex items-center justify-center transition hover:shadow-lg hover-scale">
          {profileImg ? (
            <Avatar className="w-full h-full">
              <AvatarImage src={profileImg} alt="Profile" className="object-cover w-full h-full" />
              <AvatarFallback className="text-2xl text-white font-bold bg-[#9b87f5]">
                {profileData.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="w-full h-full bg-[#9b87f5]">
              <AvatarFallback className="text-2xl text-white font-bold">
                {profileData.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          {isCurrentUser && (
            <input
              ref={imgInput}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleProfileImgChange}
            />
          )}
        </div>
        {isCurrentUser && (
          <div className="absolute bottom-1 right-1 bg-[#9b87f5] text-white p-1 rounded-full shadow-lg opacity-80 group-hover:opacity-100">
            <Upload size={16} />
          </div>
        )}
      </div>
      <h2 className="text-2xl font-bold text-[#9b87f5]">{profileData.username}</h2>
      <p className="text-sm text-gray-500">
        Member since {new Date(profileData.created_at).toLocaleDateString()}
      </p>
      <div className="w-full flex items-center justify-center gap-2">
        {editingBio ? (
          <>
            <input
              className="flex-1 px-3 py-2 rounded border focus:outline-none border-[#9b87f5]"
              value={bio}
              onChange={e => setBio(e.target.value)}
              autoFocus
              onBlur={handleBioSave}
              onKeyDown={e => {
                if (e.key === "Enter") handleBioSave();
              }}
            />
            <Button size="sm" onClick={handleBioSave} className="bg-[#9b87f5] text-white">
              Save
            </Button>
          </>
        ) : (
          <>
            <p className="text-gray-600">{bio}</p>
            {isCurrentUser && (
              <Button variant="ghost" size="icon" onClick={handleBioEdit}>
                <Edit className="text-[#9b87f5]" size={18} />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
