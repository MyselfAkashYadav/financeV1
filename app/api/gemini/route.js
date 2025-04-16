import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    // Initialize Gemini API with your API key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Generate content based on the prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return Response.json({
      success: true,
      text: text,
    });
    
  } catch (error) {
    console.error("Gemini API error:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to generate suggestions. Please try again later.",
      },
      { status: 500 }
    );
  }
}