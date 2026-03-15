import { useState } from 'react';
import { FileText, Download, Mail, Loader2 } from 'lucide-react';
import api from '../lib/api';

const REPORT_LEVELS = [
  { value: 'soc1', label: 'SOC 1 — Analyse technique (IT Manager)', description: 'Résumé vulgarisé avec plan d\'action' },
  { value: 'soc2', label: 'SOC 2 — Audit infrastructure (Admin/RSSI)', description: 'Audit technique détaillé' },
  { value: 'soc3_alert', label: 'SOC 3 — Analyse avancée (SOC)', description: 'Analyse MITRE ATT&CK' },
  { value: 'nis2', label: 'NIS2 — Conformité réglementaire', description: 'Évaluation directive NIS2 (EU) 2022/2555' },
  { value: 'monthly', label: 'Mensuel — Synthèse exécutive', description: 'Résumé mensuel pour direction' },
];

export default function ReportsPage() {
  const [scanId, setScanId] = useState('');
  const [level, setLevel] = useState('soc1');
  const [companyName, setCompanyName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const generateReport = async () => {
    if (!scanId) return;
    try {
      setGenerating(true);
      setMessage(null);
      const { data } = await (api as any).client.post(`/reports/generate/${scanId}`, { level });
      setReport(data.report);
      setMessage({ type: 'success', text: 'Rapport généré avec succès' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la génération' });
    } finally {
      setGenerating(false);
    }
  };

  const downloadPdf = async () => {
    if (!scanId) return;
    try {
      setGenerating(true);
      await (api as any).client.post(`/reports/generate/${scanId}`, { level });
      // Now generate PDF
      const response = await (api as any).client.post('/reports/pdf', {
        scanResults: { domain: companyName, score: 0, company_name: companyName },
        level,
      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cybersensei-report-${companyName || 'scan'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Erreur lors du téléchargement PDF' });
    } finally {
      setGenerating(false);
    }
  };

  const emailReport = async () => {
    if (!scanId || !recipientEmail || !companyName) return;
    try {
      setSending(true);
      setMessage(null);
      await (api as any).client.post('/reports/email', {
        scanId,
        level,
        recipientEmail,
        companyName,
      });
      setMessage({ type: 'success', text: `Rapport envoyé à ${recipientEmail}` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de l\'envoi' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports IA</h1>
          <p className="text-gray-500">Génération de rapports SOC / NIS2 via Claude AI</p>
        </div>
        <FileText className="h-8 w-8 text-primary-600" />
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Générer un rapport</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scan ID</label>
            <input
              type="text"
              value={scanId}
              onChange={(e) => setScanId(e.target.value)}
              placeholder="UUID du scan"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm px-3 py-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Nom de l'entreprise"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm px-3 py-2 border"
            />
          </div>
        </div>

        {/* Level Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Type de rapport</label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {REPORT_LEVELS.map((l) => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                className={`text-left p-3 rounded-lg border-2 transition-colors ${
                  level === l.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-sm font-medium text-gray-900">{l.label}</p>
                <p className="text-xs text-gray-500 mt-1">{l.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={generateReport}
            disabled={generating || !scanId}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
          >
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
            Générer (Markdown)
          </button>
          <button
            onClick={downloadPdf}
            disabled={generating || !scanId}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger PDF
          </button>
        </div>

        {/* Email Section */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Envoyer par email</h3>
          <div className="flex gap-3">
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="destinataire@example.com"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm px-3 py-2 border"
            />
            <button
              onClick={emailReport}
              disabled={sending || !scanId || !recipientEmail || !companyName}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
              Envoyer
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`rounded-lg p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Generated Report Preview */}
      {report && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Aperçu du rapport</h2>
          <div className="prose prose-sm max-w-none bg-gray-50 p-6 rounded-lg overflow-auto max-h-[600px]">
            <pre className="whitespace-pre-wrap text-sm text-gray-800">{report}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
