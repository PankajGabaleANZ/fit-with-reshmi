import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useContent } from '../lib/useContent';

export default function Onboarding({ onComplete }: { onComplete: (answers: Record<string, string>) => void }) {
  const QUESTIONS = useContent().onboarding;
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [QUESTIONS[currentStep].id]: option });
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(answers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentQ = QUESTIONS[currentStep];
  const hasAnswer = !!answers[currentQ.id];

  return (
    <div className="max-w-2xl mx-auto bg-mashiro rounded-3xl shadow-2xl overflow-hidden border border-sakura">
      {/* Progress */}
      <div className="w-full bg-sakura/20 h-2 flex">
        {QUESTIONS.map((_, idx) => (
          <div key={idx} className="flex-1 px-1 py-1">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${idx <= currentStep ? 'bg-momo' : 'bg-transparent'}`} />
          </div>
        ))}
      </div>

      <div className="p-8 sm:p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-momo mb-2 tracking-tight">
              {currentQ.title}
            </h2>
            <p className="text-momo/70 font-light mb-8">
              {currentQ.subtitle}
            </p>

            <div className="space-y-4 mb-12">
              {currentQ.options.map((option) => {
                const isSelected = answers[currentQ.id] === option;
                return (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 ${
                      isSelected
                        ? 'border-momo bg-momo/5 text-momo shadow-[0_0_15px_rgba(245,143,152,0.1)]'
                        : 'border-sakura hover:border-momo/50 text-momo/80 hover:bg-sakura/10'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border flex-shrink-0 flex items-center justify-center ${
                      isSelected ? 'border-momo bg-momo' : 'border-sakura'
                    }`}>
                      {isSelected && <Check size={14} className="text-mashiro" />}
                    </div>
                    <span className="font-medium text-lg leading-snug">{option}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-auto">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
              currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-momo/70 hover:bg-sakura hover:text-momo'
            }`}
          >
            <ArrowLeft size={18} /> Back
          </button>

          <span className="text-sm font-medium text-momo/50">
            Step {currentStep + 1} of {QUESTIONS.length}
          </span>

          <button
            onClick={handleNext}
            disabled={!hasAnswer}
            className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${
              hasAnswer
                ? 'bg-momo text-mashiro hover:bg-momo/90 hover:scale-105 shadow-lg'
                : 'bg-sakura text-momo/50 cursor-not-allowed border border-sakura'
            }`}
          >
            {currentStep === QUESTIONS.length - 1 ? 'See My Results' : 'Next'} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
