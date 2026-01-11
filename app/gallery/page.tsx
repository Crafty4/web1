"use client";

/**
 * GALLERY PAGE (PROTECTED)
 * 
 * Displays a grid of images showcasing the café ambiance and food.
 * Only accessible after login.
 */

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

export default function GalleryPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [photos, setPhotos] = useState<Array<{ _id: string; url: string; title?: string }>>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/gallery");
        const data = await res.json();
        if (data.success) {
          setPhotos(data.photos);
        } else {
          setPhotos([]);
        }
      } catch (e) {
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  return (
    <div>
      <Navbar />

      {/* Header section */}
      <section className={styles.header}>
        <h1 className={styles.headerTitle}>Gallery</h1>
      </section>

      {/* Gallery grid */}
      <section className={styles.gallerySection}>
        {loading ? (
          <div className={styles.loading}>Loading gallery...</div>
        ) : photos.length === 0 ? (
          <div className={styles.emptyState}>No photos in gallery.</div>
        ) : (
          <div className={styles.galleryGrid}>
            {photos.map((photo, index) => (
              <div key={photo._id || index} className={styles.galleryItem}>
                <Image
                  src={
                    photo.url.startsWith("/") || photo.url.startsWith("http")
                      ? photo.url
                      : `/${photo.url}`
                  }
                  alt={photo.title || `Gallery image ${index + 1}`}
                  fill
                  className={styles.galleryImage}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
