import { NextResponse } from "next/server";
import {
  getSwarmState,
  isRemoteIngestEnabled,
  remoteStorageKind,
} from "@/lib/swarm-state-store";

export async function GET() {
  const { source } = await getSwarmState();
  return NextResponse.json({
    source,
    storage: remoteStorageKind(),
    ingestEnabled: isRemoteIngestEnabled(),
    vercel: process.env.VERCEL === "1",
    config: {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
      supabasePublishable: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim(),
      supabaseService: !!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
      blob: !!process.env.BLOB_READ_WRITE_TOKEN?.trim(),
      ingestSecret: !!process.env.SWARM_INGEST_SECRET?.trim(),
    },
  });
}
