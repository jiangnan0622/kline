
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
    temperature: 0.6,
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
  startDaYun: string
): Promise<KLinePoint[]> => {
  const count = endAge - startAge + 1;

  const prompt = `你是八字命理专家。生成 ${startAge}-${endAge} 岁共 ${count} 条K线数据。

八字：${input.yearPillar} ${input.monthPillar} ${input.dayPillar} ${input.hourPillar}
出生：${birthYear}年，起运：${input.startAge}岁，首运：${startDaYun}，${daYunDir}

只输出JSON：{"chartPoints":[{"age":${startAge},"year":${birthYear + startAge - 1},"daYun":"干支","ganZhi":"干支","open":45,"close":62,"high":70,"low":38,"score":62,"reason":"10字"},...]}

【重要】K线形态 - 区分度 (High Contrast)：
- **拒绝平均**：不要每年都差不多长！必须有长有短。
- **平稳年份 (70%)**：open和close非常接近 (差值 < 5)，K线很短，表示运势平稳。
- **转折年份 (30%)**：open和close差距极大 (差值 > 15-25)，K线很长，表示大起大落。
- **吉凶分明**：吉年(>70分)要长红，凶年(<40分)要长绿。
- **制造疏密**：平稳期像一条线，动荡期像一根柱，视觉上要有明显的疏密节奏。

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

  console.log("=== 开始生成人生K线 ===");
  console.log("八字:", input.yearPillar, input.monthPillar, input.dayPillar, input.hourPillar);

  // Step 1: Get analysis
  const analysisPrompt = `八字：${input.yearPillar} ${input.monthPillar} ${input.dayPillar} ${input.hourPillar}，${input.gender === Gender.MALE ? '男' : '女'} 命

  生成JSON：{ "bazi": ["${input.yearPillar}", "${input.monthPillar}", "${input.dayPillar}", "${input.hourPillar}"], "summary": "30字总评", "summaryScore": 7, "industry": "20字事业", "industryScore": 7, "wealth": "20字财运", "wealthScore": 7, "marriage": "20字婚姻", "marriageScore": 7, "health": "20字健康", "healthScore": 7, "family": "20字六亲", "familyScore": 7 } `;

  console.log("Step 1: 获取命理分析...");
  const analysisContent = await callApi(cleanBaseUrl, apiKey, targetModel, analysisPrompt);
  const analysisData = parseJson(analysisContent);
  console.log("Step 1 完成");

  // Step 2-4: Generate chart points in 3 batches (1-30, 31-60, 61-80)
  const allPoints: KLinePoint[] = [];

  console.log("Step 2: 生成 1-40 岁...");
  const batch1 = await generateBatch(cleanBaseUrl, apiKey, targetModel, input, 1, 40, birthYear, daYunDir, input.firstDaYun);
  allPoints.push(...batch1);
  console.log(`Step 2 完成: ${batch1.length} 条`);

  console.log("Step 3: 生成 41-80 岁...");
  const batch2 = await generateBatch(cleanBaseUrl, apiKey, targetModel, input, 41, 80, birthYear, daYunDir, input.firstDaYun);
  allPoints.push(...batch2);
  console.log(`Step 3 完成: ${batch2.length} 条`);

  console.log("Step 4: 生成 81-120 岁...");
  const batch3 = await generateBatch(cleanBaseUrl, apiKey, targetModel, input, 81, 120, birthYear, daYunDir, input.firstDaYun);
  allPoints.push(...batch3);
  console.log(`Step 4 完成: ${batch3.length} 条`);

  console.log(`=== 完成！共 ${allPoints.length} 条数据 === `);

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
};
