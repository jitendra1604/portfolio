import dynamic from "next/dynamic";
import HeroSection from "./components/sections/HeroSection";
import SectionSkeleton from "./components/SectionSkeleton";

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

const Chatbot = dynamic(() => import("./components/ai/Chatbot"));

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <HowIBuildSection />
      <ExperienceSection />
      <ContactSection />
      <Chatbot />
    </>
  );
}
