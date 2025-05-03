
import React from "react";
import { WelcomeBanner } from "@/components/home/WelcomeBanner";
import { CacheBuster } from "@/components/utils/CacheBuster";
import { UserSearch } from "@/components/search/UserSearch";

const Index = () => {
  return (
    <section className="min-h-screen flex flex-col items-stretch bg-gradient-to-br from-[#f1f0fb] via-[#e5deff] to-[#d3e4fd] animate-fade-in transition-all w-full">
      <CacheBuster />
      <div className="flex flex-1 flex-col items-center justify-start p-4 w-full">
        <div className="text-center text-2xl font-semibold text-gray-700 mb-6 mt-6">
          Upload user files through online
        </div>
        
        {/* User Search moved to the top */}
        <div className="w-full max-w-xl mb-8">
          <UserSearch />
        </div>
        
        {/* Welcome Banner moved below search */}
        <WelcomeBanner />
      </div>
    </section>
  );
};

export default Index;
