import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';

export default function ExercisesPanel() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exercices</h1>
          <p className="text-gray-600 mt-1">Gérer les exercices de formation</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nouvel exercice
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 btn-secondary">
          <Filter className="w-4 h-4" />
          Filtres
        </button>
        <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} className="input">
          <option value="all">Tous les exercices</option>
          <option value="MCQ">QCM</option>
          <option value="TRUE_FALSE">Vrai/Faux</option>
          <option value="SIMULATION">Simulation</option>
        </select>
      </div>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Exercise #{i}</h3>
                <p className="text-sm text-gray-600 mt-1">Topic Placeholder</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                i % 3 === 0 ? 'bg-success-100 text-success-800' :
                i % 3 === 1 ? 'bg-warning-100 text-warning-800' :
                'bg-danger-100 text-danger-800'
              }`}>
                {i % 3 === 0 ? 'EASY' : i % 3 === 1 ? 'MEDIUM' : 'HARD'}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-4">Description de l'exercice placeholder...</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{Math.floor(Math.random() * 100)}% complété</span>
              <button className="text-primary-600 hover:text-primary-800 font-medium">
                Modifier
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


