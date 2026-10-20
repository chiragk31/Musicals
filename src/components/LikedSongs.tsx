import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SongCard from "./SongCard";
import { Loader2 } from "lucide-react";

interface Song {
  id: string;
  title: string;
  artist_name: string;
  audio_url: string;
  thumbnail_url: string | null;
  uploaded_by: string;
}

const LikedSongs = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedSongs = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("liked_songs")
          .select("song_id, songs(*)")
          .eq("user_id", user.id);

        if (!error && data) {
          const likedSongs = data
            .map((item: any) => item.songs)
            .filter((song: any) => song !== null);
          setSongs(likedSongs);
        }
      }
      setLoading(false);
    };

    fetchLikedSongs();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("liked-songs-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "liked_songs" },
        () => {
          fetchLikedSongs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {songs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            You haven't liked any songs yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedSongs;
