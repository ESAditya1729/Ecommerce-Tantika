import HeroAbout from '../components/About/HeroAbout';
import OurStory from '../components/About/OurStory';
import ArtisansSection from '../components/About/ArtisansSection';
import ProcessSection from '../components/About/ProcessSection';
import ValuesSection from '../components/About/ValuesSection';
import CTAAbout from '../components/About/CTAAbout';
import LeadershipTeam from '../components/About/LeadershipTeam';

const About = () => {
  return (
    <div>
      <HeroAbout />
      <OurStory />
      <ArtisansSection />
      <ProcessSection />
      <ValuesSection />
      <LeadershipTeam />
      <CTAAbout />
    </div>
  );
};

export default About;