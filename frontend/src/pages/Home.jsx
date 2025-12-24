import HeroSectionSection from '../components/HeroSection/HeroSection';
import FeaturesSection from '../components/HeroSection/FeaturesSection';
import CategoryShowcase from '../components/HeroSection/CategoryShowcase';
import FeaturedProducts from '../components/HeroSection/FeaturedProducts';
import CTASection from '../components/HeroSection/CTASection';

const Home = () => {
  return (
    <div>
      <HeroSectionSection />
      <FeaturesSection />
      <CategoryShowcase />
      <FeaturedProducts />
      <CTASection />
    </div>
  );
};

export default Home;