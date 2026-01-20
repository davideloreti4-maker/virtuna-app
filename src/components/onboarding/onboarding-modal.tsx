'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, TrendingUp, Zap, ChevronRight, ChevronLeft } from 'lucide-react'
import { useUpdateOnboarding } from '@/lib/hooks/use-onboarding'
import {
  trackOnboardingShown,
  trackOnboardingStepViewed,
  trackOnboardingCompleted,
  trackOnboardingSkipped,
} from '@/lib/analytics'

interface OnboardingStep {
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

const steps: OnboardingStep[] = [
  {
    title: 'Analyze Any TikTok',
    description: 'Paste any TikTok URL and our AI will predict its viral potential with a score from 0-100.',
    icon: <Sparkles className="w-8 h-8" />,
    color: '#7C3AED',
  },
  {
    title: 'Get Actionable Insights',
    description: 'Discover what makes videos go viral: hook strength, trend relevance, audio selection, and timing.',
    icon: <TrendingUp className="w-8 h-8" />,
    color: '#FF5757',
  },
  {
    title: 'Improve & Track Progress',
    description: 'Apply AI suggestions to boost your content. Track your scores over time and watch yourself improve.',
    icon: <Zap className="w-8 h-8" />,
    color: '#10B981',
  },
]

interface OnboardingModalProps {
  onComplete: () => void
  onSkip: () => void
}

export function OnboardingModal({ onComplete, onSkip }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const { mutate: updateOnboarding } = useUpdateOnboarding()

  const isLastStep = currentStep === steps.length - 1
  const step = steps[currentStep]

  // Track onboarding shown on mount
  useEffect(() => {
    trackOnboardingShown()
    trackOnboardingStepViewed(0, steps[0].title)
  }, [])

  // Track step changes
  useEffect(() => {
    if (currentStep > 0) {
      trackOnboardingStepViewed(currentStep, steps[currentStep].title)
    }
  }, [currentStep])

  const handleNext = () => {
    if (isLastStep) {
      handleComplete()
    } else {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1)
        setIsAnimating(false)
      }, 150)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep((prev) => prev - 1)
        setIsAnimating(false)
      }, 150)
    }
  }

  const handleComplete = () => {
    trackOnboardingCompleted(currentStep + 1)
    updateOnboarding({ has_seen_onboarding: true })
    onComplete()
  }

  const handleSkip = () => {
    trackOnboardingSkipped(currentStep)
    updateOnboarding({ has_seen_onboarding: true })
    onSkip()
  }

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel-strong w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="text-[var(--text-muted)] text-sm">
            Step {currentStep + 1} of {steps.length}
          </span>
          <button
            onClick={handleSkip}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-[var(--text-muted)] hover:text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className={`p-8 text-center transition-opacity duration-150 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          {/* Icon */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${step.color}20`, color: step.color }}
          >
            {step.icon}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>

          {/* Description */}
          <p className="text-[var(--text-secondary)] leading-relaxed">{step.description}</p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 pb-4">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-6 bg-[var(--accent-primary)]'
                  : 'bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 p-4 border-t border-white/10">
          {currentStep > 0 ? (
            <button
              onClick={handleBack}
              className="btn btn-secondary px-4 py-2.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="text-[var(--text-muted)] hover:text-white text-sm transition-colors"
            >
              Skip tour
            </button>
          )}

          <button
            onClick={handleNext}
            className="btn btn-virtuna flex-1 px-4 py-2.5"
          >
            {isLastStep ? (
              <>
                Get Started
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
