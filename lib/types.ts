export type StageValue =
  | "Sample Profile (Pitching)"
  | "Sample Profile & Soft Interest Check (Pitching)"
  | "Sample Profile & Soft Interest Check (Nearly Confirmed)"
  | "Interest Check (Confirmed)"
  | "";

export type StatusValue =
  | "Request Assign"
  | "Done Reach Out"
  | "Client Feedback to Continue"
  | "Client Approve Project - Handover to Operations"
  | "Done Remark and Complete"
  | "Client Cancel Project"
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
  status: StatusValue;
  specialRemarks: string;
  totalPax: string;
  statusUpdatedAt: string;
  filledPax: string;
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
