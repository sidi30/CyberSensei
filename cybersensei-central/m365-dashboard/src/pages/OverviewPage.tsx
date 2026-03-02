import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ScoreGauge from '../components/ScoreGauge';
import SeverityBadge from '../components/SeverityBadge';
import { getLatestScore, getLatestScan, getScoreHistory, triggerScan } from '../api';
import type { M365Score, M365Scan, M365Finding } from '../types';

const categoryLabels: Record<string, string> = {
  MFA: 'MFA',
  ADMIN_ROLES: 'Admins',
  EMAIL_FORWARDING: 'Transferts',
  SHARING: 'Partages',
  EMAIL_SECURITY: 'Email (SPF/DKIM)',
  OAUTH_APPS: 'Apps OAuth',
  PASSWORD_POLICY: 'Mots de passe',
  CONDITIONAL_ACCESS: 'Acces cond.',
  MAILBOX: 'Boites mail',
  SIGN_IN: 'Connexions',
};

export default function OverviewPage() {
  const [score, setScore] = useState<M365Score | null>(null);
  const [scan, setScan] = useState<M365Scan | null>(null);
  const [history, setHistory] = useState<M365Score[]>([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [s, sc, h] = await Promise.allSettled([
        getLatestScore(),
        getLatestScan(),
        getScoreHistory(30),
      ]);
      if (s.status === 'fulfilled') setScore(s.value);
      if (sc.status === 'fulfilled') setScan(sc.value);
      if (h.status === 'fulfilled') setHistory(h.value.reverse());
    } catch {
      setError('Impossible de charger les donnees. Verifiez la connexion M365.');
    }
  }

  async function handleScan() {
    setScanning(true);
    try {
      await triggerScan();
      setTimeout(loadData, 3000);
    } catch {
      setError('Erreur lors du lancement du scan.');
    }
    setScanning(false);
  }

  const topFindings = (scan?.findings || [])
    .filter((f: M365Finding) => f.severity === 'CRITICAL' || f.severity === 'HIGH')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vue d'ensemble</h1>
          <p className="text-gray-500 text-sm">
            {scan?.completedAt
              ? `Dernier scan: ${new Date(scan.completedAt).toLocaleString('fr-FR')}`
              : 'Aucun scan effectue'}
          </p>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center gap-2 px-4 py-2 bg-cyber-600 text-white rounded-lg hover:bg-cyber-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Scan en cours...' : 'Lancer un scan'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {score ? (
        <>
          {/* Score + Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col items-center">
              <ScoreGauge score={score.globalScore} grade={score.globalGrade} />
              {score.scoreDelta !== null && (
                <div className={`flex items-center gap-1 mt-3 text-sm ${score.scoreDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {score.scoreDelta >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {score.scoreDelta > 0 ? '+' : ''}{score.scoreDelta} pts
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6 col-span-2">
              <h3 className="font-semibold mb-3">Statistiques</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{score.criticalFindings}</div>
                  <div className="text-xs text-gray-500">Critiques</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">{score.highFindings}</div>
                  <div className="text-xs text-gray-500">Eleves</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-700">{score.totalFindings}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyber-600">{score.globalScore}</div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Grid */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold mb-4">Scores par categorie</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(score.categoryScores).map(([cat, cs]) => (
                <Link
                  key={cat}
                  to={`/category/${cat}`}
                  className="border rounded-lg p-3 hover:border-cyber-400 transition-colors text-center"
                >
                  <ScoreGauge score={cs.score} grade={cs.grade} size="sm" />
                  <div className="text-xs text-gray-600 mt-2">{categoryLabels[cat] || cat}</div>
                  <div className="text-xs text-gray-400">{cs.findings} prob.</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Evolution Chart */}
          {history.length > 1 && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold mb-4">Evolution du score</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={history.map((h) => ({ date: new Date(h.calculatedAt).toLocaleDateString('fr-FR'), score: h.globalScore }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis domain={[0, 100]} fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Findings */}
          {topFindings.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold">Problemes prioritaires</h3>
              </div>
              <div className="space-y-3">
                {topFindings.map((f: M365Finding) => (
                  <div key={f.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <SeverityBadge severity={f.severity} />
                    <div>
                      <div className="font-medium text-sm">{f.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{f.description}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/findings" className="inline-block mt-3 text-sm text-cyber-600 hover:underline">
                Voir tous les problemes →
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun scan disponible</h3>
          <p className="text-gray-500 mb-4">Connectez votre tenant Microsoft 365 et lancez votre premier scan.</p>
          <Link to="/settings" className="text-cyber-600 hover:underline">
            Configurer la connexion M365 →
          </Link>
        </div>
      )}
    </div>
  );
}

function Shield(props: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
