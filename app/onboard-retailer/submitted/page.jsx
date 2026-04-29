import { OnboardLayout } from "../../../components/onboard/OnboardLayout";
import { VerificationTimeline } from "../../../components/onboard/submitted/VerificationTimeline";
import { SubmittedFooter } from "../../../components/onboard/submitted/SubmittedFooter";
import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import { SignOutButton as OnboardSignOutButton } from "../../../components/auth/SignOutButton";

export const metadata = { title: "Verification Pending — Retailer" };

export default async function RetailerSubmittedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entry_page/signup");
  }

  const { data: retailer } = await supabase
    .from("retailers")
    .select("verification_status, created_at, updated_at, rejection_reason")
    .eq("user_id", user.id)
    .single();

  if (!retailer) {
    redirect("/onboard-retailer"); // They haven't finished the form
  }

  if (retailer.verification_status === "verified") {
    redirect("/dashboard/retailer");
  }

  const timeSubmitted = new Date(retailer.created_at).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  });

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col font-sans antialiased text-[#374151]">
      <header className="w-full bg-[#FFFFFF] border-b border-[#E0E0E0] px-[clamp(16px,3vw,48px)] py-[clamp(6px,0.8vw,12px)] flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-2">
          <img src="/jewelLogo.svg" alt="Jewels India Logo" className="w-[wrap(24px,3vw,28px)] h-auto object-contain" />
          <span className="text-[clamp(13px,1.5vw,15px)] font-bold text-[#111827]">Jewels India</span>
        </div>
        <OnboardSignOutButton />
      </header>

      <main className="flex-1 w-full max-w-[800px] mx-auto px-[clamp(16px,3vw,48px)] pt-[clamp(32px,5vw,60px)] pb-12 flex flex-col items-center">
        
        {retailer.verification_status === 'pending' && (
          <div className="w-full flex justify-center mb-8">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-amber-500">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor" fillOpacity="0.2"/>
              <path d="M12 8V13L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}

        <h1 className="text-[clamp(24px,3vw,32px)] font-extrabold text-[#111827] text-center mb-3">
          {retailer.verification_status === 'pending' ? 'Application under review' :
           retailer.verification_status === 'rejected' ? 'Application Rejected' :
           retailer.verification_status === 'on_hold' ? 'Application On Hold' :
           retailer.verification_status === 'resubmission_required' ? 'Action Required' : 'Status Update'}
        </h1>
        
        <p className="text-[15px] text-[#6B7280] text-center max-w-[500px] mb-12 leading-relaxed">
          {retailer.verification_status === 'pending' ? "We've received your business details and documents. Our team is verifying your application right now. This usually takes 24-48 hours." :
           retailer.verification_status === 'rejected' ? retailer.rejection_reason || "Unfortunately, your application did not meet our requirements." :
           retailer.verification_status === 'on_hold' ? "Your application requires manual review and is currently on hold. We will reach out shortly." :
           retailer.verification_status === 'resubmission_required' ? "We need you to update some information or re-upload documents before we can proceed." : ""}
        </p>

        <div className="w-full max-w-[500px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[16px] p-6 md:p-8">
          <VerificationTimeline 
            status={retailer.verification_status} 
            submittedAt={timeSubmitted}
            updatedAt={retailer.updated_at}
          />
        </div>

        <SubmittedFooter />
      </main>
    </div>
  );
}
