import React from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface EvaluationProgressProps {
  currentStage: string | null;
}

const stages = [
  { id: 'processing', label: 'Processing the repo' },
  { id: 'analyzing', label: 'Analyzing the repo' },
  { id: 'preparing', label: 'Preparing the report' }
];

const EvaluationProgress: React.FC<EvaluationProgressProps> = ({ currentStage }) => {
  const getStageIndex = (stage: string | null) => {
    if (!stage) return -1;
    return stages.findIndex(s => s.label === stage);
  };

  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={stage.id} className="flex flex-col items-center">
              <div className="relative">
                {isCompleted ? (
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                ) : isCurrent ? (
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                ) : (
                  <Circle className="w-8 h-8 text-gray-300" />
                )}
                {index < stages.length - 1 && (
                  <div 
                    className={`absolute top-4 left-8 w-full h-0.5 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
              <span className={`mt-2 text-sm font-medium ${
                isCurrent ? 'text-primary-600' : 
                isCompleted ? 'text-green-600' : 'text-gray-500'
              }`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EvaluationProgress; 