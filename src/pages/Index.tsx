import { Button } from "@/components/ui/button";
import { Music2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
const Index = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Gradient background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] -top-48 -left-48 rounded-full gradient-primary opacity-20 blur-3xl" />
        <div className="absolute w-[500px] h-[500px] -bottom-48 -right-48 rounded-full gradient-primary opacity-20 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        {/* Logo and title */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <Music2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="font-bold px-[5px] py-[5px] rounded-md bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent text-6xl">Musicals</h1>
        </div>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">Open Source Platform Discover, upload, and enjoy songs. Create playlists, share your music, and connect with artists worldwide. </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button onClick={() => navigate("/auth")} size="lg" className="gradient-primary hover:opacity-90 transition-smooth text-lg px-8 py-6 shadow-glow">
            Get Started
          </Button>
          <Button onClick={() => navigate("/auth")} variant="outline" size="lg" className="text-lg px-8 py-6 border-primary/50 hover:bg-primary/10 transition-smooth">
            Sign In
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          {[{
          title: "Discover Music",
          description: "Explore songs from artists around the world"
        }, {
          title: "Upload & Share",
          description: "Become an artist and share your creations"
        }, {
          title: "Create Playlists",
          description: "Organize your favorite tracks your way"
        }].map((feature, i) => <div key={i} className="glass-effect rounded-xl p-6 transition-smooth hover:scale-105">
              <h3 className="text-xl font-semibold mb-2 text-primary">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>)}
        </div>
        
        {/* Developer credit */}
        <div className="mt-16 pt-8 border-t border-primary/20">
          <p className="text-sm text-muted-foreground">
            Developed by <span className="text-primary font-semibold">chiragk31</span>
          </p>
        </div>
      </div>
    </div>;
};
export default Index;