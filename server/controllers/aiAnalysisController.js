import { transcribeAudio, transcribeWithSpeakers, generateSubtitles, extractKeyPhrases } from '../services/aiTranscription.js';
import { analyzeInterview, analyzeCommunication, analyzeSentiment, analyzeJobFit, generateInterviewQuestions } from '../services/aiAnalysis.js';
import { uploadInterviewRecording, uploadTranscription } from '../services/cloudStorage.js';
import Interview from '../models/Interview.js';
import path from 'path';
import fs from 'fs';

/**
 * Process interview recording: transcribe and analyze
 * POST /api/ai/process-interview
 */
export const processInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;
    
    if (!interviewId) {
      return res.status(400).json({ error: 'Interview ID is required' });
    }
    
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    // Check if recording exists
    if (!interview.recordingFileName) {
      return res.status(400).json({ error: 'No recording found for this interview' });
    }
    
    const recordingPath = path.join('uploads', 'recordings', interview.recordingFileName);
    
    if (!fs.existsSync(recordingPath)) {
      return res.status(404).json({ error: 'Recording file not found' });
    }
    
    // Step 1: Transcribe audio
    console.log('Transcribing interview...');
    const transcription = await transcribeWithSpeakers(recordingPath);
    
    // Step 2: Upload transcription to cloud
    console.log('Uploading transcription...');
    const transcriptionResult = await uploadTranscription(interviewId, transcription.text);
    
    // Step 3: Analyze interview
    console.log('Analyzing interview...');
    const analysis = await analyzeInterview({
      transcription: transcription.text,
      interviewRole: interview.role,
      interviewType: interview.type,
      duration: interview.duration
    });
    
    // Step 4: Analyze communication
    console.log('Analyzing communication...');
    const communicationAnalysis = await analyzeCommunication(transcription.text);
    
    // Step 5: Analyze sentiment
    console.log('Analyzing sentiment...');
    const sentimentAnalysis = await analyzeSentiment(transcription.text);
    
    // Step 6: Extract key phrases
    console.log('Extracting key phrases...');
    const keyPhrases = await extractKeyPhrases(transcription.text);
    
    // Step 7: Generate subtitles
    const subtitles = generateSubtitles(transcription);
    
    // Update interview with analysis results
    interview.aiAnalysis = {
      transcription: transcription.text,
      transcriptionUrl: transcriptionResult.url,
      analysis,
      communicationAnalysis,
      sentimentAnalysis,
      keyPhrases,
      subtitles,
      processedAt: new Date()
    };
    
    await interview.save();
    
    res.json({
      success: true,
      message: 'Interview processed successfully',
      data: interview.aiAnalysis
    });
    
  } catch (error) {
    console.error('Error processing interview:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get AI analysis for an interview
 * GET /api/ai/analysis/:interviewId
 */
export const getAnalysis = async (req, res) => {
  try {
    const { interviewId } = req.params;
    
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    if (!interview.aiAnalysis) {
      return res.status(404).json({ error: 'No AI analysis available for this interview' });
    }
    
    res.json({
      success: true,
      data: interview.aiAnalysis
    });
    
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Analyze job fit for a candidate
 * POST /api/ai/analyze-job-fit
 */
export const analyzeJobFitEndpoint = async (req, res) => {
  try {
    const { interviewId, jobDescription } = req.body;
    
    if (!interviewId || !jobDescription) {
      return res.status(400).json({ error: 'Interview ID and job description are required' });
    }
    
    const interview = await Interview.findById(interviewId);
    if (!interview || !interview.aiAnalysis) {
      return res.status(404).json({ error: 'Interview or analysis not found' });
    }
    
    const fitAnalysis = await analyzeJobFit(interview.aiAnalysis.transcription, jobDescription);
    
    // Update interview with fit analysis
    interview.aiAnalysis.jobFitAnalysis = fitAnalysis;
    await interview.save();
    
    res.json({
      success: true,
      data: fitAnalysis
    });
    
  } catch (error) {
    console.error('Error analyzing job fit:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Generate interview questions
 * POST /api/ai/generate-questions
 */
export const generateQuestions = async (req, res) => {
  try {
    const { role, type } = req.body;
    
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }
    
    const questions = await generateInterviewQuestions(role, type);
    
    res.json({
      success: true,
      data: questions
    });
    
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get transcription with timestamps
 * GET /api/ai/transcription/:interviewId
 */
export const getTranscription = async (req, res) => {
  try {
    const { interviewId } = req.params;
    
    const interview = await Interview.findById(interviewId);
    if (!interview || !interview.aiAnalysis) {
      return res.status(404).json({ error: 'Transcription not found' });
    }
    
    res.json({
      success: true,
      data: {
        transcription: interview.aiAnalysis.transcription,
        subtitles: interview.aiAnalysis.subtitles
      }
    });
    
  } catch (error) {
    console.error('Error fetching transcription:', error);
    res.status(500).json({ error: error.message });
  }
};

