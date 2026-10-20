import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SongCard from "@/components/SongCard";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
interface Song {
  id: string;
  title: string;
  artist_name: string;
  audio_url: string;
  thumbnail_url: string | null;
  uploaded_by: string;
}
const MyMusic = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const fetchMySongs = async () => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (user) {
      const {
        data,
        error
      } = await supabase.from("songs").select("*").eq("uploaded_by", user.id).order("created_at", {
        ascending: false
      });
      if (!error && data) {
        setSongs(data);
      }
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchMySongs();
  }, []);
  const handleDelete = async (songId: string, audioUrl: string, thumbnailUrl: string | null) => {
    try {
      // Delete from database
      const {
        error
      } = await supabase.from("songs").delete().eq("id", songId);
      if (error) throw error;

      // Delete audio file from storage
      const audioPath = audioUrl.split("/").pop();
      if (audioPath) {
        await supabase.storage.from("audio-files").remove([audioPath]);
      }

      // Delete thumbnail from storage if exists
      if (thumbnailUrl) {
        const thumbnailPath = thumbnailUrl.split("/").pop();
        if (thumbnailPath) {
          await supabase.storage.from("thumbnails").remove([thumbnailPath]);
        }
      }
      toast({
        title: "Song deleted",
        description: "Your song has been removed successfully"
      });
      fetchMySongs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>;
  }
  return <div className="space-y-6">
      <div>
        <h1 className="px-[5px] py-[5px] rounded-md bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent font-bold text-3xl">
          My Music
        </h1>
        <p className="text-muted-foreground">Songs you've uploaded to Musicals</p>
      </div>

      {songs.length === 0 ? <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            You haven't uploaded any songs yet
          </p>
        </div> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {songs.map(song => <div key={song.id} className="relative group">
              <SongCard song={song} />
              <Button variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-smooth shadow-glow" onClick={() => handleDelete(song.id, song.audio_url, song.thumbnail_url)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>)}
        </div>}
    </div>;
};
export default MyMusic;