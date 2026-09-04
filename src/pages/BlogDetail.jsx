import { useParams, Link } from "react-router-dom";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import PageHeader from "../components/PageHeader";
import BlogCard from "../components/BlogCard";
import { SectionLoading } from "../components/SectionState";
import { getBlogPostBySlug, getRelatedBlogPosts } from "../lib/queries/blog";
import { useSupabaseQuery } from "../lib/useSupabaseQuery";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogDetail() {
  const { id } = useParams();
  const {
    data: post,
    loading,
    error,
  } = useSupabaseQuery(`blog-post:${id}`, () => getBlogPostBySlug(id), [id]);

  const { data: relatedPosts } = useSupabaseQuery(
    post ? `related-posts:${post.id}` : "related-posts:pending",
    () =>
      post ? getRelatedBlogPosts(post.category, post.id, 3) : Promise.resolve([]),
    [post?.category, post?.id],
  );

  if (loading) {
    return (
      <>
        <div className="h-32 w-full bg-ink" aria-hidden="true" />
        <SectionLoading className="py-32" />
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <div className="h-32 w-full bg-ink" aria-hidden="true" />
        <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
          <p className="font-display text-6xl font-semibold text-blush-500">
            404
          </p>
          <h1 className="mt-4 font-display text-3xl font-semibold text-ink">
            Yazı Bulunamadı
          </h1>
          <p className="mt-3 text-ink/70">
            Aradığınız blog yazısı kaldırılmış veya adresi değişmiş olabilir.
          </p>
          <Link
            to="/blog"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-cream-50 transition hover:bg-blush-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Tüm Yazılara Dön
          </Link>
        </section>
      </>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: "Roséa Güzellik Merkezi" },
    datePublished: post.date,
  };

  return (
    <>
      <title>{`${post.title} | Roséa Güzellik Merkezi Blog`}</title>
      <meta name="description" content={post.excerpt} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        title={post.title}
        subtitle={post.excerpt}
        breadcrumb={[
          { label: "Anasayfa", to: "/" },
          { label: "Blog", to: "/blog" },
          { label: post.title },
        ]}
        image={post.coverImage}
      />

      <article className="py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-5 border-b border-blush-100 pb-8 text-sm text-ink/60">
            <span className="rounded-full bg-blush-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blush-700">
              {post.categoryName}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-blush-500" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-blush-500" />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-blush-500" />
              {post.readTime} okuma
            </span>
          </div>

          <p className="mt-8 text-lg leading-relaxed text-ink/80">
            {post.intro}
          </p>

          {post.sections.map((section) => (
            <div key={section.heading} className="mt-8">
              <h2 className="font-display text-2xl font-semibold text-ink">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 24)}
                  className="mt-4 leading-relaxed text-ink/75"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          ))}

          <Link
            to="/blog"
            className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-blush-600 transition hover:text-blush-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Tüm Yazılara Dön
          </Link>
        </div>
      </article>

      {relatedPosts && relatedPosts.length > 0 && (
        <section className="border-t border-blush-100/80 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              Benzer <span className="italic text-blush-600">Yazılar</span>
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
