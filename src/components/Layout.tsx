import { ReactNode } from "react";
import Header from "./Header";
import MusicPlayer from "./MusicPlayer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <MusicPlayer />
    </div>
  );
};

export default Layout;
