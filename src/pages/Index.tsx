
import { Search, File, Folder, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useUserSearch } from "@/hooks/useUserSearch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Index = () => {
  const [userSearch, setUserSearch] = useState("");
  const [fileSearch, setFileSearch] = useState("");
  const { searchUsers, results, isSearching, error } = useUserSearch();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (userSearch) {
        searchUsers(userSearch);
      }
    }, 400); // Add debounce to prevent too many API calls

    return () => clearTimeout(timer);
  }, [userSearch]);

  return (
    <section className="min-h-screen flex flex-col md:flex-row items-stretch bg-gradient-to-br from-[#f1f0fb] via-[#e5deff] to-[#d3e4fd] animate-fade-in transition-all">
      <div className="flex flex-1 flex-col items-center justify-start md:justify-center mt-10 md:mt-0 p-4 w-full">
        {/* Top search: User search */}
        <form className="w-full max-w-xl mb-8" onSubmit={(e) => e.preventDefault()}>
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
          {isSearching && <div className="mt-2 text-sm text-gray-500">Searching...</div>}
          {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
          
          {results.length > 0 && (
            <div className="mt-3 bg-white border rounded-lg shadow-sm overflow-hidden">
              <h3 className="px-4 py-2 bg-gray-50 font-medium text-gray-700 border-b">Users</h3>
              <div className="max-h-60 overflow-y-auto">
                {results.map((profile) => (
                  <div key={profile.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b last:border-b-0">
                    <Avatar className="h-8 w-8 bg-[#9b87f5]">
                      <AvatarFallback className="text-white">
                        {profile.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{profile.username}</p>
                      <p className="text-xs text-gray-500">
                        Joined {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link to={`/profile?id=${profile.id}`}>
                      <Button size="sm" variant="outline" className="text-[#9b87f5]">
                        <UserIcon size={14} className="mr-1" /> View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            {/* Get Started Button */}
            <Link to="/signup" className="w-full flex justify-center mt-4">
              <Button size="lg" className="w-full md:w-auto bg-[#9b87f5] hover:bg-[#7E69AB] text-white rounded-lg shadow-lg transition hover-scale font-bold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Index;
