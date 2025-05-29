import { motion } from 'framer-motion';
import { useState } from 'react';
import Button from '../components/ui/Button';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';

const LeaderboardPage = () => {
  const [activeView, setActiveView] = useState<'overall' | 'monthly'>('overall');

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-primary-900">Leaderboard</h1>
          <p className="mt-4 text-lg text-gray-600">
            See how builders rank based on their performance across all challenges
          </p>
        </motion.div>
        
        <div className="bg-gradient-to-r from-primary-900 to-secondary-800 rounded-xl p-1 mb-8">
          <div className="flex">
            <button
              onClick={() => setActiveView('overall')}
              className={`flex-1 py-3 text-center text-sm font-medium rounded-lg ${
                activeView === 'overall' 
                  ? 'bg-white text-primary-900'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Overall Career Scores
            </button>
            <button
              onClick={() => setActiveView('monthly')}
              className={`flex-1 py-3 text-center text-sm font-medium rounded-lg ${
                activeView === 'monthly'
                  ? 'bg-white text-primary-900' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Monthly Rankings
            </button>
          </div>
        </div>
        
        <motion.div
          key={activeView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <LeaderboardTable 
            entries={[]} 
            isLoading={false}
          />
          
          <div className="mt-6 text-center">
            <Button variant="outline" size="sm">
              Load More
            </Button>
          </div>
        </motion.div>
        
        {/* Featured achievements section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.2 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-primary-900 mb-6 text-center">Recent Achievements</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="h-3 bg-gradient-to-r from-primary-600 to-secondary-600"></div>
                <div className="p-6">
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0">
                      <img
                        src={`https://images.pexels.com/photos/${2379004 + i}/pexels-photo-${2379004 + i}.jpeg?auto=compress&cs=tinysrgb&w=300`}
                        alt="User avatar"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">{['James Liu', 'Emily Chen', 'Raj Patel'][i - 1]}</h3>
                      <p className="text-sm text-gray-500">{['Perfect Score', 'First Time Winner', 'Innovation Award'][i - 1]}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {[
                      'Achieved a perfect score of 100/100 in the Financial Sentiment Analyzer challenge.',
                      'Won first place in their first-ever challenge submission for the AI Writing Assistant.',
                      'Received special recognition for the most innovative approach to the Medical Diagnosis Assistant.'
                    ][i - 1]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LeaderboardPage;