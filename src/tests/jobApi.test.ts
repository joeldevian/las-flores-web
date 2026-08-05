import { describe, expect, it, vi } from "vitest";
import { JobValidationError, duplicateJobOffer, submitJobApplication } from "../features/jobs/api";
import type { JobApplicationInput, JobOffer } from "../features/jobs/types";
import { supabase } from "../lib/supabase";

const input: JobApplicationInput = {
  full_name: "María Pérez",
  phone: "+51 999 888 777",
  email: "maria@example.com",
  city: "Ayacucho",
  experience_summary: "Tres años en atención al cliente.",
  availability: "Inmediata",
  privacy_consent: true,
};

const application = {
  ...input,
  id: "application-1",
  job_offer_id: "offer-1",
  cv_path: "offer-1/cv.pdf",
  status: "new" as const,
  internal_notes: null,
  created_at: "2026-08-05T00:00:00Z",
  updated_at: "2026-08-05T00:00:00Z",
};

function createClient({
  uploadError = null,
  rpcError = null,
  rpcData = application,
}: {
  uploadError?: Error | null;
  rpcError?: Error | null;
  rpcData?: unknown;
} = {}) {
  const upload = vi.fn().mockResolvedValue({ error: uploadError });
  const remove = vi.fn().mockResolvedValue({ error: null });
  const rpc = vi.fn().mockResolvedValue({ data: rpcData, error: rpcError });
  const from = vi.fn(() => ({ upload, remove }));

  return {
    client: { storage: { from }, rpc },
    from,
    upload,
    remove,
    rpc,
  };
}

describe("submitJobApplication", () => {
  it("sube el CV y registra la postulación mediante RPC", async () => {
    const fake = createClient();
    const cv = new File(["pdf"], "cv.pdf", { type: "application/pdf" });

    await expect(submitJobApplication("offer-1", input, cv, fake.client)).resolves.toEqual(
      application,
    );

    expect(fake.from).toHaveBeenCalledWith("job-cvs");
    expect(fake.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^offer-1\/[a-zA-Z0-9_-]+\.pdf$/),
      cv,
      { contentType: "application/pdf", upsert: false },
    );
    const cvPath = fake.upload.mock.calls[0][0];
    expect(fake.rpc).toHaveBeenCalledWith("submit_job_application", {
      p_job_offer_id: "offer-1",
      p_full_name: input.full_name,
      p_phone: input.phone,
      p_email: input.email,
      p_city: input.city,
      p_experience_summary: input.experience_summary,
      p_availability: input.availability,
      p_privacy_consent: input.privacy_consent,
      p_cv_path: cvPath,
    });
  });

  it("rechaza una respuesta RPC que no sea una postulación completa", async () => {
    const fake = createClient({ rpcData: "application-1" });
    const cv = new File(["pdf"], "cv.pdf", { type: "application/pdf" });

    await expect(submitJobApplication("offer-1", input, cv, fake.client)).rejects.toThrow(
      "La RPC submit_job_application devolvió una respuesta inválida.",
    );
  });

  it("elimina el CV si falla el RPC", async () => {
    const rpcError = new Error("RPC failed");
    const fake = createClient({ rpcError });
    const cv = new File(["pdf"], "cv.pdf", { type: "application/pdf" });

    await expect(submitJobApplication("offer-1", input, cv, fake.client)).rejects.toBe(rpcError);

    expect(fake.remove).toHaveBeenCalledWith([fake.upload.mock.calls[0][0]]);
  });

  it("no invoca el RPC si falla el upload", async () => {
    const uploadError = new Error("Upload failed");
    const fake = createClient({ uploadError });
    const cv = new File(["pdf"], "cv.pdf", { type: "application/pdf" });

    await expect(submitJobApplication("offer-1", input, cv, fake.client)).rejects.toBe(uploadError);

    expect(fake.rpc).not.toHaveBeenCalled();
    expect(fake.remove).not.toHaveBeenCalled();
  });

  it("valida antes de usar storage o RPC", async () => {
    const fake = createClient();
    const cv = new File(["no pdf"], "cv.txt", { type: "text/plain" });

    await expect(
      submitJobApplication("offer-1", { ...input, email: "incorrecto" }, cv, fake.client),
    ).rejects.toBeInstanceOf(JobValidationError);

    expect(fake.from).not.toHaveBeenCalled();
    expect(fake.rpc).not.toHaveBeenCalled();
  });
});

describe("duplicateJobOffer", () => {
  it("persiste un borrador sin identificadores ni fechas", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1_754_390_400_000);
    const offer: JobOffer = {
      id: "offer-1",
      title: "Anfitrión de salón",
      slug: "anfitrion-de-salon",
      department: "Servicio",
      location: "Ayacucho",
      work_mode: "onsite",
      summary: "Recibe a nuestros visitantes.",
      description: "Descripción",
      responsibilities: ["Recibir clientes"],
      requirements: ["Comunicación cordial"],
      benefits: [],
      status: "published",
      application_deadline: null,
      sort_order: 2,
      created_at: "2026-08-01T00:00:00Z",
      updated_at: "2026-08-02T00:00:00Z",
    };

    const duplicated = { ...offer, id: "offer-2", status: "draft" as const };
    const single = vi.fn().mockResolvedValue({ data: duplicated, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    vi.spyOn(supabase, "from").mockReturnValue({ insert } as never);

    await expect(duplicateJobOffer(offer)).resolves.toBe(duplicated);
    expect(insert).toHaveBeenCalledWith({
      title: "Anfitrión de salón (copia)",
      slug: "anfitrion-de-salon-copia-1754390400000",
      department: "Servicio",
      location: "Ayacucho",
      work_mode: "onsite",
      summary: "Recibe a nuestros visitantes.",
      description: "Descripción",
      responsibilities: ["Recibir clientes"],
      requirements: ["Comunicación cordial"],
      benefits: [],
      status: "draft",
      application_deadline: null,
      sort_order: 2,
    });
  });
});
