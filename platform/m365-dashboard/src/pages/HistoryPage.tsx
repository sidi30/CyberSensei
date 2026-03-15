import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getScanHistory, getScoreHistory } from '../api';
import type { M365Scan, M365Score } from '../types';

export default function HistoryPage() {
  const [scans, setScans] = useState<M365Scan[]>([]);
  const [scores, setScores] = useState<M365Score[]>([]);
  const [, setTotal] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [scanData, scoreData] = await Promise.all([
        getScanHistory(50),
        getScoreHistory(50),
      ]);
      setScans(scanData.scans);
      setTotal(scanData.total);
      setScores(scoreData.reverse());
    } catch {
      // Handle error
    }
  }

  const statusColors: Record<string, string> = {
    COMPLETED: 'bg-green-100 text-green-700',
    PARTIAL: 'bg-yellow-100 text-yellow-700',
    FAILED: 'bg-red-100 text-red-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    PENDING: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Historique des scans</h1>

      {/* Score Evolution */}
      {scores.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold mb-4">Evolution du score</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scores.map((s) => ({
              date: new Date(s.calculatedAt).toLocaleDateString('fr-FR'),
              score: s.globalScore,
              grade: s.globalGrade,
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis domain={[0, 100]} fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Scan Timeline */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Statut</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Declencheur</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Problemes</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Critiques</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Duree</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((s) => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">
                  {new Date(s.createdAt).toLocaleString('fr-FR')}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[s.status] || ''}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{s.trigger}</td>
                <td className="px-4 py-3 text-center">{s.totalFindings}</td>
                <td className="px-4 py-3 text-center text-red-600 font-medium">
                  {s.criticalFindings > 0 ? s.criticalFindings : '-'}
                </td>
                <td className="px-4 py-3 text-center text-gray-500">
                  {s.durationMs ? `${(s.durationMs / 1000).toFixed(1)}s` : '-'}
                </td>
              </tr>
            ))}
            {scans.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Aucun scan effectue
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
