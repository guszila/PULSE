import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json();
    const customKey = req.headers.get("x-gemini-key");
    const apiKey = customKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ไม่พบ API Key กรุณาตั้งค่า Gemini API Key ในหน้าตั้งค่า (Settings)" },
        { status: 401 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Define the expected output schema
    const decisionSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        score: {
          type: Type.INTEGER,
          description: "A score from 0 to 100 representing trend strength and overall stock health. 0 is very weak, 100 is very strong.",
        },
        bias: {
          type: Type.STRING,
          enum: ["Bullish", "Bearish", "Neutral"],
          description: "The overall directional bias of the stock based on technicals and fundamentals.",
        },
        riskLevel: {
          type: Type.STRING,
          enum: ["High", "Medium", "Low"],
          description: "The assessed risk level of entering a trade at this time.",
        },
        actionLabel: {
          type: Type.STRING,
          description: "A short, actionable recommendation in Thai, e.g., 'รอราคาย่อตัวที่แนวรับแล้วค่อยเข้า', 'ซื้อสะสมเมื่อทะลุแนวต้าน', 'ระวังความเสี่ยง ห้ามเพิ่งเข้า'. Must be strictly in Thai.",
        },
        support: {
          type: Type.NUMBER,
          description: "The primary calculated support level.",
        },
        strongSupport: {
          type: Type.NUMBER,
          description: "A deeper, stronger support level.",
        },
        resistance: {
          type: Type.NUMBER,
          description: "The primary calculated resistance level.",
        },
        strongResistance: {
          type: Type.NUMBER,
          description: "A higher, stronger resistance level.",
        },
        suggestedEntry: {
          type: Type.STRING,
          description: "A suggested entry price range, formatted as '$xxx.xx - $xxx.xx'.",
        },
        stopLoss: {
          type: Type.STRING,
          description: "The suggested stop loss price, formatted as '$xxx.xx'.",
        },
        takeProfit: {
          type: Type.STRING,
          description: "The suggested take profit target price, formatted as '$xxx.xx'.",
        },
        riskReward: {
          type: Type.STRING,
          description: "The calculated risk-reward ratio, formatted as 'X.X : 1'.",
        }
      },
      required: [
        "score", "bias", "riskLevel", "actionLabel", 
        "support", "strongSupport", "resistance", "strongResistance",
        "suggestedEntry", "stopLoss", "takeProfit", "riskReward"
      ],
    };

    // Slim down the data to save massive amounts of input tokens (remove 220-day candle data)
    // The AI still gets the most important structural data to do its job.
    const slimData = {
      symbol: data.selectedStock?.symbol,
      price: data.selectedStock?.price,
      indicators: data.indicators,
      fundamentals: data.fundamentals,
      supportResistance: data.supportResistance,
      macro: data.macro
    };

    const prompt = `
You are an elite quantitative analyst and AI trading algorithm.
Analyze the following market data for the given stock and return a structured JSON response.

Input Data:
${JSON.stringify(slimData, null, 2)}

CRITICAL INSTRUCTIONS:
1. Act as a precise mathematical model.
2. The current price of the stock is ${data.selectedStock.price}. ALL calculations MUST make mathematical sense relative to this exact current price.
3. Rules for support/resistance:
   - support MUST be strictly <= current price.
   - strongSupport MUST be strictly < support.
   - resistance MUST be strictly >= current price.
   - strongResistance MUST be strictly > resistance.
4. Rules for suggestedEntry, stopLoss, and takeProfit:
   - stopLoss MUST be < suggestedEntry.
   - takeProfit MUST be > suggestedEntry.
   - If bias is Bullish, suggestedEntry should be near current price or support.
5. Calculate real support and resistance levels based on price action and volume profile in the provided data. Do not hallucinate old prices.
6. Provide a realistic score (0-100), directional bias, and risk level. Calculate the risk-reward ratio formatted as 'X.X : 1'.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: decisionSchema,
        temperature: 0.1, // Keep it deterministic
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from AI");
    }

    const aiData = JSON.parse(resultText);

    return NextResponse.json({ result: aiData });
  } catch (error: any) {
    console.error("AI Decision Error:", error);
    
    let errorMessage = "เกิดข้อผิดพลาดในการคำนวณ AI กรุณาลองใหม่อีกครั้ง";
    
    if (error?.message) {
      const msg = error.message.toLowerCase();
      if (msg.includes("503") || msg.includes("high demand") || msg.includes("overloaded")) {
        errorMessage = "ขณะนี้ระบบ AI มีผู้ใช้งานจำนวนมาก กรุณารอสักครู่แล้วลองใหม่ครับ";
      } else if (msg.includes("api key not valid") || msg.includes("api_key_invalid") || msg.includes("400")) {
        errorMessage = "API Key ของ Gemini ไม่ถูกต้อง กรุณาตรวจสอบ Key ในหน้าตั้งค่าครับ";
      } else {
        errorMessage = `ข้อผิดพลาด: ${error.message}`;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
