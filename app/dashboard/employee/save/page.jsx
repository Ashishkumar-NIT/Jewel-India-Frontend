export const metadata = {
  title: "Saved — Jewel India",
  description: "Your saved designs and collections.",
};

export default function SavePage() {
  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <img
            src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777351888/saved_logo_bscslf.svg"
            alt="Saved"
            className="w-7 h-7 opacity-60"
          />
        </div>
        <h1 className="text-[22px] font-bold text-[#111827] tracking-tight">
          Saved
        </h1>
        <p className="text-[15px] text-[#6B7280] text-center max-w-xs">
          Bookmark your favourite pieces and find them here. Coming soon.
        </p>
        <span className="inline-block mt-2 text-[12px] font-semibold text-white bg-[#1A1A1A] px-4 py-1.5 rounded-full tracking-wide uppercase">
          Coming Soon
        </span>
      </div>
    </div>
  );
}
