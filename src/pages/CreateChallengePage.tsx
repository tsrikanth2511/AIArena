import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

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
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  requirements: string[];
  evaluationCriteria: EvaluationCriterion[];
}

const CreateChallengePage = () => {
  const navigate = useNavigate();
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
    // TODO: Implement challenge creation logic
    console.log('Form submitted:', formData);
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
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
          <div className="h-3 bg-gradient-to-r from-primary-600 to-secondary-600"></div>
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Challenge</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Challenge Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                      Deadline
                    </label>
                    <input
                      type="date"
                      id="deadline"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="prizeMoney" className="block text-sm font-medium text-gray-700">
                      Prize Money ($)
                    </label>
                    <input
                      type="number"
                      id="prizeMoney"
                      value={formData.prizeMoney}
                      onChange={(e) => setFormData({ ...formData, prizeMoney: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
                      Difficulty
                    </label>
                    <select
                      id="difficulty"
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as ChallengeForm['difficulty'] })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                      placeholder="Add a tag"
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
                        className="flex items-center gap-1"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements
                  </label>
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => {
                          const newReqs = [...formData.requirements];
                          newReqs[index] = e.target.value;
                          setFormData({ ...formData, requirements: newReqs });
                        }}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Evaluation Criteria
                  </label>
                  {formData.evaluationCriteria.map((criterion, index) => (
                    <div key={index} className="space-y-4 p-4 border border-gray-200 rounded-lg mb-4">
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
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                            placeholder="e.g., Writing Quality"
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
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
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
                      Total Weight: {formData.evaluationCriteria.reduce((sum, criterion) => sum + criterion.weight, 0)}%
                      {!validateWeights() && (
                        <span className="ml-2 text-error-600">
                          (Total must equal 100%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
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
                  disabled={!validateWeights()}
                >
                  Create Challenge
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateChallengePage; 