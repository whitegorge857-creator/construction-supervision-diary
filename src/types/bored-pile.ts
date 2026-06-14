// 钻孔灌注桩专用数据结构 - 工程真实流程 + 选项化
export interface BoredPileModuleData {
  // 一、基本信息（桩级）
  basicInfo: {
    pileNumber: string;
    pileDiameter: string;
    pileDiameterOther?: string;
    designPileLength: string;
    designElevation: string;
    constructionDate: string;
    constructionUnit: string;
  };
  // 二、成孔施工
  holeDrilling: {
    startDrillingTime: string;
    endDrillingTime: string;
    drillingProcess: string;
    drillingProcessOther?: string;
    actualHoleDepth: string;
    sedimentThickness: string;
    holeAcceptance: string;
    holeAcceptanceOther?: string;
  };
  // 三、钢筋笼加工（整体）
  rebarProcessing: {
    mainRebarSpec: string;
    mainRebarSpecOther?: string;
    spiralSpacing: string;
    spiralSpacingOther?: string;
    encryptedSpacing: string;
    encryptedSpacingOther?: string;
    stirrupSpacing: string;
    stirrupSpacingOther?: string;
    processingQualityProblems: string[];
    processingQualityProblemsOther?: string;
  };
  // 四、钢筋笼安装（整体控制）
  rebarInstallation: {
    cageSections: string;
    cageSectionsOther?: string;
    connectionMethod: string;
    connectionMethodOther?: string;
    weldLength: string;
    weldLengthOther?: string;
    installationQualityProblems: string[];
    installationQualityProblemsOther?: string;
    installationAcceptance: string;
    installationAcceptanceOther?: string;
  };
  // 五、混凝土灌注
  concretePouring: {
    concreteStrength: string;
    concreteStrengthOther?: string;
    startPouringTime: string;
    endPouringTime: string;
    actualVolume: string;
    pouringProcess: string;
    pouringProcessOther?: string;
    pipeDepthControl: string;
    pipeDepthControlOther?: string;
    testBlockRetained: string;
    testBlockRetainedOther?: string;
    pouringAcceptance: string;
    pouringAcceptanceOther?: string;
  };
  // 六、安全与监理行为
  safetySupervision: {
    safetyStatus: string;
    safetyStatusOther?: string;
    旁站Supervision: string;
    inspectionCheck: string;
  };
}

