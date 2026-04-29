import { OnboardLayout } from "../../../components/onboard/OnboardLayout";
import { StepIndicator } from "../../../components/onboard/StepIndicator";
import { RetailerStep3Container } from "../../../components/onboard-retailer/step3/RetailerStep3Container";

export const metadata = { title: "Step 3 of 3 — Retailer Onboarding" };

export default function RetailerOnboardStep3Page() {
  return (
    <OnboardLayout
      heading="Almost there — one last step"
      description="Upload your PAN and GST certificate so we can verify your business. This is a one-time process."
      backRoute="/onboard-retailer/step2"
      textMarginTop="md:mt-[18px]"
    >
      <div className="flex flex-col w-full max-w-[500px] mx-auto md:mx-0 mt-8 md:mt-0">
        <StepIndicator currentStep={3} totalSteps={3} />
        <RetailerStep3Container />
      </div>
    </OnboardLayout>
  );
}