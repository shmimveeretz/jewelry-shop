import { getBlockIcon } from "../icons";

const COLUMN_CLASSES = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

function FeaturesBlock({ title, items = [], columns = 3 }) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      {title ? (
        <h2 className="mb-8 text-center font-display text-2xl text-navy">
          {title}
        </h2>
      ) : null}

      <div
        className={`grid gap-6 ${COLUMN_CLASSES[columns] || COLUMN_CLASSES[3]}`}
      >
        {items.map((item, index) => {
          const Icon = getBlockIcon(item.icon);
          return (
            <div
              key={`${item.title}-${index}`}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cream text-gold-ink">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <p className="mt-4 font-semibold text-navy">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {item.text}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FeaturesBlock;
