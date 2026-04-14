'use client'

import { useTranslations } from 'next-intl'

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3
  totalSteps?: number
}

export function StepIndicator({ currentStep, totalSteps = 3 }: StepIndicatorProps) {
  const t = useTranslations('auth.register')

  return (
    <div className="px-4 pt-4 pb-2">
      <div
        className="flex items-center justify-center gap-2"
        aria-label="Registration progress"
        role="group"
      >
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1
          const isCompleted = step < currentStep
          const isActive = step === currentStep
          const isUpcoming = step > currentStep

          // Connector line (between dots, not after last dot)
          const showConnector = step < totalSteps
          // Connector is blue if connecting from a completed/active dot to the next
          const connectorFilled = step < currentStep || (step === currentStep && false)
          const connectorBlue = step < currentStep

          return (
            <div key={step} className="flex items-center gap-2">
              {/* Step dot */}
              {isCompleted && (
                <div
                  className="w-2 h-2 rounded-full bg-[#0091EA]"
                  aria-label={`Step ${step} complete`}
                />
              )}
              {isActive && (
                <div
                  className="w-3 h-3 rounded-full bg-[#FFE600] ring-2 ring-[#FFE600]/30"
                  aria-current="step"
                  aria-label={`Step ${step} current`}
                />
              )}
              {isUpcoming && (
                <div
                  className="w-2 h-2 rounded-full bg-[#E0E0E0]"
                  aria-label={`Step ${step} upcoming`}
                />
              )}

              {/* Connector line */}
              {showConnector && (
                <div
                  className={`flex-1 max-w-8 h-px ${connectorBlue ? 'bg-[#0091EA]' : 'bg-[#E0E0E0]'}`}
                />
              )}
            </div>
          )
        })}
      </div>
      <p className="text-xs uppercase text-[#757575] tracking-widest text-center mt-1">
        {t('stepLabel', { current: currentStep, total: totalSteps })}
      </p>
    </div>
  )
}
