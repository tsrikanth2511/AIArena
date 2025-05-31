import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { AlertCircle } from 'lucide-react';

const CreateChallengePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [requirements, setRequirements] = useState<string[]>(['']);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    prize_money: '',
    difficulty: 'Beginner',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .insert([
          {
            company_id: user?.id,
            title: formData.title,
            description: formData.description,
            deadline: new Date(formData.deadline).toISOString(),
            prize_money: parseInt(formData.prize_money),
            difficulty: formData.difficulty,
            tags: selectedTags,
            requirements: requirements.filter(req => req.trim() !== ''),
            evaluation_criteria: [],
          },
        ])
        .select()
        .single();

      if (challengeError) throw challengeError;

      navigate(`/challenges/${challenge.id}`);
    } catch (err) {
      setError('Failed to create challenge. Please try again.');
      console.error('Error creating challenge:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTag.trim()) {
      e.preventDefault();
      if (!selectedTags.includes(customTag.trim())) {
        setSelectedTags([...selectedTags, customTag.trim()]);
      }
      setCustomTag('');
    }
  };

  const handleAddRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };

  const handleRequirementTemplate = (template: string, index: number) => {
    const newRequirements = [...requirements];
    newRequirements[index] = template;
    setRequirements(newRequirements);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary-600 to-secondary-600"></div>
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Challenge</h1>
            
            {error && (
              <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-md flex items-center gap-2 text-error-700">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Challenge Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500 sm:text-sm"
                    placeholder="e.g., Build an AI-powered Content Recommendation System"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500 sm:text-sm"
                    placeholder="Describe the challenge objectives, context, and expected outcomes..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                      Deadline
                    </label>
                    <input
                      type="datetime-local"
                      id="deadline"
                      required
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="prize_money" className="block text-sm font-medium text-gray-700 mb-1">
                      Prize Money (USD)
                    </label>
                    <input
                      type="number"
                      id="prize_money"
                      required
                      min="0"
                      value={formData.prize_money}
                      onChange={(e) => setFormData({ ...formData, prize_money: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500 sm:text-sm"
                      placeholder="5000"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    id="difficulty"
                    required
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500 sm:text-sm"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-secondary-600 hover:text-secondary-800"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyDown={handleAddCustomTag}
                    placeholder="Add custom tag and press Enter"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500 sm:text-sm mb-3"
                  />
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagSelect(tag)}
                          disabled={selectedTags.includes(tag)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            selectedTags.includes(tag)
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements
                  </label>
                  <div className="space-y-4">
                    {requirements.map((req, index) => (
                      <div key={index} className="relative">
                        <textarea
                          value={req}
                          onChange={(e) => handleRequirementChange(index, e.target.value)}
                          placeholder="Enter a requirement"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500 sm:text-sm pr-10"
                          rows={2}
                        />
                        <div className="absolute right-2 top-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveRequirement(index)}
                            className="text-gray-400 hover:text-error-500"
                            disabled={requirements.length === 1}
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="mt-2">
                          <select
                            onChange={(e) => handleRequirementTemplate(e.target.value, index)}
                            value=""
                            className="text-sm text-gray-500 border-gray-300 rounded-md shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                          >
                            <option value="">Select a template...</option>
                            {REQUIREMENT_TEMPLATES.map((template) => (
                              <option key={template} value={template}>
                                {template}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddRequirement}
                      leftIcon={<Plus size={16} />}
                      className="w-full"
                    >
                      Add Requirement
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/company/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Challenge'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChallengePage;