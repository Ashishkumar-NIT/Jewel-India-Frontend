import OrdersClient from "../../../../components/wholesaler/orders/OrdersClient";

export const metadata = {
  title: "Orders — Wholesaler Dashboard",
  description: "Review and respond to orders from retailers.",
};

export default function OrdersPage() {
  return <OrdersClient />;
}
