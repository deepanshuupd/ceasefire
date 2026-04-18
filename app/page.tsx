import { HeroClipsSection } from "@/components/HeroSection";
import { NavBar } from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="dark flex min-h-screen flex-col bg-zinc-900 font-sans dark:bg-black">
      <NavBar />
      <HeroClipsSection />
      <Footer />
    </div>
  );
}
