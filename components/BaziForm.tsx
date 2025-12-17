import React, { useState } from 'react';
import { UserInput, Gender } from '../types';
import { Loader2, Sparkles, MapPin, Calendar, Clock, Settings, User } from 'lucide-react';
import { calculateBaziFromSolar } from '../utils/baziHelper';

interface BaziFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}

const BaziForm: React.FC<BaziFormProps> = ({ onSubmit, isLoading }) => {
  // Simple Form State
  const [formData, setFormData] = useState({
    name: '',
    gender: Gender.MALE,
    birthYear: '1990',
    birthMonth: '1',
    birthDay: '1',
    birthHour: '12',
    birthMinute: '0',
    birthPlace: '',
    modelName: 'deepseek-chat',
    apiBaseUrl: 'https://api.deepseek.com/v1',
    apiKey: '',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string | undefined }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Basic Validation
    const errors: { [key: string]: string } = {};
    if (!formData.birthYear) errors.birthYear = "必填";
    if (!formData.birthMonth) errors.birthMonth = "必填";
    if (!formData.birthDay) errors.birthDay = "必填";
    if (!formData.apiKey.trim()) errors.apiKey = "请输入 API Key";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // If API key missing, show advanced
      if (errors.apiKey) setShowAdvanced(true);
      return;
    }

    // 2. Local Calculation using lunar-javascript
    try {
      const result = calculateBaziFromSolar(
        parseInt(formData.birthYear),
        parseInt(formData.birthMonth),
        parseInt(formData.birthDay),
        parseInt(formData.birthHour) || 0,
        parseInt(formData.birthMinute) || 0,
        formData.gender
      );

      // 3. Construct Final Payload
      const finalData: UserInput = {
        name: formData.name,
        gender: formData.gender,
        birthYear: formData.birthYear,

        // Pillars from calculation
        yearPillar: result.yearPillar,
        monthPillar: result.monthPillar,
        dayPillar: result.dayPillar,
        hourPillar: result.hourPillar,

        // Da Yun from calculation
        startAge: result.startAge,
        firstDaYun: result.firstDaYun,

        // Config
        modelName: formData.modelName,
        apiBaseUrl: formData.apiBaseUrl,
        apiKey: formData.apiKey,
      };

      onSubmit(finalData);

    } catch (err) {
      console.error("Calculation Error", err);
      const errorMsg = err instanceof Error ? err.message : "日期无效，请检查输入";
      setFormErrors({ calculation: errorMsg });
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8 relative">
        <h2 className="text-3xl font-calligraphy text-ink mb-2 tracking-widest">八字排盘</h2>
        <div className="w-12 h-1 bg-cinnabar/20 mx-auto rounded-full"></div>
        <p className="text-indigo-dye/60 text-xs mt-2 font-serif-sc tracking-wider">
          输入出生信息，AI 自动完成排盘与推演
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Name & Gender */}
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-xs font-bold text-indigo-dye/70 mb-1">
              <User className="w-3 h-3" /> 姓名 (可选)
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="chinese-input text-center"
              placeholder="某某某"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-indigo-dye/70 mb-1">性别</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: Gender.MALE })}
                className={`flex-1 py-1.5 border border-dashed rounded-sm text-sm font-bold transition-all ${formData.gender === Gender.MALE
                  ? 'border-indigo-dye bg-indigo-dye/10 text-indigo-dye shadow-inner'
                  : 'border-indigo-dye/20 text-indigo-dye/40 hover:border-indigo-dye/50'
                  }`}
              >
                乾造 (男)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: Gender.FEMALE })}
                className={`flex-1 py-1.5 border border-dashed rounded-sm text-sm font-bold transition-all ${formData.gender === Gender.FEMALE
                  ? 'border-cinnabar bg-cinnabar/10 text-cinnabar shadow-inner'
                  : 'border-cinnabar/20 text-cinnabar/40 hover:border-cinnabar/50'
                  }`}
              >
                坤造 (女)
              </button>
            </div>
          </div>
        </div>

        {/* Date Input */}
        <div className="bg-paper p-4 rounded-sm border border-indigo-dye/10 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-paper px-2 text-xs font-bold text-indigo-dye/50 flex gap-1">
            <Calendar className="w-3 h-3" /> 公历出生日期
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="relative">
              <input
                type="number"
                name="birthYear"
                value={formData.birthYear}
                onChange={handleChange}
                className="chinese-input text-center font-mono"
                placeholder="1990"
              />
              <span className="absolute right-0 bottom-2 text-xs text-indigo-dye/30">年</span>
            </div>
            <div className="relative">
              <input
                type="number"
                name="birthMonth"
                value={formData.birthMonth}
                onChange={handleChange}
                className="chinese-input text-center font-mono"
                placeholder="1"
                max="12" min="1"
              />
              <span className="absolute right-0 bottom-2 text-xs text-indigo-dye/30">月</span>
            </div>
            <div className="relative">
              <input
                type="number"
                name="birthDay"
                value={formData.birthDay}
                onChange={handleChange}
                className="chinese-input text-center font-mono"
                placeholder="1"
                max="31" min="1"
              />
              <span className="absolute right-0 bottom-2 text-xs text-indigo-dye/30">日</span>
            </div>
          </div>
        </div>

        {/* Time & Place */}
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-xs font-bold text-indigo-dye/70 mb-1">
              <Clock className="w-3 h-3" /> 出生时间 (24h)
            </label>
            <div className="flex gap-2 items-end">
              <input
                type="number"
                name="birthHour"
                value={formData.birthHour}
                onChange={handleChange}
                className="chinese-input text-center font-mono w-full"
                placeholder="12"
                max="23" min="0"
              />
              <span className="text-indigo-dye/30 pb-2">:</span>
              <input
                type="number"
                name="birthMinute"
                value={formData.birthMinute}
                onChange={handleChange}
                className="chinese-input text-center font-mono w-full"
                placeholder="00"
                max="59" min="0"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-xs font-bold text-indigo-dye/70 mb-1">
              <MapPin className="w-3 h-3" /> 出生地点
            </label>
            <input
              type="text"
              name="birthPlace"
              value={formData.birthPlace}
              onChange={handleChange}
              className="chinese-input text-center text-sm"
              placeholder="如: 北京市"
            />
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-indigo-dye/40 hover:text-indigo-dye flex items-center justify-center gap-1 mx-auto transition-colors"
          >
            <Settings className="w-3 h-3" />
            {showAdvanced ? '隐藏模型配置' : '配置 API (必填)'}
          </button>
        </div>

        {/* API Settings */}
        {showAdvanced && (
          <div className="bg-indigo-dye/5 p-4 rounded-sm border border-indigo-dye/10 text-left animate-fade-in space-y-4">

            {/* Model Provider Presets */}
            <div>
              <label className="block text-xs font-bold text-indigo-dye/50 mb-2">选择模型提供商</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    modelName: 'qwen-max',
                    apiBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
                  })}
                  className={`py-2 px-3 text-xs font-bold rounded-sm border transition-all ${formData.apiBaseUrl.includes('dashscope')
                    ? 'bg-indigo-dye text-white border-indigo-dye'
                    : 'bg-white/50 text-indigo-dye/70 border-indigo-dye/20 hover:border-indigo-dye/50'
                    }`}
                >
                  🌙 通义千问 (Qwen)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    modelName: 'deepseek-chat',
                    apiBaseUrl: 'https://api.deepseek.com/v1'
                  })}
                  className={`py-2 px-3 text-xs font-bold rounded-sm border transition-all ${formData.apiBaseUrl.includes('deepseek')
                    ? 'bg-indigo-dye text-white border-indigo-dye'
                    : 'bg-white/50 text-indigo-dye/70 border-indigo-dye/20 hover:border-indigo-dye/50'
                    }`}
                >
                  🐋 DeepSeek
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    modelName: 'claude-sonnet-4-20250514',
                    apiBaseUrl: 'https://api.anthropic.com/v1'
                  })}
                  className={`py-2 px-3 text-xs font-bold rounded-sm border transition-all ${formData.apiBaseUrl.includes('anthropic')
                    ? 'bg-cinnabar text-white border-cinnabar'
                    : 'bg-white/50 text-indigo-dye/70 border-indigo-dye/20 hover:border-indigo-dye/50'
                    }`}
                >
                  🧠 Claude (Anthropic)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    modelName: 'gpt-4o',
                    apiBaseUrl: 'https://api.openai.com/v1'
                  })}
                  className={`py-2 px-3 text-xs font-bold rounded-sm border transition-all ${formData.apiBaseUrl.includes('openai.com')
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white/50 text-indigo-dye/70 border-indigo-dye/20 hover:border-indigo-dye/50'
                    }`}
                >
                  💚 OpenAI (GPT-4)
                </button>
              </div>
              <p className="text-xs text-indigo-dye/40 mt-2 text-center">点击选择后自动填充 Base URL 和模型名</p>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-xs font-bold text-indigo-dye/50 mb-1">API Key</label>
              <input
                type="password"
                name="apiKey"
                value={formData.apiKey}
                onChange={handleChange}
                placeholder="sk-... 或对应平台的 API Key"
                className={`chinese-input text-xs font-mono py-1 ${formErrors.apiKey ? 'border-red-500' : ''}`}
              />
              {formErrors.apiKey && <p className="text-xs text-red-500 mt-1">{formErrors.apiKey}</p>}
            </div>

            {/* Advanced: Base URL & Model Name */}
            <details className="group">
              <summary className="text-xs text-indigo-dye/40 cursor-pointer hover:text-indigo-dye transition-colors">
                ⚙️ 高级设置（自定义 URL 和模型）
              </summary>
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-indigo-dye/10">
                <div>
                  <label className="block text-xs font-bold text-indigo-dye/50 mb-1">Base URL</label>
                  <input
                    type="text"
                    name="apiBaseUrl"
                    value={formData.apiBaseUrl}
                    onChange={handleChange}
                    className="chinese-input text-xs font-mono py-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-indigo-dye/50 mb-1">Model Name</label>
                  <input
                    type="text"
                    name="modelName"
                    value={formData.modelName}
                    onChange={handleChange}
                    className="chinese-input text-xs font-mono py-1"
                  />
                </div>
              </div>
            </details>

          </div>
        )}

        {formErrors.calculation && (
          <div className="text-center text-cinnabar text-sm font-bold animate-pulse">
            {formErrors.calculation}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="seal-button w-full flex justify-center items-center gap-2 disabled:opacity-70 disabled:grayscale mt-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              <span>大师推演中...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              <span>生成人生K线</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default BaziForm;
