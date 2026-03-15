interface SeverityBadgeProps {
  severity: string;
}

const severityStyles: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  LOW: 'bg-blue-100 text-blue-800 border-blue-200',
  INFO: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${severityStyles[severity] || severityStyles.INFO}`}>
      {severity}
    </span>
  );
}
