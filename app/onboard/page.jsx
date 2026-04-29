import { OnboardLayout } from "../../components/onboard/OnboardLayout";
import { StepIndicator } from "../../components/onboard/StepIndicator";
import { Step1Container } from "../../components/onboard/step1/Step1Container";

export const metadata = { title: "Step 1 of 3 — Onboarding" };

export default function OnboardStep1Page() {
  return (
    <OnboardLayout
      heading="Let me get to know you"
      description="We need a few details to verify who you are. This keeps your account and your business safe."
      backRoute="/signup"
    >
      <div className="flex flex-col w-full max-w-[500px] mx-auto md:mx-0 mt-8 md:mt-0">
        <StepIndicator currentStep={1} totalSteps={3} />
        <Step1Container />
      </div>
    </OnboardLayout>
  );
}