// 字段选项配置
export const BORED_PILE_OPTIONS = {
  // 基本信息
  pileDiameter: [
    { value: 'Φ500mm', label: 'Φ500mm' },
    { value: 'Φ600mm', label: 'Φ600mm' },
    { value: 'Φ800mm', label: 'Φ800mm' },
    { value: 'Φ1000mm', label: 'Φ1000mm' },
    { value: 'Φ1200mm', label: 'Φ1200mm' },
    { value: 'other', label: '其他：' },
  ],
  
  // 成孔施工
  drillingProcess: [
    { value: '正循环钻进', label: '正循环钻进' },
    { value: '反循环钻进', label: '反循环钻进' },
    { value: '旋挖钻进', label: '旋挖钻进' },
    { value: '冲击钻进', label: '冲击钻进' },
    { value: 'other', label: '其他：' },
  ],
  holeAcceptance: [
    { value: '合格', label: '合格' },
    { value: '不合格', label: '不合格' },
    { value: 'other', label: '其他：' },
  ],
  
  // 钢筋笼加工
  mainRebarSpec: [
    { value: 'HRB400 Φ16', label: 'HRB400 Φ16' },
    { value: 'HRB400 Φ18', label: 'HRB400 Φ18' },
    { value: 'HRB400 Φ20', label: 'HRB400 Φ20' },
    { value: 'HRB400 Φ22', label: 'HRB400 Φ22' },
    { value: 'HRB400 Φ25', label: 'HRB400 Φ25' },
    { value: 'other', label: '其他：' },
  ],
  spiralSpacing: [
    { value: '100mm', label: '100mm' },
    { value: '150mm', label: '150mm' },
    { value: '200mm', label: '200mm' },
    { value: 'other', label: '其他：' },
  ],
  encryptedSpacing: [
    { value: '100mm', label: '100mm' },
    { value: '150mm', label: '150mm' },
    { value: '200mm', label: '200mm' },
    { value: 'other', label: '其他：' },
  ],
  stirrupSpacing: [
    { value: '2m', label: '2m' },
    { value: '2.5m', label: '2.5m' },
    { value: '3m', label: '3m' },
    { value: 'other', label: '其他：' },
  ],
  processingQualityProblems: [
    { value: '无问题', label: '无问题' },
    { value: '尺寸偏差', label: '尺寸偏差' },
    { value: '间距偏差（螺旋筋/加强箍/加密区）', label: '间距偏差（螺旋筋/加强箍/加密区）' },
    { value: '焊接不牢', label: '焊接不牢' },
    { value: '变形', label: '变形' },
    { value: '直径超差', label: '直径超差' },
    { value: 'other', label: '其他：' },
  ],
  
  // 钢筋笼安装（整体控制）
  cageSections: [
    { value: '1节', label: '1节' },
    { value: '2节', label: '2节' },
    { value: '3节', label: '3节' },
    { value: '4节', label: '4节' },
    { value: '5节', label: '5节' },
    { value: '6节', label: '6节' },
    { value: '7节及以上', label: '7节及以上' },
    { value: 'other', label: '其他：' },
  ],
  connectionMethod: [
    { value: '单面搭接焊', label: '单面搭接焊' },
    { value: '双面搭接焊', label: '双面搭接焊' },
    { value: '单面帮条焊', label: '单面帮条焊' },
    { value: '双面帮条焊', label: '双面帮条焊' },
    { value: 'other', label: '其他：' },
  ],
  weldLength: [
    { value: '8d', label: '8d' },
    { value: '10d', label: '10d' },
    { value: '12d', label: '12d' },
    { value: '15d', label: '15d' },
    { value: 'other', label: '其他：' },
  ],
  installationQualityProblems: [
    { value: '无问题', label: '无问题' },
    { value: '钢筋笼偏位', label: '钢筋笼偏位' },
    { value: '保护层垫块不足', label: '保护层垫块不足' },
    { value: '钢筋笼变形', label: '钢筋笼变形' },
    { value: '接头错位', label: '接头错位' },
    { value: '焊缝质量不合格', label: '焊缝质量不合格' },
    { value: '吊装过程异常', label: '吊装过程异常' },
    { value: 'other', label: '其他：' },
  ],
  installationAcceptance: [
    { value: '合格', label: '合格' },
    { value: '不合格', label: '不合格' },
    { value: 'other', label: '其他：' },
  ],
  
  // 混凝土灌注
  concreteStrength: [
    { value: 'C25', label: 'C25' },
    { value: 'C30', label: 'C30' },
    { value: 'C35', label: 'C35' },
    { value: 'C40', label: 'C40' },
    { value: 'C30水下混凝土', label: 'C30水下混凝土' },
    { value: 'other', label: '其他：' },
  ],
  pouringProcess: [
    { value: '连续', label: '连续' },
    { value: '中断', label: '中断' },
    { value: 'other', label: '其他：' },
  ],
  pipeDepthControl: [
    { value: '正常', label: '正常' },
    { value: '不正常', label: '不正常' },
    { value: 'other', label: '其他：' },
  ],
  testBlockRetained: [
    { value: '已留置', label: '已留置' },
    { value: '未留置', label: '未留置' },
    { value: 'other', label: '其他：' },
  ],
  pouringAcceptance: [
    { value: '合格', label: '合格' },
    { value: '不合格', label: '不合格' },
    { value: 'other', label: '其他：' },
  ],
  
  // 安全与监理行为
  safetyStatus: [
    { value: '正常', label: '正常' },
    { value: '存在问题', label: '存在问题' },
    { value: 'other', label: '其他：' },
  ],
  旁站Supervision: [
    { value: '已实施', label: '已实施' },
    { value: '未实施', label: '未实施' },
  ],
  inspectionCheck: [
    { value: '已实施', label: '已实施' },
    { value: '未实施', label: '未实施' },
  ],
};

