import HomePage from "@/components/HomePage";
import styles from "./page.module.css";
import { getMapData } from "@lib/loadMap";

export default function Home() {
  const mapData = getMapData();
  return (
    <main className={styles.main}>
      <HomePage mapData={mapData} />
    </main>
  );
}
