import { OnboardNavbar } from "./OnboardNavbar";
import { LeftPanel } from "./LeftPanel";

export function OnboardLayout({ children, heading, description, backRoute, textMarginTop }) {
  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col font-sans antialiased text-[#374151]">
      <OnboardNavbar backRoute={backRoute} />

      <main className="flex-1 w-full max-w-[1100px] mx-auto px-[clamp(16px,3vw,48px)] pt-[clamp(24px,3vw,40px)] pb-2 flex flex-col md:flex-row md:justify-center md:items-start gap-8 md:gap-[clamp(24px,1vw,48px)]">
        {/* Left Side */}
        <div className="w-full md:w-[340px] shrink-0 pt-2 flex flex-col items-center md:items-start text-center md:text-left">
          <LeftPanel heading={heading} description={description} textMarginTop={textMarginTop} />
        </div>

        {/* Right Side - Dynamic Content */}
        <div className="w-full md:w-[500px] flex flex-col items-center md:items-start min-h-[400px]">
          {children}
        </div>
      </main>
    </div>
  );
}