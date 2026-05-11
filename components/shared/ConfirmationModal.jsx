export function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger" // "danger" | "primary" | "success"
}) {
  if (!isOpen) return null;

  const themes = {
    danger: {
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
      buttonBg: "bg-red-600 hover:bg-red-700 shadow-red-200",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      )
    },
    primary: {
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      buttonBg: "bg-[#111827] hover:bg-black shadow-gray-200",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      )
    },
    success: {
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      buttonBg: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      )
    }
  };

  const theme = themes[variant] || themes.danger;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8 text-center">
          {/* Icon Container */}
          <div className={`mx-auto flex items-center justify-center w-14 h-14 rounded-full ${theme.iconBg} mb-6`}>
            <svg className={`w-7 h-7 ${theme.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {theme.icon}
            </svg>
          </div>
          
          <h3 className="text-[22px] font-bold text-[#111827] mb-2">{title}</h3>
          <p className="text-[14px] text-gray-500 leading-relaxed mb-8 px-2">
            {message}
          </p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              className={`w-full py-3.5 ${theme.buttonBg} text-white text-[15px] font-bold rounded-xl transition-all active:scale-[0.98] shadow-sm`}
            >
              {confirmText}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-gray-50 text-gray-600 text-[15px] font-bold rounded-xl hover:bg-gray-100 transition-all active:scale-[0.98]"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
