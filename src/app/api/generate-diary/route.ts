 import { NextRequest, NextResponse } from 'next/server';
 
 // ==================== 辅助函数 ====================
 function dv(v: string, ov?: string): string {
   if (v === 'other' && ov) return ov;
   return v || '';
 }
 
 // ==================== 生成自然段落的钻孔灌注桩描述 ====================
 function genBoredPile(data: any): string {
   const B = data._boredPileData?.basicInfo || {};
   const H = data._boredPileData?.holeDrilling || {};
   const RP = data._boredPileData?.rebarProcessing || {};
   const RI = data._boredPileData?.rebarInstallation || {};
   const C = data._boredPileData?.concretePouring || {};
   const S = data._boredPileData?.safetySupervision || {};
 
   const pn = dv(B.pileNumber) || '本桩';
   const pd = dv(B.pileDiameter, B.pileDiameterOther);
   const dl = dv(B.designPileLength);
   const de = dv(B.designElevation);
   const sd = dv(H.startDrillingTime);
   const ed = dv(H.endDrillingTime);
   const dp = dv(H.drillingProcess, H.drillingProcessOther);
   const ad = dv(H.actualHoleDepth);
   const se = dv(H.sedimentThickness);
   const ha = dv(H.holeAcceptance, H.holeAcceptanceOther);
   const mr = dv(RP.mainRebarSpec, RP.mainRebarSpecOther);
   const ss = dv(RP.spiralSpacing, RP.spiralSpacingOther);
   const es = dv(RP.encryptedSpacing, RP.encryptedSpacingOther);
   const sts = dv(RP.stirrupSpacing, RP.stirrupSpacingOther);
   const pp = (RP.processingQualityProblems||[]).filter(Boolean);
   const cs = dv(RI.cageSections, RI.cageSectionsOther);
   const cm = dv(RI.connectionMethod, RI.connectionMethodOther);
   const wl = dv(RI.weldLength, RI.weldLengthOther);
   const ip = (RI.installationQualityProblems||[]).filter(Boolean);
   const ia = dv(RI.installationAcceptance, RI.installationAcceptanceOther);
   const cstr = dv(C.concreteStrength, C.concreteStrengthOther);
   const sp = dv(C.startPouringTime);
   const ep = dv(C.endPouringTime);
   const av = dv(C.actualVolume);
   const prp = dv(C.pouringProcess, C.pouringProcessOther);
   const pdc = dv(C.pipeDepthControl, C.pipeDepthControlOther);
   const tb = dv(C.testBlockRetained, C.testBlockRetainedOther);
   const pa = dv(C.pouringAcceptance, C.pouringAcceptanceOther);
   const sst = dv(S.safetyStatus, S.safetyStatusOther);
   const pz = S.旁站Supervision === '已实施';
   const ic = S.inspectionCheck === '已实施';
 
   // ---- 工程进展（自然段落） ----
   const progressParts: string[] = [];
 
   // 桩号 + 设计参数
   let intro = '本日进行钻孔灌注桩' + pn + '施工';
   const designParams: string[] = [];
   if (pd) designParams.push('桩径' + pd);
   if (dl) designParams.push('设计桩长' + dl + 'm');
   if (de) designParams.push('设计桩顶标高' + de + 'm');
   if (designParams.length > 0) intro += '，' + designParams.join('，');
   intro += '。';
   progressParts.push(intro);
 
   // 成孔施工
   if (sd && ed) {
     const startH = sd.replace(/[：:]/g, ':');
     const endH = ed.replace(/[：:]/g, ':');
     let drillText = '';
     if (dp) drillText = '采用' + dp + '工艺进行成孔作业';
     if (ad || se) {
       const drillDetail: string[] = [];
       if (ad) drillDetail.push('实际成孔深度' + ad + 'm');
       if (se) drillDetail.push('孔底沉渣厚度' + se + 'mm');
       if (drillDetail.length > 0) {
         drillText += '，' + drillDetail.join('，');
       }
     }
     if (drillText) {
       progressParts.push(startH + '至' + endH + '，' + drillText + '。');
     }
     if (ha) {
       const haText = ha === '合格' ? '经检查成孔质量符合设计及规范要求，验收合格。' : '成孔质量验收：' + ha + '。';
       progressParts.push(haText);
     }
   } else if (dp) {
     progressParts.push('采用' + dp + '工艺进行成孔作业。');
     if (ad) progressParts.push('实际成孔深度' + ad + 'm。');
     if (se) progressParts.push('孔底沉渣厚度' + se + 'mm。');
     if (ha === '合格') progressParts.push('经检查成孔质量符合设计及规范要求，验收合格。');
   }
 
   // 钢筋笼
   const cageParts: string[] = [];
   if (mr) cageParts.push('主筋采用' + mr);
   if (ss) cageParts.push('螺旋筋间距' + ss);
   if (es) cageParts.push('加密区间距' + es);
   if (sts) cageParts.push('加强箍间距' + sts);
   let cageText = '';
   if (cs) cageText += '钢筋笼分' + cs + '';
   if (cm) {
     cageText += '采用' + cm + '连接';
     if (wl) cageText += '，焊缝长度' + wl;
   }
   if (cs || cm) {
     cageText += '，安装就位';
   }
   if (cageParts.length > 0 || cageText) {
     const fullCage: string[] = [];
     if (cageParts.length > 0) fullCage.push('钢筋笼加工：' + cageParts.join('，'));
     if (cageText) fullCage.push(cageText);
     let cageSentence = fullCage.join('。') + '。';
     if (ia === '合格') cageSentence += '安装定位准确，保护层厚度满足要求，验收合格。';
     progressParts.push(cageSentence);
   } else if (ia === '合格') {
     progressParts.push('钢筋笼安装定位准确，保护层厚度满足要求，验收合格。');
   }
 
   // 混凝土灌注
   const pourParts: string[] = [];
   if (cstr) {
     let pourText = '混凝土强度等级' + cstr;
     if (sp && ep) {
       const sp2 = sp.replace(/[：:]/g, ':');
       const ep2 = ep.replace(/[：:]/g, ':');
       pourText += '，' + sp2 + '开始灌注至' + ep2 + '结束';
     }
     if (av) pourText += '，实际灌注量' + av + 'm³';
     if (prp) {
       if (prp === '连续') pourText += '，灌注过程连续';
       else pourText += '，灌注过程' + prp;
     }
     pourText += '。';
     progressParts.push(pourText);
   }
   if (pdc === '正常') progressParts.push('导管埋深控制正常。');
   else if (pdc) progressParts.push('导管埋深控制：' + pdc + '。');
   if (tb === '已留置') progressParts.push('按规定留置混凝土试块。');
   else if (tb) progressParts.push('试块留置：' + tb + '。');
   if (pa === '合格') progressParts.push('灌注质量符合设计及规范要求，验收合格。');
   else if (pa) progressParts.push('灌注验收：' + pa + '。');
   const progress = progressParts.join('\n');
 
   // ---- 质量控制（自然段落） ----
   const qParts: string[] = [];
   const qItems: string[] = [];
   if (ha === '合格') qItems.push('成孔深度' + (ad || '') + '、孔径、沉渣厚度' + (se || '') + '等指标经现场检查符合设计及规范要求，成孔质量合格');
   if (!pp.includes('无问题') && pp.length > 0) {
     qItems.push('钢筋笼加工存在' + pp.join('、') + '等问题');
   }
   if (!ip.includes('无问题') && ip.length > 0) {
     qItems.push('钢筋笼安装存在' + ip.join('、') + '等问题');
   }
   if (ia === '合格') qItems.push('钢筋笼安装定位准确、保护层厚度满足要求，验收合格');
   if (pa === '合格') qItems.push('混凝土灌注过程连续、导管埋深控制正常、试块按规定留置，灌注质量合格');
   if (qItems.length > 0) {
     qParts.push('本日各工序质量控制情况如下：' + qItems.join('；') + '。');
   } else {
     qParts.push('本日各工序施工质量符合设计及规范要求，质量控制到位。');
   }
   if (tb === '已留置') qParts.push('留置混凝土试块' + cstr + '一组，编号详见试验台账，待到期后送检。');
   const quality = qParts.join('\n');
 
   // ---- 安全 ----
   let safety = '';
   if (sst === '正常') {
     safety = '本日施工现场安全有序，作业人员按规定佩戴安全防护用品，机械设备运转正常，未发生安全事故。';
   } else if (sst) {
     safety = '本日检查发现现场安全问题：' + sst + '，已当场要求施工单位落实整改，整改完成后经监理复查确认。';
   }
 
   // ---- 监理工作 ----
   const svParts: string[] = [];
   if (pz) svParts.push('对钻孔灌注桩' + pn + '的混凝土灌注实施了全过程旁站监理');
   if (ic) svParts.push('对成孔质量及钢筋笼加工安装质量进行了检查验收');
   const supervision = svParts.length > 0
     ? '本日监理人员' + svParts.join('，') + '，旁站记录及验收资料同步整理归档。'
     : '';
 
   // ---- 问题处理 ----
   const prItems: string[] = [];
   if (pp.length > 0 && !pp.includes('无问题')) prItems.push('钢筋笼加工：' + pp.join('、'));
   if (ip.length > 0 && !ip.includes('无问题')) prItems.push('钢筋笼安装：' + ip.join('、'));
   if (sst && sst !== '正常') prItems.push('安全方面：' + sst);
   const problem = prItems.length > 0
     ? '本日发现以下问题：' + prItems.join('；') + '。已现场要求施工单位立即整改，监理人员将跟踪复查直至整改合格。'
     : '本日施工正常，未发现需专项处理的质量或安全问题。';
 
   return JSON.stringify({ progress, quality, safety, supervision, problem });
 }
 
 // ==================== 通用工序模板生成器 ====================
 const T: Record<string, (f: Record<string, any>) => { p: string; q: string; sf: string; sv: string; pr: string }> = {
   'earth-excavation': (f) => {
     const parts: string[] = [];
     if (f.excavationScope) parts.push('开挖范围' + f.excavationScope);
     if (f.elevation) parts.push('开挖至标高' + f.elevation + 'm');
     const methodMap: Record<string, string> = {manual:'人工开挖',excavator:'挖掘机开挖',combined:'人机结合开挖'};
     if (f.excavationMethod) parts.push('采用' + (methodMap[f.excavationMethod]||f.excavationMethod) + '方式');
     return {
       p: '【土方开挖】本日进行土方开挖作业，' + parts.join('，') + '。' + (f.soilCondition ? '现场土质情况：' + f.soilCondition + '。' : '') + (f.slopeCondition ? '边坡情况：' + f.slopeCondition + '，边坡稳定。' : '') + '开挖过程符合施工方案要求。',
       q: '开挖标高及边坡坡度经现场检查符合设计要求。',
       sf: '开挖过程中边坡稳定，机械作业安全有序。',
       sv: '监理人员对土方开挖过程进行了巡视检查。',
       pr: '',
     };
   },
   'cushion': (f) => ({
     p: '【垫层】本日进行垫层浇筑施工，' + (f.scope ? '浇筑范围' + f.scope + '，' : '') + (f.thickness ? '设计厚度' + f.thickness + '，' : '') + (f.concreteStrength ? '混凝土强度等级' + f.concreteStrength : '') + '。' + (f.surfaceQuality ? '表面质量：' + f.surfaceQuality + '。' : ''),
     q: '垫层表面平整度、标高控制符合规范要求。',
     sf: '', sv: '监理人员对垫层施工进行了检查验收。', pr: '',
   }),
   'foundation-rebar': (f) => {
     const parts: string[] = [];
     if (f.rebarSpecification) parts.push('钢筋规格采用' + f.rebarSpecification);
     if (f.spacing) parts.push('间距' + f.spacing);
     if (f.coverThickness) parts.push('保护层厚度' + f.coverThickness);
     return {
       p: '【钢筋】' + (f.bindingLocation ? '本日进行' + f.bindingLocation + '钢筋绑扎作业。' : '本日进行钢筋加工及绑扎作业。') + (parts.length > 0 ? parts.join('，') + '。' : '') + (f.inspectionStatus ? '经检查：' + f.inspectionStatus + '。' : ''),
       q: '钢筋规格、间距、保护层厚度经检查符合设计及规范要求，绑扎牢固。',
       sf: '', sv: '监理人员对钢筋绑扎进行了全过程检查验收。', pr: '',
     };
   },
   'foundation-formwork': (f) => {
     const tm: Record<string, string> = {plywood:'木模板',steel:'钢模板',aluminum:'铝模板'};
     const items: string[] = [];
     if (f.formworkLocation) items.push('支设部位' + f.formworkLocation);
     if (f.formworkType) items.push('采用' + (tm[f.formworkType]||f.formworkType));
     return {
       p: '【模板】本日进行模板支设作业，' + items.join('，') + '。' + (f.dimensionCheck ? '经检查：' + f.dimensionCheck + '。' : '') + (f.stabilityCheck ? f.stabilityCheck + '，支撑体系稳固可靠。' : ''),
       q: '模板截面尺寸、标高、垂直度经检查符合规范要求，支撑体系稳固。',
       sf: '', sv: '监理人员对模板支设进行了检查验收。', pr: '',
     };
   },
   'foundation-concrete': (f) => {
     const parts: string[] = [];
     if (f.pouringLocation) parts.push('浇筑部位' + f.pouringLocation);
     if (f.concreteStrength) parts.push('混凝土强度等级' + f.concreteStrength);
     if (f.pouringVolume) parts.push('浇筑方量' + f.pouringVolume);
     if (f.pouringTime) parts.push('浇筑时间' + f.pouringTime);
     return {
       p: '【混凝土】本日进行混凝土浇筑作业，' + parts.join('，') + '。' + (f.vibrationStatus ? '振捣：' + f.vibrationStatus + '，振捣密实。' : '') + (f.curingStatus ? '养护：' + f.curingStatus + '。' : ''),
       q: '混凝土振捣密实，养护措施到位，试块按规定留置。',
       sf: '', sv: '监理人员对混凝土浇筑实施了全过程旁站监理。', pr: '',
     };
   },
   'backfill': (f) => {
     const parts: string[] = [];
     if (f.backfillScope) parts.push('回填范围' + f.backfillScope);
     if (f.backfillMaterial) parts.push('采用' + f.backfillMaterial);
     if (f.layerThickness) parts.push('分层厚度' + f.layerThickness);
     const cm: Record<string, string> = {roller:'压路机压实',rammer:'打夯机夯实',manual:'人工夯实'};
     if (f.compactionMethod) parts.push('采用' + (cm[f.compactionMethod]||f.compactionMethod));
     return {
       p: '【回填】本日进行土方回填作业，' + parts.join('，') + '。' + (f.compactionTest ? '压实检测：' + f.compactionTest + '，压实系数满足设计要求。' : ''),
       q: '回填材料符合要求，分层厚度控制到位，压实系数满足设计要求。',
       sf: '', sv: '监理人员对回填过程进行了巡视检查。', pr: '',
     };
   },
   'structure-rebar': (f) => {
     const tm: Record<string, string> = {beam:'梁',slab:'板',column:'柱',wall:'墙'};
     const parts: string[] = [];
     if (f.rebarType) parts.push(tm[f.rebarType]||f.rebarType);
     if (f.rebarSpecification) parts.push('钢筋采用' + f.rebarSpecification);
     if (f.spacing) parts.push('间距' + f.spacing);
     if (f.coverThickness) parts.push('保护层厚度' + f.coverThickness);
     return {
       p: '【钢筋（主体结构）】' + (f.location ? '本日进行' + f.location + '钢筋绑扎作业，' : '本日进行主体结构钢筋绑扎作业，') + parts.join('，') + '。' + (f.bindingQuality ? '绑扎质量：' + f.bindingQuality + '。' : ''),
       q: f.bindingQuality || '钢筋绑扎质量符合设计及规范要求。',
       sf: '', sv: '监理人员对主体结构钢筋绑扎进行了检查验收。', pr: '',
     };
   },
 };
 function gm(m: any): { p: string; q: string; sf: string; sv: string; pr: string } {
   const fv = m.fieldValues || {};
   const w = T[m.templateId];
   if (w) return w(fv);
   const km: Record<string, string> = {
     excavationScope:'开挖范围',elevation:'标高',soilCondition:'土质情况',slopeCondition:'边坡情况',
     excavationMethod:'开挖方式',scope:'范围',thickness:'厚度',concreteStrength:'混凝土强度',
     surfaceQuality:'表面质量',rebarSpecification:'钢筋规格',bindingLocation:'绑扎部位',location:'部位',
     spacing:'间距',coverThickness:'保护层厚度',inspectionStatus:'检查情况',bindingQuality:'绑扎质量',
     formworkType:'模板类型',formworkLocation:'模板部位',dimensionCheck:'尺寸检查',stabilityCheck:'稳定性检查',
     pouringLocation:'浇筑部位',pouringVolume:'浇筑方量',pouringTime:'浇筑时间',vibrationStatus:'振捣情况',
     curingStatus:'养护情况',backfillScope:'回填范围',backfillMaterial:'回填材料',layerThickness:'分层厚度',
     compactionMethod:'压实方式',compactionTest:'压实检测',rebarType:'钢筋类型',
   };
   const ts: string[] = [];
   Object.entries(fv).forEach(([k, v]) => { if (k.startsWith('_') || !v) return; ts.push((km[k]||k) + '：' + v); });
   return { p: '【' + (m.templateName||'施工模块') + '】' + ts.join('；'), q: '', sf: '', sv: '', pr: '' };
 }
 
 // ==================== 主生成入口 ====================
 function gen(modules: any[], wd: any, date: string, pn: string): string {
   const rl: string[] = [];
   rl.push('日期：' + date);
   if (pn) rl.push('工程名称：' + pn);
   if (wd) {
     const wc: Record<number,string> = {0:'晴',1:'大部晴朗',2:'多云',3:'阴',45:'雾',48:'霜雾'};
     const desc = wd.precipitation_sum === 0 ? (wc[wd.weathercode]||'晴') : wd.precipitation_sum <= 2 ? '小雨' : '中雨';
     rl.push('天气：' + desc + '，气温' + wd.temperature_2m_min + '~' + wd.temperature_2m_max + '℃，降雨量' + wd.precipitation_sum + 'mm');
   }
   rl.push('');
   let ap = '', aq = '', asf = '', asv = '', apr = '';
   modules.forEach((m: any) => {
     let s: any;
     if (m.templateId === 'bored-pile' && m.fieldValues?._is_structured === 'true') s = JSON.parse(genBoredPile(m.fieldValues));
     else s = gm(m);
     if (s.progress) ap += s.progress + '\n\n';
     if (s.quality) aq += s.quality + '\n';
     if (s.safety) asf += s.safety + '\n';
     if (s.supervision) asv += s.supervision + '\n';
     if (s.problem) apr += s.problem + '\n';
   });
   rl.push('一、工程进展');
   rl.push(ap.trim() || '本日无工程进展。');
   rl.push(''); rl.push('二、质量控制');
   rl.push(aq.trim() || '本日施工质量符合设计及规范要求，各工序验收合格。');
   rl.push(''); rl.push('三、安全情况');
   rl.push(asf.trim() || '本日施工现场安全有序，作业人员防护用品佩戴规范，未发生安全事故。');
   rl.push(''); rl.push('四、监理工作');
   rl.push(asv.trim() || '本日监理人员按规范要求开展巡视、检查、验收等监理工作，施工过程受控。');
   rl.push(''); rl.push('五、问题处理');
   rl.push(apr.trim() || '本日施工正常，未发现需处理的质量或安全问题。');
   rl.push('');
   return rl.join('\n');
 }
 
 // ==================== API 路由 ====================
 export async function POST(request: NextRequest) {
   try {
     const body = await request.json();
     const { modules, weatherData, date, projectName } = body;
     if (!modules || modules.length === 0) {
       return NextResponse.json({ error: '无施工数据', details: '请先添加至少一个施工模块' }, { status: 400 });
     }
     const content = gen(modules, weatherData, date, projectName);
     return NextResponse.json({ success: true, content: content.trim() });
   } catch (error) {
     console.error('Error generating diary:', error);
     return NextResponse.json({ error: '生成过程出错', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
   }
 }
