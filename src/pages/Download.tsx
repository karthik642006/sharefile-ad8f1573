
import React from 'react';
import { useParams } from 'react-router-dom';
import { useFileStorage } from '@/hooks/useFileStorage';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const DownloadPage = () => {
  const { fileId } = useParams();
  const { getSharedFile } = useFileStorage();
  const [fileData, setFileData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchFile = async () => {
      if (!fileId) return;
      
      setIsLoading(true);
      const { data, error } = await getSharedFile(fileId);
      
      if (error) {
        toast({
          title: "Error",
          description: "File not found or has expired",
          variant: "destructive"
        });
      } else {
        setFileData(data);
      }
      setIsLoading(false);
    };

    fetchFile();
  }, [fileId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b87f5]"></div>
      </div>
    );
  }

  if (!fileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">File Not Found</h1>
        <p className="text-gray-600">This file may have expired or been deleted.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-[#f1f0fb] via-[#e5deff] to-[#d3e4fd]">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Download File</h1>
        <div className="space-y-4">
          <div>
            <p className="text-gray-600 font-medium">Filename:</p>
            <p className="text-gray-800">{fileData.filename}</p>
          </div>
          {fileData.expires_at && (
            <div>
              <p className="text-gray-600 font-medium">Available until:</p>
              <p className="text-gray-800">
                {new Date(fileData.expires_at).toLocaleString()}
              </p>
            </div>
          )}
          <a 
            href={fileData.publicUrl} 
            download={fileData.filename}
            className="w-full"
          >
            <Button className="w-full bg-[#9b87f5] hover:bg-[#7E69AB]">
              <Download className="mr-2" size={18} />
              Download File
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
