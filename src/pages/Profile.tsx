
import React, { useRef, useState, useEffect } from "react";
import { User, Edit, File, Folder, Upload, KeyRound, FileDown, Trash, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFileStorage } from "@/hooks/useFileStorage";

// Updated: Utility for time left (now for 24 hours)
function getTimeLeft(expires_at?: string | null) {
  if (!expires_at) return "Expired";
  const ms = new Date(expires_at).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  
  // For 24h format, show hours and minutes
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

interface ProfileData {
  id: string;
  username: string;
  created_at: string;
  avatar_url?: string;
}

interface FileData {
  id: string;
  filename: string;
  created_at: string;
  downloads: number;
  file_path: string;
  expires_at: string | null;
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
  const [profilePassword, setProfilePassword] = useState("");
  const [newProfilePassword, setNewProfilePassword] = useState("");
  const [profilePasswordMode, setProfilePasswordMode] = useState<'view' | 'edit'>('view');
  const [now, setNow] = useState(Date.now()); // For live countdown timer
  const imgInput = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { updateProfilePassword } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const profileId = queryParams.get('id') || (user ? user.id : null);
  const { deleteFile } = useFileStorage();

  // Periodically update 'now' for timers
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch profile & files
  useEffect(() => {
    if (!profileId) {
      setError("No profile specified");
      setIsLoadingProfile(false);
      return;
    }
    async function fetchProfileData() {
      try {
        setIsLoadingProfile(true);

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single();

        if (error) throw error;

        setProfileData(data);
        
        // Get the avatar URL if it exists
        if (data.avatar_url) {
          const { data: { publicUrl } } = supabase.storage
            .from('shared-files')
            .getPublicUrl(data.avatar_url);
          setProfileImg(publicUrl);
        }

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
    // refresh every 15 seconds to catch deleted/expired files
    const refreshInterval = setInterval(() => fetchUserFiles(profileId), 15000);
    return () => clearInterval(refreshInterval);
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
  }

  async function handleProfileImgChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    const file = e.target.files[0];
    
    try {
      // Show local preview first
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImg(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to storage
      const filePath = `avatars/${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('shared-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Update profile with avatar URL
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

  // Delete file
  async function handleDeleteFile(file: FileData) {
    if (!user || user.id !== profileId) return;
    const confirm = window.confirm("Are you sure you want to delete this file?");
    if (!confirm) return;
    const { error } = await deleteFile({ id: file.id, file_path: file.file_path });
    if (!error) {
      setUserFiles(prev => prev.filter(f => f.id !== file.id));
      toast({ title: "Deleted", description: "File deleted successfully." });
    } else {
      toast({
        title: "Delete Failed",
        description: (error as Error).message,
        variant: "destructive"
      });
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
    <section className="flex flex-col items-center min-h-screen w-full bg-gradient-to-b from-[#e5deff] to-[#f1f1f1] py-10 animate-fade-in px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 flex flex-col items-center gap-4">
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
          <hr className="my-4 w-3/4 border-gray-200" />
          <h3 className="text-lg font-semibold mb-2">Uploaded Files</h3>
          <div className="w-full space-y-3">
            {isLoadingFiles ? (
              <div className="py-8 text-center text-gray-500">Loading files...</div>
            ) : userFiles.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No files uploaded yet</div>
            ) : (
              userFiles.map((file) => {
                // Only show if file not expired
                const expired = file.expires_at && new Date(file.expires_at).getTime() < now;
                if (expired) return null;

                const { data } = supabase.storage
                  .from('shared-files')
                  .getPublicUrl(file.file_path);

                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 bg-[#f8f6ff] rounded-md px-4 py-2 border relative"
                  >
                    {getFileIcon(file.filename)}
                    <div className="flex-1">
                      <span className="font-semibold">{file.filename}</span>
                      <div className="text-xs text-gray-500">
                        {file.downloads} downloads • {new Date(file.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-sm text-orange-500">
                        <Clock size={14} />
                        <span>
                          Auto-deletes in {getTimeLeft(file.expires_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <a
                        href={data.publicUrl}
                        download
                        className="text-[#9b87f5] hover:underline p-2"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Download file (will auto-delete after 24h from upload)"
                      >
                        <FileDown size={18} />
                      </a>
                      {isCurrentUser && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteFile(file)} 
                          className="text-red-500" 
                          aria-label="Delete file"
                        >
                          <Trash size={18}/>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      {isCurrentUser && (
        <div className="w-full max-w-lg mt-4">
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
        </div>
      )}
    </section>
  );
};

export default Profile;
