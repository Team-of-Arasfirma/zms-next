import Hero from "./Hero";
import Stats from "./Stats";
import About from "./About";
import Advantage from "./Advantage";
import ProductPreview from "./ProductPreview";
import Applications from "./Applications";
import LatestProjects from "./LatestProjects";
import IndustryLeaders from "./IndustryLeaders";
import PrestigiousClients from "./PrestigiousClients";
import Testimonial from "./Testimonial";
import CTA from "./CTA";
function App() {
  return (
    <>
      <main>
        <section id="home" className="scroll-mt-24">
          <Hero />
          <Stats />
          <About />
          <Advantage />
          <ProductPreview />
          <Applications />
          <LatestProjects />
          <IndustryLeaders />
          <PrestigiousClients />
          <Testimonial />
          <CTA />
        </section>
      </main>
    </>
  );
}

export default App;
