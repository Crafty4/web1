/**
 * FOOTER COMPONENT
 * 
 * Simple footer component that displays copyright information.
 * No state needed - it's just static content.
 */

import React from "react";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <h3 className={styles.copyright}>
        © 2025 White Chillies. All Rights Reserved.
      </h3>
    </footer>
  );
}
