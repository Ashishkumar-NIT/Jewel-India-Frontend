export function Input({
  id,
  label,
  type = "text",
  placeholder,
  error,
  ...props
}) {
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
      <input
        id={id}
        type={type}
        className={`h-11 w-full border rounded-lg px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] placeholder:font-gilroy placeholder:font-semibold focus:outline-none transition-colors font-gilroy font-semibold ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
            : "border-[#e5e5e5] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
        }`}
        placeholder={placeholder}
        {...props}
      />
      {error && (
        <p className="text-xs font-semibold text-red-500 font-gilroy mt-0.5 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}
