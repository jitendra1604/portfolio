type SectionSkeletonProps = {
  titleWidth?: string;
};

export default function SectionSkeleton({
  titleWidth = "w-56",
}: SectionSkeletonProps) {
  return (
    <section className="bg-black px-6 py-24 text-white md:py-32">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className={`h-10 rounded-full bg-white/8 ${titleWidth}`} />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="h-48 rounded-3xl bg-white/6" />
          <div className="h-48 rounded-3xl bg-white/6" />
        </div>
      </div>
    </section>
  );
}
