"use client";

export function EmployeeCredentialsModal({ employee, businessName, isOpen, onClose }) {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[20px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col transform transition-all">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-[18px] font-extrabold text-[#111827] tracking-tight">
            Employee Accounts Created
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-[18px] h-[18px]">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <p className="text-[14px] text-gray-500 leading-relaxed">
            Please copy these credentials and securely share them with your employee. They will need these to log in to the platform.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
            <div className="pb-4 border-b border-gray-200">
              <span className="text-[12px] font-bold tracking-wider text-gray-500 uppercase mb-1 block">Full Name</span>
              <span className="text-[16px] font-medium text-gray-900">{employee.full_name}</span>
            </div>
            
            <div className="pb-4 border-b border-gray-200">
              <span className="text-[12px] font-bold tracking-wider text-gray-500 uppercase mb-1 block">Role / Designation</span>
              <span className="text-[16px] font-medium text-gray-900 bg-white border border-gray-200 px-3 py-1 rounded-full text-sm inline-block">{employee.designation}</span>
            </div>
            
            <div className="pb-4 border-b border-gray-200">
              <span className="text-[12px] font-bold tracking-wider text-gray-500 uppercase mb-1 block">Login Email</span>
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-medium text-gray-900 font-mono tracking-tight">{employee.email}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(employee.email)}
                  className="text-blue-600 hover:text-blue-800 text-[12px] font-bold pr-1"
                >
                  COPY
                </button>
              </div>
            </div>

            <div>
              <span className="text-[12px] font-bold tracking-wider text-gray-500 uppercase mb-1 block">Generated Password</span>
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-medium text-gray-900 font-mono tracking-tight bg-yellow-100 px-2 py-0.5 rounded">{employee.password_plain}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(employee.password_plain)}
                  className="text-blue-600 hover:text-blue-800 text-[12px] font-bold pr-1"
                >
                  COPY
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-[#111827] text-white font-bold py-3.5 rounded-[12px] hover:bg-black transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}