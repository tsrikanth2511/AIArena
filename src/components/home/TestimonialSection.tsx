import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "AI Challenge Arena completely changed how I showcase my skills. I went from no responses to my job applications to having three offers in one month after winning a challenge.",
    author: "Sarah Chen",
    role: "ML Engineer at Anthropic",
    avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300"
  },
  {
    quote: "As a self-taught AI developer, I struggled to prove my abilities. Winning a challenge on this platform got me noticed by companies that previously wouldn't give me the time of day.",
    author: "Michael Okonjo",
    role: "AI Product Manager at Cohere",
    avatar: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=300"
  },
  {
    quote: "We've hired three engineers through AI Challenge Arena, and they've all been exceptional. The platform lets us evaluate candidates based on their actual ability to ship AI products.",
    author: "Lisa Park",
    role: "CTO at Dataflow AI",
    avatar: "https://images.pexels.com/photos/3747435/pexels-photo-3747435.jpeg?auto=compress&cs=tinysrgb&w=300"
  }
];

const TestimonialSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-900">Success Stories</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Hear from builders and companies who've found success on the platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.2 }}
              className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 mr-4">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={testimonial.avatar}
                    alt={testimonial.author}
                  />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{testimonial.author}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"{testimonial.quote}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;