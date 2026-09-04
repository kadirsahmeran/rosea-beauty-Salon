import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogCard({ post }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-blush-100/80 bg-white shadow-xl shadow-blush-900/5 transition-all duration-500 hover:-translate-y-1.5 hover:border-blush-300 hover:shadow-2xl hover:shadow-blush-900/10">
      <Link
        to={`/blog/${post.id}`}
        className="relative block aspect-[16/10] w-full overflow-hidden bg-ink/5"
      >
        <img
          src={post.coverImage}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent opacity-70 transition-opacity group-hover:opacity-40" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blush-700 backdrop-blur-md shadow-sm">
          {post.categoryName}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-center gap-4 text-xs text-ink/50">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(post.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {post.readTime}
          </span>
        </div>

        <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-ink transition-colors group-hover:text-blush-600">
          <Link to={`/blog/${post.id}`}>{post.title}</Link>
        </h3>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/70 line-clamp-2">
          {post.excerpt}
        </p>

        <div className="mt-6 flex items-center justify-between border-t border-blush-100/60 pt-4">
          <span className="text-xs font-medium text-ink/50">
            {post.author}
          </span>
          <Link
            to={`/blog/${post.id}`}
            className="group/btn inline-flex items-center gap-1.5 text-xs font-semibold text-blush-600 transition-colors hover:text-blush-700"
          >
            <span>Devamını Oku</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
