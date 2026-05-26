import type { Campaign, KolEntry, ApiResponse } from "./types";
import { GAS_URL } from "./constants";

async function gasGet<T>(action: string, params?: Record<string, string>): Promise<T> {
  const searchParams = new URLSearchParams({ action, ...params });
  const res = await fetch(`${GAS_URL}?${searchParams}`, { cache: "no-store" });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error ?? "Unknown error");
  return json.data as T;
}

async function gasPost<T>(action: string, payload: unknown): Promise<T> {
  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action, payload }),
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error ?? "Unknown error");
  return json.data as T;
}

export async function getCampaigns(): Promise<Campaign[]> {
  return gasGet<Campaign[]>("getCampaigns");
}

export async function getCampaign(rowIndex: number): Promise<Campaign> {
  return gasGet<Campaign>("getCampaign", { rowIndex: String(rowIndex) });
}

export async function getKolList(clientSheetId: string): Promise<KolEntry[]> {
  return gasGet<KolEntry[]>("getKolList", { clientSheetId });
}

export async function createCampaign(
  data: Omit<Campaign, "rowIndex">
): Promise<{ rowIndex: number }> {
  return gasPost<{ rowIndex: number }>("createCampaign", data);
}

export async function updateCampaign(
  rowIndex: number,
  data: Partial<Campaign>
): Promise<void> {
  return gasPost<void>("updateCampaign", { rowIndex, data });
}

export async function createClientSheet(
  campaignName: string,
  rowIndex: number
): Promise<{ url: string }> {
  return gasPost<{ url: string }>("createClientSheet", { campaignName, rowIndex });
}

export async function addKolEntry(
  clientSheetId: string,
  data: Omit<KolEntry, "rowIndex" | "no">
): Promise<{ rowIndex: number }> {
  return gasPost<{ rowIndex: number }>("addKolEntry", { clientSheetId, data });
}

export async function getSettings(): Promise<{ picList: string[]; bdList: string[] }> {
  return gasGet("getSettings");
}

export async function updateSettings(data: { picList?: string[]; bdList?: string[] }): Promise<void> {
  return gasPost("updateSettings", data);
}

export async function updateKolEntry(
  clientSheetId: string,
  rowIndex: number,
  data: Partial<KolEntry>
): Promise<void> {
  return gasPost<void>("updateKolEntry", { clientSheetId, rowIndex, data });
}
