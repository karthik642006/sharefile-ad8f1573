
import React from "react";
import { UserSearch } from "@/components/search/UserSearch";
import { FileSearch } from "@/components/search/FileSearch";
import { WelcomeBanner } from "@/components/home/WelcomeBanner";
import { CacheBuster } from "@/components/utils/CacheBuster";

const Index = () => {
  return (
    <section className="min-h-screen flex flex-col md:flex-row items-stretch bg-gradient-to-br from-[#f1f0fb] via-[#e5deff] to-[#d3e4fd] animate-fade-in transition-all w-full">
      <CacheBuster />
      <div className="flex flex-1 flex-col items-center justify-start md:justify-center mt-10 md:mt-0 p-4 w-full">
        <UserSearch />
        <FileSearch />
        <WelcomeBanner />
      </div>
    </section>
  );
};

export default Index;
