
import React, { useRef, useState } from "react";
import { Upload, Copy, File, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const mockUniqueLink = "https://filelinker.app/download/abcd1234"; // placeholder
const mockUser = { loggedIn: false }; // We'll use this to simulate authentication

const Dashboard = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploaded, setUploaded] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [fileDescs, setFileDescs] = useState<string[]>([]);
  const [fileMsg, setFileMsg] = useState("");
  const navigate = useNavigate();

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
      // Convert FileList to array and append to existing files
      const newFiles = Array.from(e.dataTransfer.files);
      const newDescs = newFiles.map(file => `A ${file.type || "file"} named ${file.name}`);
      
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setFileDescs(prev => [...prev, ...newDescs]);
      setUploaded(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to array and append to existing files
      const newFiles = Array.from(e.target.files);
      const newDescs = newFiles.map(file => `A ${file.type || "file"} named ${file.name}`);
      
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setFileDescs(prev => [...prev, ...newDescs]);
      setUploaded(false);
    }
  }

  function uploadAndGenerate() {
    if (!mockUser.loggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload files.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    setUploaded(true);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(mockUniqueLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 1200);
  }

  function handleClickUploadArea() {
    if (!fileInput.current) return;
    fileInput.current.click();
  }
  
  function removeFile(index: number) {
    setSelectedFiles(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    
    setFileDescs(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  }

  return (
    <section className="flex flex-col items-center min-h-screen bg-gradient-to-b from-[#d3e4fd] to-[#f1f0fb] py-10 animate-fade-in">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#9b87f5] mb-6">Upload File</h2>
          <div
            className="mb-7"
            onDragOver={handleDrag}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <label className="font-semibold text-gray-700 mb-2 block">
              Drag & drop files here, or click to select
            </label>
            <div
              className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg h-40 ${dragActive ? "border-[#9b87f5] bg-[#f6f3ff]" : "border-gray-300 bg-[#f1f1f1]"} cursor-pointer`}
              onClick={handleClickUploadArea}
            >
              <Upload className="text-[#7E69AB]" size={28} />
              <span className="text-gray-600">
                {selectedFiles.length > 0 
                  ? `${selectedFiles.length} file(s) selected` 
                  : "No files selected"}
              </span>
              <input
                type="file"
                className="hidden"
                ref={fileInput}
                onChange={handleFileChange}
                multiple
              />
            </div>
            
            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700 mb-2">Selected Files:</h3>
                <div className="max-h-60 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeFile(index)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Plus className="rotate-45" size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <label className="block mb-1 text-sm font-semibold text-gray-600">Message</label>
                <Input
                  value={fileMsg}
                  onChange={e => setFileMsg(e.target.value)}
                  placeholder="Add your message about the files (optional)"
                  onClick={e => e.stopPropagation()}
                />
              </div>
            )}
          </div>
          <Button
            className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white font-semibold px-4 py-2 rounded-lg transition-all hover-scale"
            onClick={uploadAndGenerate}
            disabled={selectedFiles.length === 0}
          >
            <Upload className="inline-block mr-2" size={18} />
            Upload & Generate Link
          </Button>
          {uploaded && (
            <div className="mt-6 p-4 border rounded-lg bg-[#f8f6ff] flex flex-col gap-2 animate-fade-in">
              <div className="flex items-center gap-3">
                <File className="text-[#9b87f5]" size={20} />
                <span className="flex-1 break-all text-sm md:text-base">{mockUniqueLink}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyLink}
                  className="ml-1"
                  aria-label="Copy link"
                >
                  <Copy className={copySuccess ? "text-green-500" : "text-gray-500"} size={18} />
                </Button>
              </div>
              <div>
                <a
                  href={mockUniqueLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-2 text-[#9b87f5] hover:underline"
                  download
                >
                  <Download className="mr-1" size={18} /> Download Files
                </a>
              </div>
              <div className="mt-2">
                <div className="text-sm text-gray-600">
                  <b>Files:</b> {selectedFiles.map(file => file.name).join(", ")}
                </div>
                {fileMsg && (
                  <div className="text-sm text-gray-700 mt-1">
                    <b>Message:</b> {fileMsg}
                  </div>
                )}
              </div>
              {copySuccess && (
                <span className="text-xs text-green-500">Copied!</span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
