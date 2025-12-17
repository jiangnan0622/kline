
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
  startDaYun: string
): Promise<KLinePoint[]> => {
  const count = endAge - startAge + 1;

  const prompt = `你是资深八字命理师，精通子平真诠、滴天髓、穷通宝鉴。请根据以下命盘推演 ${startAge}-${endAge} 岁的流年运势。

【命盘信息】
四柱八字：${input.yearPillar}年 ${input.monthPillar}月 ${input.dayPillar}日 ${input.hourPillar}时
出生年份：公元${birthYear}年
大运起运：${input.startAge}岁起运，首步大运${startDaYun}，${daYunDir}

【推演规则】
1. 大运每10年一换，流年干支逐年递进
2. 根据日主强弱、用神喜忌、流年与命局的刑冲克合来判断吉凶
3. 分数范围：20-90分。大吉(75-90)、小吉(60-74)、平(45-59)、小凶(30-44)、大凶(20-29)
4. K线形态要体现运势波动：平稳年open/close差<5，转折年open/close差>15

【输出格式】
严格输出JSON：{"chartPoints":[{"age":${startAge},"year":${birthYear + startAge - 1},"daYun":"当前大运干支","ganZhi":"流年干支","open":起始分,"close":收盘分,"high":最高分,"low":最低分,"score":收盘分,"reason":"命理依据8字内"},...]}

共${count}条数据，请专业推演。`;



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

  // Define prompts - Professional Bazi Analysis
  const analysisPrompt = `你是资深八字命理师，精通子平真诠、滴天髓、穷通宝鉴等经典。请对以下命盘进行专业分析。

【命盘】
四柱：${input.yearPillar}年 ${input.monthPillar}月 ${input.dayPillar}日 ${input.hourPillar}时
性别：${input.gender === Gender.MALE ? '乾造（男）' : '坤造（女）'}

【分析要求】
1. 先定日主强弱，再论格局用神
2. 评分标准（1-10分）：
   - 9-10分：极上格局，五行流通，用神有力
   - 7-8分：上格局，略有缺陷但瑕不掩瑜
   - 5-6分：中格局，吉凶参半
   - 3-4分：下格局，忌神当令或有刑冲破害
   - 1-2分：极凶格局，克陷重重
3. 根据命局实际情况客观评分，不要所有项目都给7分

【输出JSON】
{
  "bazi": ["${input.yearPillar}", "${input.monthPillar}", "${input.dayPillar}", "${input.hourPillar}"],
  "summary": "格局定性与总评（30字内）",
  "summaryScore": 根据格局高低给1-10分,
  "industry": "事业方向与适合行业（25字内）",
  "industryScore": 根据官杀印星状态给1-10分,
  "wealth": "财运分析（25字内）",
  "wealthScore": 根据财星喜忌给1-10分,
  "marriage": "婚姻感情（25字内）",
  "marriageScore": 根据夫妻宫与配偶星给1-10分,
  "health": "健康提示（25字内）",
  "healthScore": 根据五行偏枯给1-10分,
  "family": "六亲缘分（25字内）",
  "familyScore": 根据六亲宫位给1-10分
}`;

  // Launch all requests in parallel
  console.log("启动并发请求...");

  try {
    const [analysisContent, batch1Points, batch2Points, batch3Points] = await Promise.all([
      // 1. Analysis
      callApi(cleanBaseUrl, apiKey, targetModel, analysisPrompt)
        .then(res => { console.log("分析模块完成"); return res; }),

      // 2. Batch 1 (1-40)
      generateBatch(cleanBaseUrl, apiKey, targetModel, input, 1, 40, birthYear, daYunDir, input.firstDaYun)
        .then(res => { console.log("Batch 1 (1-40) 完成"); return res; }),

      // 3. Batch 2 (41-80)
      generateBatch(cleanBaseUrl, apiKey, targetModel, input, 41, 80, birthYear, daYunDir, input.firstDaYun)
        .then(res => { console.log("Batch 2 (41-80) 完成"); return res; }),

      // 4. Batch 3 (81-120)
      generateBatch(cleanBaseUrl, apiKey, targetModel, input, 81, 120, birthYear, daYunDir, input.firstDaYun)
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
