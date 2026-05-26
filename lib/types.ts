export type StageValue =
  | "Sample Profile"
  | "Interest Check (pitching)"
  | "Interest Check (confirmed)"
  | "";

export interface Campaign {
  rowIndex: number;
  pic: string;
  picSupport: string;
  urgent: string;
  revenueSize: string;
  dateRequest: string;
  bdName: string;
  agencyName: string;
  campaignName: string;
  stage: StageValue;
  clientWebsite: string;
  platformDetails: string;
  kolRequirement: string;
  budget: string;
  timeline: string;
  category: string;
  clientSheetLink: string;
  ytUniqueLink: string;
  ytAdminLink: string;
  internalSheet: string;
  copywriting: string;
  zynnApproval: string;
  telegramPosted: string;
  emailBlasted: string;
  fbGroupPosted: string;
  ytAdminContact: string;
  googleResearch: string;
  heepsyContact: string;
}

export interface KolEntry {
  rowIndex: number;
  no: string;
  name: string;
  profileLink: string;
  followers: string;
  interestCheckClient: "YES" | "NO" | "";
  interestCheckKol: "YES" | "NO" | "";
  ytRemarks: string;
  clientRemarks: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
