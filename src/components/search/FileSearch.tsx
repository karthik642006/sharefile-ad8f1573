
import React, { useState } from "react";
import { Folder, File } from "lucide-react";

export const FileSearch = () => {
  const [fileSearch, setFileSearch] = useState("");

  return (
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
  );
};
