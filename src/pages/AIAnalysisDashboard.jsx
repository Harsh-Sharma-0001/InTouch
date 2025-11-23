import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Brain, 
  MessageSquare, 
  TrendingUp, 
  Award, 
  AlertCircle, 
  CheckCircle, 
  FileText,
  Download,
  Loader
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import InterviewHeader from '../components/InterviewHeader';
import Footer from '../components/Footer';

const AIAnalysisDashboard = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalysis();
  }, [interviewId]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/ai/analysis/${interviewId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.data);
      } else if (response.status === 404) {
        // No analysis yet
        setAnalysis(null);
      } else {
        throw new Error('Failed to fetch analysis');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processInterview = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/process-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ interviewId })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.data);
      } else {
        throw new Error('Failed to process interview');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const downloadTranscription = () => {
    if (analysis && analysis.transcription) {
      const blob = new Blob([analysis.transcription], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-${interviewId}-transcription.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const downloadSubtitles = () => {
    if (analysis && analysis.subtitles) {
      const blob = new Blob([analysis.subtitles], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-${interviewId}-subtitles.srt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <InterviewHeader />
        <div className="flex flex-1">
          <Sidebar role="user" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center max-w-md">
              <Brain className="mx-auto mb-4" size={64} />
              <h2 className="text-2xl font-bold mb-4">No Analysis Available</h2>
              <p className="text-gray-400 mb-6">
                This interview hasn't been analyzed yet. Click the button below to start AI analysis.
              </p>
              <button
                onClick={processInterview}
                disabled={processing}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Analyze Interview'}
              </button>
              {error && (
                <p className="text-red-500 mt-4">{error}</p>
              )}
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  const { analysis: mainAnalysis, communicationAnalysis, sentimentAnalysis, keyPhrases } = analysis;

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <InterviewHeader />
      <div className="flex flex-1">
        <Sidebar role="user" />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">AI Interview Analysis</h1>
                <p className="text-gray-400">Comprehensive AI-powered insights and feedback</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={downloadTranscription}
                  className="flex items-center gap-2 bg-dark-card hover:bg-gray-700 px-4 py-2 rounded-lg"
                >
                  <Download size={16} />
                  Transcription
                </button>
                <button
                  onClick={downloadSubtitles}
                  className="flex items-center gap-2 bg-dark-card hover:bg-gray-700 px-4 py-2 rounded-lg"
                >
                  <Download size={16} />
                  Subtitles
                </button>
              </div>
            </div>

            {/* Overall Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-dark-card p-6 rounded-lg border border-border-color">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Overall Score</span>
                  <Award className="text-primary" size={20} />
                </div>
                <div className="text-3xl font-bold">{mainAnalysis?.overallScore || 0}/100</div>
              </div>

              <div className="bg-dark-card p-6 rounded-lg border border-border-color">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Communication</span>
                  <MessageSquare className="text-blue-400" size={20} />
                </div>
                <div className="text-3xl font-bold">{mainAnalysis?.communicationScore || 0}/100</div>
              </div>

              <div className="bg-dark-card p-6 rounded-lg border border-border-color">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Technical</span>
                  <Brain className="text-purple-400" size={20} />
                </div>
                <div className="text-3xl font-bold">{mainAnalysis?.technicalScore || 0}/100</div>
              </div>

              <div className="bg-dark-card p-6 rounded-lg border border-border-color">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Confidence</span>
                  <TrendingUp className="text-green-400" size={20} />
                </div>
                <div className="text-3xl font-bold capitalize">{mainAnalysis?.confidenceLevel || 'N/A'}</div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-dark-card p-6 rounded-lg border border-border-color mb-6">
              <h2 className="text-xl font-bold mb-4">Executive Summary</h2>
              <p className="text-gray-300">{mainAnalysis?.summary || 'No summary available'}</p>
            </div>

            {/* Strengths and Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-dark-card p-6 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="text-green-400" size={20} />
                  Strengths
                </h2>
                <ul className="space-y-2">
                  {mainAnalysis?.strengths?.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span className="text-gray-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-dark-card p-6 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <AlertCircle className="text-orange-400" size={20} />
                  Areas for Improvement
                </h2>
                <ul className="space-y-2">
                  {mainAnalysis?.weaknesses?.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span>
                      <span className="text-gray-300">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Communication Analysis */}
            {communicationAnalysis && (
              <div className="bg-dark-card p-6 rounded-lg border border-border-color mb-6">
                <h2 className="text-xl font-bold mb-4">Communication Analysis</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Articulacy</div>
                    <div className="text-2xl font-bold">{communicationAnalysis.articulacy || 0}/100</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Grammar</div>
                    <div className="text-2xl font-bold">{communicationAnalysis.grammarQuality || 0}/100</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Engagement</div>
                    <div className="text-2xl font-bold">{communicationAnalysis.engagement || 0}/100</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Professionalism</div>
                    <div className="text-2xl font-bold">{communicationAnalysis.professionalTone || 0}/100</div>
                  </div>
                </div>
              </div>
            )}

            {/* Sentiment Analysis */}
            {sentimentAnalysis && (
              <div className="bg-dark-card p-6 rounded-lg border border-border-color mb-6">
                <h2 className="text-xl font-bold mb-4">Sentiment & Emotional Analysis</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Overall Sentiment</div>
                    <div className="text-xl font-bold capitalize">{sentimentAnalysis.overallSentiment || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Enthusiasm</div>
                    <div className="text-xl font-bold">{sentimentAnalysis.enthusiasm || 0}/100</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Confidence</div>
                    <div className="text-xl font-bold">{sentimentAnalysis.confidence || 0}/100</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Stress Level</div>
                    <div className="text-xl font-bold capitalize">{sentimentAnalysis.stressLevel || 'N/A'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Key Insights */}
            <div className="bg-dark-card p-6 rounded-lg border border-border-color mb-6">
              <h2 className="text-xl font-bold mb-4">Key Insights</h2>
              <ul className="space-y-2">
                {mainAnalysis?.keyInsights?.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-gray-300">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="bg-dark-card p-6 rounded-lg border border-border-color mb-6">
              <h2 className="text-xl font-bold mb-4">Recommendations</h2>
              <ul className="space-y-2">
                {mainAnalysis?.recommendations?.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">→</span>
                    <span className="text-gray-300">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Detailed Feedback */}
            <div className="bg-dark-card p-6 rounded-lg border border-border-color">
              <h2 className="text-xl font-bold mb-4">Detailed Feedback</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{mainAnalysis?.detailedFeedback || 'No detailed feedback available'}</p>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AIAnalysisDashboard;

