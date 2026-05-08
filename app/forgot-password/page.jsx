import { Suspense } from "react";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { ForgotPasswordForm } from "../../components/auth/ForgotPasswordForm";

export const metadata = {
  title: "Forgot Password - Jewel India",
  description: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email to receive a password reset link."
      imageSrc="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1774883373/authImg_ivftu7.png"
    >
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
