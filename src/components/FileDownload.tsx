
import React, { useEffect, useState } from 'react';
import { Download, File, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

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
}

const FileDownload: React.FC<FileDownloadProps> = ({ fileId }) => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFileData() {
      try {
        setIsLoading(true);
        
        // Get file data
        const { data: fileData, error: fileError } = await supabase
          .from('shared_files')
          .select('*')
          .eq('id', fileId)
          .single();
          
        if (fileError) throw fileError;
        
        // Get username from profiles table
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', fileData.user_id)
          .single();
        
        // Update download count
        await supabase
          .from('shared_files')
          .update({ downloads: (fileData.downloads || 0) + 1 })
          .eq('id', fileData.id);
        
        // Get file URL
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

  function handleCopyLink() {
    if (!fileData) return;
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  }

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
        >
          <Button className="w-full bg-[#9b87f5] hover:bg-[#7E69AB]">
            <Download className="mr-2" size={18} />
            Download File
          </Button>
        </a>
        
        <Button variant="outline" onClick={handleCopyLink}>
          <Share className="mr-2" size={18} />
          Copy Shareable Link
        </Button>
      </div>
      
      <div className="mt-6 pt-4 border-t text-sm text-gray-500">
        <p>File shared on {new Date(fileData.created_at).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default FileDownload;
