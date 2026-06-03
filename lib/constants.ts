export const STAGE_OPTIONS = [
  "Sample Profile (Pitching)",
  "Sample Profile & Soft Interest Check (Pitching)",
  "Sample Profile & Soft Interest Check (Nearly Confirmed)",
  "Interest Check (Confirmed)",
] as const;

export const STATUS_OPTIONS = [
  "Request Assign",
  "Done Reach Out",
  "Client Feedback to Continue",
  "Client Approve Project - Handover to Operations",
  "Done Remark and Complete",
  "Client Cancel Project",
] as const;

// Days to keep a campaign in the active pipeline based on its status.
// Statuses not listed here always stay in the pipeline.
export const STATUS_RETENTION_DAYS: Record<string, number> = {
  "Client Approve Project - Handover to Operations": 15,
  "Done Remark and Complete": 15,
  "Client Cancel Project": 30,
};

// Statuses that move to "Completed Projects" after retention window expires.
export const COMPLETED_STATUSES = new Set([
  "Client Approve Project - Handover to Operations",
  "Done Remark and Complete",
]);

export const URGENCY_OPTIONS = ["ASAP", "Can take time"] as const;

export const INTEREST_OPTIONS = ["YES", "NO", ""] as const;

export const STAGE_COLORS: Record<string, string> = {
  "Sample Profile (Pitching)": "bg-blue-100 text-blue-700",
  "Sample Profile & Soft Interest Check (Pitching)": "bg-amber-100 text-amber-700",
  "Sample Profile & Soft Interest Check (Nearly Confirmed)": "bg-orange-100 text-orange-700",
  "Interest Check (Confirmed)": "bg-green-100 text-green-700",
  // legacy fallbacks
  "Sample Profile": "bg-blue-100 text-blue-700",
  "Interest Check (pitching)": "bg-amber-100 text-amber-700",
  "Interest Check (confirmed)": "bg-green-100 text-green-700",
};

export const STAGE_DOT_COLORS: Record<string, string> = {
  "Sample Profile (Pitching)": "bg-blue-500",
  "Sample Profile & Soft Interest Check (Pitching)": "bg-amber-500",
  "Sample Profile & Soft Interest Check (Nearly Confirmed)": "bg-orange-500",
  "Interest Check (Confirmed)": "bg-green-500",
  // legacy
  "Sample Profile": "bg-blue-500",
  "Interest Check (pitching)": "bg-amber-500",
  "Interest Check (confirmed)": "bg-green-500",
};

export const STATUS_COLORS: Record<string, string> = {
  "Request Assign": "bg-red-100 text-red-700 border-red-200",
  "Done Reach Out": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Client Feedback to Continue": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Client Approve Project - Handover to Operations": "bg-blue-100 text-blue-700 border-blue-200",
  "Done Remark and Complete": "bg-teal-100 text-teal-700 border-teal-200",
  "Client Cancel Project": "bg-rose-100 text-rose-700 border-rose-200",
};

export const GAS_URL = "/api/gas";
