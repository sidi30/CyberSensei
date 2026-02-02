import { useState, useEffect } from 'react';
import type { ApiClient } from '../hooks/useApi';
import type { ManagerMetrics } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';

interface CompanyInsightsSectionProps {
  apiClient: ApiClient;
}

export function CompanyInsightsSection({ apiClient }: CompanyInsightsSectionProps) {
  const [metrics, setMetrics] = useState<ManagerMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getManagerMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Error loading metrics:', err);
      
      // Mock data pour graphiques
      if (import.meta.env.DEV) {
        setMetrics({
          companyScore: 78,
          averageScore: 75.5,
          totalUsers: 156,
          activeUsers: 142,
          completedExercises: 1247,
          departments: [
            { name: 'IT', averageScore: 85, userCount: 45 },
            { name: 'Marketing', averageScore: 72, userCount: 32 },
            { name: 'Finance', averageScore: 68, userCount: 28 },
            { name: 'HR', averageScore: 75, userCount: 22 },
            { name: 'Sales', averageScore: 65, userCount: 29 },
          ],
          topics: [
            { name: 'Phishing', averageScore: 82, completionRate: 95 },
            { name: 'Mots de passe', averageScore: 78, completionRate: 90 },
            { name: 'Malware', averageScore: 71, completionRate: 85 },
            { name: 'Ingénierie sociale', averageScore: 68, completionRate: 80 },
            { name: 'Sécurité physique', averageScore: 75, completionRate: 88 },
          ],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  // Default data if not provided by API
  const departments = metrics.departments || [
    { name: 'IT', averageScore: 75, userCount: 10 },
    { name: 'Marketing', averageScore: 68, userCount: 8 },
    { name: 'Finance', averageScore: 72, userCount: 6 },
  ];
  
  const topics = metrics.topics || [
    { name: 'Phishing', averageScore: 78, completionRate: 85 },
    { name: 'Mots de passe', averageScore: 72, completionRate: 80 },
    { name: 'Ingénierie sociale', averageScore: 65, completionRate: 70 },
  ];

  const bestDepartment = departments.length > 0 
    ? departments.reduce((max, dept) => dept.averageScore > max.averageScore ? dept : max)
    : { name: 'N/A', averageScore: 0 };
    
  const bestTopic = topics.length > 0
    ? topics.reduce((max, topic) => topic.averageScore > max.averageScore ? topic : max)
    : { name: 'N/A', averageScore: 0 };
    
  const worstTopic = topics.length > 0
    ? topics.reduce((min, topic) => topic.averageScore < min.averageScore ? topic : min)
    : { name: 'N/A', averageScore: 0 };

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">
          Insights de l'entreprise
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique par Département */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Performance par département
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departments}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar 
                dataKey="averageScore" 
                fill="#0078d4" 
                radius={[8, 8, 0, 0]}
                name="Score moyen (%)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique par Sujet */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Performance par sujet
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={topics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                stroke="#6b7280"
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="averageScore" 
                stroke="#0078d4" 
                strokeWidth={2}
                dot={{ fill: '#0078d4', r: 4 }}
                name="Score moyen (%)"
              />
              <Line 
                type="monotone" 
                dataKey="completionRate" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                name="Taux de completion (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-700 mb-1">Meilleur département</div>
          <div className="text-xl font-bold text-blue-900">
            {bestDepartment.name}
          </div>
          <div className="text-sm text-blue-700 mt-1">
            {bestDepartment.averageScore.toFixed(1)}% de moyenne
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-700 mb-1">Sujet le mieux maîtrisé</div>
          <div className="text-xl font-bold text-purple-900">
            {bestTopic.name}
          </div>
          <div className="text-sm text-purple-700 mt-1">
            {bestTopic.averageScore.toFixed(1)}% de moyenne
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
          <div className="text-sm text-amber-700 mb-1">Points d'attention</div>
          <div className="text-xl font-bold text-amber-900">
            {worstTopic.name}
          </div>
          <div className="text-sm text-amber-700 mt-1">
            {worstTopic.averageScore.toFixed(1)}% nécessite amélioration
          </div>
        </div>
      </div>
    </div>
  );
}

