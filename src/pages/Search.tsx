import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SongCard from "@/components/SongCard";
interface Song {
  id: string;
  title: string;
  artist_name: string;
  audio_url: string;
  thumbnail_url: string | null;
  uploaded_by: string;
}
const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [searched, setSearched] = useState(false);
  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    if (!searchQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setSearched(true);
    const {
      data,
      error
    } = await supabase.from("songs").select("*").or(`title.ilike.%${searchQuery}%,artist_name.ilike.%${searchQuery}%`);
    if (!error && data) {
      setResults(data);
    }
  };
  return <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold px-[5px] py-[5px] rounded-md bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Search
        </h1>
        <p className="text-muted-foreground">Find your favorite songs and artists</p>
      </div>

      <div className="relative max-w-2xl">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input type="text" placeholder="Search for songs or artists..." value={query} onChange={e => handleSearch(e.target.value)} className="pl-10 bg-secondary/50 border-primary/20 focus:border-primary h-12" />
      </div>

      {searched && <div>
          {results.length === 0 ? <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                Song is not available
              </p>
            </div> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {results.map(song => <SongCard key={song.id} song={song} />)}
            </div>}
        </div>}
    </div>;
};
export default Search;