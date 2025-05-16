
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { FileList } from "@/components/profile/FileList";
import { PasswordSection } from "@/components/profile/PasswordSection";
import { useFileStorage } from "@/hooks/useFileStorage";
import { ProfilePasswordAccess } from "@/components/profile/ProfilePasswordAccess";

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
  const [profileImg, setProfileImg] = useState<string | undefined>();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const { user } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const profileId = queryParams.get('id') || (user ? user.id : null);
  
  useEffect(() => {
    // If no profile ID from query params or current user,
    // show the password entry form
    if (!profileId) {
      setShowPasswordForm(true);
      setIsLoadingProfile(false);
      return;
    }
    
    fetchProfileData(profileId);
  }, [profileId]);

  const fetchProfileData = async (id: string) => {
    try {
      setIsLoadingProfile(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setProfileData(data);
      
      if (data.avatar_url) {
        const { data: { publicUrl } } = supabase.storage
          .from('shared-files')
          .getPublicUrl(data.avatar_url);
        setProfileImg(publicUrl);
      }

      await fetchUserFiles(id);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching profile:", err);
    } finally {
      setIsLoadingProfile(false);
    }
  }

  const fetchUserFiles = async (userId: string) => {
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

  const handleAccessWithPassword = async (profileData: ProfileData) => {
    setShowPasswordForm(false);
    await fetchProfileData(profileData.id);
  };

  if (showPasswordForm) {
    return <ProfilePasswordAccess onProfileAccessed={handleAccessWithPassword} />;
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
        <button 
          onClick={() => setShowPasswordForm(true)} 
          className="mt-4 bg-[#9b87f5] text-white px-4 py-2 rounded hover:bg-[#7E69AB] transition"
        >
          Try a different profile password
        </button>
      </div>
    );
  }

  const isCurrentUser = user && user.id === profileData.id;

  return (
    <section className="flex flex-col items-center min-h-screen w-full bg-gradient-to-b from-[#e5deff] to-[#f1f1f1] py-10 animate-fade-in px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 flex flex-col items-center gap-4">
          <ProfileHeader 
            profileData={profileData} 
            profileImg={profileImg} 
            setProfileImg={setProfileImg} 
          />
          <hr className="my-4 w-3/4 border-gray-200" />
          <h3 className="text-lg font-semibold mb-2">Uploaded Files</h3>
          <FileList 
            userFiles={userFiles} 
            setUserFiles={setUserFiles}
            profileId={profileData.id}
            isLoadingFiles={isLoadingFiles}
          />
        </div>
      </div>
      
      {isCurrentUser && (
        <div className="w-full max-w-lg mt-4">
          <PasswordSection />
        </div>
      )}
    </section>
  );
};

export default Profile;
