import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { AlertCircle, X, Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const SUGGESTED_TAGS = [
  'Finance', 'Healthcare', 'NLP', 'Computer Vision', 'Real-time Data',
  'LLM', 'Developer Tools', 'Content Generation', 'Diagnosis', 'Gen-AI'
];

// Define type for evaluation criteria
interface EvaluationCriterion {
  name: string;
  description: string;
  weight: number;
}

const EditChallengePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [challengeLoading, setChallengeLoading] = useState(true); // New loading state for fetching challenge

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    prize_money: '',
    difficulty: 'Beginner',
    tags: [] as string[],
    requirements: [] as string[],
    evaluation_criteria: [] as EvaluationCriterion[],
  });

  const [currentTagInput, setCurrentTagInput] = useState('');

  // Add handleChange function
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fetch existing challenge data
  useEffect(() => {
    const fetchChallenge = async () => {
      if (!id) {
        setError('Challenge ID not provided.');
        setChallengeLoading(false);
        return;
      }

      setChallengeLoading(true);
      try {
        const { data: challengeData, error: fetchError } = await supabase
          .from('challenges')
          .select(`
            *,
            company:company_id (
              id,
              full_name
            )
          `)
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        if (!challengeData) {
          setError('Challenge not found.');
          return;
        }

        // Check if the logged-in user is the owner
        if (user?.id !== challengeData.company.id) {
           setError('You do not have permission to edit this challenge.');
           return;
        }

        // Pre-fill form data
        setFormData({
          title: challengeData.title,
          description: challengeData.description,
          deadline: challengeData.deadline ? challengeData.deadline.split('T')[0] : '',
          prize_money: challengeData.prize_money?.toString() || '',
          difficulty: challengeData.difficulty,
          tags: Array.isArray(challengeData.tags) ? challengeData.tags : [],
          requirements: Array.isArray(challengeData.requirements) ? challengeData.requirements : [''],
          evaluation_criteria: Array.isArray(challengeData.evaluation_criteria) ? challengeData.evaluation_criteria : [{ name: '', description: '', weight: 0 }],
        });

         // Initialize requirements and criteria if they are empty arrays after fetch
         if (!Array.isArray(challengeData.requirements) || challengeData.requirements.length === 0) {
           setFormData(prev => ({ ...prev, requirements: [''] }));
         }
         if (!Array.isArray(challengeData.evaluation_criteria) || challengeData.evaluation_criteria.length === 0) {
            setFormData(prev => ({ ...prev, evaluation_criteria: [{ name: '', description: '', weight: 0 }] }));
         }
         setCurrentTagInput(''); // Clear custom tag input on load

      } catch (err: any) {
        setError(err.message || 'Failed to fetch challenge details.');
        console.error('Error fetching challenge for edit:', err);
        toast.error(err.message || 'Failed to load challenge for editing');
      } finally {
        setChallengeLoading(false);
      }
    };

    fetchChallenge();
  }, [id, user?.id]); // Depend on id and user.id

  // Add a default requirement input if the array is empty initially (after fetch completes or if starting new)
  useEffect(() => {
    if (!challengeLoading && formData.requirements.length === 0) {
      setFormData(prev => ({ ...prev, requirements: [''] }));
    }
  }, [challengeLoading, formData.requirements.length]);

   // Add a default evaluation criterion if the array is empty initially (after fetch completes or if starting new)
   useEffect(() => {
     if (!challengeLoading && formData.evaluation_criteria.length === 0) {
       setFormData(prev => ({ ...prev, evaluation_criteria: [{ name: '', description: '', weight: 0 }] }));
     }
   }, [challengeLoading, formData.evaluation_criteria.length]);

  const handleAddTag = () => {
    const newTag = currentTagInput.trim();
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      setCurrentTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTagInput(e.target.value);
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSuggestedTagClick = (tag: string) => {
     if (!formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  }

  const handleAddRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const handleRequirementChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

   // Functions for Evaluation Criteria
   const handleAddCriterion = () => {
    setFormData(prev => ({
      ...prev,
      evaluation_criteria: [...prev.evaluation_criteria, { name: '', description: '', weight: 0 }]
    }));
  };

  const handleCriterionChange = (index: number, field: keyof EvaluationCriterion, value: string | number) => {
     setFormData(prev => ({
       ...prev,
       evaluation_criteria: prev.evaluation_criteria.map((criterion, i) =>
         i === index ? { ...criterion, [field]: value } : criterion
       )
     }));
   };

  const handleRemoveCriterion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      evaluation_criteria: prev.evaluation_criteria.filter((_, i) => i !== index)
    }));
  };

   const validateWeights = () => {
     const totalWeight = formData.evaluation_criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
     return totalWeight === 100;
   };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
       if (!id) {
         setError('Challenge ID is missing.');
         setLoading(false);
         return;
       }

      // Ensure requirements is an array of strings
      const requirementsArray = Array.isArray(formData.requirements) ? formData.requirements.filter(req => req.trim() !== '') : [];

      // Ensure evaluation_criteria is an array of objects
      const evaluationCriteriaArray = Array.isArray(formData.evaluation_criteria) ? formData.evaluation_criteria.filter(c => c.name && c.description && c.weight >= 0) : [];

      const { data, error: updateError } = await supabase
        .from('challenges')
        .update({
            title: formData.title,
            description: formData.description,
            deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
            prize_money: formData.prize_money ? parseInt(formData.prize_money) : null,
            difficulty: formData.difficulty,
            tags: Array.isArray(formData.tags) ? formData.tags.filter(tag => tag.trim() !== '') : [],
            requirements: requirementsArray,
            evaluation_criteria: evaluationCriteriaArray,
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Challenge updated successfully!');
      navigate(`/challenges/${id}`); // Redirect back to the challenge details page
    } catch (err: any) {
      setError(err.message || 'Failed to update challenge. Please try again.');
      console.error('Error updating challenge:', err);
      toast.error(err.message || 'Failed to update challenge');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching challenge data
  if (challengeLoading) {
    return (
       <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
         Loading challenge for editing...
       </div>
    );
  }

   // Show error message if fetching failed or user is not authorized
   if (error && !challengeLoading) {
     return (
       <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center text-error-600">
         <AlertCircle className="w-5 h-5 mr-2" /> {error}
       </div>
     );
   }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-8 space-y-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Edit Challenge</h1>
          
          {/* Error message (for submission errors) */}
          {error && loading === false && ( // Only show if there's an error and not currently submitting
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Challenge Title */}
            <div className="space-y-1">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Challenge Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Deadline and Prize Money */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                  Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  id="deadline"
                  required
                  value={formData.deadline}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="prize_money" className="block text-sm font-medium text-gray-700">
                  Prize Money (USD)
                </label>
                <input
                  type="number"
                  name="prize_money"
                  id="prize_money"
                  required
                  min="0"
                  value={formData.prize_money}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-1">
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
                Difficulty Level
              </label>
              <select
                name="difficulty"
                id="difficulty"
                required
                value={formData.difficulty}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                   <span key={index} className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-secondary-100 text-secondary-800">
                     {tag}
                     <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="flex-shrink-0 ml-1.5 inline-flex text-secondary-600 hover:text-secondary-800 focus:outline-none focus:text-secondary-800"
                     >
                       <span className="sr-only">Remove tag</span>
                        <X size={14} />
                     </button>
                   </span>
                ))}
              </div>
              <input
                 type="text"
                 value={currentTagInput}
                 onChange={handleTagInputChange}
                 onKeyPress={handleTagInputKeyPress}
                 placeholder="Add custom tag and press Enter"
                 className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
               <div className="mt-2">
                 <span className="block text-sm font-medium text-gray-700 mb-1">Suggested Tags:</span>
                  <div className="flex flex-wrap gap-2">
                   {SUGGESTED_TAGS.map((tag) => (
                      <button
                         key={tag}
                         type="button"
                         onClick={() => handleSuggestedTagClick(tag)}
                         className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300"
                      >
                         {tag}
                      </button>
                   ))}
                  </div>
               </div>
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Requirements
              </label>
              <div className="space-y-2">
                {formData.requirements.map((requirement, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={requirement}
                      onChange={(e) => handleRequirementChange(index, e.target.value)}
                      placeholder="Enter requirement"
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(index)}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={formData.requirements.length <= 1}
                    >
                      <span className="sr-only">Remove requirement</span>
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddRequirement}
                  leftIcon={<Plus size={16} />}
                  className="w-full mt-2"
                >
                  Add Requirement
                </Button>
              </div>
            </div>

            {/* Evaluation Criteria Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Evaluation Criteria
              </label>
              <div className="space-y-4">
                {formData.evaluation_criteria.map((criterion, index) => (
                  <div key={index} className="space-y-3 p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-900">Criterion {index + 1}</h4>
                      {formData.evaluation_criteria.length > 1 && (
                        <button
                           type="button"
                           onClick={() => handleRemoveCriterion(index)}
                           className="text-error-600 hover:text-error-700 disabled:opacity-50 disabled:cursor-not-allowed"
                           disabled={formData.evaluation_criteria.length <= 1}
                        >
                          <span className="sr-only">Remove criterion</span>
                           <X size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <input
                          type="text"
                          value={criterion.name}
                          onChange={(e) => handleCriterionChange(index, 'name', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                          placeholder="e.g., Writing Quality"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Weight (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={criterion.weight}
                          onChange={(e) => handleCriterionChange(index, 'weight', Number(e.target.value))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        value={criterion.description}
                        onChange={(e) => handleCriterionChange(index, 'description', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                        rows={2}
                        placeholder="e.g., How much does the tool improve documentation quality?"
                        required
                      />
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddCriterion}
                    leftIcon={<Plus size={16} />}
                  >
                    Add Criterion
                  </Button>

                  <div className="text-sm text-gray-600">
                    Total Weight: {formData.evaluation_criteria.reduce((sum, criterion) => sum + criterion.weight, 0)}%
                    {!validateWeights() && formData.evaluation_criteria.length > 0 && (
                      <span className="ml-2 text-error-600">
                        (Total must equal 100%)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(`/challenges/${id}`)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !validateWeights() || formData.evaluation_criteria.length === 0}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditChallengePage; 