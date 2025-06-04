import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, DollarSign, ArrowLeft, GanttChartSquare, Upload, BarChart, GitBranch, Brain, FileText } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Challenge } from '../types';
import { useAuthStore } from '../store/authStore';
import { formatDate, getDifficultyColor } from '../lib/utils';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Octokit } from '@octokit/rest';

interface EvaluationResult {
  summary: string;
  scores: {
    [key: string]: number;
  };
  overallScore: number;
  keyStrengths: string[];
  keyImprovements: string[];
}

type EvaluationStage = 'idle' | 'processing' | 'analyzing' | 'preparing';

const ChallengePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [evaluationStage, setEvaluationStage] = useState<EvaluationStage>('idle');

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const { data: challengeData, error } = await supabase
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
          .eq('id', id)
          .single();

        if (error) throw error;

        if (challengeData) {
          const formattedChallenge: Challenge = {
            id: challengeData.id,
            title: challengeData.title,
            description: challengeData.description,
            company: {
              id: challengeData.company?.id || challengeData.company_id,
              name: challengeData.company?.full_name || 'Unknown Company',
              logo: challengeData.company?.avatar_url || `https://ui-avatars.com/api/?name=Unknown+Company`,
              description: challengeData.company?.company_details?.description,
              website: challengeData.company?.company_details?.website,
            },
            deadline: challengeData.deadline,
            prizeMoney: challengeData.prize_money,
            difficulty: challengeData.difficulty,
            tags: challengeData.tags || [],
            participants: challengeData.participants_count,
            status: challengeData.status,
            requirements: challengeData.requirements || [],
            evaluationCriteria: challengeData.evaluation_criteria as any[] || [],
          };

          setChallenge(formattedChallenge);
        }
      } catch (error) {
        console.error('Error fetching challenge:', error);
        toast.error('Failed to load challenge');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenge();
  }, [id]);

  const evaluateSubmission = async (repoUrl: string, folderName: string) => {
    if (!challenge) throw new Error('Challenge not found');
    
    try {
      // Extract owner and repo from GitHub URL
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) throw new Error('Invalid GitHub URL');
      const [, owner, repo] = match;

      console.log('GitHub Repository Info:', { owner, repo });

      // Prepare evaluation data
      const evaluationRequest = {
        repository: {
          name: repo,
          owner: owner,
          folderName: folderName
        },
        challenge: {
          requirements: challenge.requirements,
          evaluationCriteria: challenge.evaluationCriteria,
        }
      };

      // Send to Edge Function for evaluation
      const { data: evaluationResponse, error: evaluationError } = await supabase.functions.invoke('evaluate-submission', {
        body: evaluationRequest
      });

      if (evaluationError) {
        console.error('Evaluation error:', evaluationError);
        throw new Error(evaluationError.message);
      }

      return evaluationResponse.evaluation;
    } catch (error) {
      console.error('Detailed error in evaluateSubmission:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!challenge) {
      toast.error('Challenge not found');
      return;
    }

    e.preventDefault();
    setIsEvaluating(true);
    setEvaluationResult(null);
    setEvaluationStage('processing');

    try {
      const formData = new FormData(e.currentTarget);
      const repoUrl = formData.get('repo-url') as string;
      
      // Create a unique folder name for this submission
      const folderName = `submissions/${user?.id}/${challenge.id}/${Date.now()}`;
      
      // Stage 1: Processing Repository
      setEvaluationStage('processing');
      const cloneResponse = await supabase.functions.invoke('clone-repo', {
        body: { 
          repoUrl,
          folderName
        }
      });

      if (cloneResponse.error) {
        throw new Error(cloneResponse.error.message);
      }

      // Stage 2: Analyzing Repository
      setEvaluationStage('analyzing');
      const evaluation = await evaluateSubmission(repoUrl, folderName);
      
      // Stage 3: Preparing Report
      setEvaluationStage('preparing');
      setEvaluationResult(evaluation);
      
      // Save submission to database
      const { error } = await supabase
        .from('submissions')
        .insert({
          challenge_id: challenge.id,
          user_id: user?.id,
          repo_url: repoUrl,
          deck_url: formData.get('deck-url') as string,
          video_url: formData.get('video-url') as string,
          evaluation_result: evaluation,
        });

      if (error) throw error;
      
      toast.success('Submission evaluated successfully!');
    } catch (error) {
      console.error('Error submitting solution:', error);
      toast.error('Failed to evaluate submission');
    } finally {
      setIsEvaluating(false);
      setEvaluationStage('idle');
    }
  };

  const getEvaluationStageContent = () => {
    switch (evaluationStage) {
      case 'processing':
        return (
          <div className="flex items-center space-x-2 text-primary-600">
            <GitBranch className="animate-spin\" size={20} />
            <span>Processing repository...</span>
          </div>
        );
      case 'analyzing':
        return (
          <div className="flex items-center space-x-2 text-secondary-600">
            <Brain className="animate-pulse" size={20} />
            <span>Analyzing code...</span>
          </div>
        );
      case 'preparing':
        return (
          <div className="flex items-center space-x-2 text-accent-600">
            <FileText className="animate-bounce" size={20} />
            <span>Preparing evaluation report...</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Challenge not found</h2>
        <p className="text-gray-600 mb-8">The challenge you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/challenges"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary-600 hover:bg-secondary-700"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Challenges
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === challenge.company.id;
  const canSubmit = challenge.status === 'Active' && !isOwner && user?.role === 'individual';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <GanttChartSquare size={16} /> },
    ...(user?.role === 'individual' ? [
      { id: 'submit', label: 'Submit Solution', icon: <Upload size={16} /> }
    ] : []),
    { id: 'leaderboard', label: 'Challenge Leaderboard', icon: <BarChart size={16} /> },
  ];

  const daysLeft = Math.ceil(
    (new Date(challenge.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to={isOwner ? "/company/dashboard" : "/challenges"}
          className="inline-flex items-center text-sm text-gray-600 hover:text-secondary-600 mb-6"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to {isOwner ? "Dashboard" : "Challenges"}
        </Link>
        
        {isOwner && (
          <div className="flex justify-end mb-4">
            <Link to={`/company/challenges/edit/${challenge.id}`}>
              <Button variant="outline">
                Edit Challenge
              </Button>
            </Link>
          </div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden mb-6"
        >
          <div className="h-3 bg-gradient-to-r from-primary-600 to-secondary-600"></div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
              <div>
                <div className="flex items-center mb-4">
                  <img
                    src={challenge.company.logo}
                    alt={challenge.company.name}
                    className="h-12 w-12 rounded-full object-cover border border-gray-200"
                  />
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">{challenge.company.name}</h4>
                    <Badge
                      variant={challenge.status === 'Active' ? 'success' : 'default'}
                    >
                      {challenge.status}
                    </Badge>
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{challenge.title}</h1>
                <p className="text-gray-600">{challenge.description}</p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {challenge.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 md:mt-0 md:ml-6 flex-shrink-0">
                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg border border-gray-200 p-4 text-center w-full md:w-48">
                  <span className="block text-2xl font-bold text-primary-900">${challenge.prizeMoney.toLocaleString()}</span>
                  <span className="text-sm text-gray-600">Prize Money</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="flex items-center">
                <Calendar size={20} className="mr-2 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Deadline</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(challenge.deadline)}
                    {challenge.status === 'Active' && (
                      <span className="ml-1 text-sm text-secondary-600">
                        ({daysLeft} day{daysLeft !== 1 ? 's' : ''} left)
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Users size={20} className="mr-2 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Participants</p>
                  <p className="font-medium text-gray-900">{challenge.participants} builders</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <DollarSign size={20} className="mr-2 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Difficulty</p>
                  <div className="font-medium">
                    <Badge variant="primary" className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                  ${activeTab === tab.id
                    ? 'border-secondary-500 text-secondary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {tab.icon && <span className="mr-2">{tab.icon}</span>}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-2 text-gray-600">
                  {challenge.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-secondary-100 text-secondary-600 text-xs font-medium mr-2 mt-0.5">
                        {index + 1}
                      </span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Evaluation Criteria</h2>
                <div className="space-y-4">
                  {challenge.evaluationCriteria.map((criterion, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-medium text-gray-900">{criterion.name}</h3>
                        <span className="text-sm text-gray-500">{criterion.weight}%</span>
                      </div>
                      <p className="text-sm text-gray-600">{criterion.description}</p>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                          style={{ width: `${criterion.weight}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'submit' && user?.role === 'individual' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Submit Your Solution</h2>
                {!canSubmit ? (
                  <div className="py-8">
                    <p className="text-gray-600 mb-4">
                      {challenge.status === 'Completed' 
                        ? 'This challenge has ended and is no longer accepting submissions.'
                        : isOwner
                        ? 'You cannot submit to your own challenge.'
                        : 'This challenge is not currently accepting submissions.'}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/challenges')}
                    >
                      Browse Other Challenges
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600 mb-6">
                      Upload your solution including code repository, pitch deck, and demo video
                    </p>
                    
                    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                      <div className="mb-4">
                        <label htmlFor="repo-url" className="block text-sm font-medium text-gray-700 mb-1">
                          GitHub Repository URL (required)
                        </label>
                        <input
                          type="url"
                          id="repo-url"
                          name="repo-url"
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary-500 focus:border-secondary-500"
                          placeholder="https://github.com/username/repo"
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="deck-url" className="block text-sm font-medium text-gray-700 mb-1">
                          Pitch Deck URL (optional)
                        </label>
                        <input
                          type="url"
                          id="deck-url"
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary-500 focus:border-secondary-500"
                          placeholder="https://docs.google.com/presentation/d/..."
                        />
                        <p className="mt-1 text-xs text-gray-500">Link to your pitch deck (Google Slides, Figma, etc.)</p>
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="video-url" className="block text-sm font-medium text-gray-700 mb-1">
                          Demo Video URL (optional but recommended)
                        </label>
                        <input
                          type="url"
                          id="video-url"
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary-500 focus:border-secondary-500"
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                        <p className="mt-1 text-xs text-gray-500">Link to a demo video of your solution (YouTube, Loom, etc.)</p>
                      </div>

                      {evaluationStage !== 'idle' && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <div className="space-y-4">
                            <div className={`transition-opacity ${evaluationStage === 'processing' ? 'opacity-100' : 'opacity-50'}`}>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Processing Repository</span>
                                {evaluationStage === 'processing' && getEvaluationStageContent()}
                              </div>
                              <div className="mt-2 h-2 bg-gray-200 rounded-full">
                                <div className={`h-2 bg-primary-600 rounded-full ${evaluationStage === 'processing' ? 'animate-pulse w-full' : evaluationStage === 'analyzing' || evaluationStage === 'preparing' ? 'w-full' : 'w-0'}`}></div>
                              </div>
                            </div>

                            <div className={`transition-opacity ${evaluationStage === 'analyzing' ? 'opacity-100' : evaluationStage === 'preparing' ? 'opacity-100' : 'opacity-50'}`}>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Analyzing Code</span>
                                {evaluationStage === 'analyzing' && getEvaluationStageContent()}
                              </div>
                              <div className="mt-2 h-2 bg-gray-200 rounded-full">
                                <div className={`h-2 bg-secondary-600 rounded-full ${evaluationStage === 'analyzing' ? 'animate-pulse w-full' : evaluationStage === 'preparing' ? 'w-full' : 'w-0'}`}></div>
                              </div>
                            </div>

                            <div className={`transition-opacity ${evaluationStage === 'preparing' ? 'opacity-100' : 'opacity-50'}`}>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Preparing Report</span>
                                {evaluationStage === 'preparing' && getEvaluationStageContent()}
                              </div>
                              <div className="mt-2 h-2 bg-gray-200 rounded-full">
                                <div className={`h-2 bg-accent-600 rounded-full ${evaluationStage === 'preparing' ? 'animate-pulse w-full' : 'w-0'}`}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full mt-6" 
                        size="lg"
                        disabled={isEvaluating}
                      >
                        {isEvaluating ? 'Evaluating...' : 'Submit Solution'}
                      </Button>
                    </form>

                    {evaluationResult && (
                      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Evaluation Results</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-900">Summary</h4>
                            <p className="text-gray-700">{evaluationResult.summary}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900">Scores</h4>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                              {Object.entries(evaluationResult.scores).map(([criterion, score]) => {
                                let denominator = 20;
                                if (criterion === 'BadgingRecognition') {
                                  denominator = 20;
                                }
                                return (
                                  <div key={criterion} className="bg-white p-3 rounded shadow-sm">
                                    <div className="text-sm text-gray-600">{criterion}</div>
                                    <div className="text-lg font-semibold text-primary-600">{score}/{denominator}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900">Overall Score</h4>
                            <div className="text-2xl font-bold text-primary-600 mt-1">
                              {evaluationResult.overallScore}/100
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900">Key Strengths</h4>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              {evaluationResult.keyStrengths.map((strength: string, index: number) => (
                                <li key={index} className="text-gray-700">{strength}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900">Areas for Improvement</h4>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              {evaluationResult.keyImprovements.map((improvement: string, index: number) => (
                                <li key={index} className="text-gray-700">{improvement}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'leaderboard' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Challenge Leaderboard</h2>
                <p className="text-gray-600 mb-6">
                  {challenge.status === 'Active' 
                    ? 'Leaderboard will be available once the challenge ends' 
                    : 'Top builders for this challenge'}
                </p>
                
                {challenge.status === 'Completed' ? (
                  <div className="max-w-2xl mx-auto">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <img
                            src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300"
                            alt="Winner"
                            className="h-16 w-16 rounded-full object-cover border-2 border-warning-500"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h4 className="text-lg font-semibold text-gray-900">Alex Johnson</h4>
                            <span className="ml-2 px-2 py-1 bg-warning-100 text-warning-800 text-xs font-medium rounded-full">
                              1st Place
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">Score: 95/100</p>
                          <div className="mt-1 flex items-center">
                            <div className="h-1.5 w-1.5 rounded-full bg-success-500 mr-1"></div>
                            <span className="text-xs text-gray-500">Hired by {challenge.company.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <img
                              src="https://images.pexels.com/photos/1181391/pexels-photo-1181391.jpeg?auto=compress&cs=tinysrgb&w=300"
                              alt="Runner up"
                              className="h-12 w-12 rounded-full object-cover border-2 border-gray-400"
                            />
                          </div>
                          <div className="ml-3">
                            <div className="flex items-center">
                              <h4 className="text-sm font-medium text-gray-900">Taylor Swift</h4>
                              <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">
                                2nd
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">Score: 92/100</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <img
                              src="https://images.pexels.com/photos/2380794/pexels-photo-2380794.jpeg?auto=compress&cs=tinysrgb&w=300"
                              alt="Runner up"
                              className="h-12 w-12 rounded-full object-cover border-2 border-amber-700"
                            />
                          </div>
                          <div className="ml-3">
                            <div className="flex items-center">
                              <h4 className="text-sm font-medium text-gray-900">James Rodriguez</h4>
                              <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
                                3rd
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">Score: 89/100</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-md mx-auto">
                    <img
                      src="https://images.pexels.com/photos/7103/writing-notes-idea-conference.jpg?auto=compress&cs=tinysrgb&w=600"
                      alt="Leaderboard coming soon"
                      className="rounded-lg mx-auto max-w-full h-auto opacity-50"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
        
        {canSubmit && (
          <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              size="lg"
              onClick={() => setActiveTab('submit')}
            >
              Submit Your Solution
            </Button>
            <Link
              to="#"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                size="lg"
              >
                Download Resources
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengePage;