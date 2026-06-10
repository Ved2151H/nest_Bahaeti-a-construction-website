import { GoogleGenAI } from '@google/genai';
import { Deal, Project } from '../data';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateFollowUpMessage(deal: Deal, project: Project | undefined): Promise<string> {
  const prompt = `
    You are an expert real estate advisor. Draft a short, professional, and persuasive WhatsApp follow-up message for a client.
    
    Client Name: ${deal.buyerName}
    Project: ${project?.name || 'Unknown'}
    Unit: ${deal.unitName}
    Current Stage: ${deal.status}
    Recent Interaction History:
    ${deal.history.slice(0, 3).map(h => `- ${h.date}: ${h.note}`).join('\n')}
    
    Keep it under 3 sentences. Be polite, mention the project/unit, and suggest a clear next step based on the history. Do not include placeholders like [Your Name].
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || 'Could not generate message.';
  } catch (error) {
    console.error('Error generating follow-up:', error);
    return 'Error generating message. Please try again.';
  }
}

export async function analyzeLead(deal: Deal, project: Project | undefined): Promise<{ score: number, analysis: string }> {
  const prompt = `
    You are an expert real estate sales director. Analyze this lead and provide a predictive conversion score out of 100, along with a 2-sentence analysis of their likelihood to buy.
    
    Client Name: ${deal.buyerName}
    Profile: ${deal.buyerProfile}
    Project: ${project?.name || 'Unknown'}
    Unit: ${deal.unitName}
    Amount: ${deal.amount}
    Current Stage: ${deal.status}
    Days in Stage: ${deal.daysInStage}
    Temperature: ${deal.temperature}
    
    Interaction History:
    ${deal.history.map(h => `- ${h.date}: ${h.note}`).join('\n')}
    
    Respond in JSON format with exactly two keys: "score" (a number between 0 and 100) and "analysis" (a string).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });
    
    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        score: data.score || 50,
        analysis: data.analysis || 'Analysis unavailable.'
      };
    }
    return { score: 50, analysis: 'Could not generate analysis.' };
  } catch (error) {
    console.error('Error analyzing lead:', error);
    return { score: 50, analysis: 'Error analyzing lead. Please try again.' };
  }
}
