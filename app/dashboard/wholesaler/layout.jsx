import Sidebar from "../../../components/wholesaler/Sidebar";

export const metadata = {
  title: "Wholesaler Dashboard",
  description: "Manage your catalogue, orders, and queries.",
};

export default async function WholesalerLayout({ children }) {
  return (
    <div className="theme-wholesaler" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main className="wholesaler-main-content">
        {children}
      </main>
    </div>
  );
}