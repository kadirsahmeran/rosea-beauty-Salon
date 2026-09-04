import { supabase } from "../supabaseClient";

const POST_SELECT = "*, blog_categories(name)";

function normalizeBlogPost(row) {
  return {
    id: row.slug,
    category: row.category_id,
    categoryName: row.blog_categories?.name ?? row.category_id,
    title: row.title,
    excerpt: row.excerpt,
    coverImage: row.cover_image_url,
    author: row.author,
    date: row.published_at,
    readTime: row.read_time,
    featured: row.featured,
    intro: row.intro,
    sections: row.sections ?? [],
  };
}

export async function getBlogCategories() {
  const { data, error } = await supabase
    .from("blog_categories")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data.map((row) => ({ id: row.id, name: row.name }));
}

export async function getBlogPosts() {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_SELECT)
    .order("published_at", { ascending: false });

  if (error) throw error;
  return data.map(normalizeBlogPost);
}

export async function getFeaturedBlogPosts(limit = 3) {
  const { data: featured, error: featuredError } = await supabase
    .from("blog_posts")
    .select(POST_SELECT)
    .eq("featured", true)
    .order("published_at", { ascending: false });

  if (featuredError) throw featuredError;

  const posts = [...(featured ?? [])];

  if (posts.length < limit) {
    const { data: latest, error: latestError } = await supabase
      .from("blog_posts")
      .select(POST_SELECT)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (latestError) throw latestError;

    const seen = new Set(posts.map((row) => row.slug));
    for (const row of latest ?? []) {
      if (posts.length >= limit) break;
      if (seen.has(row.slug)) continue;
      posts.push(row);
      seen.add(row.slug);
    }
  }

  return posts
    .sort((a, b) => String(b.published_at).localeCompare(String(a.published_at)))
    .slice(0, limit)
    .map(normalizeBlogPost);
}

export async function getBlogPostBySlug(slug) {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? normalizeBlogPost(data) : null;
}

export async function getRelatedBlogPosts(categoryId, excludeSlug, limit = 3) {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_SELECT)
    .eq("category_id", categoryId)
    .neq("slug", excludeSlug)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data.map(normalizeBlogPost);
}
