import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { getWeatherDescription } from '@/types/bored-pile';

// 天气描述的固定句式
export function generateWeatherDescription(weatherData?: {
  weathercode: number;
  temperature_2m_max: number;
  temperature_2m_min: number;
  precipitation_sum: number;
}): string {
  if (!weatherData) {
    return '施工期间天气正常，现场施工条件满足要求。';
  }
  const weatherDesc = getWeatherDescription(weatherData.weathercode, weatherData.precipitation_sum);
  return `施工期间天气${weatherDesc}，最高气温${weatherData.temperature_2m_max}℃，最低气温${weatherData.temperature_2m_min}℃，降雨量${weatherData.precipitation_sum}mm，现场施工条件满足要求。`;
}

// 获取历史天气数据（上海坐标）
export async function fetchHistoricalWeatherData(date: string): Promise<{
  weathercode: number;
  temperature_2m_max: number;
  temperature_2m_min: number;
  precipitation_sum: number;
} | null> {
  try {
    const response = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?latitude=31.2304&longitude=121.4737&start_date=${date}&end_date=${date}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Shanghai`
    );
    if (!response.ok) {
      console.error('Historical weather API request failed');
      return null;
    }
    const data = await response.json();
    if (data.daily && data.daily.weathercode && data.daily.weathercode.length > 0) {
      return {
        weathercode: data.daily.weathercode[0],
        temperature_2m_max: data.daily.temperature_2m_max[0],
        temperature_2m_min: data.daily.temperature_2m_min[0],
        precipitation_sum: data.daily.precipitation_sum[0] || 0,
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch historical weather data:', error);
    return null;
  }
}

// 导出Word - 支持直接从最终内容导出
export async function exportFinalDiaryToWord(
  projectName: string,
  date: string,
  weather: string,
  author: string,
  finalContent: string,
  weatherData?: {
    weathercode: number;
    temperature_2m_max: number;
    temperature_2m_min: number;
    precipitation_sum: number;
  }
): Promise<void> {
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
            new TextRun(projectName),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '日    期：', bold: true }),
            new TextRun(date),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '天    气：', bold: true }),
            new TextRun(weather),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '监理人员：', bold: true }),
            new TextRun(author),
          ],
          spacing: { after: 400 },
        }),

        // 天气描述（固定句式）
        ...(weatherData ? [
          new Paragraph({
            text: generateWeatherDescription(weatherData),
            spacing: { before: 200, after: 200 },
          })
        ] : []),

        // 最终内容
        ...finalContent.split('\n').map(line => new Paragraph({
          text: line,
          spacing: { after: 100 },
        })),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `监理日记_${projectName}_${date}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
