
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string, username: string, profilePassword: string) => Promise<{ error: any | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  updateProfilePassword: (newPassword: string) => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    // Add auto-deletion check for downloaded files
    const checkDownloadedFilesExpiry = () => {
      const downloads = JSON.parse(localStorage.getItem('downloadedFiles') || '[]');
      const now = Date.now();
      const updatedDownloads = downloads.filter((item: any) => item.expiryTime > now);
      
      // If any files were expired and removed, notify the user
      if (downloads.length > updatedDownloads.length) {
        const deletedCount = downloads.length - updatedDownloads.length;
        toast({
          title: `${deletedCount} file(s) auto-deleted`,
          description: "Files have been deleted after 24 hours as scheduled",
        });
      }
      
      localStorage.setItem('downloadedFiles', JSON.stringify(updatedDownloads));
    };
    
    // Check on load and periodically
    checkDownloadedFilesExpiry();
    const interval = setInterval(checkDownloadedFilesExpiry, 60000); // Check every minute

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const signUp = async (email: string, password: string, username: string, profilePassword: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            profile_password: profilePassword
          }
        }
      });

      if (!error) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ profile_password: profilePassword })
          .eq('username', username);

        if (profileError) {
          toast({
            title: "Profile Password Error",
            description: profileError.message,
            variant: "destructive"
          });
        }
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!error) {
        navigate("/dashboard");
      }
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const updateProfilePassword = async (newPassword: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No authenticated user");
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ profile_password: newPassword })
        .eq('id', user.id);

      if (profileError) {
        toast({
          title: "Update Password Error",
          description: profileError.message,
          variant: "destructive"
        });
        return { error: profileError };
      }

      toast({
        title: "Success",
        description: "Profile password updated successfully",
      });
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      isLoading, 
      signUp, 
      signIn, 
      signOut,
      updateProfilePassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
