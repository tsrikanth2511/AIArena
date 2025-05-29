import { motion } from 'framer-motion';
import { useChallengeStore } from '../store/challengeStore';
import ChallengeCard from '../components/challenges/ChallengeCard';
import ChallengeFilters from '../components/challenges/ChallengeFilters';

const ChallengesPage = () => {
  const { filteredChallenges, isLoading } = useChallengeStore();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-primary-900"
          >
            AI Challenge Catalogue
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Browse through AI challenges from top companies and showcase your skills
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ChallengeFilters />
            </div>
          </div>

          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse bg-white rounded-lg shadow h-96">
                    <div className="h-3 bg-gray-300 rounded-t-lg"></div>
                    <div className="p-5">
                      <div className="flex items-center mb-4">
                        <div className="rounded-full bg-gray-300 h-10 w-10"></div>
                        <div className="ml-3 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-24"></div>
                          <div className="h-3 bg-gray-300 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-6 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredChallenges.length > 0 ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {filteredChallenges.map((challenge) => (
                  <motion.div
                    key={challenge.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <ChallengeCard challenge={challenge} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-20 bg-white rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-1">No challenges found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengesPage;