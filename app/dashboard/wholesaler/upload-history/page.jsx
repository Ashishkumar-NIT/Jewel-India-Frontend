import { createClient } from "../../../../lib/supabase/server";
import { getAuthUser } from "../../../../lib/supabase/queries";
import { redirect } from "next/navigation";
import { BackToDashboardButton } from "../../../../components/product/BackToDashboardButton";
import UploadHistoryClient from "../../../../components/wholesaler/upload-history/UploadHistoryClient";

export const metadata = { title: "Upload History — Celestique" };

export default async function UploadHistoryPage() {
  const user = await getAuthUser();
  if (!user) redirect("/signin");

  const supabase = await createClient();

  // Fetch usage first to get the correct resetsAt date/timezone
  let usedUploads = 0;
  let uploadLimit = 20;
  let resetsAt = null;

  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const usageRes = await fetch(
      `${API_BASE}/api/upload-usage?wholesaler_id=${encodeURIComponent(user.id)}`,
      { cache: "no-store" }
    );
    if (usageRes.ok) {
      const usageData = await usageRes.json();
      usedUploads = usageData.used ?? 0;
      uploadLimit = usageData.limit ?? 20;
      resetsAt = usageData.resets_at || usageData.resetsAt || null;
    }
  } catch (err) {
    console.error("[UploadHistoryPage] Failed to fetch usage:", err);
  }

  // Calculate start/end of the today's limit cycle matching the resetsAt
  let startOfTodayStr;
  let endOfTodayStr;
  let isValidDate = false;

  if (resetsAt) {
    try {
      // Fix potential backend double-timezone suffix (e.g. +00:00Z)
      const cleanResetsAt = typeof resetsAt === "string"
        ? resetsAt.replace(/\+00:00Z$/, "Z").replace(/\+00:00$/, "Z")
        : resetsAt;

      const end = new Date(cleanResetsAt);
      if (!isNaN(end.getTime())) {
        const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
        startOfTodayStr = start.toISOString();
        endOfTodayStr = end.toISOString();
        isValidDate = true;
      }
    } catch (err) {
      console.error("[UploadHistoryPage] Date parsing failed:", err);
    }
  }

  if (!isValidDate) {
    // Fallback: midnight UTC to next midnight UTC
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    startOfTodayStr = start.toISOString();
    endOfTodayStr = end.toISOString();
  }

  // Query products via the execution logs API endpoint
  let products = [];
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const historyRes = await fetch(
      `${API_BASE}/api/upload-history?wholesaler_id=${encodeURIComponent(user.id)}&start_date=${encodeURIComponent(startOfTodayStr)}&limit=100`,
      { cache: "no-store" }
    );
    if (historyRes.ok) {
      products = await historyRes.json();
    } else {
      console.error("[UploadHistoryPage] API returned error status:", historyRes.status);
    }
  } catch (err) {
    console.error("[UploadHistoryPage] Failed to fetch history:", err);
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#e5e5e5] bg-white px-4 md:px-10 py-2.5">
        <BackToDashboardButton />
      </header>

      <main className="flex-1 flex flex-col gap-6 w-full px-4 py-6 md:gap-8 md:max-w-[1200px] md:mx-auto md:px-8 md:py-8 lg:gap-10 lg:max-w-[1200px] lg:mx-auto lg:px-10 lg:py-10">
        <UploadHistoryClient 
          initialProducts={products || []} 
          usedCount={usedUploads} 
          limitCount={uploadLimit} 
          resetsAt={resetsAt}
        />
      </main>
    </div>
  );
}
