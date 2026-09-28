import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  FileText,
  IndianRupee,
} from "lucide-react";

import {
  formatCurrency,
  formatDate,
  normalizeStatus,
} from "./applicationUtils";

export default function ApplicationOfferInfo({
  application,
}) {
  const status = normalizeStatus(
    application?.status
  );

  const offer =
    application?.offerDetails || null;

  const hasOffer =
    Boolean(
      offer &&
        (
          offer.position ||
          offer.salaryPackage ||
          offer.joiningDate ||
          offer.offerLetterUrl
        )
    );

  if (!hasOffer) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.03]">
      <div className="border-b border-emerald-400/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <CheckCircle2
            size={17}
            className="text-emerald-400"
          />

          <div>
            <h2 className="text-sm font-semibold text-white">
              Offer information
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              {status === "HIRED"
                ? "Offer accepted / hiring completed"
                : "Offer details shared by the recruiting team"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <OfferItem
            icon={BriefcaseBusiness}
            label="Position"
            value={offer.position || "—"}
          />

          <OfferItem
            icon={IndianRupee}
            label="Package"
            value={
              offer.salaryPackage !==
                undefined &&
              offer.salaryPackage !== null
                ? formatCurrency(
                    offer.salaryPackage
                  )
                : "—"
            }
          />

          <OfferItem
            icon={CalendarDays}
            label="Joining date"
            value={formatDate(
              offer.joiningDate
            )}
          />

          <OfferItem
            icon={CalendarDays}
            label="Offer sent"
            value={formatDate(offer.sentAt)}
          />
        </div>

        {Array.isArray(offer.benefits) &&
          offer.benefits.length > 0 && (
            <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Benefits
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {offer.benefits.map(
                  (benefit, index) => (
                    <span
                      key={`${benefit}-${index}`}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-slate-300"
                    >
                      {benefit}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

        {offer.offerLetterUrl && (
          <a
            href={offer.offerLetterUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-400"
          >
            <FileText size={16} />
            View Offer Letter
          </a>
        )}
      </div>
    </section>
  );
}

function OfferItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2">
        <Icon
          size={15}
          className="text-slate-600"
        />

        <span className="text-[11px] uppercase tracking-wide text-slate-600">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-medium text-slate-300">
        {value}
      </p>
    </div>
  );
}
