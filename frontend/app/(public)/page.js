import { withPageSeo } from "@/lib/pageSeo";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import About from "@/components/home/About";
import Advantage from "@/components/home/Advantage";
import ProductPreview from "@/components/home/ProductPreview";
import Applications from "@/components/home/Applications";
import LatestProjects from "@/components/home/LatestProjects";
import IndustryLeaders from "@/components/home/IndustryLeaders";
import PrestigiousClients from "@/components/home/PrestigiousClients";
import Testimonial from "@/components/home/Testimonial";
import CTA from "@/components/home/CTA";

// Home page canonical SEO
const fallbackMetadata = {
  alternates: {
    canonical: "https://www.zmsipl.com/",
  },
};

export default function HomePage() {
  return (
    <section id="home">
      <Hero />
      <Stats />
      <About />
      <Advantage />
      <ProductPreview />
      {/* <Applications /> */}
      <LatestProjects />
      <IndustryLeaders />
      <PrestigiousClients />
     {/* <Testimonial /> */}
      <CTA />
    </section>
  );
}
export async function generateMetadata() {
  return withPageSeo('/', fallbackMetadata);
}
