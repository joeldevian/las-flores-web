import { describe, expect, it } from "vitest";
import {
  createCvPath,
  isOfferPublic,
  sortPublicOffers,
  validateApplication,
  validateCv,
} from "../features/jobs/rules";

const offer = {
  id: "offer-1",
  title: "Anfitrión de salón",
  slug: "anfitrion-de-salon",
  department: "Servicio",
  location: "Ayacucho",
  work_mode: "onsite" as const,
  summary: "Recibe a nuestros visitantes.",
  description: "Descripción",
  responsibilities: ["Recibir clientes"],
  requirements: ["Comunicación cordial"],
  benefits: [],
  status: "published" as const,
  application_deadline: "2026-08-31",
  sort_order: 2,
  created_at: "2026-08-01T00:00:00Z",
  updated_at: "2026-08-01T00:00:00Z",
};

describe("job rules", () => {
  it("solo publica ofertas publicadas y no vencidas", () => {
    expect(isOfferPublic(offer, new Date("2026-08-05T12:00:00Z"))).toBe(true);
    expect(isOfferPublic({ ...offer, status: "paused" }, new Date("2026-08-05"))).toBe(false);
    expect(
      isOfferPublic(
        { ...offer, application_deadline: "2026-08-04" },
        new Date("2026-08-05T12:00:00Z"),
      ),
    ).toBe(false);
  });

  it("ordena por sort_order y después por fecha de creación descendente", () => {
    const result = sortPublicOffers([
      { ...offer, id: "b", sort_order: 1, created_at: "2026-08-01T00:00:00Z" },
      { ...offer, id: "a", sort_order: 1, created_at: "2026-08-02T00:00:00Z" },
      { ...offer, id: "c", sort_order: 2 },
    ]);
    expect(result.map(({ id }) => id)).toEqual(["a", "b", "c"]);
  });

  it("acepta solo PDF de hasta 5 MB", () => {
    expect(validateCv(new File(["pdf"], "cv.pdf", { type: "application/pdf" }))).toEqual([]);
    expect(
      validateCv(
        new File(["x"], "cv.docx", {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
      ),
    ).toContain("Adjunta tu CV en formato PDF.");
    expect(
      validateCv(
        new File([new Uint8Array(5 * 1024 * 1024 + 1)], "cv.pdf", { type: "application/pdf" }),
      ),
    ).toContain("El CV no debe superar los 5 MB.");
  });

  it("valida campos y consentimiento", () => {
    expect(
      validateApplication({
        full_name: "",
        phone: "123",
        email: "mal",
        city: "",
        experience_summary: "",
        availability: "",
        privacy_consent: false,
      }),
    ).toMatchObject({
      full_name: expect.any(String),
      email: expect.any(String),
      privacy_consent: expect.any(String),
    });
  });

  it("genera una ruta privada sin conservar el nombre personal", () => {
    expect(createCvPath("offer-1", "CV María Pérez.pdf", "12345678-1234-1234-1234-1234567890ab")).toBe(
      "offer-1/12345678-1234-1234-1234-1234567890ab.pdf",
    );
  });
});
