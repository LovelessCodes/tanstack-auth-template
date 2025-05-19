import { motion, useAnimation, useInView } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ArrowRight, Shield, Zap, Github, Star, ArrowUpRight, Code, LockKeyhole, Sparkles } from "lucide-react";
import { useEffect, useState, useRef } from "react";

// Interactive gradient background component
const AnimatedGradient = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent animate-[spin_30s_linear_infinite]" />
      <div className="absolute -top-1/2 -right-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent animate-[spin_25s_linear_infinite_reverse]" />
      <div className="absolute -bottom-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-500/10 via-transparent to-transparent animate-[spin_35s_linear_infinite]" />
    </div>
  );
};

// Define props interface for FeatureCard
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

// Animated feature card component
const FeatureCard = ({ icon, title, description, delay = 0 }: FeatureCardProps) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 as const });

  useEffect(() => {
    if (isInView) {
      controls.start({
        y: 0,
        opacity: 1,
        transition: { duration: 0.5, delay: delay * 0.1 }
      });
    }
  }, [isInView, controls, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ y: 30, opacity: 0 }}
      animate={controls}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="h-full transition-all hover:shadow-lg hover:border-mauve-6 group">
        <CardHeader>
          <motion.div 
            className="p-3 bg-mauve-3 rounded-lg w-fit mb-4 group-hover:bg-blue-500/10 transition-colors"
            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
          >
            {icon}
          </motion.div>
          <CardTitle className="text-mauve-12 group-hover:text-blue-500 transition-colors">
            {title}
          </CardTitle>
          <CardDescription className="text-mauve-11">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </motion.div>
  );
};

// Define props interface for AnimatedButton
interface AnimatedButtonProps extends React.ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
  className?: string;
}

// Animated button with hover effect
const AnimatedButton = ({ children, className = "", ...props }: AnimatedButtonProps) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
    className={className}
  >
    {children}
  </motion.div>
);

// Define props interface for FloatingElement
interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

// Floating animation for decorative elements
const FloatingElement = ({ children, className = "", delay = 0 }: FloatingElementProps) => (
  <motion.div
    className={className}
    animate={{
      y: [0, -15, 0],
    }}
    transition={{
      duration: 4 + delay,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
      repeatType: "reverse",
    }}
  >
    {children}
  </motion.div>
);

const GITHUB_REPO = "lovelesscodes/tanstack-auth-template";

export default function IndexPage() {
  const [starCount, setStarCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`);
        if (response.ok) {
          const data = await response.json();
          setStarCount(data.stargazers_count);
        }
      } catch (error) {
        console.error("Error fetching GitHub stars:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStars();
  }, []);
  const features = [
    {
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      title: "Secure Authentication",
      description: "Industry-standard security to keep your data safe and protected.",
    },
    {
      icon: <Zap className="w-6 h-6 text-purple-500" />,
      title: "Lightning Fast",
      description: "Built with modern technologies for the best performance.",
    },
    {
      icon: <LockKeyhole className="w-6 h-6 text-pink-500" />,
      title: "Privacy First",
      description: "Your data stays yours. We don't sell or share your information.",
    },
    {
      icon: <Code className="w-6 h-6 text-amber-500" />,
      title: "Developer Friendly",
      description: "Clean, well-documented code that's easy to customize and extend.",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-green-500" />,
      title: "Modern Stack",
      description: "Built with the latest technologies for a seamless developer experience.",
    },
    {
      icon: <ArrowUpRight className="w-6 h-6 text-cyan-500" />,
      title: "Easy Integration",
      description: "Quickly add authentication to your existing or new projects.",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    const sequence = async () => {
      await controls.start({ scale: 1.05, transition: { duration: 1 } });
      await controls.start({ scale: 1, transition: { duration: 0.5 } });
    };
    const interval = setInterval(sequence, 5000);
    return () => clearInterval(interval);
  }, [controls]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-mauve-1 to-mauve-2 relative overflow-hidden">
      <AnimatedGradient />
      
      {/* Floating decorative elements */}
      <FloatingElement className="absolute top-1/4 left-10 opacity-20">
        <div className="w-16 h-16 rounded-full bg-blue-500/20 blur-xl" />
      </FloatingElement>
      <FloatingElement className="absolute top-2/3 right-20 opacity-20" delay={1}>
        <div className="w-24 h-24 rounded-full bg-purple-500/20 blur-xl" />
      </FloatingElement>
      <FloatingElement className="absolute top-1/3 right-1/4 opacity-20" delay={2}>
        <div className="w-12 h-12 rounded-full bg-pink-500/20 blur-xl" />
      </FloatingElement>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-mauve-12 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Welcome to{' '}
            <motion.span 
              className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500"
              animate={controls}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              TanStack x BetterAuth
              <motion.span 
                className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg -z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  scale: isHovered ? 1.05 : 0.9,
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-mauve-11 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            A modern authentication template built with TanStack Start, Better Auth, Drizzle ORM, and Tailwind CSS.
            Get started in seconds with our secure and customizable auth solution.
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap justify-center gap-4 mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <AnimatedButton>
              <Button asChild size="lg" className="gap-2 group relative overflow-hidden">
                <a 
                  href={`https://github.com/${GITHUB_REPO}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 relative z-10"
                >
                  <motion.span 
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ opacity: 0 }}
                  />
                  <Github className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Star on GitHub</span>
                  {!isLoading && starCount !== null && (
                    <span className="inline-flex items-center gap-1 ml-1 text-sm bg-mauve-2 px-2 py-0.5 rounded-full relative z-10">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {starCount.toLocaleString()}
                    </span>
                  )}
                </a>
              </Button>
            </AnimatedButton>
            
            <AnimatedButton>
              <Button asChild variant="outline" size="lg" className="gap-2 group">
                <Link to="/" className="relative overflow-hidden">
                  <motion.span 
                    className="absolute inset-0 bg-mauve-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ opacity: 0 }}
                  />
                  <span className="relative z-10">Get Started</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 relative z-10" />
                </Link>
              </Button>
            </AnimatedButton>
          </motion.div>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16 relative"
          variants={container}
          initial="hidden"
          viewport={{ once: true, margin: "-100px" }}
          whileInView="show"
        >
          {features.map((feature, index) => (
            <FeatureCard 
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index}
            />
          ))}
        </motion.div>

        <motion.div 
          className="mt-24 text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="inline-block mb-8"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
              Ready to get started?
            </h2>
          </motion.div>
          <p className="text-mauve-11 mb-8 max-w-2xl mx-auto text-lg">
            Join the community of developers using TanStack x Better Auth for their authentication needs.
          </p>
          <AnimatedButton>
            <Button asChild size="lg" className="gap-2 group relative overflow-hidden">
              <a 
                href={`https://github.com/${GITHUB_REPO}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10"
              >
                <motion.span 
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ opacity: 0 }}
                />
                <Github className="w-5 h-5 inline-block mr-2 relative z-10" />
                <span className="relative z-10">View on GitHub</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1 relative z-10" />
              </a>
            </Button>
          </AnimatedButton>
        </motion.div>
      </div>
    </div>
  );
}
