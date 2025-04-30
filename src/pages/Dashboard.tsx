
import React, { useEffect, useRef, useState } from "react";
import { Upload, Copy, File, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFileStorage } from "@/hooks/useFileStorage";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [fileDesc, setFileDesc] = useState<string>("");
  const [fileMsg, setFileMsg] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { uploadFile, isUploading, progress } = useFileStorage();
  const [uploadedFileUrl, setUploadedFileUrl] = useState<{id: string, filename: string, publicUrl: string} | null>(null);
  const [uploadStats, setUploadStats] = useState({
    used: 0,
    total: 3, // Default to free plan
    planType: "basic"
  });

  // Fetch user's upload stats when component mounts
  useEffect(() => {
    if (user) {
      fetchUploadStats();
    }
  }, [user]);

  const fetchUploadStats = async () => {
    if (!user) return;
    
    try {
      // Check if user has an active plan
      const { data: planData } = await supabase
        .rpc('check_active_plan', { user_id: user.id });
        
      let planType = "basic";
      let totalAllowed = 3; // Default free plan
      
      if (planData && planData.length > 0 && planData[0].has_plan) {
        planType = planData[0].plan_type;
        
        // Set total allowed based on plan type
        switch (planType) {
          case '5day':
            totalAllowed = 2;
            break;
          case 'monthly':
            totalAllowed = 10;
            break;
          case 'yearly':
            totalAllowed = 100;
            break;
          default:
            totalAllowed = 3; // Free plan
        }
      }
      
      // Count how many files the user has already uploaded this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      if (planType === "basic") {
        // For free plan, count only free uploads this month
        const { data: monthlyFiles, error: countError } = await supabase
          .from('shared_files')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth)
          .is('plan_expires_at', null);
          
        if (countError) throw countError;
        
        setUploadStats({
          used: monthlyFiles?.length || 0,
          total: totalAllowed,
          planType: planType
        });
      } else {
        // For paid plans, count uploads during plan period
        const { data: planFiles } = await supabase
          .from('shared_files')
          .select('id')
          .eq('user_id', user.id)
          .not('plan_expires_at', 'is', null);
          
        setUploadStats({
          used: planFiles?.length || 0,
          total: totalAllowed,
          planType: planType
        });
      }
    } catch (err) {
      console.error("Error fetching upload stats:", err);
    }
  };

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragover" || e.type === "dragenter") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Only take the first file
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setFileDesc(`A ${file.type || "file"} named ${file.name}`);
      setUploaded(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      // Only take the first file
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileDesc(`A ${file.type || "file"} named ${file.name}`);
      setUploaded(false);
    }
  }

  async function uploadAndGenerate() {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload files.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await uploadFile(selectedFile);
      if (error) throw error;
      if (data) {
        setUploadedFileUrl({
          id: data.id,
          filename: data.filename,
          publicUrl: data.publicUrl
        });
        setUploaded(true);
        toast({
          title: "Upload Successful",
          description: `Successfully uploaded file: ${data.filename}`,
        });
        
        // Reset selected file to allow user to upload another
        setSelectedFile(null);
        setFileDesc("");
        
        // Refresh upload stats
        fetchUploadStats();
      }
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: `Failed to upload: ${err.message}`,
        variant: "destructive",
      });
    }
  }

  function handleCopyLink(url: string) {
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    toast({
      title: "Link Copied",
      description: "File link copied to clipboard!",
    });
    setTimeout(() => setCopySuccess(false), 1200);
  }

  function handleClickUploadArea() {
    if (!fileInput.current) return;
    fileInput.current.click();
  }
  
  function removeFile() {
    setSelectedFile(null);
    setFileDesc("");
  }

  // Get plan name for display
  const getPlanName = () => {
    switch (uploadStats.planType) {
      case '5day':
        return "5 Day Plan";
      case 'monthly':
        return "Monthly Plan";
      case 'yearly':
        return "Yearly Plan";
      default:
        return "Free Plan";
    }
  };

  return (
    <section className="flex flex-col items-center min-h-screen bg-gradient-to-b from-[#d3e4fd] to-[#f1f0fb] py-10 animate-fade-in">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#9b87f5] mb-6">Upload File</h2>
          
          {/* Upload Stats Display */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700">Your Upload Stats:</h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  {getPlanName()}: {uploadStats.used} of {uploadStats.total} files used
                </p>
              </div>
              <div className="bg-gray-200 h-2 w-24 rounded-full overflow-hidden">
                <div 
                  className="bg-[#9b87f5] h-full" 
                  style={{ 
                    width: `${Math.min(100, (uploadStats.used / uploadStats.total) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
          
          <div
            className="mb-7"
            onDragOver={handleDrag}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <label className="font-semibold text-gray-700 mb-2 block">
              {uploadStats.used < uploadStats.total ? 
                "Select a file to upload" : 
                "You've reached your plan's upload limit"
              }
            </label>
            <div
              className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg h-40 ${dragActive ? "border-[#9b87f5] bg-[#f6f3ff]" : "border-gray-300 bg-[#f1f1f1]"} ${uploadStats.used >= uploadStats.total ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              onClick={uploadStats.used < uploadStats.total ? handleClickUploadArea : undefined}
            >
              <Upload className="text-[#7E69AB]" size={28} />
              <span className="text-gray-600">
                {selectedFile 
                  ? `Selected: ${selectedFile.name}` 
                  : "No file selected"}
              </span>
              {uploadStats.used < uploadStats.total && (
                <input
                  type="file"
                  className="hidden"
                  ref={fileInput}
                  onChange={handleFileChange}
                />
              )}
            </div>
            
            {selectedFile && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700 mb-2">Selected File:</h3>
                <div className="bg-gray-50 p-2 rounded mb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={removeFile}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Plus className="rotate-45" size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {selectedFile && (
              <div className="mt-4">
                <label className="block mb-1 text-sm font-semibold text-gray-600">Message</label>
                <Input
                  value={fileMsg}
                  onChange={e => setFileMsg(e.target.value)}
                  placeholder="Add your message about the file (optional)"
                  onClick={e => e.stopPropagation()}
                />
              </div>
            )}
          </div>
          <Button
            className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white font-semibold px-4 py-2 rounded-lg transition-all hover-scale"
            onClick={uploadAndGenerate}
            disabled={!selectedFile || isUploading || uploadStats.used >= uploadStats.total}
          >
            {isUploading ? (
              <>
                <Upload className="inline-block mr-2 animate-pulse" size={18} />
                Uploading... {Math.round(progress * 100)}%
              </>
            ) : (
              <>
                <Upload className="inline-block mr-2" size={18} />
                Upload & Generate Link
              </>
            )}
          </Button>
          {uploaded && uploadedFileUrl && (
            <div className="mt-6 p-4 border rounded-lg bg-[#f8f6ff] flex flex-col gap-4 animate-fade-in">
              <h3 className="font-semibold">Your Shareable Link</h3>
              <div className="flex flex-col gap-2 pb-3">
                <div className="flex items-center gap-3">
                  <File className="text-[#9b87f5]" size={20} />
                  <span className="font-medium">{uploadedFileUrl.filename}</span>
                </div>
                <div className="flex items-center gap-2 pl-7">
                  <span className="flex-1 break-all text-xs md:text-sm text-gray-500">{uploadedFileUrl.publicUrl}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyLink(uploadedFileUrl.publicUrl)}
                    className="ml-1"
                    aria-label="Copy link"
                  >
                    <Copy className="text-gray-500" size={18} />
                  </Button>
                </div>
                <div className="pl-7">
                  <a
                    href={uploadedFileUrl.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-1 text-[#9b87f5] hover:underline text-sm"
                    download
                  >
                    <Download className="mr-1" size={16} /> Download File
                  </a>
                </div>
              </div>
              {fileMsg && (
                <div className="text-sm text-gray-700 mt-1">
                  <b>Message:</b> {fileMsg}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
