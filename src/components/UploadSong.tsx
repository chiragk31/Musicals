import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

const UploadSong = () => {
  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) return;

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Upload audio file
      const audioFileName = `${user.id}/${Date.now()}-${audioFile.name}`;
      const { data: audioData, error: audioError } = await supabase.storage
        .from("audio-files")
        .upload(audioFileName, audioFile);

      if (audioError) throw audioError;

      const audioUrl = supabase.storage.from("audio-files").getPublicUrl(audioData.path)
        .data.publicUrl;

      // Upload thumbnail if provided
      let thumbnailUrl = null;
      if (thumbnailFile) {
        const thumbnailFileName = `${user.id}/${Date.now()}-${thumbnailFile.name}`;
        const { data: thumbnailData, error: thumbnailError } = await supabase.storage
          .from("thumbnails")
          .upload(thumbnailFileName, thumbnailFile);

        if (thumbnailError) throw thumbnailError;

        thumbnailUrl = supabase.storage.from("thumbnails").getPublicUrl(thumbnailData.path)
          .data.publicUrl;
      }

      // Create song record
      const { error: songError } = await supabase.from("songs").insert({
        title,
        artist_name: artistName,
        audio_url: audioUrl,
        thumbnail_url: thumbnailUrl,
        uploaded_by: user.id,
      });

      if (songError) throw songError;

      toast({
        title: "Song uploaded!",
        description: "Your song is now available to all users",
      });

      // Reset form
      setTitle("");
      setArtistName("");
      setAudioFile(null);
      setThumbnailFile(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-effect border-primary/20">
      <CardHeader>
        <CardTitle className="gradient-primary bg-clip-text text-transparent">
          Upload Your Song
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Song Title</Label>
            <Input
              id="title"
              placeholder="Enter song title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-secondary/50 border-primary/20 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="artistName">Artist Name</Label>
            <Input
              id="artistName"
              placeholder="Enter artist name"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              required
              className="bg-secondary/50 border-primary/20 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio">Audio File</Label>
            <Input
              id="audio"
              type="file"
              accept="audio/*"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              required
              className="bg-secondary/50 border-primary/20 focus:border-primary"
            />
            {audioFile && (
              <p className="text-sm text-muted-foreground">{audioFile.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail (Optional)</Label>
            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              className="bg-secondary/50 border-primary/20 focus:border-primary"
            />
            {thumbnailFile && (
              <p className="text-sm text-muted-foreground">{thumbnailFile.name}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || !audioFile}
            className="w-full gradient-primary hover:opacity-90 transition-smooth shadow-glow"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Song
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UploadSong;
