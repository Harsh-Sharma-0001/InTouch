import OpenAI from 'openai';
import fs from 'fs';
import FormData from 'form-data';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

/**
 * Transcribe audio/video file using OpenAI Whisper
 * @param {string} filePath - Path to audio/video file
 * @returns {Promise<object>} - Transcription result
 */
export async function transcribeAudio(filePath) {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word', 'segment']
    });

    return {
      text: transcription.text,
      segments: transcription.segments || [],
      words: transcription.words || [],
      language: transcription.language,
      duration: transcription.duration
    };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

/**
 * Transcribe with speaker diarization (identifying different speakers)
 * @param {string} filePath - Path to audio/video file
 * @returns {Promise<object>} - Transcription with speaker labels
 */
export async function transcribeWithSpeakers(filePath) {
  try {
    const transcription = await transcribeAudio(filePath);
    
    // Basic speaker diarization based on pauses and segments
    const speakerSegments = identifySpeakers(transcription.segments);
    
    return {
      ...transcription,
      speakers: speakerSegments
    };
  } catch (error) {
    console.error('Error transcribing with speakers:', error);
    throw error;
  }
}

/**
 * Simple speaker identification based on segment timing
 * @param {Array} segments - Transcription segments
 * @returns {Array} - Segments with speaker labels
 */
function identifySpeakers(segments) {
  if (!segments || segments.length === 0) return [];
  
  let currentSpeaker = 'Speaker 1';
  let speakerCount = 1;
  const speakerSegments = [];
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const prevSegment = i > 0 ? segments[i - 1] : null;
    
    // If there's a significant pause (>2 seconds), assume speaker change
    if (prevSegment && (segment.start - prevSegment.end) > 2.0) {
      speakerCount++;
      currentSpeaker = `Speaker ${Math.min(speakerCount, 2)}`; // Limit to 2 speakers for interview
    }
    
    speakerSegments.push({
      ...segment,
      speaker: currentSpeaker
    });
  }
  
  return speakerSegments;
}

/**
 * Generate subtitle file (SRT format) from transcription
 * @param {object} transcription - Transcription result
 * @returns {string} - SRT formatted subtitles
 */
export function generateSubtitles(transcription) {
  if (!transcription.segments || transcription.segments.length === 0) {
    return '';
  }
  
  let srt = '';
  
  transcription.segments.forEach((segment, index) => {
    const startTime = formatSRTTime(segment.start);
    const endTime = formatSRTTime(segment.end);
    
    srt += `${index + 1}\n`;
    srt += `${startTime} --> ${endTime}\n`;
    srt += `${segment.text.trim()}\n\n`;
  });
  
  return srt;
}

function formatSRTTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
}

/**
 * Extract key phrases and topics from transcription
 * @param {string} transcriptionText - Full transcription text
 * @returns {Promise<object>} - Key phrases and topics
 */
export async function extractKeyPhrases(transcriptionText) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that extracts key phrases, topics, and important points from interview transcriptions.'
        },
        {
          role: 'user',
          content: `Extract key phrases, main topics discussed, and important points from this interview transcription:\n\n${transcriptionText}\n\nProvide the result in JSON format with keys: keyPhrases (array), topics (array), importantPoints (array).`
        }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error extracting key phrases:', error);
    return {
      keyPhrases: [],
      topics: [],
      importantPoints: []
    };
  }
}

