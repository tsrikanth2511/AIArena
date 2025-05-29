import { motion } from 'framer-motion';
import { Trophy, Award, Medal } from 'lucide-react';
import { LeaderboardEntry } from '../../types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  isLoading?: boolean;
}

// Mock data for the leaderboard
const mockLeaderboard: LeaderboardEntry[] = [
  {
    userId: '1',
    userName: 'Alex Johnson',
    userAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
    score: 920,
    rank: 1,
    badges: [{ id: 'b1', name: 'Top Contributor', description: 'Most active participant', icon: 'award', earnedAt: '2024-03-15T12:00:00Z' }],
  },
  {
    userId: '2',
    userName: 'Maria Garcia',
    userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300',
    score: 875,
    rank: 2,
    badges: [{ id: 'b2', name: 'Innovation Star', description: 'Created the most innovative solution', icon: 'star', earnedAt: '2024-02-20T12:00:00Z' }],
  },
  {
    userId: '3',
    userName: 'David Kim',
    userAvatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=300',
    score: 820,
    rank: 3,
    badges: [{ id: 'b3', name: 'Perfect Score', description: 'Achieved a perfect score in one challenge', icon: '100', earnedAt: '2024-01-10T12:00:00Z' }],
  },
  {
    userId: '4',
    userName: 'Sarah Wilson',
    userAvatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300',
    score: 780,
    rank: 4,
    badges: [],
  },
  {
    userId: '5',
    userName: 'James Rodriguez',
    userAvatar: 'https://images.pexels.com/photos/2380794/pexels-photo-2380794.jpeg?auto=compress&cs=tinysrgb&w=300',
    score: 765,
    rank: 5,
    badges: [{ id: 'b5', name: 'Rising Star', description: 'Made the most progress in a short time', icon: 'trending-up', earnedAt: '2024-03-05T12:00:00Z' }],
  },
];

const LeaderboardTable = ({ entries = mockLeaderboard, isLoading = false }: LeaderboardTableProps) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy size={20} className="text-warning-500" />;
      case 2:
        return <Medal size={20} className="text-gray-400" />;
      case 3:
        return <Award size={20} className="text-amber-700" />;
      default:
        return <span className="font-semibold">{rank}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 mb-4"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border-b border-gray-200">
              <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/5"></div>
              </div>
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Builder
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Badges
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry, index) => (
              <motion.tr 
                key={entry.userId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={entry.rank <= 3 ? 'bg-gray-50' : ''}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                    {getRankIcon(entry.rank)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full object-cover" src={entry.userAvatar} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{entry.userName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-1">
                    {entry.badges.slice(0, 3).map((badge) => (
                      <div 
                        key={badge.id}
                        className="w-6 h-6 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600"
                        title={badge.name}
                      >
                        <Award size={14} />
                      </div>
                    ))}
                    {entry.badges.length > 3 && (
                      <div className="text-xs text-gray-500 flex items-center">
                        +{entry.badges.length - 3}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <span className="font-bold">{entry.score}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardTable;