import HomePage from "@/components/HomePage";
import styles from "./page.module.css";
import { getMapData } from "@lib/loadMap";
import { useMemo } from "react";

export default function Home() {
  const mapData = useMemo(() => getMapData(), []);
  return (
    <main className={styles.main}>
      <HomePage mapData={mapData} />
    </main>
  );
}
