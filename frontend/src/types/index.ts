export type Status =
  | "SAVED"
  | "APPLIED"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "ARCHIVED";

export type WorkSetup = "ONSITE" | "HYBRID" | "REMOTE";

export interface Application {
  id: string;
  company: string;
  role: string;
  status: Status;
  workSetup: WorkSetup;
  location: string | null;
  appliedAt: string | null;
  url: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusHistory[];
}

export interface StatusHistory {
  id: string;
  from: Status;
  to: Status;
  changedAt: string;
}

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
