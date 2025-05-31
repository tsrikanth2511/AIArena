import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-center">
      <div>
        <h1 className="text-9xl font-bold text-secondary-600">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">Page not found</h2>
        <p className="mt-2 text-lg text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-8">
          <Link to="/">
            <Button leftIcon={<ArrowLeft size={16} />}>
              Back to home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;