import { supabase } from "../../lib/supabase";
import { createCvPath, validateApplication, validateCv } from "./rules";
import type {
  JobApplication,
  JobApplicationInput,
  JobApplicationStatus,
  JobOffer,
  JobOfferInput,
  PublicJobOffer,
} from "./types";

type ApplicationValidationErrors = Partial<Record<keyof JobApplicationInput | "cv", string>>;

type StorageResult = Promise<{ error: unknown | null }>;

export interface JobSubmissionClient {
  storage: {
    from(bucket: string): {
      upload(
        path: string,
        file: File,
        options: { contentType: string; upsert: boolean },
      ): StorageResult;
      remove(paths: string[]): StorageResult;
    };
  };
  rpc(
    functionName: string,
    params: Record<string, string | boolean>,
  ): Promise<{ data: unknown; error: unknown | null }>;
}

export class JobValidationError extends Error {
  readonly errors: ApplicationValidationErrors;

  constructor(errors: ApplicationValidationErrors) {
    super("La postulación contiene datos inválidos.");
    this.name = "JobValidationError";
    this.errors = errors;
  }
}

function throwIfError(error: unknown): asserts error is null {
  if (error) throw error;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isJobApplication(value: unknown): value is JobApplication {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.job_offer_id === "string" &&
    typeof value.full_name === "string" &&
    typeof value.phone === "string" &&
    typeof value.email === "string" &&
    typeof value.city === "string" &&
    typeof value.experience_summary === "string" &&
    typeof value.availability === "string" &&
    value.privacy_consent === true &&
    typeof value.cv_path === "string" &&
    ["new", "reviewing", "shortlisted", "rejected", "hired"].includes(String(value.status)) &&
    (typeof value.internal_notes === "string" || value.internal_notes === null) &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string"
  );
}

export async function listPublicJobOffers(): Promise<PublicJobOffer[]> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("job_offers")
    .select("*")
    .eq("status", "published")
    .or(`application_deadline.is.null,application_deadline.gte.${today}`)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  throwIfError(error);
  return (data ?? []) as PublicJobOffer[];
}

export async function listAdminJobOffers(): Promise<JobOffer[]> {
  const { data, error } = await supabase
    .from("job_offers")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  throwIfError(error);
  return (data ?? []) as JobOffer[];
}

export async function saveJobOffer(input: JobOfferInput, id?: string): Promise<JobOffer> {
  const query = id
    ? supabase.from("job_offers").update(input).eq("id", id)
    : supabase.from("job_offers").insert(input);
  const { data, error } = await query.select().single();

  throwIfError(error);
  return data as JobOffer;
}

export async function duplicateJobOffer(offer: JobOffer): Promise<JobOffer> {
  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...input } = offer;

  return saveJobOffer({
    ...input,
    title: `${offer.title} (copia)`,
    slug: `${offer.slug}-copia-${Date.now()}`,
    status: "draft",
  });
}

export async function listJobApplications(): Promise<JobApplication[]> {
  const { data, error } = await supabase
    .from("job_applications")
    .select("*, job_offers(title, slug)")
    .order("created_at", { ascending: false });

  throwIfError(error);
  return (data ?? []) as JobApplication[];
}

export async function submitJobApplication(
  offerId: string,
  input: JobApplicationInput,
  cv: File,
  client: JobSubmissionClient = supabase as unknown as JobSubmissionClient,
): Promise<JobApplication> {
  const errors: ApplicationValidationErrors = {
    ...validateApplication(input),
    cv: validateCv(cv)[0],
  };
  if (Object.values(errors).some(Boolean)) throw new JobValidationError(errors);

  const cvPath = createCvPath(offerId, cv.name);
  const storage = client.storage.from("job-cvs");
  const { error: uploadError } = await storage.upload(cvPath, cv, {
    contentType: "application/pdf",
    upsert: false,
  });
  throwIfError(uploadError);

  try {
    const { data, error } = await client.rpc("submit_job_application", {
      p_job_offer_id: offerId,
      p_full_name: input.full_name,
      p_phone: input.phone,
      p_email: input.email,
      p_city: input.city,
      p_experience_summary: input.experience_summary,
      p_availability: input.availability,
      p_privacy_consent: input.privacy_consent,
      p_cv_path: cvPath,
    });

    throwIfError(error);
    if (!isJobApplication(data)) {
      throw new Error("La RPC submit_job_application devolvió una respuesta inválida.");
    }

    return data;
  } catch (error) {
    try {
      await storage.remove([cvPath]);
    } catch {
      // Cleanup is best-effort; preserve the application failure as the root cause.
    }
    throw error;
  }
}

export async function updateJobApplication(
  id: string,
  patch: Partial<Pick<JobApplication, "status" | "internal_notes">>,
): Promise<JobApplication> {
  const { data, error } = await supabase
    .from("job_applications")
    .update(patch)
    .eq("id", id)
    .select("*, job_offers(title, slug)")
    .single();

  throwIfError(error);
  return data as JobApplication;
}

export async function createCvSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from("job-cvs").createSignedUrl(path, 60);

  throwIfError(error);
  return data.signedUrl;
}

export type { JobApplicationStatus };
