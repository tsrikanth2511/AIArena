import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Github, Globe, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'individual' as UserRole,
    githubUrl: '',
    portfolioUrl: '',
    bio: '',
    companyDetails: {
      name: '',
      logo: '',
      website: '',
      description: '',
      industry: '',
      size: ''
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, registerWithGithub, registerWithGoogle, isLoading } = useAuthStore();
  const navigate = useNavigate();
  
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const hasLowercase = /[a-z]/.test(formData.password);
      const hasUppercase = /[A-Z]/.test(formData.password);
      const hasNumber = /[0-9]/.test(formData.password);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(formData.password);
      
      if (!hasLowercase || !hasUppercase || !hasNumber || !hasSpecial) {
        newErrors.password = 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        formData.role === 'company' ? formData.companyDetails : undefined
      );
      // Redirect based on role
      if (formData.role === 'company') {
        navigate('/company/dashboard');
      } else {
        navigate('/challenges');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setErrors({ 
        email: 'Registration failed. Please try again.'
      });
      setStep(1);
    }
  };

  const handleGithubRegister = async () => {
    try {
      await registerWithGithub(formData.role);
      // Role check will happen in auth callback
    } catch (error) {
      console.error('GitHub registration failed:', error);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await registerWithGoogle(formData.role);
      // Role check will happen in auth callback
    } catch (error) {
      console.error('Google registration failed:', error);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
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
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-gray-600">
            Join the AI Challenge Arena community
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div
            className={`border rounded-lg p-4 cursor-pointer ${
              formData.role === 'individual' ? 'border-secondary-500 bg-secondary-50' : 'border-gray-300'
            }`}
            onClick={() => setFormData({ ...formData, role: 'individual' })}
          >
            <h3 className="font-medium text-gray-900">Individual</h3>
            <p className="text-sm text-gray-500 mt-1">Join as a developer to participate in challenges</p>
          </div>
          <div
            className={`border rounded-lg p-4 cursor-pointer ${
              formData.role === 'company' ? 'border-secondary-500 bg-secondary-50' : 'border-gray-300'
            }`}
            onClick={() => setFormData({ ...formData, role: 'company' })}
          >
            <h3 className="font-medium text-gray-900">Company</h3>
            <p className="text-sm text-gray-500 mt-1">Post challenges and manage your organization</p>
          </div>
        </div>
        
        {formData.role === 'individual' && (
          <div className="flex flex-col space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleGithubRegister}
              leftIcon={<Github size={20} />}
            >
              Continue with GitHub
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleGoogleRegister}
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
        
        <div className="relative pt-4">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
            <div
              style={{ width: step === 1 ? '50%' : '100%' }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-secondary-600 transition-all duration-500"
            ></div>
          </div>
          <div className="flex justify-between">
            <div className="text-xs text-secondary-600 font-medium">Account Details</div>
            <div className={`text-xs ${step === 2 ? 'text-secondary-600' : 'text-gray-500'} font-medium`}>
              {formData.role === 'individual' ? 'Profile Information' : 'Company Details'}
            </div>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {formData.role === 'individual' ? 'Full name' : 'Company name'}
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.name ? 'border-error-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm`}
                    placeholder={formData.role === 'individual' ? 'John Doe' : 'Your Company Name'}
                  />
                </div>
              </div>
              
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
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.email ? 'border-error-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm`}
                    placeholder="you@example.com"
                  />
                </div>
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
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.password ? 'border-error-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm`}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.confirmPassword ? 'border-error-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm`}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.role === 'individual' ? (
                <>
                  <div>
                    <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700">
                      GitHub URL (optional)
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Github size={16} className="text-gray-400" />
                      </div>
                      <input
                        id="githubUrl"
                        name="githubUrl"
                        type="url"
                        value={formData.githubUrl}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm"
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-700">
                      Portfolio URL (optional)
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe size={16} className="text-gray-400" />
                      </div>
                      <input
                        id="portfolioUrl"
                        name="portfolioUrl"
                        type="url"
                        value={formData.portfolioUrl}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm"
                        placeholder="https://yourdomain.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio (optional)
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleChange}
                        className="block w-full border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-700">
                      Company Website
                    </label>
                    <input
                      id="companyWebsite"
                      name="companyWebsite"
                      type="url"
                      value={formData.companyDetails.website}
                      onChange={(e) => setFormData({
                        ...formData,
                        companyDetails: { ...formData.companyDetails, website: e.target.value }
                      })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm"
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700">
                      Company Description
                    </label>
                    <textarea
                      id="companyDescription"
                      name="companyDescription"
                      rows={4}
                      value={formData.companyDetails.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        companyDetails: { ...formData.companyDetails, description: e.target.value }
                      })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm"
                      placeholder="Tell us about your company..."
                    />
                  </div>
                </>
              )}
            </div>
          )}
          
          <div>
            {step === 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="w-full"
                size="lg"
                rightIcon={<ArrowRight size={16} />}
              >
                Continue
              </Button>
            ) : (
              <div className="flex flex-col space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                >
                  {!isLoading && 'Create Account'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="w-full"
                >
                  Back
                </Button>
              </div>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterPage;