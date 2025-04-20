
import React, { useRef, useState } from "react";
import { Upload, Copy, File, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockUniqueLink = "https://filelinker.app/download/abcd1234"; // placeholder

const Dashboard = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [copySuccess, setCopySuccess] = useState(false);

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setUploaded(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploaded(false);
    }
  }

  function uploadAndGenerate() {
    // Here, integrate with Supabase to upload file and get real link
    setUploaded(true);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(mockUniqueLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 1200);
  }

  return (
    <section className="flex flex-col items-center min-h-screen bg-gradient-to-b from-[#d3e4fd] to-[#f1f0fb] py-10 animate-fade-in">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#9b87f5] mb-6">Upload File</h2>
          {/* Drag-and-drop box */}
          <form
            className="flex flex-col gap-5 mb-7"
            onDragOver={handleDrag}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInput.current?.click()}
            style={{ cursor: "pointer" }}
          >
            <label className="font-semibold text-gray-700">
              Drag & drop file here, or click to select
            </label>
            <div
              className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg h-40 ${dragActive ? "border-[#9b87f5] bg-[#f6f3ff]" : "border-gray-300 bg-[#f1f1f1]"}`}
            >
              <Upload className="text-[#7E69AB]" size={28} />
              <span className="text-gray-600">
                {selectedFile ? selectedFile.name : "No file selected"}
              </span>
              <input
                type="file"
                className="hidden"
                ref={fileInput}
                onChange={handleFileChange}
              />
            </div>
          </form>
          {/* Upload & Generate Link Button */}
          <Button
            className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white font-semibold px-4 py-2 rounded-lg transition-all hover-scale"
            onClick={uploadAndGenerate}
            disabled={!selectedFile}
          >
            <Upload className="inline-block mr-2" size={18} />
            Upload & Generate Link
          </Button>
          {/* After Upload: Show unique link, copy & download */}
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
                  <Download className="mr-1" size={18} /> Download File
                </a>
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
