import type { JobApplicationInput, JobOffer, PublicJobOffer } from "./types";

const MAX_CV_SIZE = 5 * 1024 * 1024;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s()-]{7,20}$/;

type ApplicationErrors = Partial<Record<keyof JobApplicationInput, string>>;

export function isOfferPublic(offer: JobOffer, now = new Date()): boolean {
  if (offer.status !== "published") return false;
  if (!offer.application_deadline) return true;

  const [year, month, day] = offer.application_deadline.split("-").map(Number);
  const deadline = new Date(year, month - 1, day, 23, 59, 59, 999);
  return now <= deadline;
}

export function sortPublicOffers(offers: PublicJobOffer[]): PublicJobOffer[] {
  return [...offers].sort(
    (left, right) =>
      left.sort_order - right.sort_order ||
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
  );
}

export function validateCv(file: File): string[] {
  const errors: string[] = [];
  const isPdf = file.type === "application/pdf" && file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) errors.push("Adjunta tu CV en formato PDF.");
  if (file.size > MAX_CV_SIZE) errors.push("El CV no debe superar los 5 MB.");

  return errors;
}

export function validateApplication(input: JobApplicationInput): ApplicationErrors {
  const errors: ApplicationErrors = {};

  if (!input.full_name.trim()) errors.full_name = "Ingresa tu nombre completo.";
  if (!PHONE_PATTERN.test(input.phone.trim())) errors.phone = "Ingresa un teléfono válido.";
  if (!EMAIL_PATTERN.test(input.email.trim())) errors.email = "Ingresa un correo válido.";
  if (!input.city.trim()) errors.city = "Ingresa tu ciudad.";
  if (!input.experience_summary.trim()) errors.experience_summary = "Resume tu experiencia.";
  if (!input.availability.trim()) errors.availability = "Indica tu disponibilidad.";
  if (!input.privacy_consent) errors.privacy_consent = "Debes aceptar la política de privacidad.";

  return errors;
}

function sanitizePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export function createCvPath(
  offerId: string,
  _fileName: string,
  token = crypto.randomUUID(),
): string {
  return `${sanitizePathSegment(offerId)}/${sanitizePathSegment(token)}.pdf`;
}
