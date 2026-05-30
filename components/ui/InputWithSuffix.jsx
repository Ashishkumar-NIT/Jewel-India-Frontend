export function InputWithSuffix({ id, label, suffix, helperText, error, ...props }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-semibold text-[#374151] font-gilroy"
        >
          {label}
        </label>
      )}
      <div
        className={`flex items-center border rounded-lg overflow-hidden transition-colors ${
          error
            ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
            : "border-[#e5e5e5] focus-within:border-[#3B82F6] focus-within:ring-1 focus-within:ring-[#3B82F6]"
        }`}
      >
        <input
          id={id}
          className="h-11 flex-1 px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] placeholder:font-gilroy placeholder:font-semibold focus:outline-none bg-transparent font-gilroy font-semibold"
          {...props}
        />
        <span className="h-11 flex items-center px-3 bg-[#F9FAFB] text-sm text-[#6B7280] border-l border-[#e5e5e5] font-gilroy font-semibold">
          {suffix}
        </span>
      </div>
      {error ? (
        <p className="text-xs font-semibold text-red-500 font-gilroy mt-0.5 animate-fade-in">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-[#9CA3AF] mt-0.5 font-gilroy">{helperText}</p>
      ) : null}
    </div>
  );
}
