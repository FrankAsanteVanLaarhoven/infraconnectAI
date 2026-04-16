import { OpenAI } from "openai";
import { ROIMetrics, getROISummary } from "./roiEngine";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateStrategicBrief(lead: any, roi: ROIMetrics) {
  const roiText = getROISummary(roi);
  
  const prompt = `
    You are a Strategic Sales Operator for InfraConnectAI. 
    Analyze the following lead and ROI data to generate a high-intensity "Closing Thesis" for the founder.
    
    Lead Data:
    - Company: ${lead.company || "Unknown"}
    - Role: ${lead.role || "Executive"}
    - Behavioral Signals: visitedDemo=${lead.visitedDemo}, viewedSecurity=${lead.viewedSecurity}
    - Capture Message: ${lead.message || "None"}
    
    ROI Analysis:
    ${roiText}
    
    Generate exactly 3 "Executive Leverage Points" and 1 "Strategic Close Suggestion".
    Keep it concise, professional, and aggressive. Focus on financial impact and risk.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an elite enterprise sales strategist." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("SYNTHESIS_FAIL", error);
    return "Intelligence synthesis currently unavailable. Manual intervention recommended.";
  }
}
