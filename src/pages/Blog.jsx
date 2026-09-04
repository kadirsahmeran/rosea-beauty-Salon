import { useState, useRef } from "react";
import PageHeader from "../components/PageHeader";
import BlogCard from "../components/BlogCard";
import Pagination from "../components/Pagination";
import { SectionLoading, SectionError } from "../components/SectionState";
import { getBlogCategories, getBlogPosts } from "../lib/queries/blog";
import { useSupabaseQuery } from "../lib/useSupabaseQuery";

const HEADER_IMAGE =
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop";

const POSTS_PER_PAGE = 12;
const ALL_TAB = { id: "hepsi", name: "Tümü" };

export default function Blog() {
  const [activeTab, setActiveTab] = useState("hepsi");
  const [currentPage, setCurrentPage] = useState(1);
  const gridRef = useRef(null);

  const { data: dbCategories, loading: categoriesLoading } = useSupabaseQuery(
    "blog-categories",
    getBlogCategories,
    [],
  );
  const {
    data: blogPosts,
    loading: postsLoading,
    error,
  } = useSupabaseQuery("blog-posts", getBlogPosts, []);

  const categories = dbCategories ? [ALL_TAB, ...dbCategories] : [ALL_TAB];
  const loading = categoriesLoading || postsLoading;

  const filteredPosts = !blogPosts
    ? []
    : activeTab === "hepsi"
      ? blogPosts
      : blogPosts.filter((post) => post.category === activeTab);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE,
  );

  const handleTabChange = (categoryId) => {
    setActiveTab(categoryId);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    gridRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  return (
    <>
      <title>Blog | Roséa Güzellik Merkezi</title>
      <meta
        name="description"
        content="Cilt bakımı, saç bakımı, makyaj ve spa dünyasından uzman ipuçları ve rehberler. Roséa Güzellik Merkezi blogunu keşfedin."
      />

      <PageHeader
        title="Blog"
        subtitle="Cilt bakımından saç sağlığına, güzellik dünyasından uzman ipuçları ve rehberler."
        breadcrumb={[{ label: "Anasayfa", to: "/" }, { label: "Blog" }]}
        image={HEADER_IMAGE}
      />

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleTabChange(category.id)}
                className={`cursor-pointer rounded-full px-5 py-2.5 text-xs font-medium transition-all duration-300 sm:text-sm ${
                  activeTab === category.id
                    ? "scale-105 bg-ink text-cream-50 shadow-lg shadow-ink/10"
                    : "border border-blush-100 bg-white/80 text-ink/70 hover:bg-blush-100/60 hover:text-ink"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {loading && <SectionLoading />}
          {error && <SectionError />}

          {blogPosts && (
            <>
              <div
                ref={gridRef}
                className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
              >
                {paginatedPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </section>
    </>
  );
}
