import { HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface MetricTooltipProps {
  title: string;
  description: string;
}

export function MetricTooltip({ title, description }: MetricTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="text-gray-400 hover:text-gray-300 transition-colors"
        type="button"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isVisible && (
        <div className="absolute z-50 w-64 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl bottom-full left-1/2 transform -translate-x-1/2 mb-2">
          <div className="font-semibold text-white mb-1 text-sm">{title}</div>
          <div className="text-xs text-gray-300">{description}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-8 border-transparent border-t-gray-800" />
          </div>
        </div>
      )}
    </div>
  );
}
