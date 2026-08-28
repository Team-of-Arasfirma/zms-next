import Image from "next/image";

function ProjectHero() {
  return (
    <section className="relative w-full h-[70vh] min-h-[480px] overflow-hidden">
      {/* Background Image */}
      <Image
        src="/assets/project/chi.jpg"
        alt="Chennimalai 7MW project"
        fill
        sizes="100vw"
        className="object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/55"></div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-3xl">
            <p className="font-[Lato] text-[#ff6b2c] text-sm md:text-base uppercase tracking-[4px] mb-4">
              Our Projects
            </p>

            <h1 className="font-[Bebas_Neue] text-white text-[58px] md:text-[90px] lg:text-[110px] leading-[0.9] tracking-wide">
              Building Strong <br />
              Industrial Landmarks
            </h1>

            <p className="font-[Lato] text-gray-200 text-base md:text-lg max-w-2xl mt-6 leading-relaxed">
              Explore our completed and ongoing projects that showcase ZMS
              precision, fabrication strength, and high-quality structural
              solutions.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Shape */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg
          className="relative block w-full h-[70px]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C300,100 900,100 1200,0 L1200,120 L0,120 Z"
            className="fill-white"
          ></path>
        </svg>
      </div>
    </section>
  );
}

export default ProjectHero;

