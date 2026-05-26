export const STAGE_OPTIONS = [
  "Sample Profile",
  "Interest Check (pitching)",
  "Interest Check (confirmed)",
] as const;

export const PIC_LIST = ["Zi Jian", "YiChing", "Randall", "SimYee"] as const;

export const BD_LIST = ["WanCi", "Shirley"] as const;

export const URGENCY_OPTIONS = ["ASAP", "Can take time"] as const;

export const INTEREST_OPTIONS = ["YES", "NO", ""] as const;

export const STAGE_COLORS: Record<string, string> = {
  "Sample Profile": "bg-blue-100 text-blue-700",
  "Interest Check (pitching)": "bg-amber-100 text-amber-700",
  "Interest Check (confirmed)": "bg-green-100 text-green-700",
};

export const STAGE_DOT_COLORS: Record<string, string> = {
  "Sample Profile": "bg-blue-500",
  "Interest Check (pitching)": "bg-amber-500",
  "Interest Check (confirmed)": "bg-green-500",
};

export const GAS_URL = "/api/gas";
