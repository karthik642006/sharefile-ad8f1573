
import React, { useRef, useState, useEffect } from "react";
import { User, Edit, File, Folder, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProfileData {
  id: string;
  username: string;
  created_at: string;
}

interface FileData {
  id: string;
  filename: string;
  created_at: string;
  downloads: number;
  file_path: string;
}

const Profile = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userFiles, setUserFiles] = useState<FileData[]>([]);
  const [bio, setBio] = useState("I share photos, docs, and more!");
  const [editingBio, setEditingBio] = useState(false);
  const [profileImg, setProfileImg] = useState<string | undefined>();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const imgInput = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const profileId = queryParams.get('id') || (user ? user.id : null);

  useEffect(() => {
    if (!profileId) {
      setError("No profile specified");
      setIsLoadingProfile(false);
      return;
    }
    
    async function fetchProfileData() {
      try {
        setIsLoadingProfile(true);
        
        // Get profile data
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single();
          
        if (error) throw error;
        
        setProfileData(data);
        
        // Fetch user's files if viewing the profile
        await fetchUserFiles(profileId);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching profile:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    }
    
    async function fetchUserFiles(userId: string) {
      try {
        setIsLoadingFiles(true);
        
        // Get user's files
        const { data, error } = await supabase
          .from('shared_files')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setUserFiles(data || []);
      } catch (err) {
        console.error("Error fetching files:", err);
      } finally {
        setIsLoadingFiles(false);
      }
    }
    
    fetchProfileData();
  }, [profileId]);

  function handleBioEdit() {
    if (user && profileData && user.id === profileData.id) {
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
    // In a real implementation, save bio to the database
  }

  function handleProfileImgChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImg(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
      // In a real implementation, upload to Supabase storage
    }
  }

  function getFileIcon(filename: string) {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <File className="text-blue-500" size={20} />;
    } else if (['pdf'].includes(extension || '')) {
      return <File className="text-red-500" size={20} />;
    } else if (['doc', 'docx'].includes(extension || '')) {
      return <File className="text-[#2b579a]" size={20} />;
    } else if (['xls', 'xlsx'].includes(extension || '')) {
      return <File className="text-green-600" size={20} />;
    } else {
      return <File className="text-[#7E69AB]" size={20} />;
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b87f5]"></div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Profile</h2>
        <p>{error || 'Profile not found'}</p>
      </div>
    );
  }

  const isCurrentUser = user && user.id === profileData.id;

  return (
    <section className="flex flex-col items-center min-h-screen bg-gradient-to-b from-[#e5deff] to-[#f1f1f1] py-10 animate-fade-in">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center gap-4">
          {/* Profile picture with upload support */}
          <div
            className={`relative group ${isCurrentUser ? 'cursor-pointer' : ''}`}
            onClick={() => isCurrentUser && imgInput.current?.click()}
            tabIndex={isCurrentUser ? 0 : undefined}
          >
            <div className="rounded-full overflow-hidden w-24 h-24 border-4 border-[#dfd8fc] bg-gray-50 flex items-center justify-center transition hover:shadow-lg hover-scale">
              {profileImg ? (
                <img
                  src={profileImg}
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
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
          {/* Username */}
          <h2 className="text-2xl font-bold text-[#9b87f5]">{profileData.username}</h2>
          <p className="text-sm text-gray-500">
            Member since {new Date(profileData.created_at).toLocaleDateString()}
          </p>
          {/* Editable Bio */}
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
          <hr className="my-4 w-3/4 border-gray-200" />
          <h3 className="text-lg font-semibold mb-2">Uploaded Files</h3>
          <div className="w-full space-y-3">
            {isLoadingFiles ? (
              <div className="py-8 text-center text-gray-500">Loading files...</div>
            ) : userFiles.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No files uploaded yet</div>
            ) : (
              userFiles.map((file) => {
                // Get the file's public URL
                const { data } = supabase.storage
                  .from('shared-files')
                  .getPublicUrl(file.file_path);
                
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 bg-[#f8f6ff] rounded-md px-4 py-2 border"
                  >
                    {getFileIcon(file.filename)}
                    <div className="flex-1">
                      <span className="font-semibold">{file.filename}</span>
                      <div className="text-xs text-gray-500">
                        {file.downloads} downloads • {new Date(file.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <a 
                      href={data.publicUrl} 
                      download 
                      className="text-[#9b87f5] hover:underline text-sm"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
