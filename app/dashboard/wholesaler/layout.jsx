import Footer from "../../../components/wholesaler/Footer";
import Sidebar from "../../../components/wholesaler/Sidebar";

export const metadata = {
  title: "Wholesaler Dashboard",
  description: "Manage your catalogue, orders, and queries.",
};

export default function WholesalerLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: "70px", minHeight: "100vh" }}>
        {children}
        {/* <Footer /> */}
      </main>
    </div>
  );
}
