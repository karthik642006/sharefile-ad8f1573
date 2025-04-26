
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

interface Profile {
  id: string;
  username: string;
  created_at: string;
  avatar_url?: string | null;
}

export function useUserSearch() {
  const [results, setResults] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }
    
    try {
      setIsSearching(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${query}%`)
        .limit(10) as { data: Tables<'profiles'>[] | null, error: Error | null };

      if (error) throw error;
      
      setResults(data || []);
    } catch (err: any) {
      setError(err.message);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchUsers,
    results,
    isSearching,
    error
  };
}
