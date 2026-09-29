import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json({ limit: '15mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Korean Center Card Studio' });
});

// Gemini Vision OCR Endpoint for Business Cards
app.post('/api/scan-card', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: '이미지 데이터가 전달되지 않았습니다.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not configured on server.');
      return res.status(503).json({ 
        error: 'GEMINI_API_KEY_MISSING',
        message: '서버에 GEMINI_API_KEY가 설정되지 않아 수동 입력 모드로 전환합니다.' 
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `You are an expert executive OCR and information extraction system for business cards.
Analyze this business card image and extract accurate details. 
Return a pure JSON object with the following fields:
{
  "name": "성명 (한글 우선 또는 원어)",
  "nameKr": "성명 한글 표기",
  "nameEn": "성명 영문 표기 (대문자 성, 이름 형태 e.g. PARK, GIHONG)",
  "title": "직함/직책 영문 (e.g. President Director, Senior Vice President)",
  "titleKr": "직함/직책 한글 (e.g. 대표이사, 부사장, 팀장)",
  "organization": "소속 기관/회사명 영문 또는 공식 명칭",
  "organizationKr": "소속 기관/회사명 국문",
  "phone": "전화번호 또는 휴대전화 (+82 또는 원형 유지)",
  "email": "이메일 주소",
  "website": "공식 웹사이트 URL (https:// 포함)",
  "websiteDisplay": "표시용 웹사이트 주소 (http 제외)",
  "address": "주소 (국문 또는 원어)",
  "tagline": "명함에 적힌 슬로건 또는 모토 (한글, 없으면 null)",
  "taglineEn": "명함에 적힌 슬로건 또는 모토 (영문, 없으면 null)",
  "themeRecommendation": "obsidian" | "cotton" | "sand" | "navy" | "emerald" | "burgundy",
  "category": "VIP 파트너" | "글로벌 네트워크" | "공공·기관" | "투자·금융" | "IT·기술" | "일반"
}
Ensure all keys are present. If a field is not found on the card, provide a reasonable default or empty string.
DO NOT wrap with markdown or code fences. Return valid JSON only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: cleanBase64
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text?.trim() || '{}';
    const parsedData = JSON.parse(text);
    return res.json({ success: true, card: parsedData });
  } catch (error) {
    console.error('Card scan error:', error);
    return res.status(500).json({ 
      success: false, 
      error: (error as Error).message || '명함 스캔 중 오류가 발생했습니다.' 
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
