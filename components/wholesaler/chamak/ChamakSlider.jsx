"use client";

export default function ChamakSlider({
  label,
  value = 50,
  onChange,
  design1Label = "Design 1",
  design2Label = "Design 2",
}) {
  const d1Percent = 100 - value;
  const d2Percent = value;

  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-white border border-celestique-taupe shadow-2xs hover:border-celestique-dark/60 transition-all">
      {/* Label and Percentage Balance */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-celestique-dark font-sans tracking-wide">
          {label}
        </span>
        <span className="text-[11px] font-semibold text-celestique-muted font-sans">
          <span className="text-[#D4AF37]">{d1Percent}%</span> / <span className="text-[#3B82F6]">{d2Percent}%</span>
        </span>
      </div>

      {/* Range Slider Track */}
      <div className="relative flex items-center py-2">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer focus:outline-none"
          style={{
            background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${d1Percent}%, #3B82F6 ${d1Percent}%, #3B82F6 100%)`,
          }}
        />
      </div>

      {/* End Labels */}
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
        <span className="text-[#D4AF37] truncate max-w-[45%]">
          ← {design1Label}
        </span>
        <span className="text-[#3B82F6] truncate max-w-[45%] text-right">
          {design2Label} →
        </span>
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #111111;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.1s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #111111;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
