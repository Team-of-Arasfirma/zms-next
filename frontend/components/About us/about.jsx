import AboutHero from "./AboutHero.jsx";
import CompanyOverview from "./CompanyOverview.jsx";
import StatsBar from "./StatsBar";
import Infra from "./Infrastructure.jsx";
import MissionVisionValues from "./MissionVisionValues.jsx";
import ManufacturingProcess from "./ManufacturingProcess.jsx";
import CertificationAwards from "./CertificationAwards.jsx";
import CTA from "../home/CTA.jsx";

const About = () => {
  return (
    <>
      <AboutHero />
      <CompanyOverview />
      <StatsBar />
      <Infra />
      <MissionVisionValues />
      <ManufacturingProcess />
       <CertificationAwards />
      <CTA />
    </>
  );
};

export default About;