import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SongCard from "@/components/SongCard";
import { Loader2 } from "lucide-react";
interface Song {
  id: string;
  title: string;
  artist_name: string;
  audio_url: string;
  thumbnail_url: string | null;
  uploaded_by: string;
}
const Home = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchSongs = async () => {
      const {
        data,
        error
      } = await supabase.from("songs").select("*").order("created_at", {
        ascending: false
      });
      if (!error && data) {
        setSongs(data);
      }
      setLoading(false);
    };
    fetchSongs();

    // Subscribe to realtime updates
    const channel = supabase.channel("songs-channel").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "songs"
    }, () => {
      fetchSongs();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>;
  }
  return <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2 px-[10px] py-[10px] rounded-md bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Discover Music
        </h1>
        <p className="text-muted-foreground">
          Explore the latest tracks from artists around the world
        </p>
      </div>

      {songs.length === 0 ? <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            No songs available yet. Be the first to upload!
          </p>
        </div> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-fr">
          {songs.map(song => <SongCard key={song.id} song={song} />)}
        </div>}
    </div>;
};
export default Home;