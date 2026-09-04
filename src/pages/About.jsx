import PageHeader from "../components/PageHeader";
import AboutStats from "../components/AboutStats";
import AboutStory from "../components/about/AboutStory";
import AboutValues from "../components/about/AboutValues";
import AboutTeam from "../components/about/AboutTeam";
import AboutCta from "../components/about/AboutCta";
import { SectionLoading, SectionError } from "../components/SectionState";
import {
  getAboutStory,
  getTeamMembers,
  getAboutValues,
  getSiteStats,
} from "../lib/queries/about";
import { useSupabaseQuery } from "../lib/useSupabaseQuery";

const HEADER_IMAGE =
  "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1600&auto=format&fit=crop";

export default function About() {
  const { data: story, loading: storyLoading, error } = useSupabaseQuery(
    "about-story",
    getAboutStory,
    [],
  );
  const { data: team, loading: teamLoading } = useSupabaseQuery(
    "team-members",
    getTeamMembers,
    [],
  );
  const { data: values, loading: valuesLoading } = useSupabaseQuery(
    "about-values",
    getAboutValues,
    [],
  );
  const { data: stats, loading: statsLoading } = useSupabaseQuery(
    "site-stats:about",
    () => getSiteStats("about"),
    [],
  );

  const loading = storyLoading || teamLoading || valuesLoading || statsLoading;

  return (
    <>
      <title>Hakkımızda | Roséa Güzellik Merkezi</title>
      <meta
        name="description"
        content="Roséa Güzellik Merkezi'nin hikayesini, uzman kadrosunu ve değerlerini keşfedin. 2013'ten bu yana güvenilir güzellik ve bakım hizmeti."
      />

      <PageHeader
        title="Hakkımızda"
        subtitle="Güzelliğe olan tutkumuzu, uzman kadromuzu ve değerlerimizi yakından tanıyın."
        breadcrumb={[{ label: "Anasayfa", to: "/" }, { label: "Hakkımızda" }]}
        image={HEADER_IMAGE}
      />

      {loading && <SectionLoading className="py-24" />}
      {error && <SectionError className="py-24" />}

      {story && <AboutStory story={story} />}
      {values && <AboutValues values={values} />}
      {team && <AboutTeam team={team} />}
      {stats && <AboutStats stats={stats} />}
      <AboutCta />
    </>
  );
}
