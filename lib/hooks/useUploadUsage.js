import { useState, useEffect, useCallback } from "react";
import { fetchUploadUsage } from "../api/products";

export function useUploadUsage(wholesalerId) {
  const [data, setData] = useState({ used: 0, limit: Infinity, resetsAt: null });
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!wholesalerId) return;
    try {
      setIsLoading(true);
      const result = await fetchUploadUsage(wholesalerId);
      setData(result);
    } catch {
      // Fail-open: if usage endpoint is down, don't block uploads
      setData((prev) => ({ ...prev }));
    } finally {
      setIsLoading(false);
    }
  }, [wholesalerId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    used: data.used,
    limit: data.limit,
    resetsAt: data.resetsAt,
    isLoading,
    isLimitReached: data.used >= data.limit,
    refetch,
  };
}
