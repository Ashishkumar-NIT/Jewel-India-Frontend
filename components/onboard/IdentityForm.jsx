export function IdentityForm() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-[13px] font-semibold text-[#374151]">Name*</label>
        <input
          id="name"
          type="text"
          placeholder="Parash Rautela"
          className="w-full bg-[#F5F5F5] rounded-[8px] border-none outline-none px-4 py-3.5 text-[15px] text-[#374151] placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-black/10 transition-shadow"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="aadhar" className="text-[13px] font-semibold text-[#374151]">Aadhar Number*</label>
        <input
          id="aadhar"
          type="text"
          placeholder="•••• •••• •••• &#42;&#42;&#42;&#42; &#42;&#42;&#42;&#42; &#42;&#42;&#42;&#42;"
          className="w-full bg-[#F5F5F5] rounded-[8px] border-none outline-none px-4 py-3.5 text-[15px] text-[#374151] placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-black/10 transition-shadow"
        />
      </div>
    </div>
  );
}