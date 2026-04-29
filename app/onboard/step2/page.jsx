import { OnboardLayout } from "../../../components/onboard/OnboardLayout";
import { StepIndicator } from "../../../components/onboard/StepIndicator";
import { Step2Container } from "../../../components/onboard/step2/Step2Container";

export const metadata = { title: "Step 2 of 3 — Onboarding" };

export default function OnboardStep2Page() {
  return (
    <OnboardLayout 
      heading="Tell us about your business"
      description="This is how retailers will find and recognise you on the platform."
      backRoute="/onboard"
    >
      <div className="flex flex-col w-full max-w-[500px] mx-auto md:mx-0 mt-8 md:mt-0">
        <StepIndicator currentStep={2} totalSteps={3} />
        <Step2Container />
      </div>
    </OnboardLayout>
  );
}