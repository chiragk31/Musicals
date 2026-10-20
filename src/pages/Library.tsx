import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreatePlaylist from "@/components/CreatePlaylist";
import UploadSong from "@/components/UploadSong";
import LikedSongs from "@/components/LikedSongs";
import MyPlaylists from "@/components/MyPlaylists";
const Library = () => {
  return <div className="space-y-6">
      <div>
        <h1 className="font-bold px-[5px] py-[5px] rounded-md bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent text-3xl">
          Your Library
        </h1>
        <p className="text-muted-foreground">Manage your playlists, uploads, and liked songs</p>
      </div>

      <Tabs defaultValue="my-playlists" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-secondary/50">
          <TabsTrigger value="my-playlists">My Playlists</TabsTrigger>
          <TabsTrigger value="create">Create Playlist</TabsTrigger>
          <TabsTrigger value="upload">Upload Songs</TabsTrigger>
          <TabsTrigger value="liked">Liked Songs</TabsTrigger>
        </TabsList>
        <TabsContent value="my-playlists" className="mt-6">
          <MyPlaylists />
        </TabsContent>
        <TabsContent value="create" className="mt-6">
          <CreatePlaylist />
        </TabsContent>
        <TabsContent value="upload" className="mt-6">
          <UploadSong />
        </TabsContent>
        <TabsContent value="liked" className="mt-6">
          <LikedSongs />
        </TabsContent>
      </Tabs>
    </div>;
};
export default Library;