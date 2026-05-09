"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const QUESTIONS = [
  {
    id: "occasion",
    title: "What's the occasion?",
    type: "single",
    options: ["Wedding", "Engagement", "Festival", "Gift", "Daily Wear", "Party"]
  },
  {
    id: "material",
    title: "Select material",
    type: "multiple",
    options: ["Gold", "Silver", "Platinum", "Diamond", "Artificial"]
  },
  {
    id: "style",
    title: "What are you drawn to?",
    type: "single",
    options: ["Traditional", "Modern", "Minimalist", "Statement", "Fusion"]
  },
  {
    id: "type",
    title: "Jewel type",
    type: "multiple",
    options: ["Necklaces", "Rings", "Bangles", "Earrings", "Pendants", "View All"]
  },
  {
    id: "weight",
    title: "What weight?",
    type: "multiple",
    options: ["Light (0-5g)", "Medium (5-15g)", "Heavy (15-30g)", "Statement (30g+)"]
  }
];

export default function QuestionnaireFlow({ businessName }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Store answers as an object: { questionId: [selectedOptions] }
  const [answers, setAnswers] = useState({
    occasion: [],
    material: [],
    style: [],
    type: [],
    weight: []
  });

  const currentQ = QUESTIONS[currentStep];

  const handleToggleOption = (option) => {
    setAnswers(prev => {
      const currentSelections = prev[currentQ.id];
      
      if (currentQ.type === "single") {
        return { ...prev, [currentQ.id]: [option] };
      }
      
      // Handle Multiple Choice
      // Special case for 'View All' in jewel type
      if (currentQ.id === "type" && option === "View All") {
        return { ...prev, [currentQ.id]: ["View All"] };
      }
      
      let newSelections;
      if (currentSelections.includes(option)) {
        newSelections = currentSelections.filter(item => item !== option);
      } else {
        newSelections = [...currentSelections.filter(item => item !== "View All"), option];
      }
      return { ...prev, [currentQ.id]: newSelections };
    });
  };

  const handleNext = () => {
    // Validate selection
    if (answers[currentQ.id].length === 0) {
      alert("Please select at least one option.");
      return;
    }

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final Submit
      const params = new URLSearchParams();
      Object.entries(answers).forEach(([key, values]) => {
        if (values.length > 0) {
          params.append(key, values.join(","));
        }
      });
      router.push(`/dashboard/employee/playground?${params.toString()}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      router.push('/dashboard/employee');
    }
  };

  return (
    <div className="w-full flex flex-col bg-white min-h-[calc(100vh-64px)] relative">
      
      {/* ── Background Area ── */}
      <section className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1593693397690-362bb9a11866?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
          alt="Palace Archway" 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#fce4e4]/80 via-[#fadcdc]/70 to-[#fdf2f2]/90 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[#f9dada]/40"></div>
      </section>

      {/* ── Top Bar Overlay (Back Button) ── */}
      <div className="relative z-20 w-full px-6 py-6 flex justify-between items-center">
        <button 
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-10 flex flex-col items-center flex-1 justify-center px-4 pb-20">
        
        {/* Header Text */}
        <h1 className="font-serif text-[42px] md:text-[54px] text-[#2c1f18] mb-3 leading-tight text-center">
          {businessName}
        </h1>
        <p className="text-[13px] md:text-[15px] text-[#4a3b32] max-w-[320px] md:max-w-md mx-auto mb-10 leading-relaxed text-center">
          Discover designs selected with precision, blending craftsmanship and ethnic style
        </p>

        {/* ── Interactive Card ── */}
        <div className="w-[320px] md:w-[350px] min-h-[350px] rounded-[24px] overflow-hidden shadow-2xl border border-white/20 flex flex-col bg-gradient-to-b from-[#25362b] to-[#18251d]">
          
          <div className="flex-1 p-8 flex flex-col">
            <h3 className="text-white/90 text-[20px] font-serif leading-snug tracking-wide text-center mb-8">
              {currentQ.title}
            </h3>
            
            {/* Options Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 mb-8 flex-1 content-start">
              {currentQ.options.map(option => {
                const isSelected = answers[currentQ.id].includes(option);
                return (
                  <label 
                    key={option} 
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <span className="text-white/80 text-[14px] group-hover:text-white transition-colors select-none">
                      {option}
                    </span>
                    
                    {/* Checkbox / Radio Visual */}
                    <div className={`w-5 h-5 rounded-[4px] border flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-emerald-500 border-emerald-500' 
                        : 'border-white/40 bg-white/5 group-hover:border-white/70'
                    }`}>
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                    
                    {/* Hidden actual input */}
                    <input 
                      type={currentQ.type === "single" ? "radio" : "checkbox"} 
                      className="hidden"
                      checked={isSelected}
                      onChange={() => handleToggleOption(option)}
                    />
                  </label>
                );
              })}
            </div>
            
            {/* Action Button */}
            <div className="mt-auto pt-4">
              <button 
                onClick={handleNext}
                className="w-full py-3.5 rounded-lg bg-gradient-to-b from-[#2a2a2a] to-[#000000] text-white text-[14px] tracking-widest shadow-xl border border-white/10 hover:from-[#333] hover:to-[#111] transition-all"
              >
                {currentStep === QUESTIONS.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {QUESTIONS.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep ? 'w-6 bg-emerald-500' : 'w-2 bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
