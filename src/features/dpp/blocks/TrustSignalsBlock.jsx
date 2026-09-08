import { getBlockIcon } from "../icons";

function TrustSignalsBlock({ title, items = [] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-y border-gray-200 bg-white py-10">
      <div className="mx-auto max-w-5xl px-4">
        {title ? (
          <h2 className="mb-6 text-center font-display text-2xl text-navy">
            {title}
          </h2>
        ) : null}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => {
            const Icon = getBlockIcon(item.icon);
            return (
              <div key={`${item.title}-${index}`} className="flex gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream text-navy">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="font-semibold text-navy">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TrustSignalsBlock;
