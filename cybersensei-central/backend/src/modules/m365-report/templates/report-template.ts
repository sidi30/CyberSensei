interface ReportData {
  tenantDomain: string;
  scanDate: string;
  globalScore: number;
  globalGrade: string;
  categoryScores: Record<string, { score: number; grade: string; findings: number; weight: number }>;
  totalFindings: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
  executiveSummary: string;
  recommendations: string;
  categoryAnalyses: Record<string, string>;
  findings: Array<{
    category: string;
    severity: string;
    title: string;
    description: string;
    remediation?: string;
  }>;
}

function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    A: '#22c55e',
    B: '#84cc16',
    C: '#eab308',
    D: '#f97316',
    E: '#ef4444',
    F: '#dc2626',
  };
  return colors[grade] || '#6b7280';
}

function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    CRITICAL: '#dc2626',
    HIGH: '#ef4444',
    MEDIUM: '#f97316',
    LOW: '#eab308',
    INFO: '#3b82f6',
  };
  return colors[severity] || '#6b7280';
}

export function generateReportHtml(data: ReportData): string {
  const categoryRows = Object.entries(data.categoryScores)
    .sort(([, a], [, b]) => a.score - b.score)
    .map(
      ([cat, score]) => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${cat}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        <span style="background: ${getGradeColor(score.grade)}; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${score.grade}</span>
      </td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${score.score}/100</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${score.findings}</td>
    </tr>`,
    )
    .join('');

  const findingRows = data.findings
    .sort((a, b) => {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
      return (order[a.severity] ?? 5) - (order[b.severity] ?? 5);
    })
    .map(
      (f) => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">
        <span style="background: ${getSeverityColor(f.severity)}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">${f.severity}</span>
      </td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${f.category}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${f.title}</strong><br/>
        <span style="color: #6b7280; font-size: 12px;">${f.description}</span>
        ${f.remediation ? `<br/><em style="color: #059669; font-size: 12px;">Remediation: ${f.remediation}</em>` : ''}
      </td>
    </tr>`,
    )
    .join('');

  const categoryAnalysisSections = Object.entries(data.categoryAnalyses)
    .map(
      ([cat, analysis]) => `
    <div style="margin-bottom: 20px;">
      <h3 style="color: #1f2937; border-bottom: 2px solid ${getGradeColor(data.categoryScores[cat]?.grade || 'C')}; padding-bottom: 5px;">
        ${cat} — ${data.categoryScores[cat]?.grade || 'N/A'} (${data.categoryScores[cat]?.score || 0}/100)
      </h3>
      <p style="color: #374151; line-height: 1.6; white-space: pre-wrap;">${analysis}</p>
    </div>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 40px; color: #1f2937; }
    .header { text-align: center; margin-bottom: 40px; }
    .score-circle { width: 150px; height: 150px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-direction: column; margin: 20px auto; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { background: #f3f4f6; padding: 10px 12px; text-align: left; border-bottom: 2px solid #d1d5db; }
    .page-break { page-break-before: always; }
    .section { margin-bottom: 30px; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="color: #111827; margin-bottom: 5px;">Rapport de Securite Microsoft 365</h1>
    <h2 style="color: #6b7280; font-weight: normal;">${data.tenantDomain}</h2>
    <p style="color: #9ca3af;">Date du scan: ${data.scanDate}</p>
    <div class="score-circle" style="background: ${getGradeColor(data.globalGrade)};">
      <span style="font-size: 48px; font-weight: bold; color: white;">${data.globalGrade}</span>
      <span style="font-size: 18px; color: white;">${data.globalScore}/100</span>
    </div>
  </div>

  <div class="section">
    <h2 style="color: #111827;">Resume Executif</h2>
    <p style="line-height: 1.7; color: #374151; white-space: pre-wrap;">${data.executiveSummary}</p>
  </div>

  <div class="section">
    <h2 style="color: #111827;">Vue d'ensemble par Categorie</h2>
    <table>
      <thead>
        <tr>
          <th>Categorie</th>
          <th style="text-align: center;">Grade</th>
          <th style="text-align: center;">Score</th>
          <th style="text-align: center;">Problemes</th>
        </tr>
      </thead>
      <tbody>${categoryRows}</tbody>
    </table>
  </div>

  <div class="section">
    <h2 style="color: #111827;">Statistiques</h2>
    <p><strong>Total:</strong> ${data.totalFindings} probleme(s) detecte(s)</p>
    <p><span style="color: #dc2626;">Critiques: ${data.criticalFindings}</span> | <span style="color: #ef4444;">Eleves: ${data.highFindings}</span> | <span style="color: #f97316;">Moyens: ${data.mediumFindings}</span> | <span style="color: #eab308;">Faibles: ${data.lowFindings}</span></p>
  </div>

  <div class="page-break"></div>

  <div class="section">
    <h2 style="color: #111827;">Analyse Detaillee par Categorie</h2>
    ${categoryAnalysisSections}
  </div>

  <div class="page-break"></div>

  <div class="section">
    <h2 style="color: #111827;">Plan d'Action et Recommandations</h2>
    <p style="line-height: 1.7; color: #374151; white-space: pre-wrap;">${data.recommendations}</p>
  </div>

  <div class="page-break"></div>

  <div class="section">
    <h2 style="color: #111827;">Tous les Problemes Detectes</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 80px;">Severite</th>
          <th style="width: 120px;">Categorie</th>
          <th>Detail</th>
        </tr>
      </thead>
      <tbody>${findingRows}</tbody>
    </table>
  </div>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #d1d5db; text-align: center; color: #9ca3af; font-size: 12px;">
    <p>Rapport genere par Cyber Sensei — Plateforme de Monitoring M365</p>
    <p>Ce rapport est confidentiel et destine uniquement au tenant ${data.tenantDomain}</p>
  </div>
</body>
</html>`;
}
