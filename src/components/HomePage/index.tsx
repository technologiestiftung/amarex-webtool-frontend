"use client";
import React, { useState } from "react";
import { MapComponent } from "../Map";

interface HomePageProps {
  mapData: any;
}
const HomePage = ({ mapData }: HomePageProps) => {
  const [activeDistrict, activeDistrictSet] = useState("keiner ausgewählt");
  return (
    <div style={{ width: "100vw" }}>
      <h1 style={{ textAlign: "center" }}>Active district: {activeDistrict}</h1>
      <MapComponent mapData={mapData} activeDistrictSet={activeDistrictSet} />
    </div>
  );
};

export default HomePage;
