"use client";

/**
 * ABOUT PAGE (PROTECTED)
 * 
 * This page displays information about White Chillies café.
 * Only accessible after login.
 */

import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

export default function AboutPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  // Redirect if not authenticated or if admin (admins shouldn't access user pages)
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role === "admin") {
      router.push("/admin");
    }
  }, [isAuthenticated, user, router]);

  // Don't render if not authenticated or if admin
  if (!isAuthenticated || user?.role === "admin") {
    return null;
  }
  return (
    <div>
      <Navbar />

      {/* Header section */}
      <section className={styles.header}>
        <h1 className={styles.headerTitle}>About Us</h1>
      </section>

      {/* Content section */}
      <section className={styles.content}>
        <div className={styles.container}>
          <h1 className={styles.title}>Welcome to White Chillies</h1>

          <div className={styles.textCard}>
            <p className={styles.paragraph}>
              At White Chillies, we believe in serving more than just coffee and
              delicious meals—we create experiences. Established with a passion for
              flavors and a love for community, our cafe is the perfect place to
              relax, unwind, and enjoy moments with your loved ones. Whether you're
              here for a quick coffee break or an intimate dinner, we ensure a warm
              and inviting atmosphere.
            </p>
          </div>

          <div className={styles.imageWrapper}>
            <div className={styles.imageContainer}>
              <Image
                src="/aboutUsPic.jpg"
                alt="White Chillies Cafe Interior"
                fill
                className={styles.image}
                sizes="(max-width: 768px) 100vw, 800px"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>

          <div className={styles.textCard}>
            <p className={styles.paragraph}>
              Our menu is crafted with love, bringing you a fusion of classic
              favorites and innovative dishes, all made from the freshest ingredients.
              From hand-crafted beverages to gourmet dishes, every bite and sip at
              White Chillies tells a story of quality and passion.
            </p>
          </div>

          <div className={styles.ctaCard}>
            <p className={styles.ctaText}>
              Visit us today and be part of the White Chillies experience!
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
