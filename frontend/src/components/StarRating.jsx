// Reusable star rating: pass onChange for an interactive picker, omit it
// (or set readOnly) for a plain display of an existing rating value.
export default function StarRating({ value = 0, onChange, readOnly = false, size = "text-lg" }) {
  const interactive = !readOnly && typeof onChange === "function";
  const rounded = Math.round(value);

  return (
    <div className={`inline-flex gap-0.5 ${size}`} role={interactive ? "radiogroup" : undefined}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(s)}
          aria-label={`${s} star${s === 1 ? "" : "s"}`}
          className={`leading-none transition-colors ${
            interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
          } ${s <= rounded ? "text-chili" : "text-ink/20"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
