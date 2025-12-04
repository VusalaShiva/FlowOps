import React, { useState } from 'react';
import { UI_ICONS } from './Icons';

interface Step {
  title: string;
  description: string;
  image?: React.ReactNode;
}

const steps: Step[] = [
  {
    title: "Welcome to ctrlchecks",
    description: "Your visual studio for building AI workflows. Drag, drop, and connect nodes to create powerful automation pipelines in minutes.",
    image: UI_ICONS.wave
  },
  {
    title: "The Toolbox",
    description: "Your creative palette is on the left. Drag a Start trigger, Gemini LLM, or Code block onto the canvas to begin your journey.",
    image: UI_ICONS.drag
  },
  {
    title: "Connect & Flow",
    description: "Draw lines between nodes to pass data forward. Use 'If/Else' nodes to create smart branching logic based on your AI results.",
    image: <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
  },
  {
    title: "Fine-Tune Details",
    description: "Select any node to access the Properties Panel. Tweak system prompts, adjust AI temperature, or edit JavaScript code directly.",
    image: UI_ICONS.tune
  },
  {
    title: "Run & Debug",
    description: "Click 'Run Workflow' to see magic happen. The bottom panel displays real-time execution logs, inputs, and outputs for instant debugging.",
    image: UI_ICONS.play
  },
  {
    title: "Start Building",
    description: "You're all set! Use the 'Help' button in the sidebar if you need this tour again. Let's automate something amazing.",
    image: UI_ICONS.rocket
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingTour: React.FC<Props> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
      // Reset for next time if opened manually, though usually handled by parent
      setTimeout(() => setCurrentStep(0), 300); 
    }
  };

  const handleSkip = () => {
    onClose();
    setTimeout(() => setCurrentStep(0), 300);
  };

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  // Animation classes handled by global CSS or basic Tailwind
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col relative animate-in zoom-in">
        
        {/* Progress Bar */}
        <div className="h-1 bg-slate-800 w-full">
            <div 
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300" 
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-slate-700/50">
                {step.image}
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
            <p className="text-slate-400 leading-relaxed mb-8">
                {step.description}
            </p>

            <div className="flex items-center gap-3 w-full">
                {!isLast && (
                    <button 
                        onClick={handleSkip}
                        className="flex-1 py-3 px-4 rounded-xl text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors font-medium text-sm"
                    >
                        Skip Tour
                    </button>
                )}
                <button 
                    onClick={handleNext}
                    className={`
                        flex-1 py-3 px-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2
                        ${isLast 
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 w-full' 
                            : 'bg-blue-600 hover:bg-blue-500'
                        }
                    `}
                >
                    {isLast ? "Get Started" : "Next"} 
                    {!isLast && <span>→</span>}
                </button>
            </div>
        </div>

        {/* Dots */}
        <div className="pb-6 flex justify-center gap-2">
            {steps.map((_, idx) => (
                <div 
                    key={idx} 
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'bg-white w-6' : 'bg-slate-700'}`}
                />
            ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;