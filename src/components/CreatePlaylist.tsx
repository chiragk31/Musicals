import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
interface Song {
  id: string;
  title: string;
  artist_name: string;
}
const CreatePlaylist = () => {
  const [playlistName, setPlaylistName] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSongs, setLoadingSongs] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    const fetchSongs = async () => {
      const {
        data,
        error
      } = await supabase.from("songs").select("id, title, artist_name");
      if (!error && data) {
        setSongs(data);
      }
      setLoadingSongs(false);
    };
    fetchSongs();
  }, []);
  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create playlist
      const {
        data: playlist,
        error: playlistError
      } = await supabase.from("playlists").insert({
        name: playlistName,
        user_id: user.id
      }).select().single();
      if (playlistError) throw playlistError;

      // Add songs to playlist
      if (selectedSongs.length > 0) {
        const {
          error: songsError
        } = await supabase.from("playlist_songs").insert(selectedSongs.map(songId => ({
          playlist_id: playlist.id,
          song_id: songId
        })));
        if (songsError) throw songsError;
      }
      toast({
        title: "Playlist created!",
        description: `"${playlistName}" has been added to your library`
      });
      setPlaylistName("");
      setSelectedSongs([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const toggleSong = (songId: string) => {
    setSelectedSongs(prev => prev.includes(songId) ? prev.filter(id => id !== songId) : [...prev, songId]);
  };
  return <Card className="glass-effect border-primary/20">
      <CardHeader>
        <CardTitle className="text-xl font-bold px-[5px] py-[5px] rounded-md bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Create New Playlist
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreatePlaylist} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="playlistName">Playlist Name</Label>
            <Input id="playlistName" placeholder="My Awesome Playlist" value={playlistName} onChange={e => setPlaylistName(e.target.value)} required className="bg-secondary/50 border-primary/20 focus:border-primary" />
          </div>

          <div className="space-y-2">
            <Label>Select Songs</Label>
            {loadingSongs ? <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div> : songs.length === 0 ? <p className="text-muted-foreground text-sm">No songs available</p> : <div className="max-h-64 overflow-y-auto space-y-2 rounded-lg bg-secondary/30 p-4">
                {songs.map(song => <div key={song.id} className="flex items-center space-x-2 p-2 rounded hover:bg-secondary/50 transition-smooth">
                    <Checkbox id={song.id} checked={selectedSongs.includes(song.id)} onCheckedChange={() => toggleSong(song.id)} />
                    <label htmlFor={song.id} className="flex-1 cursor-pointer text-sm">
                      <div className="font-medium">{song.title}</div>
                      <div className="text-muted-foreground text-xs">{song.artist_name}</div>
                    </label>
                  </div>)}
              </div>}
          </div>

          <Button type="submit" disabled={loading || !playlistName} className="w-full gradient-primary hover:opacity-90 transition-smooth shadow-glow">
            {loading ? <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </> : <>
                <Plus className="w-4 h-4 mr-2" />
                Create Playlist
              </>}
          </Button>
        </form>
      </CardContent>
    </Card>;
};
export default CreatePlaylist;