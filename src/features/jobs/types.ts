export type JobOfferStatus = "draft" | "published" | "paused" | "closed";
export type JobApplicationStatus = "new" | "reviewing" | "shortlisted" | "rejected" | "hired";
export type WorkMode = "onsite" | "hybrid" | "remote";

export interface JobOffer {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  work_mode: WorkMode;
  summary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  status: JobOfferStatus;
  application_deadline: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type PublicJobOffer = JobOffer;
export type JobOfferInput = Omit<JobOffer, "id" | "created_at" | "updated_at">;

export interface JobApplicationInput {
  full_name: string;
  phone: string;
  email: string;
  city: string;
  experience_summary: string;
  availability: string;
  privacy_consent: boolean;
}

export interface JobApplication extends JobApplicationInput {
  id: string;
  job_offer_id: string;
  cv_path: string;
  status: JobApplicationStatus;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  job_offers?: Pick<JobOffer, "title" | "slug">;
}

export const JOB_OFFER_STATUS_LABELS = {
  draft: "Borrador",
  published: "Publicada",
  paused: "Pausada",
  closed: "Cerrada",
} satisfies Record<JobOfferStatus, string>;

export const JOB_APPLICATION_STATUS_LABELS = {
  new: "Nueva",
  reviewing: "En revisión",
  shortlisted: "Preseleccionada",
  rejected: "Descartada",
  hired: "Contratada",
} satisfies Record<JobApplicationStatus, string>;
