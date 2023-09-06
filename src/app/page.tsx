import styles from "./page.module.css";
import { MapComponent } from "@/components/Map";
import { getMapData } from "@lib/loadMap";

export default function Home() {
  const data = getMapData();
  return (
    <main className={styles.main}>
      <MapComponent data={data} />
    </main>
  );
}
