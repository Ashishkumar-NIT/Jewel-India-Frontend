"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import s from "./orders.module.css";
import Image from "next/image";

// Module-level cache that persists across navigation
const ordersCache = {
  activeTab: "new",
  modalVisible: false
};

/* ── SVG Icons ── */
const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FunnelIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 5h15M5 10h10M7.5 15h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HourglassIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4h16v4l-4.5 4.5L20 17v3H4v-3l4.5-4.5L4 8V4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const WrenchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6c-2.4 2.8-5 6.3-8.8 8.1-1.3.6-2.7-1-2.1-2.2 1.8-3.8 5.3-6.4 8.1-8.8l1.6 1.6a1 1 0 0 0 1.4 0l2.8-2.8a1 1 0 0 0 0-1.4L18.4 2.9a1 1 0 0 0-1.4 0l-2.3 2.3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BoxIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DeliveryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 8h14M5 8a2 2 0 1 1 0-4h14a2 2 0 1 1 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8m-9 4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LocationPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DiamondIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 3h12l4 6-10 12L2 9l4-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 9h20M12 21V9M6 3l6 6M18 3l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── Static Data ── */
const baseOrderInfo = {
  product: "Necklace",
  variant: "Semi long",
  sku: "#JK65-JI-1983844",
  orderValue: "₹2,00,000",
  qty: "x3",
  weight: "14 g,12g,2g",
  makeTime: "3-4 days",
  retailer: "JK Jewellers",
  deliverTo: "bangalore, Karnataka",
  image: "https://images.unsplash.com/photo-1599643478514-4a1101859efc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
};

const NEW_ORDERS = [
  {
    id: "n1",
    ...baseOrderInfo,
    image: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1775182710/i1_pvx1me.jpg",
    statusText: "Respond in next 18 hours",
    statusVariant: "statusUrgentAmber",
    statusIcon: <HourglassIcon />,
  },
  {
    id: "n2",
    ...baseOrderInfo,
    image: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1775182709/i2_id50hp.jpg",
    statusText: "Respond in next 4 hours",
    statusVariant: "statusUrgentRed",
    statusIcon: <HourglassIcon />,
  }
];

const ACTIVE_ORDERS = [
  {
    id: "a1",
    ...baseOrderInfo,
    image: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1775182710/i3_sh9jhf.jpg",
    statusText: "In production",
    statusVariant: "statusProductionAmber",
    statusIcon: <WrenchIcon />,
    subtext: null,
    button: <button className={`${s.btn} ${s.btnOutline}`}>Marked as packed</button>
  },
  {
    id: "a2",
    ...baseOrderInfo,
    image: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1775182710/i4_riqeyj.jpg",
    statusText: "Packed",
    statusVariant: "statusPackedTeal",
    statusIcon: <BoxIcon />,
    subtext: "retailer notified",
    button: <button className={`${s.btn} ${s.btnPrimary}`}>Dispatched</button>
  },
  {
    id: "a3",
    ...baseOrderInfo,
    image: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1775182710/i5_dptbuo.jpg",
    statusText: "Overdue by 1 day !!",
    statusVariant: "statusUrgentRed",
    statusIcon: <WarningIcon />,
    subtext: "retailer have been informed",
    button: <button className={`${s.btn} ${s.btnOutline}`}>Marked as packed</button>
  }
];

const COMPLETED_ORDERS = [
  {
    id: "c1",
    ...baseOrderInfo,
    image: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1775182710/i6_gwzbmu.jpg",
    statusText: "Delivered on 15 march",
    statusVariant: "statusDeliveredGreen",
    statusIcon: <DeliveryIcon />,
  },
  {
    id: "c2",
    ...baseOrderInfo,
    image: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1775182711/i7_dblidz.jpg",
    statusText: "Delivered on 14 march",
    statusVariant: "statusDeliveredGreen",
    statusIcon: <DeliveryIcon />,
  }
];

