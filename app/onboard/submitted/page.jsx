import { OnboardLayout } from "../../../components/onboard/OnboardLayout";
import { VerificationTimeline } from "../../../components/onboard/submitted/VerificationTimeline";
import { SubmittedFooter } from "../../../components/onboard/submitted/SubmittedFooter";
import { StepIndicator } from "../../../components/onboard/StepIndicator";
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
    .select("verification_status, notification_message, rejection_reason, rejected_documents")
    .eq("user_id", user.id)
    .single();

  const status = wholesaler?.verification_status || "pending";
  const notification = wholesaler?.notification_message || "";
  const rejectionReason = wholesaler?.rejection_reason || wholesaler?.notification_message || "";
  const rejectedDocuments = wholesaler?.rejected_documents || [];

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
      paragraphText = rejectionReason || "There was an issue with your submission. Please click below to resubmit your documents.";
      buttonLabel = "Resubmit";
      actionRoute = "/onboard";
      headingText = status === "rejected" ? "Application Rejected" : "Resubmission Required";
      trackerText = status === "rejected" ? "Rejected" : "Action Needed";
      break;
    case "verified":
      paragraphText = "You're verified! You can now access your full dashboard.";
      buttonLabel = "Go to Dashboard";
      actionRoute = "/dashboard/wholesaler";
      headingText = "Verification Complete!";
      trackerText = "Verified";
      break;
  }

  // Document name mapping function for display
  const mapDocumentName = (docKey) => {
    const mapping = {
      aadhaar_front: "Aadhaar Card (Front)",
      aadhaar_back: "Aadhaar Card (Back)",
      pan_card: "PAN Card",
      gst_certificate: "GST Certificate",
      business_logo: "Business Logo",
      aadhaar_front_url: "Aadhaar Card (Front)",
      aadhaar_back_url: "Aadhaar Card (Back)",
      pan_card_url: "PAN Card",
      gst_certificate_url: "GST Certificate",
      business_logo_url: "Business Logo"
    };
    if (mapping[docKey]) return mapping[docKey];
    return docKey
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const hasRejectedDocs = Array.isArray(rejectedDocuments) && rejectedDocuments.length > 0;
  const cleanRejectedDocs = hasRejectedDocs ? rejectedDocuments.map(mapDocumentName) : [];

  return (
    <OnboardLayout 
      heading={headingText}
      description="we're reviewing your details"
      backRoute={status === "resubmission_required" || status === "rejected" || status === "verified" ? null : "/entry_page/signin"}
    >
      <div className="flex flex-col w-full max-w-[500px] mx-auto md:mx-0 md:ml-auto md:pr-4">
        
        {/* Top Header tracking */}
        <div className="w-full">
          <StepIndicator currentStep={4} totalSteps={3} />
        </div>
        
        <div className="flex flex-col w-full mt-10">
          <VerificationTimeline status={status} />
          
          {(status === "rejected" || status === "resubmission_required") ? (
            <div className="mt-8 p-5 bg-red-50/40 border border-red-200/60 rounded-2xl flex flex-col gap-4 text-left">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100/70 text-red-600 rounded-xl mt-0.5 shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-[14.5px] font-bold text-red-950">
                    {status === "rejected" ? "Application Rejected" : "Revision Required"}
                  </h4>
                  <p className="text-[13.5px] text-red-800/90 mt-1 leading-relaxed">
                    {rejectionReason || "There was an issue with your submission. Please check the details below and resubmit."}
                  </p>
                </div>
              </div>

              {hasRejectedDocs && (
                <div className="border-t border-red-200/50 pt-4">
                  <h5 className="text-[12px] font-bold uppercase tracking-wider text-red-950/70">
                    Items to Resubmit:
                  </h5>
                  <ul className="mt-2.5 flex flex-col gap-2">
                    {cleanRejectedDocs.map((docName, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-[13px] text-red-900 font-semibold bg-red-100/30 border border-red-200/50 rounded-xl px-3.5 py-2">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-500 shrink-0">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {docName}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[14px] text-[#9CA3AF] text-center mt-6">
              {paragraphText}
            </p>
          )}
        </div>
        
        <div className="mt-8 w-full">
          <SubmittedFooter label={buttonLabel} actionRoute={actionRoute} />
        </div>
      </div>
    </OnboardLayout>
  );
}
