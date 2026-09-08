import { ChevronDown } from "lucide-react";

/**
 * Native <details> rather than JS accordion state: it works before hydration,
 * which matters on a page whose whole point is being readable immediately.
 */
function FaqBlock({ title = "שאלות שנשאלות לפני הרכישה", items = [] }) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      {title ? (
        <h2 className="mb-6 text-center font-display text-2xl text-navy">
          {title}
        </h2>
      ) : null}

      <div className="divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {items.map((item, index) => (
          <details key={`${item.question}-${index}`} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 text-navy [&::-webkit-details-marker]:hidden">
              <span className="font-medium">{item.question}</span>
              <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
            </summary>
            <p className="whitespace-pre-line px-5 pb-5 text-sm leading-relaxed text-gray-600">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

export default FaqBlock;
