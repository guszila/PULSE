import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60; // Allow more time for AI processing

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();
    const customKey = req.headers.get("x-gemini-key");
    const apiKey = customKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ไม่พบ API Key กรุณาตั้งค่า Gemini API Key ในหน้าตั้งค่า (Settings) หรือในไฟล์ .env ของระบบ" },
        { status: 401 }
      );
    }

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are a highly accurate financial data extraction AI. 
The user will provide an image of their stock portfolio from a broker app (e.g. Dime, InnovestX, or others).
Your task is to extract the list of US stocks they hold.
For each stock, extract:
- symbol: The stock ticker symbol (e.g., AAPL, TSLA). Make sure it's uppercase. Ignore Thai stocks if any, focus on US stocks.
- shares: The number of shares held (a number).
- average_cost: The average cost price or average price per share (a number).

IMPORTANT: Return ONLY a valid JSON array of objects. Do not include markdown formatting like \`\`\`json. 
Example response:
[
  {"symbol": "AAPL", "shares": 10.5, "average_cost": 150.25},
  {"symbol": "TSLA", "shares": 5, "average_cost": 180.00}
]
If no stocks are found, return [].`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: "System Instruction: " + systemInstruction }] },
        { role: "model", parts: [{ text: "Understood. I will strictly return a JSON array without markdown blocks." }] },
        { 
          role: "user", 
          parts: [
            { text: "Extract the portfolio data from this image:" },
            { 
              inlineData: {
                data: imageBase64,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        temperature: 0.1, // Keep it deterministic for extraction
      }
    });

    const responseText = response.text || "[]";
    
    // Clean up potential markdown blocks just in case the model ignores instructions
    const cleanedText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    try {
      const parsedData = JSON.parse(cleanedText);
      return NextResponse.json({ result: parsedData });
    } catch (parseError) {
      console.error("Failed to parse AI response:", cleanedText);
      return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลจากรูปภาพได้ กรุณาลองใช้รูปภาพที่ชัดเจนกว่านี้" }, { status: 422 });
    }

  } catch (error: any) {
    console.error("AI Vision Error:", error);
    
    let errorMessage = "เกิดข้อผิดพลาดในการวิเคราะห์รูปภาพ กรุณาลองใหม่อีกครั้ง";
    
    if (error?.message) {
      const msg = error.message.toLowerCase();
      if (msg.includes("503") || msg.includes("high demand")) {
        errorMessage = "ขณะนี้ระบบ AI ของ Google มีผู้ใช้งานจำนวนมาก กรุณารอสักครู่แล้วลองสแกนใหม่อีกครั้งครับ";
      } else if (msg.includes("api key not valid") || msg.includes("api_key_invalid") || msg.includes("400")) {
        errorMessage = "API Key ของ Gemini ไม่ถูกต้อง กรุณาตรวจสอบ Key ของคุณในหน้าตั้งค่าอีกครั้งครับ";
      } else if (msg.includes("payload too large")) {
        errorMessage = "รูปภาพมีขนาดใหญ่เกินไป กรุณาลดขนาดรูปลงก่อนอัปโหลด";
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
