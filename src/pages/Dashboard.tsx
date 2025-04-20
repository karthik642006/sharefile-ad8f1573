
import { Upload, File, Trash } from "lucide-react";

const Dashboard = () => {
  return (
    <section className="flex flex-col items-center min-h-screen bg-gradient-to-b from-[#d3e4fd] to-[#f1f0fb] py-10 animate-fade-in">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#9b87f5] mb-6">Upload File</h2>
          <form className="flex flex-col gap-5 mb-7">
            <label className="font-semibold text-gray-700">Choose a file to upload:</label>
            <div className="flex items-center gap-3">
              <input type="file" className="flex-1" disabled />
              <button
                className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white font-semibold px-4 py-2 rounded-lg focus:outline-none transition-all hover-scale cursor-not-allowed"
                disabled
              >
                <Upload className="inline-block mr-2" size={18} />
                Upload (coming soon)
              </button>
            </div>
          </form>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Uploads</h3>
          <div className="rounded-lg border bg-[#f1f1f1] p-4 mb-2">
            {/* Static list for now */}
            <div className="flex items-center gap-3 py-2 border-b last:border-b-0">
              <File className="text-[#9b87f5]" size={20} />
              <span className="font-semibold">ProjectPlan.pdf</span>
              <span className="ml-auto text-sm text-gray-400">2.2MB</span>
              <button className="ml-3 text-red-500 hover:text-red-700 rounded p-1 transition">
                <Trash size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3 py-2 border-b last:border-b-0">
              <File className="text-[#33C3F0]" size={20} />
              <span className="font-semibold">Screenshots.zip</span>
              <span className="ml-auto text-sm text-gray-400">6MB</span>
              <button className="ml-3 text-red-500 hover:text-red-700 rounded p-1 transition">
                <Trash size={18} />
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-400 pt-3">Deleting/uploading will be implemented soon!</div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
