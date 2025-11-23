import React from 'react';
import { ArrowLeft, Video, Code, PenTool, MessageCircle, Shield, Eye, MousePointer, Copy, Video as RecordIcon, AlertTriangle, CheckCircle, XCircle, Zap, Globe, Download, Palette, Layout, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const LearnMore = () => {
  const features = [
    {
      icon: Video,
      title: "Live Video Call",
      description: "Seamless face-to-face interaction with crystal clear audio and video quality."
    },
    {
      icon: Code,
      title: "Shared Code Editor",
      description: "Real-time coding with syntax highlighting and collaborative editing capabilities."
    },
    {
      icon: PenTool,
      title: "Interactive Whiteboard",
      description: "Visual problem-solving and explanation with drawing tools and annotations."
    },
    {
      icon: MessageCircle,
      title: "Integrated Chat",
      description: "Multi-channel communication for questions, comments, and clarifications."
    }
  ];

  const proctoringFeatures = [
    {
      icon: Eye,
      title: "Tab/Window Focus Detection",
      description: "Detects when users leave the tab or switch to other applications."
    },
    {
      icon: Eye,
      title: "Eye Movement Tracking",
      description: "AI-based gaze and facial movement monitoring for attention detection."
    },
    {
      icon: MousePointer,
      title: "Mouse & Keyboard Inactivity",
      description: "Detects idle behavior and suspicious patterns during interviews."
    },
    {
      icon: Copy,
      title: "Copy/Paste Restriction",
      description: "Blocks common cheating vectors and unauthorized content sharing."
    },
    {
      icon: RecordIcon,
      title: "Session Recording",
      description: "Full interview recording with MediaRecorder for review and analysis."
    },
    {
      icon: AlertTriangle,
      title: "Event Logging",
      description: "Flags suspicious activity like tab switches and face detection issues."
    }
  ];

  const comparisonData = [
    { feature: "Real-time Collaboration", intouch: true, external: false },
    { feature: "AI-Powered Monitoring", intouch: true, external: false },
    { feature: "Modern UI/UX", intouch: true, external: false },
    { feature: "Web-based (No Download)", intouch: true, external: false },
    { feature: "Developer-Focused Tools", intouch: true, external: false }
  ];

  const developerFeatures = [
    {
      icon: Palette,
      title: "Customisable UI",
      description: "Clean design with dark/light mode options for optimal viewing experience."
    },
    {
      icon: Globe,
      title: "No External Downloads",
      description: "100% web-based platform accessible from any modern browser."
    },
    {
      icon: Layout,
      title: "Optimised Layout",
      description: "Side-by-side video + code view for efficient technical discussions."
    },
    {
      icon: Rocket,
      title: "Fast Onboarding",
      description: "Designed specifically for tech hiring workflows and quick setup."
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Why InTouch is the Future of{' '}
                <span className="text-primary">Technical Interviews</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Experience the next generation of remote technical interviews with AI-powered monitoring, 
                real-time collaboration, and seamless developer-focused tools.
              </p>
            </div>
          </div>
        </div>

        {/* Real-Time Collaboration Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">🔁 Real-Time Collaboration</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Everything you need for effective technical interviews in one seamless platform.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-dark-card rounded-lg p-6 border border-border-color hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/20 rounded-lg mb-4">
                    <feature.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Advanced Proctoring Section */}
        <section className="py-16 bg-dark-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">🛡️ Advanced Proctoring & Anti-Cheating</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                InTouch doesn't just record interviews—it actively monitors them with AI-powered detection.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proctoringFeatures.map((feature, index) => (
                <div key={index} className="bg-dark rounded-lg p-6 border border-border-color">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-red-500/20 rounded-lg">
                      <feature.icon className="text-red-500" size={20} />
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">🆚 InTouch vs Safe External Browsers</h2>
              <p className="text-gray-400 text-lg">See why InTouch is the superior choice for technical interviews.</p>
            </div>

            <div className="bg-dark-card rounded-lg overflow-hidden border border-border-color">
              <div className="grid grid-cols-3 bg-gray-800 text-white font-semibold">
                <div className="p-4">Feature</div>
                <div className="p-4 text-center">InTouch</div>
                <div className="p-4 text-center">Safe External Browser</div>
              </div>
              {comparisonData.map((row, index) => (
                <div key={index} className="grid grid-cols-3 border-t border-border-color">
                  <div className="p-4">{row.feature}</div>
                  <div className="p-4 text-center">
                    {row.intouch ? (
                      <CheckCircle className="text-green-500 mx-auto" size={20} />
                    ) : (
                      <XCircle className="text-red-500 mx-auto" size={20} />
                    )}
                  </div>
                  <div className="p-4 text-center">
                    {row.external ? (
                      <CheckCircle className="text-green-500 mx-auto" size={20} />
                    ) : (
                      <XCircle className="text-red-500 mx-auto" size={20} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Built for Developers Section */}
        <section className="py-16 bg-dark-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">⚙️ Built for Developers, By Developers</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Designed with the modern developer workflow in mind.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {developerFeatures.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4">
                    <feature.icon className="text-primary" size={28} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Accessible Anywhere Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-2xl p-12">
              <Globe className="text-primary mx-auto mb-6" size={64} />
              <h2 className="text-3xl font-bold mb-4">🌐 Accessible Anywhere</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                InTouch is lightweight, browser-based, and works seamlessly across platforms—no installation, no hassle.
              </p>
              <Link
                to="/signup-choice"
                className="inline-flex items-center space-x-2 bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/80 transition-colors"
              >
                <Rocket size={20} />
                <span>Get Started Today</span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default LearnMore; 