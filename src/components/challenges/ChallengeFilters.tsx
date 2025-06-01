import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import Button from '../ui/Button';
import { useChallengeStore } from '../../store/challengeStore';
import Badge from '../ui/Badge';

const difficultyOptions = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const statusOptions = ['Active', 'Completed'];
const tagOptions = [
  'Finance', 'Healthcare', 'NLP', 'Computer Vision', 'Real-time Data',
  'LLM', 'Developer Tools', 'Content Generation', 'Diagnosis'
];

const ChallengeFilters = () => {
  const { filter, setFilter, clearFilters } = useChallengeStore();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    setSearchInput(filter.searchQuery);
    setSelectedTags(filter.tags);
    setSelectedDifficulty(filter.difficulty);
    setSelectedStatus(filter.status);
  }, [filter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter({ searchQuery: searchInput });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    setFilter({ tags: newTags });
  };

  const handleDifficultyChange = (difficulty: string) => {
    const newDifficulty = selectedDifficulty === difficulty ? '' : difficulty;
    setSelectedDifficulty(newDifficulty);
    setFilter({ difficulty: newDifficulty });
  };

  const handleStatusChange = (status: string) => {
    const newStatus = selectedStatus === status ? '' : status;
    setSelectedStatus(newStatus);
    setFilter({ status: newStatus });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSelectedTags([]);
    setSelectedDifficulty('');
    setSelectedStatus('');
    clearFilters();
  };

  const hasActiveFilters = selectedTags.length > 0 || selectedDifficulty !== '' || selectedStatus !== '' || filter.searchQuery !== '';

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search challenges..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <span className="sr-only">Search</span>
            {searchInput && (
              <X
                size={16}
                className="text-gray-400 hover:text-gray-500 cursor-pointer"
                onClick={() => {
                  setSearchInput('');
                  setFilter({ searchQuery: '' });
                }}
              />
            )}
          </button>
        </form>

        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Filter size={16} />}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="text-gray-700"
          >
            Filters
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-gray-500"
            >
              Clear all
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedStatus && (
              <Badge variant="secondary\" className="flex items-center">
                {selectedStatus}
                <X
                  size={12}
                  className="ml-1 cursor-pointer"
                  onClick={() => handleStatusChange(selectedStatus)}
                />
              </Badge>
            )}
            
            {selectedDifficulty && (
              <Badge variant="primary" className="flex items-center">
                {selectedDifficulty}
                <X
                  size={12}
                  className="ml-1 cursor-pointer"
                  onClick={() => handleDifficultyChange(selectedDifficulty)}
                />
              </Badge>
            )}
            
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="default" className="flex items-center">
                {tag}
                <X
                  size={12}
                  className="ml-1 cursor-pointer"
                  onClick={() => handleTagToggle(tag)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {isFiltersOpen && (
        <div className="border-t border-gray-200 p-4">
          <div className="space-y-6">
            {/* Status filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedStatus === status
                        ? 'bg-secondary-100 text-secondary-800 border border-secondary-300'
                        : 'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Difficulty</h3>
              <div className="flex flex-wrap gap-2">
                {difficultyOptions.map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => handleDifficultyChange(difficulty)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedDifficulty === difficulty
                        ? 'bg-primary-100 text-primary-800 border border-primary-300'
                        : 'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tagOptions.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedTags.includes(tag)
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeFilters;