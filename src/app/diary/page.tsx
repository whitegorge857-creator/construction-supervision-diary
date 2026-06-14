'use client';

import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { 
  Project, 
  ProcessDrivenDiary, 
  ConstructionModule,
  ENGINEERING_CATEGORIES,
  SPECIALTY_ENGINEERINGS,
  PROCESS_TEMPLATES,
  EngineeringCategory
} from '@/types';
import {
  BoredPileModuleData,
  BORED_PILE_OPTIONS,
  initBoredPileData,
  getDisplayValue,
  getWeatherDescription
} from '@/types/bored-pile';
import { fetchHistoricalWeatherData, exportFinalDiaryToWord } from '@/utils/processDiaryGenerator';

export default function DiaryPage() {
  const [diaries, setDiaries] = useState<ProcessDrivenDiary[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // 日记基本信息
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
  const [date, setDate] = useState('');
  const [manualWeather, setManualWeather] = useState('');
  const [manualTemperatureMax, setManualTemperatureMax] = useState('');
  const [manualTemperatureMin, setManualTemperatureMin] = useState('');
  const [manualPrecipitation, setManualPrecipitation] = useState('');
  const [author, setAuthor] = useState('');
  
  // 自动天气数据
  const [weatherData, setWeatherData] = useState<{
    weathercode: number;
    temperature_2m_max: number;
    temperature_2m_min: number;
    precipitation_sum: number;
  } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(false);
  const [isManualWeather, setIsManualWeather] = useState(false);
  
  // 施工模块
  const [modules, setModules] = useState<ConstructionModule[]>([]);
  const [isAddingModule, setIsAddingModule] = useState(false);
  
  // 三步选择流程
  const [selectedCategory, setSelectedCategory] = useState<EngineeringCategory | ''>('');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  
  // 钻孔灌注桩专用数据
  const [boredPileData, setBoredPileData] = useState<BoredPileModuleData | null>(null);
  
  // 通用工序模板数据
  const [genericTemplateData, setGenericTemplateData] = useState<Record<string, any>>({});
  
  // AI生成相关
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [aiContent, setAiContent] = useState('');
  const [finalContent, setFinalContent] = useState('');
  const [showEditArea, setShowEditArea] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(0);
  
  // 获取历史天气数据
  const loadHistoricalWeather = useCallback(async (targetDate: string) => {
    if (!targetDate) return;
    setWeatherLoading(true);
    setWeatherError(false);
    setIsManualWeather(false);
    try {
      const data = await fetchHistoricalWeatherData(targetDate);
      if (data) {
        setWeatherData(data);
      } else {
        setWeatherError(true);
        setIsManualWeather(true);
      }
    } catch (error) {
      console.error('Failed to load historical weather:', error);
      setWeatherError(true);
      setIsManualWeather(true);
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  // 日期变化时获取天气
  useEffect(() => {
    if (date) {
      loadHistoricalWeather(date);
    }
  }, [date, loadHistoricalWeather]);

  useEffect(() => {
    fetchDiaries();
    fetchProjects();
    const cached = localStorage.getItem('sup_diaries');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDiaries(prev => {
            const ids = new Set(prev.map(d => d.id));
            const newD = parsed.filter(d => !ids.has(d.id));
            return newD.length ? [...prev, ...newD] : prev;
          });
        }
      } catch {}
    }
  }, []);

  const fetchDiaries = async () => {
    const res = await fetch('/api/diaries');
    const data = await res.json();
    setDiaries(data);
  };

  const fetchProjects = async () => {
    const res = await fetch('/api/projects');
    const data = await res.json();
    setProjects(data);
  };

  // 获取可选专业工程
  const getAvailableSpecialties = () => {
    if (!selectedCategory) return [];
    return SPECIALTY_ENGINEERINGS.filter(s => s.category === selectedCategory);
  };

  // 获取可选工序
  const getAvailableTemplates = () => {
    if (!selectedSpecialtyId) return [];
    return PROCESS_TEMPLATES.filter(t => t.specialtyId === selectedSpecialtyId);
  };

  // 重置添加模块流程
  const resetAddModule = () => {
    setSelectedCategory('');
    setSelectedSpecialtyId('');
    setSelectedTemplateId('');
    setBoredPileData(null);
    setGenericTemplateData({});
    setIsAddingModule(false);
  };

  // 开始添加模块
  const startAddModule = () => {
    setIsAddingModule(true);
  };

  // 选择钻孔灌注桩模板时初始化数据
  useEffect(() => {
    if (selectedTemplateId === 'bored-pile' && !boredPileData) {
      setBoredPileData(initBoredPileData(date));
    } else if (selectedTemplateId && selectedTemplateId !== 'bored-pile') {
      const template = PROCESS_TEMPLATES.find(t => t.id === selectedTemplateId);
      if (template) {
        const initialData: Record<string, any> = {};
        template.fields.forEach(field => {
          if (!field.id.startsWith('_')) {
            initialData[field.id] = '';
          }
        });
        setGenericTemplateData(initialData);
      }
    }
  }, [selectedTemplateId, date]);

  // 更新钻孔灌注桩基本信息
  const updateBoredPileBasicInfo = (fieldId: string, value: string) => {
    if (!boredPileData) return;
    setBoredPileData(prev => ({
      ...prev!,
      basicInfo: {
        ...prev!.basicInfo,
        [fieldId]: value
      }
    }));
  };

  // 更新钻孔灌注桩成孔施工
  const updateBoredPileHoleDrilling = (fieldId: string, value: string) => {
    if (!boredPileData) return;
    setBoredPileData(prev => ({
      ...prev!,
      holeDrilling: {
        ...prev!.holeDrilling,
        [fieldId]: value
      }
    }));
  };

  // 更新钻孔灌注桩钢筋笼加工
  const updateBoredPileRebarProcessing = (fieldId: string, value: string | string[]) => {
    if (!boredPileData) return;
    setBoredPileData(prev => ({
      ...prev!,
      rebarProcessing: {
        ...prev!.rebarProcessing,
        [fieldId]: value
      }
    }));
  };

  // 更新钻孔灌注桩钢筋笼安装
  const updateBoredPileRebarInstallation = (fieldId: string, value: string | string[]) => {
    if (!boredPileData) return;
    setBoredPileData(prev => ({
      ...prev!,
      rebarInstallation: {
        ...prev!.rebarInstallation,
        [fieldId]: value
      }
    }));
  };

  // 更新钻孔灌注桩混凝土灌注
  const updateBoredPileConcretePouring = (fieldId: string, value: string) => {
    if (!boredPileData) return;
    setBoredPileData(prev => ({
      ...prev!,
      concretePouring: {
        ...prev!.concretePouring,
        [fieldId]: value
      }
    }));
  };

  // 更新钻孔灌注桩安全与监理行为
  const updateBoredPileSafetySupervision = (fieldId: string, value: string) => {
    if (!boredPileData) return;
    setBoredPileData(prev => ({
      ...prev!,
      safetySupervision: {
        ...prev!.safetySupervision,
        [fieldId]: value
      }
    }));
  };

  // 确认添加模块
  const confirmAddModule = () => {
    if (selectedTemplateId === 'bored-pile' && boredPileData) {
      const newModule: ConstructionModule = {
        id: Date.now().toString(),
        templateId: 'bored-pile',
        category: 'civil',
        specialtyId: 'pile',
        templateName: '钻孔灌注桩',
        fieldValues: {
          _is_structured: 'true',
          _boredPileData: boredPileData
        }
      };
      setModules(prev => [...prev, newModule]);
    } else if (selectedTemplateId) {
      const template = PROCESS_TEMPLATES.find(t => t.id === selectedTemplateId);
      if (template) {
        const newModule: ConstructionModule = {
          id: Date.now().toString(),
          templateId: selectedTemplateId,
          category: template.category,
          specialtyId: template.specialtyId,
          templateName: template.name,
          fieldValues: genericTemplateData
        };
        setModules(prev => [...prev, newModule]);
      }
    }
    resetAddModule();
  };

  // 删除模块
  const removeModule = (moduleId: string) => {
    setModules(prev => prev.filter(m => m.id !== moduleId));
  };

  // 生成监理日记
  const generateDiary = async () => {
    if (modules.length === 0) {
      setGenerateError('请先添加至少一个施工模块');
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const selectedProject = projects.find(p => p.id === selectedProjectId);
      const weatherPayload = !isManualWeather && weatherData ? {
        weathercode: weatherData.weathercode,
        temperature_2m_max: weatherData.temperature_2m_max,
        temperature_2m_min: weatherData.temperature_2m_min,
        precipitation_sum: weatherData.precipitation_sum
      } : null;

      const response = await fetch('/api/generate-diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modules,
          weatherData: weatherPayload,
          date,
          projectName: selectedProject?.name,
          author
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || '生成失败');
      }

      setAiContent(result.content);
      setFinalContent(result.content);
      setShowEditArea(true);

    } catch (error) {
      console.error('Generate diary error:', error);
      setGenerateError(error instanceof Error ? error.message : '生成过程出错');
    } finally {
      setIsGenerating(false);
    }
  };

  const syncLocal = (d: any) => {
    try {
      const raw = localStorage.getItem('sup_diaries');
      const list: any[] = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex((x: any) => x.id === d.id);
      if (idx >= 0) list[idx] = d; else list.unshift(d);
      localStorage.setItem('sup_diaries', JSON.stringify(list));
    } catch {}
  };

  // 保存日记
  const handleSave = async () => {
    if (!selectedProjectId) return;

    let finalWeather = '';
    let weathercode: number | undefined = undefined;
    let temperature_2m_max: number | undefined = undefined;
    let temperature_2m_min: number | undefined = undefined;
    let precipitation_sum: number | undefined = undefined;
    let isAutoWeather = false;

    if (!isManualWeather && weatherData) {
      finalWeather = getWeatherDescription(weatherData.weathercode, weatherData.precipitation_sum);
      weathercode = weatherData.weathercode;
      temperature_2m_max = weatherData.temperature_2m_max;
      temperature_2m_min = weatherData.temperature_2m_min;
      precipitation_sum = weatherData.precipitation_sum;
      isAutoWeather = true;
    } else {
      finalWeather = manualWeather || '';
      if (manualTemperatureMax) {
        temperature_2m_max = parseFloat(manualTemperatureMax);
      }
      if (manualTemperatureMin) {
        temperature_2m_min = parseFloat(manualTemperatureMin);
      }
      if (manualPrecipitation) {
        precipitation_sum = parseFloat(manualPrecipitation);
      }
      isAutoWeather = false;
    }

    const saveMethod = editId ? 'PUT' : 'POST';
    await fetch('/api/diaries', {
      method: saveMethod,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editId || undefined,
        projectId: selectedProjectId,
        date,
        weather: finalWeather,
        weathercode,
        temperature_2m_max,
        temperature_2m_min,
        precipitation_sum,
        isAutoWeather,
        author,
        modules,
        aiGeneratedContent: aiContent,
        finalContent: finalContent
      })
    });

    // 重置表单
    setSelectedProjectId('');
    setDate('');
    setManualWeather('');
    setManualTemperatureMax('');
    setManualTemperatureMin('');
    setManualPrecipitation('');
    setWeatherData(null);
    setIsManualWeather(false);
    setAuthor('');
    setModules([]);
    setAiContent('');
    setFinalContent('');
    setShowEditArea(false);
    setIsEditing(false);
    setEditId(0);
    fetchDiaries();
  };

  // 查看已保存的日记
  const viewDiary = (diary: ProcessDrivenDiary, edit: boolean = false) => {
    const project = projects.find(p => p.id === diary.projectId);
    if (!project) return;
    setAiContent(diary.aiGeneratedContent || '');
    setFinalContent(diary.finalContent || '');
    setShowEditArea(true);
    setSelectedProjectId(diary.projectId);
    setDate(diary.date);
    setAuthor(diary.author);
    setModules(diary.modules || []);
    setIsEditing(edit);
    setEditId(edit ? diary.id : 0);
    if (diary.isAutoWeather && diary.weathercode !== undefined) {
      setWeatherData({
        weathercode: diary.weathercode,
        temperature_2m_max: diary.temperature_2m_max || 0,
        temperature_2m_min: diary.temperature_2m_min || 0,
        precipitation_sum: diary.precipitation_sum || 0,
      });
      setIsManualWeather(false);
    } else {
      setIsManualWeather(true);
      setManualWeather(diary.weather || '');
    }
  };

  // 导出Word
  const handleExportWord = async () => {
    if (!finalContent) return;
    
    const selectedProject = projects.find(p => p.id === selectedProjectId);
    if (!selectedProject) return;

    const currentWeather = !isManualWeather && weatherData 
      ? getWeatherDescription(weatherData.weathercode, weatherData.precipitation_sum)
      : manualWeather;

    const currentWeatherData = !isManualWeather && weatherData 
      ? weatherData
      : (manualTemperatureMax && manualTemperatureMin 
        ? { weathercode: 0, temperature_2m_max: parseFloat(manualTemperatureMax), temperature_2m_min: parseFloat(manualTemperatureMin), precipitation_sum: manualPrecipitation ? parseFloat(manualPrecipitation) : 0 }
        : undefined);

    await exportFinalDiaryToWord(
      selectedProject.name,
      date,
      currentWeather,
      author,
      finalContent,
      currentWeatherData
    );
  };

  // 渲染单选选项
  const renderRadioOptions = (options: { value: string; label: string }[], value: string, onChange: (val: string) => void, fieldLabel: string) => (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">{fieldLabel}</label>
      <div className="flex flex-wrap gap-3">
        {options.map(opt => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={fieldLabel}
              value={opt.value}
              checked={value === opt.value}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  // 渲染多选选项
  const renderCheckboxOptions = (options: { value: string; label: string }[], value: string[], onChange: (val: string[]) => void, fieldLabel: string) => (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">{fieldLabel}</label>
      <div className="flex flex-wrap gap-3">
        {options.map(opt => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value.includes(opt.value)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange([...value, opt.value]);
                } else {
                  onChange(value.filter(v => v !== opt.value));
                }
              }}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  // 渲染文本输入
  const renderTextInput = (value: string, onChange: (val: string) => void, fieldLabel: string, placeholder = '') => (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">{fieldLabel}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  // 渲染文本区域
  const renderTextareaInput = (value: string, onChange: (val: string) => void, fieldLabel: string, placeholder = '') => (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">{fieldLabel}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  // 渲染选择框
  const renderSelectInput = (options: { value: string; label: string }[], value: string, onChange: (val: string) => void, fieldLabel: string) => (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">{fieldLabel}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">请选择</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  // 获取模块展示信息
  const getModuleDisplayText = (module: ConstructionModule): string => {
    if (module.templateId === 'bored-pile' && module.fieldValues?._boredPileData) {
      const data = module.fieldValues._boredPileData;
      const pileNumber = getDisplayValue(data.basicInfo.pileNumber) || '未编号';
      return `${module.templateName} ${pileNumber}`;
    }
    return module.templateName;
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">工序驱动监理日记系统</h1>

        {/* 新增日记表单 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">新增监理日记</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">项目</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">请选择项目</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            {/* 天气信息 - 历史天气 */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                天气
                <button
                  type="button"
                  onClick={() => loadHistoricalWeather(date)}
                  className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  刷新
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsManualWeather(!isManualWeather);
                  }}
                  className="ml-2 text-xs text-gray-600 hover:text-gray-800"
                >
                  {isManualWeather ? '使用自动天气' : '手动输入'}
                </button>
              </label>
              
              {weatherLoading && (
                <div className="text-sm text-gray-500 py-2">获取历史天气数据中...</div>
              )}
              
              {!isManualWeather && weatherData && !weatherLoading && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-2">
                  <div className="text-sm font-medium text-green-800">历史天气数据</div>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    <div className="text-sm">
                      <span className="text-gray-600">天气：</span>
                      <span className="font-medium">{getWeatherDescription(weatherData.weathercode, weatherData.precipitation_sum)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">最高温：</span>
                      <span className="font-medium">{weatherData.temperature_2m_max}℃</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">最低温：</span>
                      <span className="font-medium">{weatherData.temperature_2m_min}℃</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">降水量：</span>
                      <span className="font-medium">{weatherData.precipitation_sum}mm</span>
                    </div>
                  </div>
                </div>
              )}
              
              {(isManualWeather || weatherError) && (
                <div className="space-y-2">
                  {weatherError && !isManualWeather && (
                    <div className="text-sm text-red-600 mb-2">无法获取历史天气，请手动输入</div>
                  )}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">天气状况</label>
                    <input
                      type="text"
                      value={manualWeather}
                      onChange={(e) => setManualWeather(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例如：晴、多云、小雨"
                      required={isManualWeather}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">最高温度 (℃)</label>
                      <input
                        type="number"
                        value={manualTemperatureMax}
                        onChange={(e) => setManualTemperatureMax(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">最低温度 (℃)</label>
                      <input
                        type="number"
                        value={manualTemperatureMin}
                        onChange={(e) => setManualTemperatureMin(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="25"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">降水量 (mm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={manualPrecipitation}
                        onChange={(e) => setManualPrecipitation(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">监理人员</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* 施工模块 */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-medium">施工模块 ({modules.length})</h3>
              {!isAddingModule && (
                <button
                  type="button"
                  onClick={startAddModule}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  + 添加施工模块
                </button>
              )}
            </div>

            {/* 已添加的模块列表 */}
            {modules.length > 0 && (
              <div className="mb-4 space-y-2">
                {modules.map((module, index) => (
                  <div key={module.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mr-2">
                        模块{index + 1}
                      </span>
                      <span className="font-medium">{getModuleDisplayText(module)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeModule(module.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 添加模块流程 */}
            {isAddingModule && (
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-blue-800">添加工序模块</h4>
                  <button
                    type="button"
                    onClick={resetAddModule}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    取消
                  </button>
                </div>

                {/* Step 1: 工程大类 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Step 1: 选择工程大类
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {ENGINEERING_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-md border transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: 专业工程 */}
                {selectedCategory && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Step 2: 选择专业工程
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {getAvailableSpecialties().map(spec => (
                        <button
                          key={spec.id}
                          type="button"
                          onClick={() => setSelectedSpecialtyId(spec.id)}
                          className={`px-4 py-2 rounded-md border transition-colors ${
                            selectedSpecialtyId === spec.id
                              ? 'bg-green-600 text-white border-green-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {spec.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: 具体工序 */}
                {selectedSpecialtyId && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Step 3: 选择具体工序
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {getAvailableTemplates().map(tpl => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => setSelectedTemplateId(tpl.id)}
                          className={`px-4 py-2 rounded-md border transition-colors ${
                            selectedTemplateId === tpl.id
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                          }`}
                        >
                          {tpl.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 钻孔灌注桩结构化表单 */}
                {selectedTemplateId === 'bored-pile' && boredPileData && (
                  <div className="bg-white rounded-lg border p-4 space-y-6 max-h-[60vh] overflow-y-auto">
                    <h5 className="font-medium text-lg">钻孔灌注桩 - 施工记录</h5>
                    
                    {/* 一、基本信息（桩级） */}
                    <div className="border-t pt-4">
                      <h6 className="font-medium text-gray-800 mb-3">一、基本信息（桩级）</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {renderTextInput(boredPileData.basicInfo.pileNumber, (v) => updateBoredPileBasicInfo('pileNumber', v), '桩号', '1#')}
                        <div className="md:col-span-2">
                          {renderRadioOptions(BORED_PILE_OPTIONS.pileDiameter, boredPileData.basicInfo.pileDiameter, (v) => updateBoredPileBasicInfo('pileDiameter', v), '桩径')}
                          {boredPileData.basicInfo.pileDiameter === 'other' && (
                            <input
                              type="text"
                              value={boredPileData.basicInfo.pileDiameterOther || ''}
                              onChange={(e) => updateBoredPileBasicInfo('pileDiameterOther', e.target.value)}
                              placeholder="请输入桩径"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                            />
                          )}
                        </div>
                        {renderTextInput(boredPileData.basicInfo.designPileLength, (v) => updateBoredPileBasicInfo('designPileLength', v), '设计桩长(m)')}
                        {renderTextInput(boredPileData.basicInfo.designElevation, (v) => updateBoredPileBasicInfo('designElevation', v), '桩顶标高')}
                        {renderTextInput(boredPileData.basicInfo.constructionDate, (v) => updateBoredPileBasicInfo('constructionDate', v), '施工日期')}
                      </div>
                    </div>

                    {/* 二、成孔施工 */}
                    <div className="border-t pt-4">
                      <h6 className="font-medium text-gray-800 mb-3">二、成孔施工</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {renderTextInput(boredPileData.holeDrilling.startDrillingTime, (v) => updateBoredPileHoleDrilling('startDrillingTime', v), '开钻时间', '08:30')}
                        {renderTextInput(boredPileData.holeDrilling.endDrillingTime, (v) => updateBoredPileHoleDrilling('endDrillingTime', v), '终孔时间', '14:20')}
                        <div className="lg:col-span-2">
                          {renderRadioOptions(BORED_PILE_OPTIONS.drillingProcess, boredPileData.holeDrilling.drillingProcess, (v) => updateBoredPileHoleDrilling('drillingProcess', v), '成孔工艺（选填）')}
                          {boredPileData.holeDrilling.drillingProcess === 'other' && (
                            <input
                              type="text"
                              value={boredPileData.holeDrilling.drillingProcessOther || ''}
                              onChange={(e) => updateBoredPileHoleDrilling('drillingProcessOther', e.target.value)}
                              placeholder="请输入成孔工艺"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                            />
                          )}
                        </div>
                        {renderTextInput(boredPileData.holeDrilling.actualHoleDepth, (v) => updateBoredPileHoleDrilling('actualHoleDepth', v), '实际孔深(m)')}
                        {renderTextInput(boredPileData.holeDrilling.sedimentThickness, (v) => updateBoredPileHoleDrilling('sedimentThickness', v), '沉渣厚度(mm)')}
                        <div>
                          {renderRadioOptions(BORED_PILE_OPTIONS.holeAcceptance, boredPileData.holeDrilling.holeAcceptance, (v) => updateBoredPileHoleDrilling('holeAcceptance', v), '成孔验收')}
                          {boredPileData.holeDrilling.holeAcceptance === 'other' && (
                            <input
                              type="text"
                              value={boredPileData.holeDrilling.holeAcceptanceOther || ''}
                              onChange={(e) => updateBoredPileHoleDrilling('holeAcceptanceOther', e.target.value)}
                              placeholder="请输入验收结果"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 三、钢筋笼加工（整体） */}
                    <div className="border-t pt-4">
                      <h6 className="font-medium text-gray-800 mb-3">三、钢筋笼加工（整体）</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                          {renderRadioOptions(BORED_PILE_OPTIONS.mainRebarSpec, boredPileData.rebarProcessing.mainRebarSpec, (v) => updateBoredPileRebarProcessing('mainRebarSpec', v), '主筋规格')}
                          {boredPileData.rebarProcessing.mainRebarSpec === 'other' && (
                            <input
                              type="text"
                              value={boredPileData.rebarProcessing.mainRebarSpecOther || ''}
                              onChange={(e) => updateBoredPileRebarProcessing('mainRebarSpecOther', e.target.value)}
                              placeholder="请输入主筋规格"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                            />
                          )}
                        </div>
                        <div>
                          {renderRadioOptions(BORED_PILE_OPTIONS.spiralSpacing, boredPileData.rebarProcessing.spiralSpacing, (v) => updateBoredPileRebarProcessing('spiralSpacing', v), '螺旋筋间距')}
                          {boredPileData.rebarProcessing.spiralSpacing === 'other' && (
                            <input
                              type="text"
                              value={boredPileData.rebarProcessing.spiralSpacingOther || ''}
                              onChange={(e) => updateBoredPileRebarProcessing('spiralSpacingOther', e.target.value)}
                              placeholder="请输入螺旋筋间距"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                            />
                          )}
                        </div>
                        <div>
                          {renderRadioOptions(BORED_PILE_OPTIONS.encryptedSpacing, boredPileData.rebarProcessing.encryptedSpacing, (v) => updateBoredPileRebarProcessing('encryptedSpacing', v), '加密区间距')}
                          {boredPileData.rebarProcessing.encryptedSpacing === 'other' && (
                            <input
                              type="text"
                              value={boredPileData.rebarProcessing.encryptedSpacingOther || ''}
                              onChange={(e) => updateBoredPileRebarProcessing('encryptedSpacingOther', e.target.value)}
                              placeholder="请输入加密区间距"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                            />
                          )}
                        </div>
                        <div>
                          {renderRadioOptions(BORED_PILE_OPTIONS.stirrupSpacing, boredPileData.rebarProcessing.stirrupSpacing, (v) => updateBoredPileRebarProcessing('stirrupSpacing', v), '加强箍间距')}
                          {boredPileData.rebarProcessing.stirrupSpacing === 'other' && (
                            <input
                              type="text"
                              value={boredPileData.rebarProcessing.stirrupSpacingOther || ''}
                              onChange={(e) => updateBoredPileRebarProcessing('stirrupSpacingOther', e.target.value)}
                              placeholder="请输入加强箍间距"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                            />
                          )}
                        </div>
                        <div className="lg:col-span-3">
                          {renderCheckboxOptions(BORED_PILE_OPTIONS.processingQualityProblems, boredPileData.rebarProcessing.processingQualityProblems || [], (v) => updateBoredPileRebarProcessing('processingQualityProblems', v), '加工质量问题（多选）')}
                          {boredPileData.rebarProcessing.processingQualityProblems?.includes('other') && (
                            <input
                              type="text"
                              value={boredPileData.rebarProcessing.processingQualityProblemsOther || ''}
                              onChange={(e) => updateBoredPileRebarProcessing('processingQualityProblemsOther', e.target.value)}
                              placeholder="请输入其他质量问题"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 四、钢筋笼安装（整体控制） */}
                    <div className="border-t pt-4">
                      <h6 className="font-medium text-gray-800 mb-3">四、钢筋笼安装（整体控制）</h6>
                      <div className="bg-gray-50 p-3 rounded-md mb-3">
                                              </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          {renderRadioOptions(BORED_PILE_OPTIONS.cageSections, boredPileData.rebarInstallation.cageSections, (v) => updateBoredPileRebarInstallation('cageSections', v), '钢筋笼节数')}
                          {boredPileData.rebarInstallation.cageSections === 'other' && (
                            <input
                              type="text"
                              value={boredPileData.rebarInstallation.cageSectionsOther || ''}
                              onChange={(e) => updateBoredPileRebarInstallation('cageSectionsOther', e.target.value)}
                              placeholder="请输入节数"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                            />
                          )}
                        </div>
                        <div className="lg:col-span-2">
                          {renderRadioOptions(BORED_PILE_OPTIONS.connectionMethod, boredPileData.rebarInstallation.connectionMethod, (v) => updateBoredPileRebarInstallation('connectionMethod', v), '连接方式')}
                          {boredPileData.rebarInstallation.connectionMethod === 'other' && (
                            <input
                              type="text"
                              value={boredPileData.rebarInstallation.connectionMethodOther || ''}
                              onChange={(e) => updateBoredPileRebarInstallation('connectionMethodOther', e.target.value)}
                              placeholder="请输入连接方式"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                            />
                          )}
                        </div>
                        <div>
                          {renderRadioOptions(BORED_PILE_OPTIONS.weldLength, boredPileData.rebarInstallation.weldLength, (v) => updateBoredPileRebarInstallation('weldLength', v), '焊缝长度')}
                          {boredPileData.rebarInstallation.weldLength === 'other' && (
                            <input
                              type="text"
                              value={boredPileData.rebarInstallation.weldLengthOther || ''}
                              onChange={(e) => updateBoredPileRebarInstallation('weldLengthOther', e.target.value)}
                              placeholder="请输入焊缝长度"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                            />
                          )}
                        </div>
                        <div className="lg:col-span-2">
                          {renderCheckboxOptions(BORED_PILE_OPTIONS.installationQualityProblems, boredPileData.rebarInstallation.installationQualityProblems || [], (v) => updateBoredPileRebarInstallation('installationQualityProblems', v), '安装质量问题（多选）')}
                          {boredPileData.rebarInstallation.installationQualityProblems?.includes('other') && (
                            <input
                              type="text"
                              value={boredPileData.rebarInstallation.installationQualityProblemsOther || ''}
                              onChange={(e) => updateBoredPileRebarInstallation('installationQualityProblemsOther', e.target.value)}
                              placeholder="请输入其他质量问题"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                            />
                          )}
                        </div>
                        <div>
                          {renderRadioOptions(BORED_PILE_OPTIONS.installationAcceptance, boredPileData.rebarInstallation.installationAcceptance, (v) => updateBoredPileRebarInstallation('installationAcceptance', v), '安装验收')}
                          {boredPileData.rebarInstallation.installationAcceptance === 'other' && (
                            <input
                              type="text"
                              value={boredPileData.rebarInstallation.installationAcceptanceOther || ''}
                              onChange={(e) => updateBoredPileRebarInstallation('installationAcceptanceOther', e.target.value)}
                              placeholder="请输入验收结果"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 五、混凝土灌注 */}
                    <div className="border-t pt-4">
                      <h6 className="font-medium text-gray-800 mb-3">五、混凝土灌注</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          {renderRadioOptions(BORED_PILE_OPTIONS.concreteStrength, boredPileData.concretePouring.concreteStrength, (v) => updateBoredPileConcretePouring('concreteStrength', v), '混凝土强度等级')}
                          {boredPileData.concretePouring.concreteStrength === 'other' && (
                            <input
                              type="text"
                              value={boredPileData.concretePouring.concreteStrengthOther || ''}
                              onChange={(e) => updateBoredPileConcretePouring('concreteStrengthOther', e.target.value)}
                              placeholder="请输入混凝土强度等级"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                            />
                          )}
                        </div>
                        {renderTextInput(boredPileData.concretePouring.startPouringTime, (v) => updateBoredPileConcretePouring('startPouringTime', v), '开始灌注时间', '15:00')}
                        {renderTextInput(boredPileData.concretePouring.endPouringTime, (v) => updateBoredPileConcretePouring('endPouringTime', v), '结束灌注时间', '18:30')}
                        {renderTextInput(boredPileData.concretePouring.actualVolume, (v) => updateBoredPileConcretePouring('actualVolume', v), '实际灌注量(m³)')}
                        <div>
                          {renderRadioOptions(BORED_PILE_OPTIONS.pouringProcess, boredPileData.concretePouring.pouringProcess, (v) => updateBoredPileConcretePouring('pouringProcess', v), '灌注过程')}
                          {boredPileData.concretePouring.pouringProcess === 'other' && (
                            <input
                              type="text"
                              value={boredPileData.concretePouring.pouringProcessOther || ''}
                              onChange={(e) => updateBoredPileConcretePouring('pouringProcessOther', e.target.value)}
                              placeholder="请输入灌注过程"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                            />
                          )}
                        </div>
                        <div>
                          {renderRadioOptions(BORED_PILE_OPTIONS.pipeDepthControl, boredPileData.concretePouring.pipeDepthControl, (v) => updateBoredPileConcretePouring('pipeDepthControl', v), '导管埋深控制')}
                          {boredPileData.concretePouring.pipeDepthControl === 'other' && (
                            <input
                              type="text"
                              value={boredPileData.concretePouring.pipeDepthControlOther || ''}
                              onChange={(e) => updateBoredPileConcretePouring('pipeDepthControlOther', e.target.value)}
                              placeholder="请输入导管埋深控制情况"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                            />
                          )}
                        </div>
                        <div>
                          {renderRadioOptions(BORED_PILE_OPTIONS.testBlockRetained, boredPileData.concretePouring.testBlockRetained, (v) => updateBoredPileConcretePouring('testBlockRetained', v), '试块留置')}
                          {boredPileData.concretePouring.testBlockRetained === 'other' && (
                            <input
                              type="text"
                              value={boredPileData.concretePouring.testBlockRetainedOther || ''}
                              onChange={(e) => updateBoredPileConcretePouring('testBlockRetainedOther', e.target.value)}
                              placeholder="请输入试块留置情况"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                            />
                          )}
                        </div>
                        <div>
                          {renderRadioOptions(BORED_PILE_OPTIONS.pouringAcceptance, boredPileData.concretePouring.pouringAcceptance, (v) => updateBoredPileConcretePouring('pouringAcceptance', v), '灌注验收')}
                          {boredPileData.concretePouring.pouringAcceptance === 'other' && (
                            <input
                              type="text"
                              value={boredPileData.concretePouring.pouringAcceptanceOther || ''}
                              onChange={(e) => updateBoredPileConcretePouring('pouringAcceptanceOther', e.target.value)}
                              placeholder="请输入验收结果"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 六、安全与监理行为 */}
                    <div className="border-t pt-4">
                      <h6 className="font-medium text-gray-800 mb-3">六、安全与监理行为</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          {renderRadioOptions(BORED_PILE_OPTIONS.safetyStatus, boredPileData.safetySupervision.safetyStatus, (v) => updateBoredPileSafetySupervision('safetyStatus', v), '现场安全情况')}
                          {boredPileData.safetySupervision.safetyStatus === 'other' && (
                            <input
                              type="text"
                              value={boredPileData.safetySupervision.safetyStatusOther || ''}
                              onChange={(e) => updateBoredPileSafetySupervision('safetyStatusOther', e.target.value)}
                              placeholder="请输入安全情况"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                            />
                          )}
                        </div>
                        {renderRadioOptions(BORED_PILE_OPTIONS.旁站Supervision, boredPileData.safetySupervision.旁站Supervision, (v) => updateBoredPileSafetySupervision('旁站Supervision', v), '旁站监理')}
                        {renderRadioOptions(BORED_PILE_OPTIONS.inspectionCheck, boredPileData.safetySupervision.inspectionCheck, (v) => updateBoredPileSafetySupervision('inspectionCheck', v), '验收检查')}
                      </div>
                    </div>
                  </div>
                )}

                {/* 通用模板表单 */}
                {selectedTemplateId && selectedTemplateId !== 'bored-pile' && (
                  <div className="bg-white rounded-lg border p-4 space-y-4">
                    <h5 className="font-medium text-lg">
                      {PROCESS_TEMPLATES.find(t => t.id === selectedTemplateId)?.name} - 施工记录
                    </h5>
                    {(() => {
                      const template = PROCESS_TEMPLATES.find(t => t.id === selectedTemplateId);
                      if (!template) return null;
                      
                      return template.fields.filter(field => !field.id.startsWith('_')).map(field => {
                        if (field.type === 'textarea') {
                          return renderTextareaInput(
                            genericTemplateData[field.id] || '',
                            (v) => setGenericTemplateData({...genericTemplateData, [field.id]: v}),
                            field.name,
                            field.placeholder
                          );
                        } else if (field.type === 'select' && field.options) {
                          return renderSelectInput(
                            field.options,
                            genericTemplateData[field.id] || '',
                            (v) => setGenericTemplateData({...genericTemplateData, [field.id]: v}),
                            field.name
                          );
                        } else {
                          return renderTextInput(
                            genericTemplateData[field.id] || '',
                            (v) => setGenericTemplateData({...genericTemplateData, [field.id]: v}),
                            field.name,
                            field.placeholder
                          );
                        }
                      });
                    })()}
                  </div>
                )}

                {selectedTemplateId && (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={confirmAddModule}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      确认添加此模块
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 生成监理日记按钮 */}
          {modules.length > 0 && (
            <div className="border-t pt-6 mt-6">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={generateDiary}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isGenerating ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      AI生成中...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      生成监理日记
                    </span>
                  )}
                </button>
                
                {generateError && (
                  <div className="text-red-600 text-sm">
                    {generateError}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 监理日记编辑区 */}
          {showEditArea && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">监理日记编辑区</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  编辑日记内容
                </label>
                <textarea
                  value={finalContent}
                  onChange={(e) => setFinalContent(e.target.value)}
                  className="w-full h-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="AI生成的内容将显示在这里，您可以自由编辑..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  保存日记
                </button>
                <button
                  type="button"
                  onClick={handleExportWord}
                  disabled={!finalContent}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  导出Word
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 日记列表 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">历史日记</h2>
          {diaries.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg">
              暂无历史日记
            </div>
          ) : (
            diaries.map((diary) => {
              const project = projects.find(p => p.id === diary.projectId);
              return (
                <div key={diary.id} className="bg-white rounded-lg shadow p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold">{project?.name || '未知项目'}</div>
                      <div className="text-sm text-gray-500">
                        {diary.date} · {diary.weather} · {diary.author}
                      </div>
                      <div className="text-sm text-blue-600 mt-1">
                        包含 {diary.modules.length} 个施工模块
                      </div>
                      {diary.aiGeneratedContent && (
                        <div className="text-xs text-green-600 mt-1">
                          已生成AI内容
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => viewDiary(diary, true)}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm font-medium"
                    >
                      查看
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
