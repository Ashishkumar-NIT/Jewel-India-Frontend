import Link from "next/link";

function ChevronRight() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="black"
      viewBox="0 0 16 16"
      className="text-gray-400"
    >
      <path
        fillRule="evenodd"
        d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
      />
    </svg>
  );
}

export function TopStatCard({ icon, title, badge, href }) {
  const inner = (
    <div className="flex flex-row items-center justify-between">
      <div className="flex flex-row items-center gap-2.5">
        <span className="text-gray-700 w-5 h-5 flex items-center justify-center">
          {icon}
        </span>
        <span className="font-switzer text-s font-medium text-gray-700">{title}</span>
        <span className="text-xs font-semibold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md">
          {badge}
        </span>
      </div>
      <ChevronRight />
    </div>
  );

  const containerClasses = "flex-1 flex flex-col justify-center rounded-xl border border-[#e5e5e5] bg-white py-5 px-6 relative transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent " + (href ? "hover:bg-gray-50 cursor-pointer" : "");

  if (href) {
    return (
      <Link href={href} className={containerClasses}>
        {inner}
      </Link>
    );
  }

  return <div className={containerClasses}>{inner}</div>;
}

export function BottomStatCard({ icon, title, value, href }) {
  const inner = (
    <div className="flex flex-row items-center justify-between">
      <div className="flex flex-col">
        <span className="font-cirka text-[48px] font-medium leading-tight text-gray-900">
          {value}
        </span>
        <div className="flex flex-row items-center gap-2 mt-1">
          <span className="text-gray-700 w-4 h-4 flex items-center justify-center">
            {icon}
          </span>
          <span className="text-s font-medium text-gray-700">{title}</span>
        </div>
      </div>
      <ChevronRight />
    </div>
  );

  const containerClasses = "flex-1 flex flex-col justify-center rounded-xl border border-[#e5e5e5] bg-white py-5 px-6 relative transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent " + (href ? "hover:bg-gray-50 cursor-pointer" : "");

  if (href) {
    return (
      <Link href={href} className={containerClasses}>
        {inner}
      </Link>
    );
  }

  return <div className={containerClasses}>{inner}</div>;
}
