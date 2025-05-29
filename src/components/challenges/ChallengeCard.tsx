import { Link } from 'react-router-dom';
import { ArrowRight, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/Card';
import Badge from '../ui/Badge';
import { Challenge } from '../../types';
import { cn, formatDate, getDifficultyColor, getStatusColor, truncateText } from '../../lib/utils';

interface ChallengeCardProps {
  challenge: Challenge;
}

const ChallengeCard = ({ challenge }: ChallengeCardProps) => {
  const daysLeft = Math.ceil(
    (new Date(challenge.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return (
    <Card className="h-full flex flex-col hover:transform hover:-translate-y-1 transition-all duration-200">
      <CardContent className="p-0 flex-grow">
        <div className="relative">
          <div className="h-3 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-t-lg"></div>
          <div className="absolute top-3 right-4">
            <Badge 
              variant={challenge.status === 'Active' ? 'success' : 
                      challenge.status === 'Upcoming' ? 'warning' : 'default'}
              className={cn(getStatusColor(challenge.status))}
            >
              {challenge.status}
            </Badge>
          </div>
        </div>
        
        <div className="p-5">
          <div className="flex items-center mb-4">
            <img 
              src={challenge.company.logo}
              alt={challenge.company.name}
              className="w-10 h-10 object-cover rounded-full border border-gray-200"
            />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-gray-900">{challenge.company.name}</h4>
              <Badge variant="primary" className="mt-1">
                ${challenge.prizeMoney.toLocaleString()} Prize
              </Badge>
            </div>
          </div>
          
          <Link to={`/challenges/${challenge.id}`} className="group">
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-secondary-600 transition-colors">
              {challenge.title}
            </h3>
          </Link>
          
          <p className="mt-2 text-gray-600">
            {truncateText(challenge.description, 120)}
          </p>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {challenge.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-secondary-50">
                {tag}
              </Badge>
            ))}
            {challenge.tags.length > 3 && (
              <Badge variant="default">+{challenge.tags.length - 3}</Badge>
            )}
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <Users size={16} className="mr-1" />
              <span>{challenge.participants} participants</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <Calendar size={16} className="mr-1" />
              <span>
                {challenge.status === 'Completed' 
                  ? 'Completed' 
                  : daysLeft > 0 
                    ? `${daysLeft} days left` 
                    : 'Ends today'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center">
        <Badge
          variant="primary"
          className={cn('ml-1', getDifficultyColor(challenge.difficulty))}
        >
          {challenge.difficulty}
        </Badge>
        
        <Link
          to={`/challenges/${challenge.id}`}
          className="inline-flex items-center text-sm font-medium text-secondary-600 hover:text-secondary-700"
        >
          View Details
          <ArrowRight size={16} className="ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ChallengeCard;