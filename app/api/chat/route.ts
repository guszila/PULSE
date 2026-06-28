import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const customKey = req.headers.get("x-gemini-key");
    const apiKey = customKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ไม่พบ API Key กรุณาตั้งค่า Gemini API Key ในหน้าตั้งค่า (Settings) หรือในไฟล์ .env ของระบบ" },
        { status: 401 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format for @google/genai
    const formattedHistory = messages.map((msg: any) => ({
      role: msg.role === "ai" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const latestMessage = formattedHistory.pop();

    if (!latestMessage) {
       return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    const systemInstruction = `You are AlphaEdge AI, a highly intelligent and expert stock assistant specializing in US stocks.
Always answer concisely in Thai. Use markdown for better formatting (lists, bold text, etc.).
Help the user make informed decisions based on technical and fundamental analysis if asked.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: "System Instruction: " + systemInstruction }] },
        { role: "model", parts: [{ text: "เข้าใจแล้วครับ ผมคือ AlphaEdge AI ผู้ช่วยเรื่องการลงทุนหุ้นสหรัฐ" }] },
        ...formattedHistory,
        latestMessage
      ],
    });

    return NextResponse.json({ result: response.text });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    
    let errorMessage = "เกิดข้อผิดพลาดในการสนทนา กรุณาลองใหม่อีกครั้ง";
    
    if (error?.message) {
      const msg = error.message.toLowerCase();
      if (msg.includes("503") || msg.includes("high demand") || msg.includes("overloaded")) {
        errorMessage = "ขณะนี้ระบบ AI ของ Google มีผู้ใช้งานจำนวนมาก (High Demand) กรุณารอสักครู่แล้วลองถามใหม่อีกครั้งครับ";
      } else if (msg.includes("api key not valid") || msg.includes("api_key_invalid") || msg.includes("400")) {
        errorMessage = "API Key ของ Gemini ไม่ถูกต้อง กรุณาตรวจสอบ Key ของคุณในหน้าตั้งค่าอีกครั้งครับ";
      } else {
        errorMessage = `ข้อผิดพลาดจากระบบ: ${error.message}`;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
