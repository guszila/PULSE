import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const customKey = req.headers.get("x-gemini-key");
    const apiKey = customKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ไม่พบ API Key กรุณาตั้งค่า Gemini API Key ในหน้าตั้งค่า (Settings) หรือในไฟล์ .env ของระบบ" },
        { status: 401 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Slim down the data to save massive amounts of input tokens (remove 220-day candle data)
    const slimData = {
      symbol: data.selectedStock?.symbol,
      price: data.selectedStock?.price,
      indicators: data.indicators,
      fundamentals: data.fundamentals,
      supportResistance: data.supportResistance,
      news: data.news
    };

    const prompt = `
วิเคราะห์ข้อมูลหุ้นนี้แบบ "สั้นกระชับที่สุด" (Bullet points, เข้าใจง่าย, ประหยัด token)
ตอบเป็นภาษาไทยเท่านั้น ห้ามเกริ่นนำ ตอบเข้าประเด็นทันที

Stock Data:
${JSON.stringify(slimData, null, 2)}

หัวข้อที่ต้องการ (สั้นๆ):
1. **เทคนิคอล**: เทรนด์ปัจจุบันเป็นไง
2. **พื้นฐาน/ข่าว**: ดีหรือแย่
3. **คำแนะนำ**: ซื้อ/ถือ/ขาย ตรงไหน
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        maxOutputTokens: 1000,
      }
    });

    return NextResponse.json({ result: response.text });
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    
    let errorMessage = "เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูล กรุณาลองใหม่อีกครั้ง";
    
    if (error?.message) {
      const msg = error.message.toLowerCase();
      if (msg.includes("503") || msg.includes("high demand") || msg.includes("overloaded")) {
        errorMessage = "ขณะนี้ระบบ AI ของ Google มีผู้ใช้งานจำนวนมาก (High Demand) กรุณารอสักครู่แล้วกดปุ่มวิเคราะห์ใหม่อีกครั้งครับ";
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
