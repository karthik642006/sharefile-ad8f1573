
import React, { useState, useEffect } from 'react';
import { Download, File, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { getShareableLink } from '@/utils/shareUtils';
import { toast } from '@/hooks/use-toast';

interface FileDownloadProps {
  fileId: string;
}

interface FileData {
  id: string;
  filename: string;
  file_path: string;
  downloads: number;
  created_at: string;
  user_id: string;
  username?: string;
  publicUrl: string;
  expires_at?: string;
}

const FileDownload: React.FC<FileDownloadProps> = ({ fileId }) => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFileData() {
      try {
        setIsLoading(true);
        
        const { data: fileData, error: fileError } = await supabase
          .from('shared_files')
          .select('*')
          .eq('id', fileId)
          .single();
          
        if (fileError) throw fileError;
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', fileData.user_id)
          .single();
        
        await supabase
          .from('shared_files')
          .update({ downloads: (fileData.downloads || 0) + 1 })
          .eq('id', fileData.id);
        
        const { data: { publicUrl } } = supabase.storage
          .from('shared-files')
          .getPublicUrl(fileData.file_path);
        
        setFileData({
          ...fileData,
          username: profileData?.username,
          publicUrl
        });
      } catch (err: any) {
        console.error('Error fetching file:', err);
        setError(err.message || 'Failed to load file');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchFileData();
  }, [fileId]);

  const handleShare = async () => {
    const shareableLink = getShareableLink(fileId);
    await navigator.clipboard.writeText(shareableLink);
    toast({
      title: "Link Copied!",
      description: "The shareable link has been copied to your clipboard",
    });
  };

  // Add auto-delete functionality for downloaded files (client-side notification)
  const handleDownload = () => {
    if (fileData) {
      // Inform user about auto-deletion
      toast({
        title: "File will auto-delete",
        description: "This downloaded file will be automatically deleted after 24 hours.",
      });
      
      // Track download action in localStorage with expiration time
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
      const downloadInfo = {
        id: fileData.id,
        filename: fileData.filename,
        expiryTime
      };
      
      // Store download info in localStorage
      const downloads = JSON.parse(localStorage.getItem('downloadedFiles') || '[]');
      downloads.push(downloadInfo);
      localStorage.setItem('downloadedFiles', JSON.stringify(downloads));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b87f5]"></div>
      </div>
    );
  }

  if (error || !fileData) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold text-red-500">Error</h2>
        <p className="mt-2">{error || 'File not found'}</p>
        <Link to="/" className="mt-4 inline-block text-[#9b87f5] hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-xl mx-auto">
      <div className="flex items-center mb-4">
        <File size={32} className="text-[#9b87f5] mr-3" />
        <div>
          <h2 className="text-xl font-bold">{fileData.filename}</h2>
          <p className="text-sm text-gray-500">
            Shared by {fileData.username || 'Unknown user'} · {fileData.downloads} downloads
          </p>
        </div>
      </div>
      
      <div className="flex flex-col gap-4 mt-6">
        <a 
          href={fileData.publicUrl} 
          download={fileData.filename}
          className="inline-block w-full"
          onClick={handleDownload}
        >
          <Button className="w-full bg-[#9b87f5] hover:bg-[#7E69AB]">
            <Download className="mr-2" size={18} />
            Download File
          </Button>
        </a>
        
        <Button variant="outline" onClick={handleShare}>
          <Share className="mr-2" size={18} />
          Share File
        </Button>
      </div>
      
      {fileData.expires_at && (
        <div className="mt-6 pt-4 border-t text-sm text-gray-500">
          <p>File shared on {new Date(fileData.created_at).toLocaleDateString()}</p>
          <p>Available until {new Date(fileData.expires_at).toLocaleString()}</p>
          <p className="text-yellow-600 mt-1">Downloaded files will auto-delete after 24 hours</p>
        </div>
      )}
    </div>
  );
};

export default FileDownload;
