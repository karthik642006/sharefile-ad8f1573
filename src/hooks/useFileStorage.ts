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

      // Check file size limits
      const fileSizeInMB = file.size / (1024 * 1024); // Convert bytes to MB
      
      // Generate a unique file path
      const filePath = `${user.id}/${new Date().getTime()}-${file.name}`;

      // Get user's current plan and monthly upload count
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { data: monthlyFiles, error: countError } = await supabase
        .from('shared_files')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth);
      
      if (countError) throw countError;
      
      // Check if user has an active subscription plan
      const { data: planData, error: planError } = await supabase
        .rpc('check_active_plan', { user_id: user.id });
      
      // Set plan limits based on subscription
      let maxFileSize = 50; // Default: 50MB for free plan
      let maxFilesPerPeriod = 3; // Default: 3 files per month for free plan
      let expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry for all files
      let plan_expires_at = null;
        
      if (planData && planData.length > 0 && planData[0].has_plan) {
        const plan = planData[0];
        // If user has an active plan, set the plan_expires_at
        plan_expires_at = plan.expires_at;
        
        // Set file limits based on plan type
        switch (plan.plan_type) {
          case '5day':
            maxFileSize = 50; // 50MB per file
            maxFilesPerPeriod = 2; // 2 files per 5-day plan
            break;
          case 'monthly':
            maxFileSize = 100; // 100MB per file
            maxFilesPerPeriod = 10; // 10 files per month
            break;
          case 'yearly':
            maxFileSize = 100; // 100MB per file
            maxFilesPerPeriod = 100; // 100 files per year
            break;
          default:
            // Keep default expiry for basic plan
            break;
        }
      }
      
      // Check file size limit
      if (fileSizeInMB > maxFileSize) {
        throw new Error(`File size exceeds the ${maxFileSize}MB limit for your plan`);
      }
      
      // Check monthly file count limit for free plan
      // For paid plans, we check against their respective limits
      const { data: planUploads, error: planUploadsError } = await supabase
        .from('shared_files')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth)
        .is('plan_expires_at', null); // Free plan uploads
      
      // Get paid plan uploads if applicable
      let paidPlanUploads = [];
      if (plan_expires_at) {
        const { data: paidUploads } = await supabase
          .from('shared_files')
          .select('id')
          .eq('user_id', user.id)
          .not('plan_expires_at', 'is', null);
        
        paidPlanUploads = paidUploads || [];
      }
      
      // Check if free plan limit reached (always 3 per month)
      if ((planUploads || []).length >= 3 && !plan_expires_at) {
        throw new Error(`You've reached the free plan limit of 3 uploads per month`);
      }
      
      // If paid plan, check against plan limit
      if (plan_expires_at && paidPlanUploads.length >= maxFilesPerPeriod) {
        const planName = planData![0].plan_type === '5day' ? '5-day plan' : 
                         planData![0].plan_type === 'monthly' ? 'monthly plan' : 'yearly plan';
        throw new Error(`You've reached the ${maxFilesPerPeriod} file limit for your ${planName}`);
      }

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
      toast({
        title: "File uploaded successfully",
        description: "Your file will be auto-deleted after 24 hours",
      });

      setIsUploading(false);
      return { data: { ...fileData, publicUrl }, error: null };
    } catch (error) {
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: (error as any).message || "Error uploading file",
        variant: "destructive"
      });
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
