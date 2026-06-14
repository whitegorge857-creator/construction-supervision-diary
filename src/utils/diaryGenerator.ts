// @ts-nocheck
import { Diary, Project } from '@/types';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export interface GeneratedDiary {
  projectName: string;
  date: string;
  weather: string;
  author: string;
  engineeringProgress: string;
  qualityControl: string;
  safetyStatus: string;
  supervisionWork: string;
  problemHandling: string;
}

export function generateSupervisionDiary(diary: Diary, project: Project): GeneratedDiary {
  // 工程进展
  const engineeringProgress = diary.records
    .map(r => {
      let progress = '';
      if (r.engineeringCategory) progress += `【${r.engineeringCategory}】`;
      if (r.professionalEngineering) progress += r.professionalEngineering + ' ';
      if (r.constructionProcess) progress += r.constructionProcess + ' ';
      if (r.constructionLocation) progress += `(${r.constructionLocation}) `;
      if (r.completionStatus) progress += r.completionStatus;
      return progress.trim();
    })
    .filter(Boolean)
    .join('\n');

  // 质量控制
  const qualityControl = diary.records
    .map(r => r.qualityStatus)
    .filter(Boolean)
    .join('\n') || '本日工程质量符合要求，未发现质量问题。';

  // 安全情况
  const safetyStatus = diary.records
    .map(r => r.safetyStatus)
    .filter(Boolean)
    .join('\n') || '本日施工现场安全有序，未发生安全事故。';

  // 监理工作
  const supervisionWork = diary.records
    .map(r => r.supervisionWork)
    .filter(Boolean)
    .join('\n') || '监理人员按规范开展监理工作。';

  // 问题处理
  const problemHandling = diary.records
    .map(r => r.remarks)
    .filter(Boolean)
    .join('\n') || '本日无需要处理的问题。';

  return {
    projectName: project.name,
    date: diary.date,
    weather: diary.weather,
    author: diary.author,
    engineeringProgress: engineeringProgress || '本日无工程进展记录。',
    qualityControl,
    safetyStatus,
    supervisionWork,
    problemHandling,
  };
}

export async function exportToWord(generatedDiary: GeneratedDiary): Promise<void> {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // 标题
        new Paragraph({
          text: '监理日记',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        
        // 基本信息
        new Paragraph({
          children: [
            new TextRun({ text: '工程名称：', bold: true }),
            new TextRun(generatedDiary.projectName),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '日    期：', bold: true }),
            new TextRun(generatedDiary.date),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '天    气：', bold: true }),
            new TextRun(generatedDiary.weather),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '监理人员：', bold: true }),
            new TextRun(generatedDiary.author),
          ],
          spacing: { after: 400 },
        }),

        // 工程进展
        new Paragraph({
          text: '一、工程进展',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 200 },
        }),
        ...generatedDiary.engineeringProgress.split('\n').map(line => 
          new Paragraph({
            text: line,
            spacing: { after: 100 },
          })
        ),

        // 质量控制
        new Paragraph({
          text: '二、质量控制',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        }),
        ...generatedDiary.qualityControl.split('\n').map(line => 
          new Paragraph({
            text: line,
            spacing: { after: 100 },
          })
        ),

        // 安全情况
        new Paragraph({
          text: '三、安全情况',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        }),
        ...generatedDiary.safetyStatus.split('\n').map(line => 
          new Paragraph({
            text: line,
            spacing: { after: 100 },
          })
        ),

        // 监理工作
        new Paragraph({
          text: '四、监理工作',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        }),
        ...generatedDiary.supervisionWork.split('\n').map(line => 
          new Paragraph({
            text: line,
            spacing: { after: 100 },
          })
        ),

        // 问题处理
        new Paragraph({
          text: '五、问题处理',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        }),
        ...generatedDiary.problemHandling.split('\n').map(line => 
          new Paragraph({
            text: line,
            spacing: { after: 100 },
          })
        ),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `监理日记_${generatedDiary.projectName}_${generatedDiary.date}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
