const AVATAR_STYLES = [
  "from-blush-300 to-blush-500",
  "from-blush-400 to-blush-600",
  "from-blush-200 to-blush-400",
  "from-blush-500 to-blush-700",
];

export default function Avatar({ testimonial, index, size = "h-10 w-10 text-xs" }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white ${size} ${AVATAR_STYLES[index % AVATAR_STYLES.length]}`}
    >
      {testimonial.initials}
    </div>
  );
}
