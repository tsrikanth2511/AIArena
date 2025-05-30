import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trophy, Users, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

interface Challenge {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed';
  participants_count: number;
  created_at: string;
}

const CompanyDashboardPage = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'company') {
      navigate('/');
      return;
    }
    fetchChallenges();
  }, [user]);

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('company_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Challenges',
      value: challenges.length,
      icon: Trophy,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Challenges',
      value: challenges.filter(c => c.status === 'active').length,
      icon: BarChart,
      color: 'bg-green-500',
    },
    {
      title: 'Total Participants',
      value: challenges.reduce((acc, c) => acc + c.participants_count, 0),
      icon: Users,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
        <Button
          onClick={() => navigate('/company/challenges/create')}
          leftIcon={<Plus size={20} />}
        >
          Create New Challenge
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Challenges List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Challenges</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Loading challenges...</div>
          ) : challenges.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No challenges yet. Create your first challenge!
            </div>
          ) : (
            challenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{challenge.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{challenge.description}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      challenge.status === 'active' ? 'bg-green-100 text-green-800' :
                      challenge.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                    </span>
                    <Button
                      variant="ghost"
                      onClick={() => navigate(`/challenges/${challenge.id}/edit`)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Users size={16} className="mr-1" />
                  {challenge.participants_count} participants
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboardPage; 