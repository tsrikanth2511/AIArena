import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trophy, Users, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Challenge } from '../types';
import { formatDate } from '../lib/utils';
import toast from 'react-hot-toast';

const CompanyDashboardPage = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'company') {
      navigate('/');
      return;
    }
    fetchChallenges();
  }, [user, navigate]);

  const fetchChallenges = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          company:company_id (
            id,
            full_name,
            avatar_url,
            company_details
          )
        `)
        .eq('company_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedChallenges: Challenge[] = (data || []).map(challenge => ({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        company: {
          id: challenge.company.id,
          name: challenge.company.full_name || 'Unknown Company',
          logo: challenge.company.avatar_url || `https://ui-avatars.com/api/?name=${challenge.company.full_name}`,
          description: challenge.company.company_details?.description,
          website: challenge.company.company_details?.website,
        },
        deadline: challenge.deadline,
        prizeMoney: challenge.prize_money,
        difficulty: challenge.difficulty,
        tags: challenge.tags || [],
        participants: challenge.participants_count,
        status: challenge.status,
        requirements: challenge.requirements || [],
        evaluationCriteria: challenge.evaluation_criteria as any[] || [],
      }));

      setChallenges(formattedChallenges);
    } catch (error: any) {
      console.error('Error fetching challenges:', error);
      toast.error('Failed to load challenges');
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
      value: challenges.filter(c => c.status === 'Active').length,
      icon: BarChart,
      color: 'bg-green-500',
    },
    {
      title: 'Total Participants',
      value: challenges.reduce((acc, c) => acc + c.participants, 0),
      icon: Users,
      color: 'bg-purple-500',
    },
  ];

  if (!user || user.role !== 'company') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">You must be logged in as a company to view this page.</p>
        <Button onClick={() => navigate('/login')}>Log In</Button>
      </div>
    );
  }

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
            <div className="p-6">
              <div className="animate-pulse space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-64"></div>
                      <div className="h-3 bg-gray-200 rounded w-48"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : challenges.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p className="mb-4">No challenges yet.</p>
              <Button
                onClick={() => navigate('/company/challenges/create')}
                leftIcon={<Plus size={16} />}
              >
                Create your first challenge
              </Button>
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
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Users size={16} className="mr-1" />
                        {challenge.participants} participants
                      </span>
                      <span>Deadline: {formatDate(challenge.deadline)}</span>
                      <span>${challenge.prizeMoney.toLocaleString()} Prize</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {challenge.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge
                      variant={
                        challenge.status === 'Active' ? 'success' :
                        challenge.status === 'Completed' ? 'default' : 'warning'
                      }
                    >
                      {challenge.status}
                    </Badge>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/challenges/${challenge.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
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