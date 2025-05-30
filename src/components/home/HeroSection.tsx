import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';

const HeroSection = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white">
      {/* Particle animation in background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-secondary-500 opacity-20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 30 + 10}px`,
              height: `${Math.random() * 30 + 10}px`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, Math.random() + 0.5, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Ship <span className="text-secondary-400">Real AI Solutions</span>, Get Noticed
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-lg mx-auto md:mx-0">
              Showcase your AI product building skills by competing in challenges authored by top companies. Get hired based on what you can actually build.
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
                    <p className="text-gray-300 text-sm mt-1">FinTech Innovations</p>
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
                  
                  <div className="flex items-center mt-4 space-x-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div 
                          key={i} 
                          className="w-8 h-8 rounded-full bg-gray-300 border-2 border-primary-800 flex items-center justify-center text-xs font-medium text-primary-800"
                        >
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-gray-300">+24 more</span>
                  </div>
                </div>
              </div>
            </div>
            
            <motion.div
              className="absolute -bottom-10 -left-16 bg-white bg-opacity-5 backdrop-filter backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-4 shadow-lg"
              animate={{ y: [0, -10, 0] }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-success-500"></div>
                <span className="text-sm font-medium">Score: 95/100</span>
              </div>
            </motion.div>
            
            <motion.div
              className="absolute -top-8 right-12 bg-white bg-opacity-5 backdrop-filter backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-4 shadow-lg"
              animate={{ y: [0, -8, 0] }}
              transition={{ 
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <div className="text-sm font-medium">
                <span className="text-secondary-300">#2</span> Rank
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        <div className="mt-16 md:mt-24">
          <p className="text-center text-gray-400 mb-6">Trusted by leading AI-centric companies</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-70">
            {['OpenAI', 'Anthropic', 'Mistral', 'Cohere'].map((company) => (
              <div key={company} className="text-white font-semibold text-lg">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;