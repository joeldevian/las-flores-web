import { useState, type FormEvent, type ChangeEvent } from "react";
import { isOfferPublic, validateApplication, validateCv } from "../rules";
import type { JobApplicationInput, PublicJobOffer } from "../types";
import { submitJobApplication, JobValidationError } from "../api";
import { Loader2, CheckCircle2, AlertCircle, Upload } from "lucide-react";

interface JobApplicationFormProps {
  offer: PublicJobOffer;
  onSuccess?: () => void;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

export function JobApplicationForm({ offer, onSuccess }: JobApplicationFormProps) {
  const [formData, setFormData] = useState<JobApplicationInput>({
    full_name: "",
    phone: "",
    email: "",
    city: "",
    experience_summary: "",
    availability: "",
    privacy_consent: false,
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof JobApplicationInput | "cv" | "form", string>>>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [closedNotice, setClosedNotice] = useState(false);

  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCvFile(file);
    if (errors.cv) {
      setErrors((prev) => ({ ...prev, cv: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isOfferPublic(offer)) {
      setClosedNotice(true);
      return;
    }

    const fieldErrors = validateApplication(formData);
    const cvErrors = cvFile ? validateCv(cvFile) : ["Adjunta tu CV en formato PDF."];

    const allErrors: Partial<Record<keyof JobApplicationInput | "cv" | "form", string>> = {
      ...fieldErrors,
      cv: cvErrors[0],
    };

    if (Object.values(allErrors).some(Boolean)) {
      setErrors(allErrors);
      return;
    }

    if (!cvFile) return;

    setStatus("submitting");
    setErrors({});

    try {
      await submitJobApplication(offer.id, formData, cvFile);
      setStatus("success");
      setFormData({
        full_name: "",
        phone: "",
        email: "",
        city: "",
        experience_summary: "",
        availability: "",
        privacy_consent: false,
      });
      setCvFile(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      setStatus("error");
      if (err instanceof JobValidationError) {
        setErrors(err.errors);
      } else {
        setErrors({
          form: "Ocurrió un error al enviar tu postulación. Por favor reintenta en un momento.",
        });
      }
    }
  };

  if (closedNotice) {
    return (
      <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col items-center text-center gap-3">
        <AlertCircle size={32} className="text-amber-600" />
        <h4 className="font-serif font-bold text-lg">Convocatoria Cerrada</h4>
        <p className="text-sm leading-relaxed">
          Esta convocatoria acaba de cerrar. Revisa las demás oportunidades disponibles.
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="p-8 rounded-2xl bg-eucalipto/10 border border-eucalipto/30 text-ink flex flex-col items-center text-center gap-4 animate-in fade-in">
        <CheckCircle2 size={48} className="text-eucalipto" />
        <h4 className="font-serif font-bold text-2xl text-eucalipto">¡Postulación Enviada!</h4>
        <p className="text-sm text-ink/80 leading-relaxed max-w-md">
          Hemos recibido tu información y tu CV exitosamente. Si tu perfil coincide con la vacante de{" "}
          <strong className="text-ink font-semibold">{offer.title}</strong>, nos pondremos en contacto contigo.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-2 px-6 py-2.5 bg-eucalipto text-cream font-bold text-sm rounded-xl hover:bg-eucalipto/90 transition-all shadow-sm"
        >
          Postular a otra posición
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="p-6 lg:p-8 rounded-2xl bg-white border border-black/10 shadow-sm space-y-5">
      <div>
        <h3 className="font-serif font-bold text-xl text-ink mb-1">
          Postula a: <span className="text-eucalipto">{offer.title}</span>
        </h3>
        <p className="text-xs text-ink/60">
          Completa tus datos personales y adjunta tu currículum en formato PDF.
        </p>
      </div>

      {errors.form && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      {/* Nombre Completo */}
      <div>
        <label htmlFor="full_name" className="block text-xs font-bold uppercase tracking-wider text-ink/75 mb-1.5">
          Nombre completo <span className="text-red-500">*</span>
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          value={formData.full_name}
          onChange={handleTextChange}
          aria-invalid={Boolean(errors.full_name)}
          aria-describedby={errors.full_name ? "full_name_error" : undefined}
          className={`w-full px-4 py-3 rounded-xl border bg-[#fcfaf5] text-sm text-ink outline-none transition-all focus:border-eucalipto focus:ring-1 focus:ring-eucalipto ${
            errors.full_name ? "border-red-400 bg-red-50/20" : "border-black/10"
          }`}
        />
        {errors.full_name && (
          <p id="full_name_error" className="mt-1 text-xs text-red-600 font-medium">
            {errors.full_name}
          </p>
        )}
      </div>

      {/* Teléfono y Correo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-ink/75 mb-1.5">
            Teléfono <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleTextChange}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone_error" : undefined}
            className={`w-full px-4 py-3 rounded-xl border bg-[#fcfaf5] text-sm text-ink outline-none transition-all focus:border-eucalipto focus:ring-1 focus:ring-eucalipto ${
              errors.phone ? "border-red-400 bg-red-50/20" : "border-black/10"
            }`}
          />
          {errors.phone && (
            <p id="phone_error" className="mt-1 text-xs text-red-600 font-medium">
              {errors.phone}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-ink/75 mb-1.5">
            Correo electrónico <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleTextChange}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email_error" : undefined}
            className={`w-full px-4 py-3 rounded-xl border bg-[#fcfaf5] text-sm text-ink outline-none transition-all focus:border-eucalipto focus:ring-1 focus:ring-eucalipto ${
              errors.email ? "border-red-400 bg-red-50/20" : "border-black/10"
            }`}
          />
          {errors.email && (
            <p id="email_error" className="mt-1 text-xs text-red-600 font-medium">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      {/* Ciudad y Disponibilidad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-xs font-bold uppercase tracking-wider text-ink/75 mb-1.5">
            Ciudad de residencia <span className="text-red-500">*</span>
          </label>
          <input
            id="city"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleTextChange}
            aria-invalid={Boolean(errors.city)}
            aria-describedby={errors.city ? "city_error" : undefined}
            className={`w-full px-4 py-3 rounded-xl border bg-[#fcfaf5] text-sm text-ink outline-none transition-all focus:border-eucalipto focus:ring-1 focus:ring-eucalipto ${
              errors.city ? "border-red-400 bg-red-50/20" : "border-black/10"
            }`}
          />
          {errors.city && (
            <p id="city_error" className="mt-1 text-xs text-red-600 font-medium">
              {errors.city}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="availability" className="block text-xs font-bold uppercase tracking-wider text-ink/75 mb-1.5">
            Disponibilidad para iniciar <span className="text-red-500">*</span>
          </label>
          <input
            id="availability"
            name="availability"
            type="text"
            value={formData.availability}
            onChange={handleTextChange}
            aria-invalid={Boolean(errors.availability)}
            aria-describedby={errors.availability ? "availability_error" : undefined}
            className={`w-full px-4 py-3 rounded-xl border bg-[#fcfaf5] text-sm text-ink outline-none transition-all focus:border-eucalipto focus:ring-1 focus:ring-eucalipto ${
              errors.availability ? "border-red-400 bg-red-50/20" : "border-black/10"
            }`}
          />
          {errors.availability && (
            <p id="availability_error" className="mt-1 text-xs text-red-600 font-medium">
              {errors.availability}
            </p>
          )}
        </div>
      </div>

      {/* Resumen de Experiencia */}
      <div>
        <label htmlFor="experience_summary" className="block text-xs font-bold uppercase tracking-wider text-ink/75 mb-1.5">
          Resumen de experiencia relevante <span className="text-red-500">*</span>
        </label>
        <textarea
          id="experience_summary"
          name="experience_summary"
          rows={3}
          value={formData.experience_summary}
          onChange={handleTextChange}
          aria-invalid={Boolean(errors.experience_summary)}
          aria-describedby={errors.experience_summary ? "experience_error" : undefined}
          className={`w-full px-4 py-3 rounded-xl border bg-[#fcfaf5] text-sm text-ink outline-none transition-all focus:border-eucalipto focus:ring-1 focus:ring-eucalipto ${
            errors.experience_summary ? "border-red-400 bg-red-50/20" : "border-black/10"
          }`}
        />
        {errors.experience_summary && (
          <p id="experience_error" className="mt-1 text-xs text-red-600 font-medium">
            {errors.experience_summary}
          </p>
        )}
      </div>

      {/* Adjuntar CV */}
      <div>
        <label htmlFor="cv" className="block text-xs font-bold uppercase tracking-wider text-ink/75 mb-1.5">
          Curriculum Vitae (PDF máx. 5 MB) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="cv"
            name="cv"
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
            aria-invalid={Boolean(errors.cv)}
            aria-describedby={errors.cv ? "cv_error" : undefined}
            className="hidden"
          />
          <label
            htmlFor="cv"
            className={`w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
              errors.cv
                ? "border-red-400 bg-red-50/20 text-red-600"
                : cvFile
                ? "border-eucalipto bg-eucalipto/5 text-eucalipto font-semibold"
                : "border-black/15 bg-[#fcfaf5] text-ink/60 hover:border-eucalipto/50"
            }`}
          >
            <Upload size={18} />
            <span className="text-xs truncate">
              {cvFile ? cvFile.name : "Seleccionar archivo PDF"}
            </span>
          </label>
        </div>
        {errors.cv && (
          <p id="cv_error" className="mt-1 text-xs text-red-600 font-medium">
            {errors.cv}
          </p>
        )}
      </div>

      {/* Consentimiento de Privacidad */}
      <div className="pt-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="privacy_consent"
            checked={formData.privacy_consent}
            onChange={handleCheckboxChange}
            aria-invalid={Boolean(errors.privacy_consent)}
            aria-describedby={errors.privacy_consent ? "consent_error" : undefined}
            className="mt-0.5 rounded border-black/20 text-eucalipto focus:ring-eucalipto"
          />
          <span className="text-xs text-ink/70 leading-normal">
            Acepto el tratamiento de mis datos personales para los fines del proceso de selección según la política de privacidad. <span className="text-red-500">*</span>
          </span>
        </label>
        {errors.privacy_consent && (
          <p id="consent_error" className="mt-1 text-xs text-red-600 font-medium">
            {errors.privacy_consent}
          </p>
        )}
      </div>

      {/* Botón de Envío */}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full py-4 bg-eucalipto text-cream font-bold text-sm rounded-xl shadow-md hover:bg-eucalipto/90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
      >
        {status === "submitting" ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Enviando postulación…</span>
          </>
        ) : (
          <span>Enviar Postulación</span>
        )}
      </button>
    </form>
  );
}
