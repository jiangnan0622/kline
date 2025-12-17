
import { UserInput, LifeDestinyResult, Gender, KLinePoint } from "../types";

// Helper to determine stem polarity
const getStemPolarity = (pillar: string): 'YANG' | 'YIN' => {
  if (!pillar) return 'YANG';
  const firstChar = pillar.trim().charAt(0);
  const yangStems = ['甲', '丙', '戊', '庚', '壬'];
  return yangStems.includes(firstChar) ? 'YANG' : 'YIN';
};

// Single API call helper with better error handling
const callApi = async (
  cleanBaseUrl: string,
  apiKey: string,
  targetModel: string,
  userPrompt: string
): Promise<string> => {
  const requestBody = {
    model: targetModel,
    messages: [{ role: "user", content: userPrompt }],
    temperature: 0.85,
    response_format: { type: "json_object" }
  };

  console.log("Calling API...");

  const response = await fetch(`${cleanBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API错误 ${response.status}: ${errText.substring(0, 200)}`);
  }

  const jsonResult = await response.json();
  const content = jsonResult.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("模型未返回内容");
  }

  console.log("API response length:", content.length);
  return content;
};

// Safer JSON parse
const parseJson = (content: string): Record<string, unknown> => {
  // First try direct parse
  try {
    return JSON.parse(content);
  } catch (e) {
    console.warn("Direct parse failed, trying to fix...");
  }

  // Try to extract JSON from the content (in case there's extra text)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn("Extracted JSON parse failed");
    }
  }

  // Try to fix truncated JSON
  let fixedContent = content;
  const openBrackets = (fixedContent.match(/\[/g) || []).length;
  const closeBrackets = (fixedContent.match(/\]/g) || []).length;
  const openBraces = (fixedContent.match(/\{/g) || []).length;
  const closeBraces = (fixedContent.match(/\}/g) || []).length;

  // Remove trailing comma if present before closing
  fixedContent = fixedContent.replace(/,\s*$/, '');

  for (let i = 0; i < openBrackets - closeBrackets; i++) fixedContent += ']';
  for (let i = 0; i < openBraces - closeBraces; i++) fixedContent += '}';

  return JSON.parse(fixedContent);
};

// Generate a single batch of chart points
const generateBatch = async (
  cleanBaseUrl: string,
  apiKey: string,
  targetModel: string,
  input: UserInput,
  startAge: number,
  endAge: number,
  birthYear: number,
  daYunDir: string,
  startDaYun: string,
  requestId: string
): Promise<KLinePoint[]> => {
  const count = endAge - startAge + 1;

  const prompt = `[请求ID: ${requestId}] 你是八字命理专家。生成 ${startAge}-${endAge} 岁共 ${count} 条K线数据。

八字：${input.yearPillar} ${input.monthPillar} ${input.dayPillar} ${input.hourPillar}
出生：${birthYear}年，起运：${input.startAge}岁，首运：${startDaYun}，${daYunDir}

只输出JSON：{"chartPoints":[{"age":${startAge},"year":${birthYear + startAge - 1},"daYun":"干支","ganZhi":"干支","open":45,"close":62,"high":70,"low":38,"score":62,"reason":"10字"},...]}

【重要】生成要求：
- **每次请求必须生成新的、独特的数值**，禁止与之前任何请求相同。
- **拒绝平均**：不要每年都差不多长！必须有长有短。
- **平稳年份 (70%)**：open和close非常接近 (差值 < 5)，K线很短。
- **转折年份 (30%)**：open和close差距极大 (差值 > 15-25)，K线很长。
- **吉凶分明**：吉年(>70分)要长红，凶年(<40分)要长绿。

daYun每10年变，ganZhi每年变，reason≤10字，score=close值`;



  const content = await callApi(cleanBaseUrl, apiKey, targetModel, prompt);
  const data = parseJson(content);

  if (!Array.isArray(data.chartPoints)) {
    console.error("Invalid chartPoints:", data);
    throw new Error(`批次 ${startAge} -${endAge} 返回格式错误`);
  }

  return data.chartPoints as KLinePoint[];
};

