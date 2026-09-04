export default function DetailCard({ icon: Icon, label, value, sub, image }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-blush-100/80 bg-white p-4 shadow-sm shadow-blush-900/5">
      {image ? (
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-blush-100">
          <img src={image} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blush-50 text-blush-600">
          <Icon className="h-5 w-5" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-widest text-ink/40 uppercase">
          {label}
        </p>
        <p className="mt-1 font-medium leading-snug text-ink">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-ink/50">{sub}</p>}
      </div>
    </div>
  );
}
