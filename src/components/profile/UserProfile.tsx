import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Github, Globe, Award, ArrowUpRight } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAuthStore } from '../../store/authStore';

const UserProfile = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('submissions');
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">Please log in to view your profile</p>
      </div>
    );
  }

  const tabs = [
    { id: 'submissions', label: 'My Submissions' },
    { id: 'badges', label: 'Badges & Achievements' },
    { id: 'settings', label: 'Profile Settings' },
  ];
  
  // Mock submissions data
  const submissions = [
    {
      id: 's1',
      challengeTitle: 'Build a Real-Time Financial Sentiment Analyzer',
      company: 'FinTech Innovations',
      submittedAt: '2024-04-20T14:30:00Z',
      score: 88,
      status: 'Scored'
    },
    {
      id: 's2',
      challengeTitle: 'Create an AI Writing Assistant for Technical Documentation',
      company: 'DevTools Inc',
      submittedAt: '2024-03-15T09:45:00Z',
      score: 92,
      status: 'Scored'
    }
  ];

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Profile header */}
      <div className="relative">
        {/* Cover background */}
        <div className="h-32 bg-gradient-to-r from-primary-600 to-secondary-600"></div>
        
        {/* Profile info */}
        <div className="px-4 sm:px-6 lg:px-8 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-end -mt-12">
            <div className="flex-shrink-0 relative">
              <img
                className="h-24 w-24 rounded-full border-4 border-white bg-white"
                src={user.avatar}
                alt={user.name}
              />
              <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-success-500 border-2 border-white"></div>
            </div>
            
            <div className="mt-4 sm:mt-0 sm:ml-4 flex-grow">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-500">{user.bio || 'No bio provided'}</p>
              
              <div className="mt-2 flex flex-wrap items-center text-sm text-gray-600 gap-4">
                <div className="flex items-center">
                  <Mail size={14} className="mr-1" />
                  {user.email}
                </div>
                {user.githubUrl && (
                  <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-secondary-600">
                    <Github size={14} className="mr-1" />
                    GitHub
                    <ArrowUpRight size={12} className="ml-1" />
                  </a>
                )}
                {user.portfolioUrl && (
                  <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-secondary-600">
                    <Globe size={14} className="mr-1" />
                    Portfolio
                    <ArrowUpRight size={12} className="ml-1" />
                  </a>
                )}
              </div>
            </div>
            
            <div className="mt-4 sm:mt-0 flex-shrink-0">
              <Button variant="outline" size="sm" leftIcon={<User size={14} />}>
                Edit Profile
              </Button>
            </div>
          </div>
          
          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-500">Career Score</div>
              <div className="text-2xl font-bold text-primary-900">{user.careerScore}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-500">Submissions</div>
              <div className="text-2xl font-bold text-primary-900">{submissions.length}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-500">Badges</div>
              <div className="text-2xl font-bold text-primary-900">{user.badges.length}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-500">Member Since</div>
              <div className="text-lg font-medium text-primary-900">
                {new Date(user.joinedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="mt-8 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-secondary-500 text-secondary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
      
      {/* Tab content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {activeTab === 'submissions' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Submissions</h2>
            
            {submissions.length === 0 ? (
              <p className="text-gray-500 text-center py-6">You haven't submitted any challenges yet.</p>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-base font-medium text-gray-900">{submission.challengeTitle}</h3>
                        <p className="text-sm text-gray-500">
                          {submission.company} · Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center">
                        <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-800 mr-2">
                          Score: {submission.score}/100
                        </div>
                        <Badge variant={submission.status === 'Scored' ? 'success' : 'warning'}>
                          {submission.status}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'badges' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Badges & Achievements</h2>
            
            {user.badges.length === 0 ? (
              <p className="text-gray-500 text-center py-6">You haven't earned any badges yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {user.badges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border border-gray-200 rounded-lg p-4 flex items-center"
                  >
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center">
                        <Award size={24} className="text-secondary-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-gray-900">{badge.name}</h3>
                      <p className="text-sm text-gray-500">{badge.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Earned {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Settings</h2>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  id="name"
                  defaultValue={user.name}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  id="bio"
                  rows={3}
                  defaultValue={user.bio}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="github" className="block text-sm font-medium text-gray-700">GitHub URL</label>
                  <input
                    type="url"
                    id="github"
                    defaultValue={user.githubUrl}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700">Portfolio URL</label>
                  <input
                    type="url"
                    id="portfolio"
                    defaultValue={user.portfolioUrl}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;