import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

/**
 * Analyze interview transcription and generate comprehensive feedback
 * @param {object} params - Analysis parameters
 * @returns {Promise<object>} - Analysis result
 */
export async function analyzeInterview({
  transcription,
  interviewRole,
  interviewType,
  duration
}) {
  try {
    const prompt = `You are an expert interview analyst. Analyze the following interview transcription and provide comprehensive feedback.

Interview Details:
- Role: ${interviewRole || 'Not specified'}
- Type: ${interviewType || 'Technical Interview'}
- Duration: ${duration || 'Unknown'} minutes

Transcription:
${transcription}

Please provide a detailed analysis in JSON format with the following structure:
{
  "overallScore": <number 0-100>,
  "summary": "<brief summary of the interview>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "communicationScore": <number 0-100>,
  "technicalScore": <number 0-100>,
  "confidenceLevel": "<low|medium|high>",
  "clarity": "<poor|fair|good|excellent>",
  "keyInsights": ["<insight 1>", "<insight 2>", ...],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...],
  "redFlags": ["<red flag 1>", ...] or [],
  "positiveIndicators": ["<indicator 1>", ...],
  "detailedFeedback": "<comprehensive feedback paragraph>"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview analyst with deep knowledge of candidate evaluation, communication assessment, and technical interviewing.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing interview:', error);
    throw error;
  }
}

/**
 * Analyze candidate's communication style
 * @param {string} transcription - Interview transcription
 * @returns {Promise<object>} - Communication analysis
 */
export async function analyzeCommunication(transcription) {
  try {
    const prompt = `Analyze the communication style in this interview transcription:

${transcription}

Provide analysis in JSON format:
{
  "articulacy": <number 0-100>,
  "vocabulary": "<basic|intermediate|advanced>",
  "grammarQuality": <number 0-100>,
  "responseLength": "<too short|appropriate|too long>",
  "fillerWords": <count>,
  "pace": "<too slow|appropriate|too fast>",
  "engagement": <number 0-100>,
  "professionalTone": <number 0-100>,
  "insights": ["<insight 1>", ...]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a communication expert specializing in professional interview assessment.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing communication:', error);
    throw error;
  }
}

/**
 * Detect sentiment and emotional tone from transcription
 * @param {string} transcription - Interview transcription
 * @returns {Promise<object>} - Sentiment analysis
 */
export async function analyzeSentiment(transcription) {
  try {
    const prompt = `Analyze the sentiment and emotional tone in this interview transcription:

${transcription}

Provide sentiment analysis in JSON format:
{
  "overallSentiment": "<positive|neutral|negative>",
  "confidence": <number 0-100>,
  "enthusiasm": <number 0-100>,
  "nervousness": <number 0-100>,
  "professionalism": <number 0-100>,
  "emotionalStability": <number 0-100>,
  "stressLevel": "<low|medium|high>",
  "sentimentTimeline": [
    {"segment": "<beginning|middle|end>", "sentiment": "<positive|neutral|negative>"}
  ],
  "insights": ["<insight 1>", ...]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in emotional intelligence and sentiment analysis for professional interviews.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw error;
  }
}

/**
 * Generate interview questions based on role and type
 * @param {string} role - Job role
 * @param {string} type - Interview type
 * @returns {Promise<Array>} - Suggested questions
 */
export async function generateInterviewQuestions(role, type = 'technical') {
  try {
    const prompt = `Generate 10 relevant interview questions for a ${role} position. Interview type: ${type}.

Provide questions in JSON format:
{
  "questions": [
    {"question": "<question text>", "category": "<category>", "difficulty": "<easy|medium|hard>"},
    ...
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical recruiter and interviewer.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result.questions || [];
  } catch (error) {
    console.error('Error generating questions:', error);
    return [];
  }
}

/**
 * Compare candidate against job requirements
 * @param {string} transcription - Interview transcription
 * @param {string} jobDescription - Job description
 * @returns {Promise<object>} - Fit analysis
 */
export async function analyzeJobFit(transcription, jobDescription) {
  try {
    const prompt = `Compare the candidate's interview responses against the job requirements.

Job Description:
${jobDescription}

Interview Transcription:
${transcription}

Provide fit analysis in JSON format:
{
  "fitScore": <number 0-100>,
  "matchedSkills": ["<skill 1>", ...],
  "missingSkills": ["<skill 1>", ...],
  "experienceAlignment": <number 0-100>,
  "cultureFit": <number 0-100>,
  "recommendation": "<strong hire|hire|maybe|no hire>",
  "reasoning": "<detailed reasoning>",
  "nextSteps": ["<step 1>", ...]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert recruiter specializing in candidate-job fit analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing job fit:', error);
    throw error;
  }
}

