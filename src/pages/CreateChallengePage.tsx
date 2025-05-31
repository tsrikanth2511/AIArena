import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { AlertCircle } from 'lucide-react';

const CreateChallengePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    prize_money: '',
    difficulty: 'Beginner',
    tags: '',
    requirements: '',
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
            tags: formData.tags.split(',').map(tag => tag.trim()),
            requirements: formData.requirements.split('\n'),
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Challenge</h1>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
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

            <div>
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

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                  Deadline
                </label>
                <input
                  type="datetime-local"
                  name="deadline"
                  id="deadline"
                  required
                  value={formData.deadline}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
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

            <div>
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

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                id="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="react, typescript, web development"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                Requirements (one per line)
              </label>
              <textarea
                name="requirements"
                id="requirements"
                rows={4}
                value={formData.requirements}
                onChange={handleChange}
                placeholder="Must use TypeScript&#10;Must include unit tests&#10;Must be responsive"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/challenges')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Challenge'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateChallengePage;