import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';

const HeroSection = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Build <span className="text-secondary-400">Real AI Solutions</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-lg mx-auto md:mx-0">
              Showcase your AI product building skills by competing in challenges. Get hired based on what you can actually build.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
              <Link to="/challenges" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  rightIcon={<ArrowRight size={20} />}
                  className="w-full"
                >
                  Browse Challenges
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full bg-white bg-opacity-10 border-white border-opacity-20 text-white hover:bg-opacity-20"
                  >
                    Create Account
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:block relative"
          >
            <div className="relative">
              <div className="w-full h-full absolute -right-4 -bottom-4 bg-accent-500 rounded-lg opacity-20"></div>
              <div className="relative bg-white bg-opacity-5 backdrop-filter backdrop-blur-sm border border-white border-opacity-10 rounded-lg shadow-xl overflow-hidden p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-semibold text-lg">Build a Sentiment Analyzer</h3>
                    <p className="text-gray-300 text-sm mt-1">Active Challenge</p>
                  </div>
                  <span className="px-3 py-1 bg-secondary-600 bg-opacity-20 rounded-full text-secondary-300 text-xs font-medium">
                    $5,000 Prize
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="h-2 bg-white bg-opacity-10 rounded-full w-full">
                    <div className="h-2 bg-secondary-500 rounded-full w-3/4"></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>187 Participants</span>
                    <span>15 days left</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;