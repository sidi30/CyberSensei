import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import SeverityBadge from '../components/SeverityBadge';
import { getLatestScan, getScanFindings } from '../api';
import type { M365Finding } from '../types';

const categories = [
  '', 'MFA', 'ADMIN_ROLES', 'EMAIL_FORWARDING', 'SHARING', 'EMAIL_SECURITY',
  'OAUTH_APPS', 'PASSWORD_POLICY', 'CONDITIONAL_ACCESS', 'MAILBOX', 'SIGN_IN',
];

const severities = ['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];

export default function FindingsPage() {
  const [findings, setFindings] = useState<M365Finding[]>([]);
  const [total, setTotal] = useState(0);
  const [scanId, setScanId] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadScanId();
  }, []);

  useEffect(() => {
    if (scanId) loadFindings();
  }, [scanId, category, severity, page]);

  async function loadScanId() {
    try {
      const scan = await getLatestScan();
      setScanId(scan.id);
    } catch {
      // No scan available
    }
  }

  async function loadFindings() {
    try {
      const data = await getScanFindings(scanId, category || undefined, severity || undefined, limit, page * limit);
      setFindings(data.findings);
      setTotal(data.total);
    } catch {
      // Handle error
    }
  }

  const filtered = search
    ? findings.filter((f) =>
        f.title.toLowerCase().includes(search.toLowerCase()) ||
        f.description.toLowerCase().includes(search.toLowerCase()),
      )
    : findings;

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Problemes detectes</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyber-400"
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(0); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyber-400"
        >
          <option value="">Toutes categories</option>
          {categories.filter(Boolean).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={severity}
          onChange={(e) => { setSeverity(e.target.value); setPage(0); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyber-400"
        >
          <option value="">Toutes severites</option>
          {severities.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left font-medium text-gray-600">Severite</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Categorie</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Titre</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ressource</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3"><SeverityBadge severity={f.severity} /></td>
                <td className="px-4 py-3 text-gray-600">{f.category}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{f.title}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{f.description}</div>
                  {f.remediation && (
                    <div className="text-xs text-green-700 mt-1">Remediation: {f.remediation}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{f.resource || '-'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  Aucun probleme trouve
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">{total} resultat(s)</div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            >
              Precedent
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Page {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
