// 项目接口
export interface Project {
  id: number;
  name: string;        // 项目名称
  code: string;        // 项目编号
  contractor: string;  // 施工单位
}

// 导出工序相关类型
export * from './process';
