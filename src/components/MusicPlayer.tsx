import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { create } from "zustand";

interface Song {
  id: string;
  title: string;
  artist_name: string;
  audio_url: string;
  thumbnail_url: string | null;
}

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  currentIndex: number;
  playHistory: Song[];
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setQueue: (queue: Song[]) => void;
  setCurrentIndex: (index: number) => void;
  addToHistory: (song: Song) => void;
  playNext: () => void;
  playPrevious: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  queue: [],
  currentIndex: -1,
  playHistory: [],
  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setQueue: (queue) => set({ queue }),
  setCurrentIndex: (index) => set({ currentIndex: index }),
  addToHistory: (song) => set((state) => ({ 
    playHistory: [...state.playHistory, song] 
  })),
  playNext: () => {
    const { queue, currentIndex } = get();
    if (queue.length > 0 && currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextSong = queue[nextIndex];
      set({ 
        currentSong: nextSong, 
        currentIndex: nextIndex,
        isPlaying: true 
      });
      get().addToHistory(nextSong);
    } else if (queue.length > 0) {
      // Loop back to first song
      const nextSong = queue[0];
      set({ 
        currentSong: nextSong, 
        currentIndex: 0,
        isPlaying: true 
      });
      get().addToHistory(nextSong);
    }
  },
  playPrevious: () => {
    const { queue, currentIndex } = get();
    if (queue.length > 0 && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevSong = queue[prevIndex];
      set({ 
        currentSong: prevSong,
        currentIndex: prevIndex,
        isPlaying: true,
      });
      get().addToHistory(prevSong);
    } else if (queue.length > 0) {
      // Loop back to last song
      const lastIndex = queue.length - 1;
      const prevSong = queue[lastIndex];
      set({ 
        currentSong: prevSong,
        currentIndex: lastIndex,
        isPlaying: true,
      });
      get().addToHistory(prevSong);
    }
  },
}));

const MusicPlayer = () => {
  const { currentSong, isPlaying, setIsPlaying, playNext, playPrevious } = usePlayerStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const loadPlaybackState = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("playback_state")
          .select("song_id, position")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data && data.song_id) {
          const { data: song } = await supabase
            .from("songs")
            .select("*")
            .eq("id", data.song_id)
            .single();

          if (song) {
            usePlayerStore.getState().setCurrentSong(song);
            if (audioRef.current) {
              audioRef.current.currentTime = data.position || 0;
            }
          }
        }
      }
    };

    loadPlaybackState();
  }, []);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = currentSong.audio_url;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const savePlaybackState = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && currentSong && audioRef.current) {
      await supabase
        .from("playback_state")
        .upsert({
          user_id: user.id,
          song_id: currentSong.id,
          position: audioRef.current.currentTime,
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      savePlaybackState();
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 glass-effect border-t border-primary/20 z-50">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="container mx-auto h-full px-4 flex items-center gap-4">
        {/* Song info */}
        <div className="flex items-center gap-3 min-w-[200px] flex-1">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
            {currentSong.thumbnail_url ? (
              <img
                src={currentSong.thumbnail_url}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full gradient-primary" />
            )}
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold truncate">{currentSong.title}</p>
            <p className="text-sm text-muted-foreground truncate">
              {currentSong.artist_name}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={playPrevious}
              className="text-muted-foreground hover:text-foreground"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              size="icon"
              className="gradient-primary hover:opacity-90 transition-smooth w-10 h-10 shadow-glow"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={playNext}
              className="text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-muted-foreground min-w-[40px] text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground min-w-[40px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 min-w-[150px] flex-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-muted-foreground hover:text-foreground"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
