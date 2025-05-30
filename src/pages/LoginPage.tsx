import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Github } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'individual' as UserRole
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, loginWithGithub, loginWithGoogle, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/challenges';
  
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const user = await login(formData.email, formData.password);
      // Redirect to the attempted page or default based on role
      if (user?.role === 'company') {
        navigate('/company/dashboard');
      } else {
        navigate(from);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setErrors({ 
        email: 'Invalid email or password'
      });
    }
  };

  const handleGithubLogin = async () => {
    try {
      await loginWithGithub();
      // Role check will happen in auth callback
    } catch (error) {
      console.error('GitHub login failed:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // Role check will happen in auth callback
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };
  
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-gray-600">
            Choose your account type
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`border rounded-lg p-4 cursor-pointer ${
              formData.role === 'individual' ? 'border-secondary-500 bg-secondary-50' : 'border-gray-300'
            }`}
            onClick={() => setFormData({ ...formData, role: 'individual' })}
          >
            <h3 className="font-medium text-gray-900">Individual</h3>
            <p className="text-sm text-gray-500 mt-1">Join as a developer</p>
          </div>
          <div
            className={`border rounded-lg p-4 cursor-pointer ${
              formData.role === 'company' ? 'border-secondary-500 bg-secondary-50' : 'border-gray-300'
            }`}
            onClick={() => setFormData({ ...formData, role: 'company' })}
          >
            <h3 className="font-medium text-gray-900">Company</h3>
            <p className="text-sm text-gray-500 mt-1">Post challenges</p>
          </div>
        </div>

        {/* Social Login Buttons - Only show for individual users */}
        {formData.role === 'individual' && (
          <div className="flex flex-col space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleGithubLogin}
              leftIcon={<Github size={20} />}
            >
              Continue with GitHub
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleGoogleLogin}
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google" 
                className="w-5 h-5 mr-2"
              />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>
          </div>
        )}

        {/* Email/Password Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.email ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : 'border-gray-300 focus:ring-secondary-500 focus:border-secondary-500'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-error-600">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.password ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : 'border-gray-300 focus:ring-secondary-500 focus:border-secondary-500'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-error-600">{errors.password}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                className="h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <a href="#" className="font-medium text-secondary-600 hover:text-secondary-500">
                Forgot your password?
              </a>
            </div>
          </div>
          
          <div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-600"></div>
                </div>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-secondary-600 hover:text-secondary-500">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;