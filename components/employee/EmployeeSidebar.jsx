"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./employeeSidebar.module.css";
const navItems = [
  {
    name: "Home",
    icon: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777351889/home_logo_xseblh.svg",
    href: "/dashboard/employee",
  },
  {
    name: "Curated",
    icon: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777351889/curated_logo_jbemqf.svg",
    href: "/dashboard/employee/curated",
  },
  {
    name: "Liked",
    icon: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777351889/liked_logo_mnifye.svg",
    href: "/dashboard/employee/likes",
  },
  {
    name: "Orders",
    icon: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777351889/order_logo_lnaqrz.svg",
    href: "/dashboard/employee/orders",
  },
  {
    name: "Chat",
    icon: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777351888/chat_logo_xxvotf.svg",
    href: "/dashboard/employee/messages",
  },
  {
    name: "Saved",
    icon: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777351888/saved_logo_bscslf.svg",
    href: "/dashboard/employee/save",
  },
];

const JI_LOGO =
  "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777013959/jewel_logo_rhgin9.svg";

/**
 * Permanent narrow vertical sidebar for the employee dashboard.
 * 60 px wide, dark background, icon-only with tooltips.
 * JI logo pinned at the bottom.
 */
export default function EmployeeSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar} id="employee-sidebar">
      {/* ── Nav icons, vertically centered ─────────────────────────── */}
      <nav className={styles.navStack}>
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard/employee"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              id={`employee-nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.icon} alt={item.name} draggable={false} />
              <span className={styles.tooltip}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── JI logo pinned at bottom ───────────────────────────────── */}
      <div className={styles.logoWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={JI_LOGO} alt="Jewel India" draggable={false} />
      </div>
    </aside>
  );
}
