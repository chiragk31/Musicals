import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Music, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import SongCard from "./SongCard";

interface Playlist {
  id: string;
  name: string;
  created_at: string;
}

interface PlaylistSong {
  id: string;
  song_id: string;
  songs: {
    id: string;
    title: string;
    artist_name: string;
    audio_url: string;
    thumbnail_url: string | null;
    uploaded_by: string;
  };
}

const MyPlaylists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [expandedPlaylist, setExpandedPlaylist] = useState<string | null>(null);
  const [playlistSongs, setPlaylistSongs] = useState<{ [key: string]: PlaylistSong[] }>({});
  const [loading, setLoading] = useState(true);
  const [loadingSongs, setLoadingSongs] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("playlists")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPlaylists(data);
    }
    setLoading(false);
  };

  const fetchPlaylistSongs = async (playlistId: string) => {
    setLoadingSongs((prev) => ({ ...prev, [playlistId]: true }));

    const { data, error } = await supabase
      .from("playlist_songs")
      .select(`
        id,
        song_id,
        songs (
          id,
          title,
          artist_name,
          audio_url,
          thumbnail_url,
          uploaded_by
        )
      `)
      .eq("playlist_id", playlistId);

    if (!error && data) {
      setPlaylistSongs((prev) => ({ ...prev, [playlistId]: data as PlaylistSong[] }));
    }

    setLoadingSongs((prev) => ({ ...prev, [playlistId]: false }));
  };

  const togglePlaylist = (playlistId: string) => {
    if (expandedPlaylist === playlistId) {
      setExpandedPlaylist(null);
    } else {
      setExpandedPlaylist(playlistId);
      if (!playlistSongs[playlistId]) {
        fetchPlaylistSongs(playlistId);
      }
    }
  };

  const deletePlaylist = async (playlistId: string, playlistName: string) => {
    const { error } = await supabase.from("playlists").delete().eq("id", playlistId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Playlist deleted",
        description: `"${playlistName}" has been removed from your library`,
      });
      setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
      setExpandedPlaylist(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <Card className="glass-effect border-primary/20">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Music className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-lg font-semibold mb-2">No playlists yet</p>
          <p className="text-muted-foreground text-sm">
            Create your first playlist in the "Create Playlist" tab
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold px-[5px] py-[5px] rounded-md bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        My Playlists
      </h2>

      {playlists.map((playlist) => (
        <Card key={playlist.id} className="glass-effect border-primary/20 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => togglePlaylist(playlist.id)}
                className="flex items-center gap-2 flex-1 text-left hover:opacity-80 transition-smooth"
              >
                <CardTitle className="text-xl">{playlist.name}</CardTitle>
                {expandedPlaylist === playlist.id ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deletePlaylist(playlist.id, playlist.name)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          {expandedPlaylist === playlist.id && (
            <CardContent>
              {loadingSongs[playlist.id] ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : playlistSongs[playlist.id]?.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4">No songs in this playlist</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {playlistSongs[playlist.id]?.map((item) => (
                    <SongCard key={item.id} song={item.songs} />
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default MyPlaylists;
