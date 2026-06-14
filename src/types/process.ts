// 工程大类
export type EngineeringCategory = 'civil' | 'installation' | 'equipment';

export interface EngineeringCategoryOption {
  id: EngineeringCategory;
  name: string;
}

export const ENGINEERING_CATEGORIES: EngineeringCategoryOption[] = [
  { id: 'civil', name: '土建工程' },
  { id: 'installation', name: '安装工程' },
  { id: 'equipment', name: '设备工程' }
];

// 专业工程
export interface SpecialtyEngineering {
  id: string;
  name: string;
  category: EngineeringCategory;
}

export const SPECIALTY_ENGINEERINGS: SpecialtyEngineering[] = [
  // 土建工程
  { id: 'pile', name: '桩基工程', category: 'civil' },
  { id: 'foundation', name: '基础工程', category: 'civil' },
  { id: 'structure', name: '主体结构工程', category: 'civil' },
  { id: 'masonry', name: '砌体工程', category: 'civil' },
  { id: 'decoration', name: '装修工程', category: 'civil' },
  
  // 安装工程
  { id: 'electrical', name: '电气工程', category: 'installation' },
  { id: 'plumbing', name: '给排水工程', category: 'installation' },
  { id: 'hvac', name: '暖通空调工程', category: 'installation' },
  
  // 设备工程
  { id: 'machinery', name: '机械设备安装', category: 'equipment' },
  { id: 'elevator', name: '电梯工程', category: 'equipment' }
];

// 字段类型
export type FieldType = 'text' | 'number' | 'select' | 'textarea' | 'date';

