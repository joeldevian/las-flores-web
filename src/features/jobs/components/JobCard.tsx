import type { PublicJobOffer } from "../types";

interface JobCardProps {
  offer: PublicJobOffer;
  isSelected?: boolean;
  onSelect: (offer: PublicJobOffer) => void;
}

const WORK_MODE_LABELS: Record<PublicJobOffer["work_mode"], string> = {
  onsite: "Presencial",
  hybrid: "Híbrido",
  remote: "Remoto",
};

export function JobCard({ offer, isSelected = false, onSelect }: JobCardProps) {
  const deadlineDate = offer.application_deadline
    ? new Date(offer.application_deadline + "T23:59:59").toLocaleDateString("es-PE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <article
      className={`p-6 rounded-2xl border transition-all ${
        isSelected
          ? "border-eucalipto bg-eucalipto/5 shadow-md ring-1 ring-eucalipto"
          : "border-black/10 bg-white hover:border-eucalipto/50 hover:shadow-sm"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-eucalipto mb-1">
            {offer.department}
          </span>
          <h3 className="font-serif font-bold text-xl text-ink leading-snug">
            {offer.title}
          </h3>
        </div>
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-cream text-ink/80 border border-black/5">
          {WORK_MODE_LABELS[offer.work_mode] || offer.work_mode}
        </span>
      </div>

      <p className="text-sm text-ink/70 mb-4 line-clamp-2 leading-relaxed">
        {offer.summary}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-ink/5 text-xs text-ink/60">
        <div className="flex items-center gap-3">
          <span>📍 {offer.location}</span>
          {deadlineDate && (
            <span>📅 Cierra: {deadlineDate}</span>
          )}
        </div>

        <button
          type="button"
          aria-label={`Ver detalle de ${offer.title}`}
          onClick={() => onSelect(offer)}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            isSelected
              ? "bg-eucalipto text-cream shadow-sm"
              : "bg-cream text-ink border border-black/10 hover:bg-eucalipto hover:text-cream hover:border-eucalipto"
          }`}
        >
          {isSelected ? (
            <>
              <span>Viendo detalle</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cream animate-pulse" />
            </>
          ) : (
            <>
              <span>Ver detalle</span>
              <span>→</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}
