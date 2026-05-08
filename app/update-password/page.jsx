import { Suspense } from "react";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { UpdatePasswordForm } from "../../components/auth/UpdatePasswordForm";

export const metadata = {
  title: "Update Password - Jewel India",
  description: "Update your password",
};

export default function UpdatePasswordPage() {
  return (
    <AuthLayout
      title="Set new password"
      subtitle="Please enter your new password below."
      imageSrc="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1774883373/authImg_ivftu7.png"
    >
      <Suspense>
        <UpdatePasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
