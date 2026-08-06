import { Link } from "react-router-dom";

export default function MenuItemCard({ item, onAdd }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-line last:border-0">
      {item.image && (
        <img
          src={item.image}
          alt={item.name}
          className="w-16 h-16 rounded-lg object-cover shrink-0 border border-line"
        />
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-3 h-3 border ${
              item.isVeg ? "border-sage" : "border-chili"
            }`}
          >
            <span
              className={`block w-1.5 h-1.5 m-auto mt-[3px] rounded-full ${
                item.isVeg ? "bg-sage" : "bg-chili"
              }`}
            />
          </span>
          <h3 className="font-medium">{item.name}</h3>
        </div>
        {item.description && (
          <p className="text-sm text-ink/60 mt-1 max-w-md">{item.description}</p>
        )}
        <p className="font-mono text-sm mt-2">₹{item.price}</p>
        <Link
          to={`/menu/${item._id}/reviews`}
          className="inline-block font-mono text-xs text-ink/40 hover:text-chili mt-1"
        >
          {item.numReviews ? `★ ${item.rating.toFixed(1)} (${item.numReviews})` : "No ratings yet"}
        </Link>
      </div>
      <button
        onClick={() => onAdd(item)}
        disabled={!item.available}
        className="shrink-0 px-4 py-2 text-sm font-medium border border-ink rounded-full hover:bg-ink hover:text-paper transition-colors disabled:opacity-30 disabled:pointer-events-none"
      >
        {item.available ? "Add" : "Sold out"}
      </button>
    </div>
  );
}
