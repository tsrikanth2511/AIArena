import { motion } from 'framer-motion';
import { Award, Zap, BarChart3, Building } from 'lucide-react';

const features = [
  {
    icon: <Zap className="h-6 w-6 text-secondary-500" />,
    title: 'Ship Real AI Solutions',
    description: 'Build complete AI-powered MVPs with prototypes, pitch decks, and demo videos that showcase your end-to-end product thinking.'
  },
  {
    icon: <Award className="h-6 w-6 text-secondary-500" />,
    title: 'Get Recognized',
    description: 'Earn badges, win prizes, and build a public portfolio of accomplishments that demonstrate your skills.'
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-secondary-500" />,
    title: 'Compare Your Skills',
    description: 'See how your solutions stack up against other builders with our hybrid leaderboards and detailed scoring system.'
  },
  {
    icon: <Building className="h-6 w-6 text-secondary-500" />,
    title: 'Connect with Companies',
    description: 'Get discovered by companies looking to hire based on demonstrated abilities, not just resumes.'
  }
];

const FeaturesSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-900">How It Works</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with real-world AI challenges and showcase your skills
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;