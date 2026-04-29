import Image from "next/image";
import UploadButton from "./UploadButton";

export default function HeroUploadSection({ businessName = "" }) {
  const displayName = businessName?.trim() || "Welcome";

  return (
    <section className="px-4 md:px-10 pt-6 pb-4">
      {/* Welcome Header */}
      <div className="mb-4">
        <p className="text-[#6B7280] text-xs md:text-sm font-sfpro mb-1">Welcome</p>
        <h1 className="text-[#1F2937] text-xl md:text-2xl font-medium font-sfpro">{displayName}</h1>
      </div>

      {/* Banner */}
      <div className="relative overflow-hidden h-[160px] md:h-[180px] rounded-xl border border-[#F3E8D6] shadow-sm bg-[#FFFDF9]">
        {/* Background image */}
        <Image
          src="/image/heroframee.png"
          alt="Add Jewellery Background"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 80vw"
          className="object-cover object-right md:object-center opacity-80"
        />
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-10 max-w-xl">
          <h2 className="text-[28px] md:text-3xl text-[#8C6A3E] mb-1" style={{ fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif", fontWeight: 600 }}>
            Add Jewellery
          </h2>
          <p className="text-[#6B7280] text-sm md:text-base font-sfpro mb-5">
            Showcase your new designs for retailers to see
          </p>
          <div>
            <UploadButton />
          </div>
        </div>
      </div>
    </section>
  );
}
