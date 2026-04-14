'use client'

import { Loader2, Check } from 'lucide-react'

interface ProcessingStep {
  label: string
  status: 'pending' | 'active' | 'complete'
}

interface ProcessingStepsProps {
  steps: ProcessingStep[]
}

export function ProcessingSteps({ steps }: ProcessingStepsProps) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-[300px]" aria-live="polite">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-3">
          {/* Icon circle */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              step.status === 'complete'
                ? 'bg-[#00C853]'
                : step.status === 'active'
                  ? 'bg-[#FFE600]'
                  : 'bg-[#F5F5F5]'
            }`}
          >
            {step.status === 'complete' && (
              <Check className="w-5 h-5 text-white" />
            )}
            {step.status === 'active' && (
              <Loader2 className="w-5 h-5 text-[#212121] animate-spin" />
            )}
          </div>

          {/* Label */}
          <span
            className={`text-base ${
              step.status === 'complete'
                ? 'text-[#757575]'
                : step.status === 'active'
                  ? 'text-[#212121]'
                  : 'text-[#9E9E9E]'
            }`}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  )
}
