import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Github, Globe, Building, ArrowUpRight } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user, updateProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">Please log in to view your profile</p>
      </div>
    );
  }

  const isCompany = user.role === 'company';
  
  const tabs = isCompany ? [
    { id: 'profile', label: 'Company Profile' },
    { id: 'settings', label: 'Profile Settings' }
  ] : [
    { id: 'profile', label: 'Profile' },
    { id: 'submissions', label: 'My Submissions' },
    { id: 'badges', label: 'Badges & Achievements' },
    { id: 'settings', label: 'Profile Settings' }
  ];

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const profileData = {
      name: formData.get('name') as string,
      bio: formData.get('bio') as string,
      githubUrl: formData.get('github') as string,
      portfolioUrl: formData.get('portfolio') as string,
      githubUsername: user?.githubUsername || '',
    };

    try {
      await updateProfile(profileData);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Profile header */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-primary-600 to-secondary-600"></div>
        
        <div className="px-4 sm:px-6 lg:px-8 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-end -mt-12">
            <div className="flex-shrink-0 relative">
              <img
                className="h-24 w-24 rounded-full border-4 border-white bg-white object-cover"
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
                    {isCompany ? 'Website' : 'Portfolio'}
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
          
          {/* Stats cards - Only show for individual users */}
          {!isCompany && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-500">Career Score</div>
                <div className="text-2xl font-bold text-primary-900">{user.careerScore}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-500">Submissions</div>
                <div className="text-2xl font-bold text-primary-900">2</div>
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
          )}
          
          {/* Company Info - Only show for companies */}
          {isCompany && user.companyDetails && (
            <div className="mt-6 bg-gray-50 rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Building size={20} className="text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
              </div>
              <p className="text-gray-600">{user.companyDetails.description}</p>
              {user.companyDetails.website && (
                <a
                  href={user.companyDetails.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center text-secondary-600 hover:text-secondary-700"
                >
                  <Globe size={16} className="mr-1" />
                  Visit Website
                  <ArrowUpRight size={14} className="ml-1" />
                </a>
              )}
            </div>
          )}
          
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
        {activeTab === 'profile' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {isCompany ? 'About the Company' : 'About Me'}
            </h2>
            <p className="text-gray-600">
              {user.bio || `No ${isCompany ? 'company description' : 'bio'} provided yet.`}
            </p>
          </div>
        )}
        
        {/* Individual-specific tabs */}
        {!isCompany && (
          <>
            {activeTab === 'submissions' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Submissions</h2>
                <div className="space-y-4">
                  {/* Add submissions list here */}
                  <p className="text-gray-500 text-center py-6">No submissions yet.</p>
                </div>
              </div>
            )}
            
            {activeTab === 'badges' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Badges & Achievements</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {user.badges.length === 0 ? (
                    <p className="text-gray-500 text-center py-6 col-span-full">
                      No badges earned yet. Start participating in challenges to earn badges!
                    </p>
                  ) : (
                    user.badges.map((badge) => (
                      <div
                        key={badge.id}
                        className="bg-white border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
                              <span className="text-secondary-600 text-lg">{badge.icon}</span>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{badge.name}</h3>
                            <p className="text-xs text-gray-500">{badge.description}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
        
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Settings</h2>
            <form className="space-y-6" onSubmit={handleProfileUpdate}>
              {error && (
                <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {isCompany ? 'Company Name' : 'Full Name'}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={user.name}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  {isCompany ? 'Company Description' : 'Bio'}
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  defaultValue={user.bio}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm"
                ></textarea>
              </div>
              
              {!isCompany && (
                <div>
                  <label htmlFor="github" className="block text-sm font-medium text-gray-700">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    id="github"
                    name="github"
                    defaultValue={user.githubUrl}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm"
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700">
                  {isCompany ? 'Website URL' : 'Portfolio URL'}
                </label>
                <input
                  type="url"
                  id="portfolio"
                  name="portfolio"
                  defaultValue={user.portfolioUrl}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm"
                />
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" isLoading={isLoading}>
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