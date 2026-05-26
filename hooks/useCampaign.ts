"use client";
import { useState, useEffect, useCallback } from "react";
import type { Campaign, KolEntry } from "@/lib/types";
import { getCampaign, getKolList } from "@/lib/api";
import { extractSheetId } from "@/lib/utils";

export function useCampaign(rowIndex: number) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [kolList, setKolList] = useState<KolEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [kolLoading, setKolLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaign = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const c = await getCampaign(rowIndex);
      setCampaign(c);
      if (c.clientSheetLink) {
        const id = extractSheetId(c.clientSheetLink);
        if (id) {
          setKolLoading(true);
          try {
            const kols = await getKolList(id);
            setKolList(kols);
          } catch {
            setKolList([]);
          } finally {
            setKolLoading(false);
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load campaign");
    } finally {
      setLoading(false);
    }
  }, [rowIndex]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  const refetchKols = useCallback(async (sheetLink: string) => {
    const id = extractSheetId(sheetLink);
    if (!id) return;
    setKolLoading(true);
    try {
      const kols = await getKolList(id);
      setKolList(kols);
    } finally {
      setKolLoading(false);
    }
  }, []);

  return { campaign, kolList, loading, kolLoading, error, refetch: fetchCampaign, refetchKols };
}
