"use client";
import styles from "./page.module.css";
import { MapComponent } from "@/components/Map";

export default function Home() {
  return (
    <main className={styles.main}>
      <MapComponent />
    </main>
  );
}
