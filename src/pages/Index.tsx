
import { Search, File, Folder } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [userSearch, setUserSearch] = useState("");
  const [fileSearch, setFileSearch] = useState("");
  return (
    <section className="min-h-screen flex flex-col md:flex-row items-stretch bg-gradient-to-br from-[#f1f0fb] via-[#e5deff] to-[#d3e4fd] animate-fade-in transition-all">
      <div className="flex flex-1 flex-col items-center justify-start md:justify-center mt-10 md:mt-0 p-4 w-full">
        {/* Top search: User search */}
        <form className="w-full max-w-xl mb-8">
          <label className="block mb-1 font-semibold text-gray-600 text-lg">
            Search Usernames
          </label>
          <div className="flex items-center bg-white rounded-lg border shadow-sm px-3 py-2">
            <Search className="text-[#9b87f5] mr-2" size={22} />
            <input
              type="text"
              className="flex-1 bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
              placeholder="Search by username..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
            />
          </div>
        </form>
        {/* Center search: File/folder search */}
        <form className="w-full max-w-xl mt-4 mb-10">
          <label className="block mb-1 font-semibold text-gray-600 text-lg">
            Search Files, Folders, or Documents
          </label>
          <div className="flex items-center bg-white rounded-lg border shadow-sm px-3 py-2">
            <Folder className="text-[#33C3F0] mr-2" size={22} />
            <input
              type="text"
              className="flex-1 bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
              placeholder="Search files, folders, documents..."
              value={fileSearch}
              onChange={e => setFileSearch(e.target.value)}
            />
            <File className="ml-2 text-[#7E69AB]" size={20} />
          </div>
        </form>
        {/* Feature section */}
        <div className="w-full max-w-xl mt-2 mb-16">
          <div className="rounded-xl bg-white/90 shadow-md p-6 flex flex-col items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#9b87f5] mb-2">
              Share Files Securely & Instantly
            </h1>
            <p className="text-lg text-gray-700 mb-2">
              <span className="font-semibold">FileLinker</span> enables anyone to download files instantly — sign up to upload and share yours with unique links!
            </p>
            <ul className="flex flex-wrap gap-x-7 gap-y-2 items-center justify-center mt-3 text-base text-gray-600">
              <li className="flex items-center gap-2"><File size={18} className="text-[#9b87f5]" /> Single or multiple file sharing</li>
              <li className="flex items-center gap-2"><Folder size={18} className="text-[#33C3F0]" /> Folder support</li>
              <li className="flex items-center gap-2"><Search size={18} className="text-[#7E69AB]" /> Public search & download</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Index;
