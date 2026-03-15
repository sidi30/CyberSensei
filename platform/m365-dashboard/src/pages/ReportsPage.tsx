import { useEffect, useState } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { getLatestScan, generateReport, getReportDownloadUrl } from '../api';
import type { M365Scan } from '../types';

interface Report {
  reportId: string;
  filename: string;
}

export default function ReportsPage() {
  const [latestScan, setLatestScan] = useState<M365Scan | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const scan = await getLatestScan();
      setLatestScan(scan);
    } catch {
      // No scan yet
    }
  }

  async function handleGenerate() {
    if (!latestScan) return;
    setGenerating(true);
    setError('');
    try {
      const report = await generateReport(latestScan.id);
      setReports((prev) => [report, ...prev]);
    } catch (err: unknown) {
      setError('Erreur lors de la generation du rapport.');
    }
    setGenerating(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rapports</h1>
        <button
          onClick={handleGenerate}
          disabled={!latestScan || generating}
          className="flex items-center gap-2 px-4 py-2 bg-cyber-600 text-white rounded-lg hover:bg-cyber-700 disabled:opacity-50 transition-colors"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          {generating ? 'Generation en cours...' : 'Generer un rapport PDF'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {!latestScan && (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-400">
          Aucun scan disponible. Lancez un scan avant de generer un rapport.
        </div>
      )}

      {reports.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <h3 className="font-semibold px-6 pt-4 pb-2">Rapports generes</h3>
          <div className="divide-y">
            {reports.map((r) => (
              <div key={r.reportId} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-sm">{r.filename}</div>
                    <div className="text-xs text-gray-400">ID: {r.reportId}</div>
                  </div>
                </div>
                <a
                  href={getReportDownloadUrl(r.reportId)}
                  className="flex items-center gap-1 text-sm text-cyber-600 hover:underline"
                >
                  <Download className="w-4 h-4" />
                  Telecharger
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold mb-3">A propos des rapports</h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>Les rapports PDF incluent un resume executif genere par IA (Claude).</li>
          <li>Chaque rapport contient l'analyse detaillee des 10 categories de securite.</li>
          <li>Les recommandations sont priorisees et adaptees a votre contexte PME.</li>
          <li>Les rapports peuvent etre partages avec votre direction ou vos auditeurs.</li>
        </ul>
      </div>
    </div>
  );
}
