import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import { getFeaturedBlogPosts } from "../lib/queries/blog";
import { useSupabaseQuery } from "../lib/useSupabaseQuery";
import BlogCard from "./BlogCard";
import { SectionLoading, SectionError } from "./SectionState";

export default function BlogPreview() {
  const { data: posts, loading, error } = useSupabaseQuery(
    "featured-blog-posts",
    getFeaturedBlogPosts,
    [],
  );
  const featuredPosts = (posts ?? []).slice(0, 3);

  return (
    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blush-300/50 bg-white/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-blush-700 backdrop-blur-sm shadow-sm">
            <BookOpen className="h-3.5 w-3.5 text-blush-500" />
            <span>Blog</span>
          </div>

          <h2 className="mt-6 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Güzellik Dünyasından{" "}
            <span className="italic text-blush-600">Öneriler</span>
          </h2>

          <p className="mt-4 text-base text-ink/75 sm:text-lg">
            Cilt bakımından saç sağlığına, uzman ekibimizden güncel ipuçları
            ve rehberler.
          </p>
        </div>

        {loading && <SectionLoading />}
        {error && <SectionError />}

        {posts && (
          <>
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                to="/blog"
                className="inline-flex items-center gap-3 rounded-full bg-ink px-9 py-4 text-sm font-semibold text-cream-50 shadow-lg shadow-ink/10 transition-all duration-300 hover:bg-blush-600 hover:shadow-xl hover:shadow-blush-600/20"
              >
                <span>Tüm Yazıları Görüntüle</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