/* ── Main Component ── */
export default function OrdersClient() {
  // Restore state from cache on mount
  const [activeTab, setActiveTab] = useState(ordersCache.activeTab || "new");
  const [modalVisible, setModalVisible] = useState(ordersCache.modalVisible || false);

  // Persist state changes to cache
  useEffect(() => {
    ordersCache.activeTab = activeTab;
  }, [activeTab]);

  useEffect(() => {
    ordersCache.modalVisible = modalVisible;
  }, [modalVisible]);

  function getListData() {
    if (activeTab === "new") return NEW_ORDERS;
    if (activeTab === "active") return ACTIVE_ORDERS;
    return COMPLETED_ORDERS;
  }

  const currentList = getListData();

  return (
    <div className={s.page}>
      {/* ── Page Header ── */}
      <Link href="/dashboard/wholesaler" className={s.backLink}>
        <ChevronLeftIcon /> Back to home
      </Link>
      
      <div className={s.headerText}>
        <h1 className={s.title}>Orders</h1>
        <p className={s.subtitle}>Review and respond to orders from retailers.</p>
      </div>

      <div className={s.tabsContainer}>
        <div className={s.tabsRow}>
          <div className={s.tabsLeft}>
            <button 
              className={`${s.tabBtn} ${activeTab === "new" ? s.tabBtnActive : ""}`}
              onClick={() => setActiveTab("new")}
            >
              New Orders <span className={s.tabBadge}>2</span>
            </button>
            <button 
              className={`${s.tabBtn} ${activeTab === "active" ? s.tabBtnActive : ""}`}
              onClick={() => setActiveTab("active")}
            >
              Active Orders <span className={s.tabBadge}>3</span>
            </button>
            <button 
              className={`${s.tabBtn} ${activeTab === "completed" ? s.tabBtnActive : ""}`}
              onClick={() => setActiveTab("completed")}
            >
              Completed <span className={s.tabBadge}>2</span>
            </button>
          </div>
          {activeTab === "completed" && (
            <button className={s.filterBtn}>
              <FunnelIcon /> Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Order List ── */}
      <div className={s.orderList}>
        {currentList.map((order) => (
          <div key={order.id} className={s.card}>
            {/* Image */}
            <div className={s.cardImageArea}>
              <img src={order.image} alt={order.product} className={s.productImage} />
            </div>

            {/* Details */}
            <div className={s.cardDetails}>
              <h2 className={s.productName}>{order.product}</h2>
              <p className={s.productMeta}>{order.variant} • SKU {order.sku}</p>

              <div className={s.detailsGrid}>
                <span className={s.detailLabel}>Order value</span>
                <span className={s.detailValue}>{order.orderValue}</span>

                <span className={s.detailLabel}>Quantity</span>
                <span className={s.detailValue}>{order.qty}</span>

                <span className={s.detailLabel}>Weight</span>
                <span className={s.detailValue}>{order.weight}</span>

                <span className={s.detailLabel}>Make to order</span>
                <span className={s.detailValue}>
                  {order.makeTime} <span style={{ color: '#E5E7EB', margin: '0 8px' }}>|</span> 
                  <span className={s.retailerLink} onClick={() => setModalVisible(true)}>{order.retailer}</span>
                </span>

                <span className={s.detailLabel}>Deliver to:</span>
                <span className={`${s.detailValue} ${s.normal}`}>{order.deliverTo}</span>
              </div>
            </div>

            {/* Actions & Status */}
            <div className={s.cardActions}>
              <div>
                <div className={`${s.statusIndicator} ${s[order.statusVariant]}`}>
                  {order.statusIcon} {order.statusText}
                </div>
                {order.subtext && <div className={s.statusSubtext}>{order.subtext}</div>}
              </div>

              <div className={s.buttonsStack}>
                {activeTab === "new" && (
                  <>
                    <button className={`${s.btn} ${s.btnReject}`}>Reject order</button>
                    <button className={`${s.btn} ${s.btnPrimary}`}>Confirm order</button>
                  </>
                )}
                {activeTab === "active" && order.button}
                {activeTab === "completed" && (
                  <>
                    <button className={`${s.btn} ${s.btnOutline}`}><EyeIcon /> View Details</button>
                    <button className={`${s.btn} ${s.btnPrimary}`}>Download Invoice</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Retailer Modal / Drawer ── */}
      {modalVisible && (
        <div className={s.modalOverlay} onClick={() => setModalVisible(false)}>
          <div className={s.modalContent} onClick={e => e.stopPropagation()}>
            
            <div className={s.modalTop}>
              <div className={s.avatar}>
                JK
              </div>
              <div className={s.modalInfo}>
                <div className={s.modalNameRow}>
                  <h3 className={s.modalTitle}>JK Jewellers</h3>
                  <span className={s.verifiedBadge}><CheckCircleIcon /> Verified</span>
                </div>
                <p className={s.memberSince}>Member since February 2026</p>
              </div>
            </div>

            <hr className={s.modalDivider} />

            <div className={s.contactList}>
              <div className={s.contactRow}>
                <LocationPinIcon />
                <span>Bandra, Mumbai</span>
              </div>
              <div className={s.contactRow}>
                <PhoneIcon />
                <span>+91 98765 22222</span>
              </div>
              <div className={s.contactRow}>
                <DiamondIcon />
                <span>Specialises in: Contemporary & Designer jewellery</span>
              </div>
            </div>

            <hr className={s.modalDivider} />

            <div className={s.modalBottom}>
              <button className={s.btnCloseModal} onClick={() => setModalVisible(false)}>
                Back to orders
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
