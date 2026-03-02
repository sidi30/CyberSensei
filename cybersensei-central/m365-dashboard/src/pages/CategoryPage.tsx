import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ScoreGauge from '../components/ScoreGauge';
import SeverityBadge from '../components/SeverityBadge';
import { getLatestScore, getLatestScan, getScanFindings } from '../api';
import type { M365Score, M365Finding, CategoryScore } from '../types';

const categoryLabels: Record<string, string> = {
  MFA: 'Authentification Multi-Facteur',
  ADMIN_ROLES: 'Roles Administrateurs',
  EMAIL_FORWARDING: 'Transfert d\'Emails',
  SHARING: 'Partage SharePoint/OneDrive',
  EMAIL_SECURITY: 'Securite Email (SPF/DKIM/DMARC)',
  OAUTH_APPS: 'Applications OAuth',
  PASSWORD_POLICY: 'Politique de Mots de Passe',
  CONDITIONAL_ACCESS: 'Acces Conditionnel',
  MAILBOX: 'Boites Mail',
  SIGN_IN: 'Connexions',
};

export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [score, setScore] = useState<M365Score | null>(null);
  const [findings, setFindings] = useState<M365Finding[]>([]);
  const [catScore, setCatScore] = useState<CategoryScore | null>(null);

  useEffect(() => {
    loadData();
  }, [categoryId]);

  async function loadData() {
    try {
      const [scoreData, scanData] = await Promise.all([
        getLatestScore(),
        getLatestScan(),
      ]);
      setScore(scoreData);
      setCatScore(scoreData.categoryScores[categoryId!] || null);

      const { findings: f } = await getScanFindings(scanData.id, categoryId, undefined, 100);
      setFindings(f);
    } catch {
      // Handle error
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/overview" className="flex items-center gap-1 text-sm text-cyber-600 hover:underline mb-2">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
        <h1 className="text-2xl font-bold">{categoryLabels[categoryId!] || categoryId}</h1>
      </div>

      {catScore && (
        <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-8">
          <ScoreGauge score={catScore.score} grade={catScore.grade} size="md" />
          <div>
            <p className="text-gray-700">
              <strong>{catScore.findings}</strong> probleme(s) detecte(s) dans cette categorie.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Poids dans le score global: <strong>{catScore.weight}%</strong>
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <h3 className="font-semibold px-6 pt-4 pb-2">Problemes</h3>
        <div className="divide-y">
          {findings.map((f) => (
            <div key={f.id} className="px-6 py-4">
              <div className="flex items-center gap-3 mb-1">
                <SeverityBadge severity={f.severity} />
                <span className="font-medium">{f.title}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{f.description}</p>
              {f.remediation && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                  <strong>Remediation:</strong> {f.remediation}
                </div>
              )}
              {f.resource && (
                <div className="text-xs text-gray-400 mt-2">Ressource: {f.resource}</div>
              )}
            </div>
          ))}
          {findings.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-400">
              Aucun probleme dans cette categorie
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
