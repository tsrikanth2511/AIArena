import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Calendar, DollarSign, Tag, ListChecks, BarChart } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface EvaluationCriterion {
  name: string;
  description: string;
  weight: number;
}

interface ChallengeForm {
  title: string;
  description: string;
  deadline: string;
  prizeMoney: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  tags: string[];
  requirements: string[];
  evaluationCriteria: EvaluationCriterion[];
}

const CreateChallengePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ChallengeForm>({
    title: '',
    description: '',
    deadline: '',
    prizeMoney: '',
    difficulty: 'Intermediate',
    tags: [],
    requirements: [''],
    evaluationCriteria: [{
      name: '',
      description: '',
      weight: 0
    }]
  });
  const [currentTag, setCurrentTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to create a challenge');
      return;
    }

    if (!validateWeights()) {
      toast.error('Evaluation criteria weights must sum to 100%');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('challenges')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            deadline: formData.deadline,
            prize_money: parseInt(formData.prizeMoney),
            difficulty: formData.difficulty,
            tags: formData.tags,
            requirements: formData.requirements.filter(req => req.trim() !== ''),
            evaluation_criteria: formData.evaluationCriteria,
            company_id: user.id,
            status: 'Active',
            participants_count: 0
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('Challenge created successfully!');
      navigate('/company/dashboard');
    } catch (error: any) {
      console.error('Error creating challenge:', error);
      toast.error(error.message || 'Failed to create challenge');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    if (currentTag && !formData.tags.includes(currentTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag]
      });
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleAddRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, '']
    });
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index)
    });
  };

  const handleAddCriterion = () => {
    setFormData({
      ...formData,
      evaluationCriteria: [...formData.evaluationCriteria, {
        name: '',
        description: '',
        weight: 0
      }]
    });
  };

  const handleRemoveCriterion = (index: number) => {
    setFormData({
      ...formData,
      evaluationCriteria: formData.evaluationCriteria.filter((_, i) => i !== index)
    });
  };

  const validateWeights = () => {
    const totalWeight = formData.evaluationCriteria.reduce((sum, criterion) => sum + criterion.weight, 0);
    return totalWeight === 100;
  };

  if (!user || user.role !== 'company') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">You must be logged in as a company to create challenges.</p>
        <Button onClick={() => navigate('/login')}>Log In</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/company/dashboard')}
            className="mb-6"
            leftIcon={<ArrowLeft size={16} />}
          >
            Back to Dashboard
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="h-2 bg-gradient-to-r from-primary-600 to-secondary-600"></div>
            <div className="p-6 sm:p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Challenge</h1>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Challenge Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                      placeholder="Enter a descriptive title for your challenge"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                      placeholder="Describe the challenge, its objectives, and what you're looking for"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center gap-2">
                          <Calendar size={16} />
                          Deadline
                        </span>
                      </label>
                      <input
                        type="date"
                        id="deadline"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="prizeMoney" className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center gap-2">
                          <DollarSign size={16} />
                          Prize Money
                        </span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                        <input
                          type="number"
                          id="prizeMoney"
                          value={formData.prizeMoney}
                          onChange={(e) => setFormData({ ...formData, prizeMoney: e.target.value })}
                          className="w-full pl-8 rounded-lg border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                          placeholder="1000"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center gap-2">
                          <BarChart size={16} />
                          Difficulty
                        </span>
                      </label>
                      <select
                        id="difficulty"
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as ChallengeForm['difficulty'] })}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="flex items-center gap-2">
                      <Tag size={16} />
                      Tags
                    </span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                      placeholder="Add relevant tags (e.g., AI, NLP, Computer Vision)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      leftIcon={<Plus size={16} />}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1 py-1 px-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-error-600"
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="flex items-center gap-2">
                      <ListChecks size={16} />
                      Requirements
                    </span>
                  </label>
                  <div className="space-y-3">
                    {formData.requirements.map((req, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={req}
                          onChange={(e) => {
                            const newReqs = [...formData.requirements];
                            newReqs[index] = e.target.value;
                            setFormData({ ...formData, requirements: newReqs });
                          }}
                          className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                          placeholder={`Requirement ${index + 1}`}
                        />
                        {formData.requirements.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleRemoveRequirement(index)}
                            className="text-error-600 hover:text-error-700"
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddRequirement}
                    leftIcon={<Plus size={16} />}
                    className="mt-2"
                  >
                    Add Requirement
                  </Button>
                </div>

                {/* Evaluation Criteria */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Evaluation Criteria
                    </label>
                    <span className={`text-sm ${validateWeights() ? 'text-success-600' : 'text-error-600'}`}>
                      Total Weight: {formData.evaluationCriteria.reduce((sum, criterion) => sum + criterion.weight, 0)}%
                    </span>
                  </div>
                  <div className="space-y-4">
                    {formData.evaluationCriteria.map((criterion, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-gray-900">Criterion {index + 1}</h4>
                          {formData.evaluationCriteria.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => handleRemoveCriterion(index)}
                              className="text-error-600 hover:text-error-700"
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={criterion.name}
                              onChange={(e) => {
                                const newCriteria = [...formData.evaluationCriteria];
                                newCriteria[index] = { ...criterion, name: e.target.value };
                                setFormData({ ...formData, evaluationCriteria: newCriteria });
                              }}
                              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                              placeholder="e.g., Technical Implementation"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Weight (%)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={criterion.weight}
                              onChange={(e) => {
                                const newCriteria = [...formData.evaluationCriteria];
                                newCriteria[index] = { ...criterion, weight: Number(e.target.value) };
                                setFormData({ ...formData, evaluationCriteria: newCriteria });
                              }}
                              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={criterion.description}
                            onChange={(e) => {
                              const newCriteria = [...formData.evaluationCriteria];
                              newCriteria[index] = { ...criterion, description: e.target.value };
                              setFormData({ ...formData, evaluationCriteria: newCriteria });
                            }}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                            rows={2}
                            placeholder="Describe how this criterion will be evaluated"
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddCriterion}
                    leftIcon={<Plus size={16} />}
                  >
                    Add Criterion
                  </Button>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/company/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={!validateWeights() || isSubmitting}
                    isLoading={isSubmitting}
                  >
                    Create Challenge
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreateChallengePage;