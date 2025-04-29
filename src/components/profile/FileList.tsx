
import React, { useEffect, useState } from "react";
import { FileItem } from "./FileItem";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useFileStorage } from "@/hooks/useFileStorage";

interface FileData {
  id: string;
  filename: string;
  created_at: string;
  downloads: number;
  file_path: string;
  expires_at: string | null;
}

interface FileListProps {
  userFiles: FileData[];
  setUserFiles: React.Dispatch<React.SetStateAction<FileData[]>>;
  profileId: string | null;
  isLoadingFiles: boolean;
}

export const FileList = ({ userFiles, setUserFiles, profileId, isLoadingFiles }: FileListProps) => {
  const { user } = useAuth();
  const { deleteFile } = useFileStorage();
  const [now, setNow] = useState(Date.now());
  const isCurrentUser = user && user.id === profileId;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  if (isLoadingFiles) {
    return <div className="py-8 text-center text-gray-500">Loading files...</div>;
  }

  if (userFiles.length === 0) {
    return <div className="py-8 text-center text-gray-500">No files uploaded yet</div>;
  }

  return (
    <div className="w-full space-y-3">
      {userFiles.map((file) => {
        const expired = file.expires_at && new Date(file.expires_at).getTime() < now;
        if (expired) return null;

        return (
          <FileItem 
            key={file.id} 
            file={file} 
            isCurrentUser={isCurrentUser} 
            onDeleteFile={handleDeleteFile} 
          />
        );
      })}
    </div>
  );
};