export interface FieldDefinition {
  id: string;
  name: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

// 工序模板
export interface ProcessTemplate {
  id: string;
  name: string;
  specialtyId: string;
  category: EngineeringCategory;
  fields: FieldDefinition[];
}

// 工序模板定义
export const PROCESS_TEMPLATES: ProcessTemplate[] = [
  // 桩基工程 - 钻孔灌注桩（结构化）
  {
    id: 'bored-pile',
    name: '钻孔灌注桩',
    specialtyId: 'pile',
    category: 'civil',
    fields: [
      // 使用特殊标记表示这是结构化工序
      { id: '_is_structured', name: '_is_structured', type: 'text', required: false }
    ]
  },
  
  // 基础工程 - 土方开挖
  {
    id: 'earth-excavation',
    name: '土方开挖',
    specialtyId: 'foundation',
    category: 'civil',
    fields: [
      { id: 'excavationScope', name: '开挖范围', type: 'textarea', required: true, placeholder: '详细描述开挖范围，如轴线、尺寸等' },
      { id: 'elevation', name: '标高', type: 'text', required: true, placeholder: '例如：-3.500m、-5.000m...' },
      { id: 'soilCondition', name: '土质情况', type: 'textarea', required: true, placeholder: '描述土层情况、颜色、含水率等' },
      { id: 'slopeCondition', name: '边坡情况', type: 'textarea', required: true, placeholder: '描述边坡坡度、支护方式、稳定性等' },
      { id: 'excavationMethod', name: '开挖方式', type: 'select', required: true, options: [
        { value: 'manual', label: '人工开挖' },
        { value: 'excavator', label: '挖掘机开挖' },
        { value: 'combined', label: '人机结合' }
      ]}
    ]
  },
  
  // 基础工程 - 垫层
  {
    id: 'cushion',
    name: '垫层',
    specialtyId: 'foundation',
    category: 'civil',
    fields: [
      { id: 'scope', name: '浇筑范围', type: 'textarea', required: true, placeholder: '描述垫层浇筑的具体范围' },
      { id: 'thickness', name: '厚度', type: 'text', required: true, placeholder: '例如：100mm、150mm...' },
      { id: 'concreteStrength', name: '混凝土强度', type: 'select', required: true, options: [
        { value: 'C15', label: 'C15' },
        { value: 'C20', label: 'C20' }
      ]},
      { id: 'surfaceQuality', name: '表面质量', type: 'textarea', required: true, placeholder: '描述表面平整度、标高控制等情况' }
    ]
  },
  
  // 基础工程 - 钢筋
  {
    id: 'foundation-rebar',
    name: '钢筋',
    specialtyId: 'foundation',
    category: 'civil',
    fields: [
      { id: 'rebarSpecification', name: '钢筋规格', type: 'text', required: true, placeholder: '例如：HRB400、Φ25...' },
      { id: 'bindingLocation', name: '绑扎部位', type: 'textarea', required: true, placeholder: '描述具体绑扎部位' },
      { id: 'spacing', name: '间距', type: 'text', required: true, placeholder: '例如：150mm、200mm...' },
      { id: 'coverThickness', name: '保护层厚度', type: 'text', required: true, placeholder: '例如：40mm、50mm...' },
      { id: 'inspectionStatus', name: '检查情况', type: 'textarea', required: true, placeholder: '详细描述钢筋绑扎质量检查情况' }
    ]
  },
  
  // 基础工程 - 模板
  {
    id: 'foundation-formwork',
    name: '模板',
    specialtyId: 'foundation',
    category: 'civil',
    fields: [
      { id: 'formworkType', name: '模板类型', type: 'select', required: true, options: [
        { value: 'plywood', label: '木模板' },
        { value: 'steel', label: '钢模板' },
        { value: 'aluminum', label: '铝模板' }
      ]},
      { id: 'formworkLocation', name: '模板部位', type: 'textarea', required: true, placeholder: '描述模板支设的具体部位' },
      { id: 'dimensionCheck', name: '尺寸检查', type: 'textarea', required: true, placeholder: '描述截面尺寸、标高等检查情况' },
      { id: 'stabilityCheck', name: '稳定性检查', type: 'textarea', required: true, placeholder: '描述支撑体系稳定性检查情况' }
    ]
  },
  
  // 基础工程 - 混凝土
  {
    id: 'foundation-concrete',
    name: '混凝土',
    specialtyId: 'foundation',
    category: 'civil',
    fields: [
      { id: 'pouringLocation', name: '浇筑部位', type: 'textarea', required: true, placeholder: '描述混凝土浇筑的具体部位' },
      { id: 'concreteStrength', name: '混凝土强度', type: 'select', required: true, options: [
        { value: 'C25', label: 'C25' },
        { value: 'C30', label: 'C30' },
        { value: 'C35', label: 'C35' },
        { value: 'C40', label: 'C40' }
      ]},
      { id: 'pouringVolume', name: '浇筑方量', type: 'text', required: true, placeholder: '例如：120m³、150m³...' },
      { id: 'pouringTime', name: '浇筑时间', type: 'text', required: true, placeholder: '例如：09:00-17:30' },
      { id: 'vibrationStatus', name: '振捣情况', type: 'textarea', required: true, placeholder: '描述振捣方式、密实情况等' },
      { id: 'curingStatus', name: '养护情况', type: 'textarea', required: true, placeholder: '描述养护方式、养护时间等' }
    ]
  },
  
  // 基础工程 - 回填
  {
    id: 'backfill',
    name: '回填',
    specialtyId: 'foundation',
    category: 'civil',
    fields: [
      { id: 'backfillScope', name: '回填范围', type: 'textarea', required: true, placeholder: '描述回填的具体范围' },
      { id: 'backfillMaterial', name: '回填材料', type: 'text', required: true, placeholder: '例如：素土、灰土、砂石...' },
      { id: 'layerThickness', name: '分层厚度', type: 'text', required: true, placeholder: '例如：250mm、300mm...' },
      { id: 'compactionMethod', name: '压实方式', type: 'select', required: true, options: [
        { value: 'roller', label: '压路机' },
        { value: 'rammer', label: '打夯机' },
        { value: 'manual', label: '人工夯实' }
      ]},
      { id: 'compactionTest', name: '压实检测', type: 'textarea', required: true, placeholder: '描述压实系数检测情况' }
    ]
  },
  
  // 主体结构 - 钢筋
  {
    id: 'structure-rebar',
    name: '钢筋',
    specialtyId: 'structure',
    category: 'civil',
    fields: [
      { id: 'rebarType', name: '钢筋类型', type: 'select', required: true, options: [
        { value: 'beam', label: '梁' },
        { value: 'slab', label: '板' },
        { value: 'column', label: '柱' },
        { value: 'wall', label: '墙' }
      ]},
      { id: 'rebarSpecification', name: '钢筋规格', type: 'text', required: true, placeholder: '例如：HRB400 Φ25' },
      { id: 'location', name: '部位', type: 'textarea', required: true, placeholder: '描述具体楼层、轴线位置' },
      { id: 'spacing', name: '间距', type: 'text', required: true, placeholder: '例如：150mm、200mm' },
      { id: 'coverThickness', name: '保护层厚度', type: 'text', required: true, placeholder: '例如：20mm、25mm' },
      { id: 'bindingQuality', name: '绑扎质量', type: 'textarea', required: true, placeholder: '描述绑扎质量检查情况' }
    ]
  }
];

// 施工模块数据
export interface ConstructionModule {
  id: string;
  templateId: string;
  category: EngineeringCategory;
  specialtyId: string;
  templateName: string;
  fieldValues: Record<string, any>;
}

// 新的日记数据结构
export interface ProcessDrivenDiary {
  id: number;
  projectId: number;
  date: string;
  weather: string; // 原始天气字段（保留兼容性）
  weathercode?: number;
  temperature_2m_max?: number;
  temperature_2m_min?: number;
  precipitation_sum?: number;
  isAutoWeather?: boolean;
  author: string;
  modules: ConstructionModule[];
  // AI生成内容
  aiGeneratedContent?: string;
  // 用户最终编辑内容
  finalContent?: string;
}