export const generateLifeAnalysis = async (input: UserInput): Promise<LifeDestinyResult> => {
  const { apiKey, apiBaseUrl, modelName } = input;

  if (!apiKey?.trim()) throw new Error("请填写 API Key");
  if (!apiBaseUrl?.trim()) throw new Error("请填写 API Base URL");

  const cleanBaseUrl = apiBaseUrl.replace(/\/+$/, "");
  const targetModel = modelName?.trim() || "deepseek-chat";
  const birthYear = parseInt(input.birthYear) || 2000;

  const yearStemPolarity = getStemPolarity(input.yearPillar);
  const isForward = input.gender === Gender.MALE ? yearStemPolarity === 'YANG' : yearStemPolarity === 'YIN';
  const daYunDir = isForward ? '顺行' : '逆行';

  console.log("=== 开始生成人生K线 (并发模式) ===");
  console.log("八字:", input.yearPillar, input.monthPillar, input.dayPillar, input.hourPillar);

  // Generate unique request ID for this session
  const requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  // Define prompts
  const analysisPrompt = `八字：${input.yearPillar} ${input.monthPillar} ${input.dayPillar} ${input.hourPillar}，${input.gender === Gender.MALE ? '男' : '女'} 命

  生成JSON：{ "bazi": ["${input.yearPillar}", "${input.monthPillar}", "${input.dayPillar}", "${input.hourPillar}"], "summary": "30字总评", "summaryScore": 7, "industry": "20字事业", "industryScore": 7, "wealth": "20字财运", "wealthScore": 7, "marriage": "20字婚姻", "marriageScore": 7, "health": "20字健康", "healthScore": 7, "family": "20字六亲", "familyScore": 7 } `;

  // Launch all requests in parallel
  console.log("启动并发请求...");

  try {
    const [analysisContent, batch1Points, batch2Points, batch3Points] = await Promise.all([
      // 1. Analysis
      callApi(cleanBaseUrl, apiKey, targetModel, analysisPrompt)
        .then(res => { console.log("分析模块完成"); return res; }),

      // 2. Batch 1 (1-40)
      generateBatch(cleanBaseUrl, apiKey, targetModel, input, 1, 40, birthYear, daYunDir, input.firstDaYun, requestId)
        .then(res => { console.log("Batch 1 (1-40) 完成"); return res; }),

      // 3. Batch 2 (41-80)
      generateBatch(cleanBaseUrl, apiKey, targetModel, input, 41, 80, birthYear, daYunDir, input.firstDaYun, requestId)
        .then(res => { console.log("Batch 2 (41-80) 完成"); return res; }),

      // 4. Batch 3 (81-120)
      generateBatch(cleanBaseUrl, apiKey, targetModel, input, 81, 120, birthYear, daYunDir, input.firstDaYun, requestId)
        .then(res => { console.log("Batch 3 (81-120) 完成"); return res; }),
    ]);

    const analysisData = parseJson(analysisContent);
    const allPoints = [...batch1Points, ...batch2Points, ...batch3Points];

    console.log(`=== 全部完成！共 ${allPoints.length} 条数据 === `);

    return {
      chartData: allPoints,
      analysis: {
        bazi: (analysisData.bazi as string[]) || [input.yearPillar, input.monthPillar, input.dayPillar, input.hourPillar],
        summary: String(analysisData.summary || "命理分析完成"),
        summaryScore: Number(analysisData.summaryScore) || 7,
        industry: String(analysisData.industry || "事业运正常"),
        industryScore: Number(analysisData.industryScore) || 7,
        wealth: String(analysisData.wealth || "财运平稳"),
        wealthScore: Number(analysisData.wealthScore) || 7,
        marriage: String(analysisData.marriage || "婚姻顺遂"),
        marriageScore: Number(analysisData.marriageScore) || 7,
        health: String(analysisData.health || "健康无虞"),
        healthScore: Number(analysisData.healthScore) || 7,
        family: String(analysisData.family || "六亲和睦"),
        familyScore: Number(analysisData.familyScore) || 7,
      },
    };
  } catch (error: any) {
    console.error("生成过程中出现错误:", error);
    throw error; // Propagate error to UI
  }
};
