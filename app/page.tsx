import dynamic from "next/dynamic";
import { Suspense } from "react";
import HeroSection from "./components/sections/HeroSection";
import SectionSkeleton from "./components/SectionSkeleton";
import LatestWritingSection from "./components/sections/LatestWritingSection";

const AboutSection = dynamic(() => import("./components/sections/AboutSection"), {
  loading: () => <SectionSkeleton titleWidth="w-40" />,
});

const ProjectsSection = dynamic(
  () => import("./components/sections/ProjectsSection"),
  {
    loading: () => <SectionSkeleton titleWidth="w-56" />,
  }
);

const HowIBuildSection = dynamic(
  () => import("./components/sections/HowIBuildSection"),
  {
    loading: () => <SectionSkeleton titleWidth="w-60" />,
  }
);

const ExperienceSection = dynamic(
  () => import("./components/sections/ExperienceSection"),
  {
    loading: () => <SectionSkeleton titleWidth="w-52" />,
  }
);

const ContactSection = dynamic(
  () => import("./components/sections/ContactSection"),
  {
    loading: () => <SectionSkeleton titleWidth="w-48" />,
  }
);
const LiveSystemConsole = dynamic(() => import("./components/LiveSystemConsole"), {
  loading: () => <SectionSkeleton titleWidth="w-52" />,
});

// Latest Writing pulls Notion/MDX posts; cache the page like the blog index
// does instead of fetching Notion on every request.
export const revalidate = 30;

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <HowIBuildSection />
      <ExperienceSection />
      {/* Async (Notion). Its own boundary, so a slow fetch streams this one
          section in instead of holding the whole page behind the loader. */}
      <Suspense fallback={<SectionSkeleton titleWidth="w-64" />}>
        <LatestWritingSection />
      </Suspense>
      <ContactSection />
      <LiveSystemConsole />
    </>
  );
}
