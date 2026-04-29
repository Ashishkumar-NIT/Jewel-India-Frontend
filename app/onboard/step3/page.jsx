import { OnboardLayout } from "../../../components/onboard/OnboardLayout";
import { StepIndicator } from "../../../components/onboard/StepIndicator";
import { Step3Container } from "../../../components/onboard/step3/Step3Container";

export const metadata = { title: "Step 3 of 3 — Onboarding" };

export default function OnboardStep3Page() {
  return (
    <OnboardLayout
      heading="Almost there one last step"
      description="Upload your PAN and GST certificate so we can verify your business. This is a one-time process."
      backRoute="/onboard/step2"
      textMarginTop="md:mt-[18px]"
    >
      <div className="flex flex-col w-full max-w-[500px] mx-auto md:mx-0 mt-8 md:mt-0">
        <StepIndicator currentStep={3} totalSteps={3} />
        <Step3Container />
      </div>
    </OnboardLayout>
  );
}