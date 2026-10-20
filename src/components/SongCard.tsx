import { Play, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayerStore } from "./MusicPlayer";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
interface SongCardProps {
  song: {
    id: string;
    title: string;
    artist_name: string;
    audio_url: string;
    thumbnail_url: string | null;
    uploaded_by: string;
  };
}
const SongCard = ({
  song
}: SongCardProps) => {
  const {
    setCurrentSong,
    setIsPlaying,
    currentSong
  } = usePlayerStore();
  const [isLiked, setIsLiked] = useState(false);
  const {
    toast
  } = useToast();
  useEffect(() => {
    const checkLiked = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user) {
        const {
          data
        } = await supabase.from("liked_songs").select("id").eq("user_id", user.id).eq("song_id", song.id).maybeSingle();
        setIsLiked(!!data);
      }
    };
    checkLiked();
  }, [song.id]);
  const handlePlay = async () => {
    // Fetch all songs to create a queue
    const { data: allSongs } = await supabase
      .from("songs")
      .select("*")
      .order("created_at", { ascending: false });

    if (allSongs) {
      const currentIndex = allSongs.findIndex((s) => s.id === song.id);
      usePlayerStore.getState().setQueue(allSongs);
      usePlayerStore.getState().setCurrentIndex(currentIndex);
      usePlayerStore.getState().addToHistory(song);
    }

    setCurrentSong(song);
    setIsPlaying(true);
  };
  const handleLike = async () => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) return;
    if (isLiked) {
      const {
        error
      } = await supabase.from("liked_songs").delete().eq("user_id", user.id).eq("song_id", song.id);
      if (!error) {
        setIsLiked(false);
        toast({
          title: "Removed from liked songs"
        });
      }
    } else {
      const {
        error
      } = await supabase.from("liked_songs").insert({
        user_id: user.id,
        song_id: song.id
      });
      if (!error) {
        setIsLiked(true);
        toast({
          title: "Added to liked songs"
        });
      }
    }
  };
  const isCurrentlyPlaying = currentSong?.id === song.id;
  return <div className="group glass-effect rounded-xl overflow-hidden transition-smooth hover:scale-105 hover:shadow-glow w-full">
      <div className="relative aspect-square bg-secondary overflow-hidden w-full">
        {song.thumbnail_url ? <img src={song.thumbnail_url} alt={song.title} className="w-full h-full object-cover" /> : <div className="w-full h-full gradient-primary" />}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center gap-2 px-[5px] py-[5px]">
          <Button onClick={handlePlay} size="icon" className={`gradient-primary hover:opacity-90 transition-smooth shadow-glow ${isCurrentlyPlaying ? "scale-110" : ""}`}>
            <Play className="w-5 h-5 ml-0.5" />
          </Button>
          <Button onClick={handleLike} size="icon" variant="outline" className={`border-white/20 hover:bg-white/10 transition-smooth ${isLiked ? "bg-primary/20 text-primary" : ""}`}>
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold truncate">{song.title}</h3>
        <p className="text-sm text-muted-foreground truncate">{song.artist_name}</p>
      </div>
    </div>;
};
export default SongCard;