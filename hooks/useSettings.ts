"use client";
import { useState, useEffect } from "react";
import { getSettings } from "@/lib/api";
import { PIC_LIST, BD_LIST } from "@/lib/constants";

export interface AppSettings {
  picList: string[];
  bdList: string[];
}

const DEFAULTS: AppSettings = {
  picList: [...PIC_LIST],
  bdList: [...BD_LIST],
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings()
      .then((s) => setSettings(s))
      .catch(() => {/* keep defaults */})
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
}
