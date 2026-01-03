import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Search, 
  BarChart3, 
  Brain, 
  Clock, 
  Shield,
  ArrowRight,
  CheckCircle2,
  Users,
  Zap
} from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Classification',
      description: 'Automatic categorization and priority assignment using advanced NLP models.',
    },
    {
      icon: Zap,
      title: 'Smart Routing',
      description: 'Intelligent routing to the right department based on complaint type.',
    },
    {
      icon: Clock,
      title: 'Real-time Tracking',
      description: 'Track your complaint status 24/7 with live updates and notifications.',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights for administrators to monitor and improve services.',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Complaints Resolved' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '<24h', label: 'Avg Response Time' },
    { value: '100+', label: 'Departments Connected' },
  ];

  const processSteps = [
    {
      step: '01',
      title: 'Submit Your Grievance',
      description: 'Fill out a simple form with your complaint details, location, and any supporting documents.',
    },
    {
      step: '02',
      title: 'AI Analysis & Routing',
      description: 'Our AI system analyzes your complaint, categorizes it, and routes it to the appropriate department.',
    },
    {
      step: '03',
      title: 'Department Action',
      description: 'The assigned department reviews and takes action on your complaint within the SLA timeline.',
    },
    {
      step: '04',
      title: 'Resolution & Feedback',
      description: 'Receive updates on resolution and provide feedback to help us improve our services.',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium animate-fade-in">
              <Shield className="h-4 w-4" />
              Government of India Initiative
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
              AI-Powered{' '}
              <span className="text-gradient">Grievance Redressal</span>
              {' '}Platform
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Submit, track, and resolve your civic complaints efficiently. 
              Our AI-powered system ensures your voice reaches the right department instantly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link to="/submit">
                <Button variant="hero" size="xl">
                  <FileText className="h-5 w-5" />
                  Submit Grievance
                </Button>
              </Link>
              <Link to="/track">
                <Button variant="outline" size="xl">
                  <Search className="h-5 w-5" />
                  Track Status
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <p className="text-3xl md:text-4xl font-bold text-gradient">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powered by Artificial Intelligence
            </h2>
            <p className="text-muted-foreground">
              Our platform leverages cutting-edge AI technology to streamline the grievance redressal process.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 rounded-xl border border-border bg-card hover:shadow-card-hover transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="h-12 w-12 rounded-lg gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              A simple, transparent process from submission to resolution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div 
                key={index}
                className="relative animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="text-6xl font-bold text-primary/10 mb-4">{step.step}</div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {index < processSteps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-8 -right-4 h-6 w-6 text-primary/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 gradient-hero" />
            <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Submit Your Grievance?
              </h2>
              <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
                Join thousands of citizens who have successfully resolved their complaints through our platform.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/submit">
                  <Button size="xl" className="bg-background text-primary hover:bg-background/90">
                    Get Started Now
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="xl" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
