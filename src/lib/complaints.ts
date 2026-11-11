import type { Database } from "@/integrations/supabase/types";

export type Category = Database["public"]["Enums"]["complaint_category"];
export type Priority = Database["public"]["Enums"]["complaint_priority"];
export type Status = Database["public"]["Enums"]["complaint_status"];
export type AppRole = Database["public"]["Enums"]["app_role"];
export type Complaint = Database["public"]["Tables"]["complaints"]["Row"];

export const CATEGORIES: { value: Category; label: string; description: string }[] = [
  {
    value: "welfare",
    label: "Welfare",
    description: "Pensions, rations, scholarships, social schemes",
  },
  {
    value: "development",
    label: "Development",
    description: "Roads, drainage, sanitation, public works",
  },
  {
    value: "regulation",
    label: "Regulation",
    description: "Certificates, permits, approvals, documents",
  },
];

export const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export const STATUS_LABEL: Record<Status, string> = {
  draft: "Draft",
  submitted: "Submitted",
  assigned: "Assigned",
  in_review: "In Review",
  work_in_progress: "Work In Progress",
  resolved: "Resolved",
  closed: "Closed",
  reopened: "Reopened",
  escalated: "Escalated",
  rejected: "Rejected",
};

export const STATUS_FLOW: Status[] = [
  "submitted",
  "assigned",
  "in_review",
  "work_in_progress",
  "resolved",
  "closed",
];

/** Valid forward/lateral status transitions a coordinator can pick from. */
export const VALID_TRANSITIONS: Record<Status, Status[]> = {
  draft: ["submitted"],
  submitted: ["assigned", "in_review", "rejected"],
  assigned: ["in_review", "work_in_progress", "rejected"],
  in_review: ["work_in_progress", "assigned", "rejected"],
  work_in_progress: ["resolved", "escalated"],
  resolved: ["closed", "reopened"],
  closed: ["reopened"],
  reopened: ["in_review", "work_in_progress"],
  escalated: ["in_review", "work_in_progress", "resolved"],
  rejected: ["reopened"],
};

export const COORDINATOR_ROLE: Record<Category, AppRole> = {
  welfare: "welfare_coordinator",
  development: "development_coordinator",
  regulation: "regulation_coordinator",
};

export function statusTone(
  status: Status,
): "muted" | "info" | "warning" | "success" | "destructive" {
  if (status === "resolved" || status === "closed") return "success";
  if (status === "rejected") return "destructive";
  if (status === "escalated" || status === "reopened") return "warning";
  if (status === "draft") return "muted";
  return "info";
}

export function priorityTone(p: Priority): "muted" | "info" | "warning" | "destructive" {
  if (p === "critical") return "destructive";
  if (p === "high") return "warning";
  if (p === "medium") return "info";
  return "muted";
}

/** Naive client-side AI hint based on keywords; coordinators can override. */
export function suggestCategory(text: string): Category | null {
  const t = text.toLowerCase();
  const w = ["pension", "ration", "scholarship", "widow", "welfare", "subsidy", "aadhaar"];
  const d = [
    "road",
    "drain",
    "sanitation",
    "garbage",
    "water",
    "street light",
    "construction",
    "pothole",
  ];
  const r = [
    "certificate",
    "license",
    "permit",
    "approval",
    "income",
    "caste",
    "birth",
    "death",
    "noc",
  ];
  if (w.some((k) => t.includes(k))) return "welfare";
  if (d.some((k) => t.includes(k))) return "development";
  if (r.some((k) => t.includes(k))) return "regulation";
  return null;
}
