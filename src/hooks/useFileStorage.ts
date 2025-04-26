import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export function useFileStorage() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

  const uploadFile = async (file: File) => {
    if (!user) {
      return { error: { message: "You must be logged in to upload files" } };
    }

    try {
      setIsUploading(true);
      setProgress(0);

      // Generate a unique file path
      const filePath = `${user.id}/${new Date().getTime()}-${file.name}`;

      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('shared-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      setProgress(1);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('shared-files')
        .getPublicUrl(filePath);
        
      // Check if user has an active subscription plan
      const { data: planData, error: planError } = await supabase
        .rpc('check_active_plan', { user_id: user.id });
        
      // Set expiry based on subscription plan
      let expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // Default: 24 hours
      let plan_expires_at = null;
        
      if (planData && planData.length > 0 && planData[0].has_plan) {
        const plan = planData[0];
        // If user has an active plan, set the plan_expires_at
        plan_expires_at = plan.expires_at;
        
        // Set file expiry based on plan type
        switch (plan.plan_type) {
          case '5day':
            expires_at = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
            break;
          case 'monthly':
            expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            break;
          case 'yearly':
            expires_at = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            // Keep default expiry for basic plan
            break;
        }
      }

      // Save file metadata to database
      const { error: dbError, data: fileData } = await supabase
        .from('shared_files')
        .insert({
          user_id: user.id,
          filename: file.name,
          file_path: filePath,
          expires_at: expires_at.toISOString(),
          plan_expires_at: plan_expires_at,
          downloads: 0 // Initialize download counter
        })
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      // Add notification about file expiration
      const expiryText = plan_expires_at 
        ? `Your file will be available until your subscription ends` 
        : `This file will be auto-deleted after 24 hours`;
      
      toast({
        title: "File uploaded successfully",
        description: expiryText,
      });

      setIsUploading(false);
      return { data: { ...fileData, publicUrl }, error: null };
    } catch (error) {
      setIsUploading(false);
      return { data: null, error };
    }
  };

  const getSharedFile = async (fileId: string) => {
    try {
      // Get file metadata
      const { data: fileData, error: fileError } = await supabase
        .from('shared_files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (fileError) throw fileError;

      // Update download count
      await supabase
        .from('shared_files')
        .update({ downloads: (fileData.downloads || 0) + 1 })
        .eq('id', fileData.id);

      // Get file URL
      const { data: { publicUrl } } = supabase.storage
        .from('shared-files')
        .getPublicUrl(fileData.file_path);

      return { data: { ...fileData, publicUrl }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Delete a file (from storage + db)
  const deleteFile = async (fileRow: { id: string, file_path: string }) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('shared-files')
        .remove([fileRow.file_path]);
      if (storageError) throw storageError;

      // Delete from db
      const { error: dbError } = await supabase
        .from('shared_files')
        .delete()
        .eq('id', fileRow.id);
      if (dbError) throw dbError;

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    uploadFile,
    getSharedFile,
    deleteFile,
    isUploading,
    progress
  };
}
