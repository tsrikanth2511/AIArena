import { motion } from 'framer-motion';

const stats = [
  { value: '300+', label: 'Challenges Completed' },
  { value: '2,500+', label: 'AI Builders' },
  { value: '$240K', label: 'Prize Money Awarded' },
  { value: '85%', label: 'Hiring Success Rate' }
];

const StatsSection = () => {
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
      transition: { 
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <section className="py-16 bg-primary-900 text-white relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-800 to-secondary-900 opacity-90"></div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute h-40 w-40 border border-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {stats.map((stat, index) => (
            <motion.div key={index} variants={itemVariants} className="flex flex-col items-center">
              <div className="relative">
                <span className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </span>
                <span className="absolute -top-2 -right-2 w-10 h-10 bg-secondary-500 opacity-20 rounded-full"></span>
              </div>
              <p className="text-gray-300 text-sm md:text-base mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;