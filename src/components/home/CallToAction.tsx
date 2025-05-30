import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';

const CallToAction = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.2 }}
          className="bg-gradient-to-r from-primary-900 via-primary-800 to-secondary-800 rounded-xl overflow-hidden shadow-xl"
        >
          <div className="relative px-6 py-12 md:p-12 lg:p-16">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 rounded-full bg-secondary-500 opacity-10"></div>
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-40 h-40 rounded-full bg-primary-600 opacity-10"></div>
            
            <div className="relative z-10 md:flex md:items-center md:justify-between">
              <div className="mb-8 md:mb-0 md:max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  Ready to showcase your AI building skills?
                </h2>
                <p className="mt-4 text-lg text-gray-200">
                  Join thousands of builders proving their abilities through real-world AI challenges and get discovered by companies who care about what you can actually build.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row md:flex-col space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-0 md:space-y-4">
                <Link to="/challenges" className="w-full md:w-auto">
                  <Button size="lg" className="w-full">
                    Browse Challenges
                  </Button>
                </Link>
                {!isAuthenticated && (
                  <Link to="/register" className="w-full md:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full bg-white text-primary-900 hover:bg-gray-100"
                    >
                      Create Account
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;