// 天气代码映射 - Open-Meteo 标准映射
export const WEATHER_CODE_MAPPING: Record<number, string> = {
  0: '晴',
  1: '大部晴朗',
  2: '多云',
  3: '阴',
  
  45: '雾',
  48: '霜雾',
  
  51: '小雨',
  53: '中雨',
  55: '大雨',
  
  61: '小雨',
  63: '中雨',
  65: '大雨',
  
  80: '阵雨',
  81: '中阵雨',
  82: '强阵雨',
};

// 获取显示值
export function getDisplayValue(value: string, otherValue?: string): string {
  if (value === 'other' && otherValue) {
    return otherValue;
  }
  return value;
}

// 结合降雨量的天气描述判断
export function getWeatherDescription(weathercode: number, precipitation_sum: number): string {
  // 降雨为0的情况：根据原始天气代码判断
  if (precipitation_sum === 0) {
    const baseWeather = WEATHER_CODE_MAPPING[weathercode];
    // 如果是降雨类天气但降雨为0，改为晴天相关
    if (baseWeather && (baseWeather.includes('雨') || baseWeather.includes('阵'))) {
      return '晴';
    }
    return baseWeather || '晴';
  }
  
  // 有降雨的情况
  if (precipitation_sum <= 2) {
    // 小雨/阵雨
    if (weathercode >= 80) {
      return '阵雨';
    }
    return '小雨';
  } else {
    // 中雨/大雨
    if (weathercode >= 80) {
      return '中阵雨';
    }
    if (weathercode >= 60 && weathercode < 80) {
      if (precipitation_sum > 5) {
        return '大雨';
      }
      return '中雨';
    }
    if (precipitation_sum > 5) {
      return '大雨';
    }
    return '中雨';
  }
}

// 初始化数据
export function initBoredPileData(date: string): BoredPileModuleData {
  return {
    basicInfo: {
      pileNumber: '',
      pileDiameter: '',
      designPileLength: '',
      designElevation: '',
      constructionDate: date,
      constructionUnit: '',
    },
    holeDrilling: {
      startDrillingTime: '',
      endDrillingTime: '',
      drillingProcess: '',
      actualHoleDepth: '',
      sedimentThickness: '',
      holeAcceptance: '',
    },
    rebarProcessing: {
      mainRebarSpec: '',
      spiralSpacing: '',
      encryptedSpacing: '',
      stirrupSpacing: '',
      processingQualityProblems: [],
    },
    rebarInstallation: {
      cageSections: '',
      connectionMethod: '',
      weldLength: '',
      installationQualityProblems: [],
      installationAcceptance: '',
    },
    concretePouring: {
      concreteStrength: '',
      startPouringTime: '',
      endPouringTime: '',
      actualVolume: '',
      pouringProcess: '',
      pipeDepthControl: '',
      testBlockRetained: '',
      pouringAcceptance: '',
    },
    safetySupervision: {
      safetyStatus: '',
      旁站Supervision: '已实施',
      inspectionCheck: '已实施',
    },
  };
}

// 天气数据接口 - 历史天气数据
export interface WeatherData {
  weathercode: number;
  temperature_2m_max: number;
  temperature_2m_min: number;
  precipitation_sum: number;
  isAuto: boolean;
  date?: string;
}

// 手动天气数据
export interface ManualWeatherData {
  weather: string;
  temperature_max: string;
  temperature_min: string;
}
