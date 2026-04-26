import { OnboardLayout } from "../../../components/onboard/OnboardLayout";
import { StepIndicator } from "../../../components/onboard/StepIndicator";
import { RetailerStep2Container } from "../../../components/onboard-retailer/step2/RetailerStep2Container";

export const metadata = { title: "Step 2 of 3 — Retailer Onboarding" };

export default function RetailerOnboardStep2Page() {
  return (
    <OnboardLayout
      heading="Tell us about your store"
      description="This is how wholesalers will find and recognise your retail store on the platform."
      backRoute="/onboard-retailer"
    >
      <div className="flex flex-col w-full max-w-[500px] mx-auto md:mx-0 mt-8 md:mt-0">
        <StepIndicator currentStep={2} totalSteps={3} />
        <RetailerStep2Container />
      </div>
    </OnboardLayout>
  );
}
