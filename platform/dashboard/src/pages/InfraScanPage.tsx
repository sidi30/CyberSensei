import { useState, useEffect } from 'react';
import { Radar, Play, Clock, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import api from '../lib/api';

interface ScanResult {
  id: string;
  tenantId: string;
  domain: string;
  score: number | null;
  previousScore: number | null;
  deltaScore: number | null;
  status: string;
  trigger: string;
  details: Record<string, any> | null;
  newRisks: string[] | null;
  resolvedRisks: string[] | null;
  errorMessage: string | null;
  durationMs: number | null;
  createdAt: string;
}

export default function InfraScanPage() {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanDomain, setScanDomain] = useState('');
  const [scanTenantId, setScanTenantId] = useState('');
  const [scanEmails, setScanEmails] = useState('');
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    try {
      setLoading(true);
      // Load recent scans across all tenants via direct API call
      const { data } = await (api as any).client.get('/infra-scan/history/all', { params: { limit: 50 } });
      setScans(data);
    } catch (err) {
      console.error('Failed to load scans:', err);
    } finally {
      setLoading(false);
    }
  };

  const launchScan = async () => {
    if (!scanDomain || !scanTenantId) return;
    try {
      setScanning(true);
      const emails = scanEmails ? scanEmails.split(',').map(e => e.trim()) : [];
      await (api as any).client.post('/infra-scan/launch', {
        tenantId: scanTenantId,
        domain: scanDomain,
        emails,
      });
      setScanDomain('');
      setScanEmails('');
      await loadScans();
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setScanning(false);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-400';
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number | null) => {
    if (score === null) return 'bg-gray-100';
    if (score >= 75) return 'bg-green-50';
    if (score >= 50) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      COMPLETED: 'bg-green-100 text-green-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      FAILED: 'bg-red-100 text-red-800',
      PENDING: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Infrastructure Scan</h1>
          <p className="text-gray-500">Nmap, Nuclei, SSL/TLS, DNS, HIBP, AbuseIPDB</p>
        </div>
        <Radar className="h-8 w-8 text-primary-600" />
      </div>

      {/* Launch Scan Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Lancer un scan</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            value={scanTenantId}
            onChange={(e) => setScanTenantId(e.target.value)}
            placeholder="Tenant ID"
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm px-3 py-2 border"
          />
          <input
            type="text"
            value={scanDomain}
            onChange={(e) => setScanDomain(e.target.value)}
            placeholder="example.com"
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm px-3 py-2 border"
          />
          <input
            type="text"
            value={scanEmails}
            onChange={(e) => setScanEmails(e.target.value)}
            placeholder="email1@ex.com, email2@ex.com"
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm px-3 py-2 border"
          />
          <button
            onClick={launchScan}
            disabled={scanning || !scanDomain || !scanTenantId}
            className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
          >
            <Play className="h-4 w-4 mr-2" />
            {scanning ? 'Scan en cours...' : 'Lancer'}
          </button>
        </div>
      </div>

      {/* Scan Results Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Historique des scans</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : scans.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucun scan effectué</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domaine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durée</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {scans.map((scan) => (
                <tr
                  key={scan.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedScan(selectedScan?.id === scan.id ? null : scan)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{scan.domain}</td>
                  <td className="px-6 py-4">
                    <span className={`text-lg font-bold ${getScoreColor(scan.score)}`}>
                      {scan.score !== null ? `${scan.score}/100` : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {scan.deltaScore !== null && (
                      <span className={`inline-flex items-center text-sm font-medium ${scan.deltaScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {scan.deltaScore >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                        {scan.deltaScore > 0 ? '+' : ''}{scan.deltaScore}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(scan.status)}`}>
                      {scan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {scan.durationMs ? `${(scan.durationMs / 1000).toFixed(1)}s` : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(scan.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Scan Details Panel */}
      {selectedScan && selectedScan.details && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Détails — {selectedScan.domain}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Object.entries(selectedScan.details).map(([module, data]: [string, any]) => (
              <div key={module} className={`rounded-lg p-4 ${data.skipped ? 'bg-gray-50' : data.error ? 'bg-red-50' : 'bg-green-50'}`}>
                <h3 className="font-medium text-sm uppercase text-gray-700">{module}</h3>
                {data.skipped ? (
                  <p className="text-xs text-gray-500 mt-1">Module ignoré</p>
                ) : data.error ? (
                  <p className="text-xs text-red-600 mt-1">{data.error}</p>
                ) : (
                  <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-32">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>

          {(selectedScan.newRisks?.length || 0) > 0 && (
            <div className="mb-4">
              <h3 className="font-medium text-red-700 mb-2 flex items-center"><AlertTriangle className="h-4 w-4 mr-2" /> Nouveaux risques</h3>
              <ul className="list-disc pl-5 text-sm text-red-600">
                {selectedScan.newRisks!.map((risk, i) => <li key={i}>{risk}</li>)}
              </ul>
            </div>
          )}

          {(selectedScan.resolvedRisks?.length || 0) > 0 && (
            <div>
              <h3 className="font-medium text-green-700 mb-2">Risques résolus</h3>
              <ul className="list-disc pl-5 text-sm text-green-600">
                {selectedScan.resolvedRisks!.map((risk, i) => <li key={i}>{risk}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
