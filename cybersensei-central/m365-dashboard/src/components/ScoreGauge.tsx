interface ScoreGaugeProps {
  score: number;
  grade: string;
  size?: 'sm' | 'md' | 'lg';
}

const gradeColors: Record<string, string> = {
  A: 'text-green-500 border-green-500',
  B: 'text-lime-500 border-lime-500',
  C: 'text-yellow-500 border-yellow-500',
  D: 'text-orange-500 border-orange-500',
  E: 'text-red-500 border-red-500',
  F: 'text-red-700 border-red-700',
};

const gradeBg: Record<string, string> = {
  A: 'bg-green-50',
  B: 'bg-lime-50',
  C: 'bg-yellow-50',
  D: 'bg-orange-50',
  E: 'bg-red-50',
  F: 'bg-red-100',
};

const sizes = {
  sm: 'w-16 h-16 text-xl',
  md: 'w-24 h-24 text-3xl',
  lg: 'w-36 h-36 text-5xl',
};

export default function ScoreGauge({ score, grade, size = 'lg' }: ScoreGaugeProps) {
  const colorClass = gradeColors[grade] || 'text-gray-500 border-gray-500';
  const bgClass = gradeBg[grade] || 'bg-gray-50';

  return (
    <div className={`${sizes[size]} rounded-full border-4 ${colorClass} ${bgClass} flex flex-col items-center justify-center`}>
      <span className="font-bold">{grade}</span>
      {size !== 'sm' && (
        <span className="text-sm text-gray-500">{score}/100</span>
      )}
    </div>
  );
}
