import { OnboardLayout } from "../../../components/onboard/OnboardLayout";
import { VerificationTimeline } from "../../../components/onboard/submitted/VerificationTimeline";
import { SubmittedFooter } from "../../../components/onboard/submitted/SubmittedFooter";
import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = { title: "Verification Status — Celestique" };

export default async function OnboardSubmittedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entry_page/signin");
  }

  const { data: wholesaler } = await supabase
    .from("wholesalers")
    .select("verification_status, notification_message")
    .eq("user_id", user.id)
    .single();

  const status = wholesaler?.verification_status || "pending";
  const notification = wholesaler?.notification_message || "";

  if (status === "banned") {
    redirect("/entry_page/signup?error=banned");
  }

  let paragraphText = "";
  let buttonLabel = "I Understand";
  let actionRoute = "/entry_page/signup";
  let headingText = "You're all submitted!";
  let trackerText = "Under Verification";

  switch (status) {
    case "pending":
      paragraphText = "We'll verify your documents in 24–48 hours and notify you on your number once you're approved.";
      break;
    case "on_hold":
      paragraphText = notification || "Your account is on hold pending further review.";
      trackerText = "On Hold";
      break;
    case "rejected":
    case "resubmission_required":
      paragraphText = notification || "There was an issue with your submission. Please click below to resubmit your documents.";
      buttonLabel = "Resubmit";
      actionRoute = "/onboard";
      headingText = "Resubmission Required";
      trackerText = "Action Needed";
      break;
    case "verified":
      paragraphText = "You're verified! You can now access your full dashboard.";
      buttonLabel = "Take me to Dashboard";
      actionRoute = "/dashboard/wholesaler";
      headingText = "Verification Complete!";
      trackerText = "Verified";
      break;
  }

  return (
    <OnboardLayout 
      heading={headingText}
      description="we're reviewing your details"
      backRoute={status === "resubmission_required" || status === "rejected" || status === "verified" ? null : "/onboard/step3"}
    >
      <div className="flex flex-col w-full max-w-[500px] mx-auto md:mx-0 md:ml-auto md:pr-4">
        
        {/* Top Header tracking */}
        <div className="flex flex-col gap-4 w-full">
          <div className="text-[16px] text-[#868A91] font-medium tracking-wide">
            {trackerText}
          </div>
          <svg className="w-full h-[6px] rounded-full mt-1" preserveAspectRatio="none" viewBox="0 0 100 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="6" rx="3" fill="#000000" />
          </svg>
        </div>
        
        <div className="flex flex-col w-full mt-10">
          <VerificationTimeline />
          
          <p className="text-[14px] text-[#9CA3AF] text-center mt-6">
            {paragraphText}
          </p>
        </div>
        
        <div className="mt-8 w-full">
          <SubmittedFooter label={buttonLabel} actionRoute={actionRoute} />
        </div>
      </div>
    </OnboardLayout>
  );
}
