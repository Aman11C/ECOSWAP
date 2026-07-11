import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "")

export async function analyzeItemImage(imageBase64: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" })
  const prompt = `Analyze this image and suggest item details for a swap/exchange platform.
Return JSON only:
{
  "title": "suggested title",
  "description": "brief description",
  "category": "Books|Electronics|Clothes|Furniture|Sports|Others",
  "condition": "New|Like New|Good|Fair|Poor",
  "suggestedCredits": number between 10-500
}`
  const result = await model.generateContent([prompt, { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }])
  const text = result.response.text().replace(/```json?/g, "").replace(/```/g, "").trim()
  return JSON.parse(text)
}
