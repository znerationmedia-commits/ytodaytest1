"use client";
import { useState, useEffect, useCallback } from "react";
import type { Campaign } from "@/lib/types";
import { getCampaigns } from "@/lib/api";
import { filterCampaigns } from "@/lib/utils";

export interface CampaignFilters {
  search: string;
  pic: string;
  stage: string;
  urgent: boolean;
  bdName: string;
}

const DEFAULT_FILTERS: CampaignFilters = {
  search: "",
  pic: "",
  stage: "",
  urgent: false,
  bdName: "",
};

export function useCampaigns() {
  const [all, setAll] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CampaignFilters>(DEFAULT_FILTERS);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCampaigns();
      setAll(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const assigned = all.filter((c) => c.pic && c.pic.trim() !== "");
  const unassigned = all.filter((c) => !c.pic || c.pic.trim() === "");
  const filtered = filterCampaigns(assigned, filters);

  return { all, assigned, unassigned, filtered, loading, error, refetch: fetch, filters, setFilters };
}
