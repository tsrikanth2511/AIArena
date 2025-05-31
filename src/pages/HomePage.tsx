import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import StatsSection from '../components/home/StatsSection';
import CallToAction from '../components/home/CallToAction';

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <CallToAction />
    </div>
  );
};

export default HomePage;