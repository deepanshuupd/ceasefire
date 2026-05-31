import React from "react";
import { Footer, HeroClipsSection, NavBar } from "@/components";

const page = () => {
  return (
    <div className="dark flex min-h-screen flex-col bg-zinc-900 font-sans dark:bg-black">
      <NavBar />
      <HeroClipsSection />
      <Footer />
    </div>
  );
};

export default page;
