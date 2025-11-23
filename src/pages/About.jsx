import React from 'react';
import { ArrowLeft, Brain, Code, Database, Wifi, Eye, Target, Lightbulb, Users, Globe, Shield, Zap, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const About = () => {
  const techStack = [
    {
      icon: Code,
      title: "Frontend",
      tech: "React.js (MERN Stack)",
      description: "Modern, responsive UI with component-based architecture"
    },
    {
      icon: Code,
      title: "Backend",
      tech: "Node.js + Express.js",
      description: "Scalable server-side logic and API development"
    },
    {
      icon: Database,
      title: "Database",
      tech: "MongoDB",
      description: "Flexible NoSQL database for dynamic data storage"
    },
    {
      icon: Wifi,
      title: "Real-Time Communication",
      tech: "WebRTC, Socket.IO",
      description: "Seamless real-time video, audio, and data synchronization"
    },
    {
      icon: Eye,
      title: "AI & Detection",
      tech: "TensorFlow.js, MediaPipe",
      description: "Advanced AI-powered monitoring and proctoring"
    }
  ];

  const uniqueFeatures = [
    "Real-time video interviews",
    "Live code collaboration",
    "Interactive whiteboard",
    "AI-powered proctoring & monitoring",
    "Full session recording and event logging",
    "Web-based, no installation needed"
  ];

  const targetUsers = [
    {
      icon: Users,
      title: "Hiring Teams & Tech Recruiters",
      description: "Looking to evaluate technical talent remotely with confidence and efficiency."
    },
    {
      icon: Zap,
      title: "Startups and Enterprises",
      description: "Needing scalable interview solutions that grow with your organization."
    },
    {
      icon: Globe,
      title: "Remote-first Companies",
      description: "Seeking smart, AI-integrated hiring tools for distributed teams."
    }
  ];

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      {/* Header */}
      <div className="bg-dark-card border-b border-border-color">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link 
              to="/"
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/20 to-purple-600/20 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <Brain className="text-primary mr-3" size={48} />
                <h1 className="text-4xl md:text-5xl font-bold">
                  About <span className="text-primary">InTouch</span>
                </h1>
              </div>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                A cutting-edge, web-based platform designed to transform the way technical interviews 
                are conducted remotely. Built with real-time communication and intelligent monitoring at its core.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-dark-card rounded-2xl p-8 border border-border-color">
              <div className="text-center mb-8">
                <Target className="text-primary mx-auto mb-4" size={48} />
                <h2 className="text-3xl font-bold mb-4">🎯 Our Mission</h2>
              </div>
              <p className="text-xl text-gray-300 text-center max-w-4xl mx-auto leading-relaxed">
                To create a seamless, secure, and smart remote interview experience that empowers 
                tech recruiters and candidates to connect meaningfully and assess capabilities effectively.
              </p>
            </div>
          </div>
        </section>

        {/* Technology Stack Section */}
        <section className="py-16 bg-dark-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">🔧 Our Technology Stack</h2>
              <p className="text-gray-400 text-lg">
                Built with modern technologies for optimal performance and scalability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {techStack.map((tech, index) => (
                <div key={index} className="bg-dark rounded-lg p-6 border border-border-color hover:border-primary/50 transition-colors">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/20 rounded-lg">
                      <tech.icon className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{tech.title}</h3>
                      <p className="text-primary font-medium">{tech.tech}</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">{tech.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What Makes Us Unique Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Lightbulb className="text-primary mx-auto mb-4" size={48} />
              <h2 className="text-3xl font-bold mb-4">💡 What Makes Us Unique</h2>
              <p className="text-gray-400 text-lg">
                Discover the features that set InTouch apart from traditional interview platforms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uniqueFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 bg-dark-card rounded-lg p-4 border border-border-color">
                  <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who It's For Section */}
        <section className="py-16 bg-dark-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Users className="text-primary mx-auto mb-4" size={48} />
              <h2 className="text-3xl font-bold mb-4">🧑‍💻 Who It's For</h2>
              <p className="text-gray-400 text-lg">
                Designed for organizations that value efficiency, security, and innovation in their hiring process.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {targetUsers.map((user, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4">
                    <user.icon className="text-primary" size={28} />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{user.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{user.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-2xl p-12 text-center">
              <Globe className="text-primary mx-auto mb-6" size={64} />
              <h2 className="text-3xl font-bold mb-4">🧭 Vision</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                To be the most trusted and intelligent remote technical interview platform globally.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Shield className="text-green-500" size={24} />
                <span className="text-gray-300">Trusted by leading tech companies worldwide</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-dark-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Interview Process?</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of companies already using InTouch to conduct better technical interviews.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup-choice"
                className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/80 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                to="/learn-more"
                className="bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default About; 