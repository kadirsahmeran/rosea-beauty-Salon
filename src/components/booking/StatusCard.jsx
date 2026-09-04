export default function StatusCard({ icon: Icon, label, value, detail, className }) {
  return (
    <div className="rounded-2xl border border-blush-100/80 bg-white p-4 shadow-sm shadow-blush-900/5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-widest text-ink/40 uppercase">
          {label}
        </p>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blush-50 text-blush-600">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <span
        className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${className}`}
      >
        {value}
      </span>
      <p className="mt-2 text-xs leading-relaxed text-ink/50">{detail}</p>
    </div>
  );
}
