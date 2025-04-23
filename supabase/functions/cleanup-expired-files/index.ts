
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const SUPABASE_URL = "https://alfdirzvingjzmikwpmy.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in environment");
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  // Find & delete expired files
  const { data: expiredFiles, error } = await supabase
    .from("shared_files")
    .select("id,file_path")
    .lte("expires_at", new Date().toISOString());

  if (error) {
    console.error("DB error:", error);
    return new Response("Error fetching expired files", { status: 500, headers: corsHeaders });
  }

  if (!expiredFiles || expiredFiles.length === 0) {
    return new Response("No expired files.", { headers: corsHeaders });
  }

  // Remove all expired files from storage
  const filePaths = expiredFiles.map(f => f.file_path);
  const { error: storageError } = await supabase.storage
    .from("shared-files")
    .remove(filePaths);

  if (storageError) {
    console.error("Storage remove error:", storageError);
    return new Response("Storage remove error", { status: 500, headers: corsHeaders });
  }

  // Delete all expired file records
  const { error: dbDelError } = await supabase
    .from("shared_files")
    .delete()
    .in("id", expiredFiles.map(f => f.id));

  if (dbDelError) {
    console.error("DB delete error:", dbDelError);
    return new Response("DB delete error", { status: 500, headers: corsHeaders });
  }

  return new Response(`Deleted ${expiredFiles.length} expired file(s)`, { headers: corsHeaders });
});
