import dynamic from "next/dynamic";

const SelectionReviewClient = dynamic(
  () => import("../../../../../components/employee/SelectionReviewClient"),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-white text-[14px] text-gray-500">
        Loading selection...
      </div>
    ),
  }
);

export const metadata = {
  title: "Review Selection — Employee Dashboard",
};

export default function ReviewSelectionPage() {
  return <SelectionReviewClient />;
}
