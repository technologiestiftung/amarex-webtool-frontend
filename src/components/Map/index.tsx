import Map from "react-map-gl/maplibre";
import mapStyle from "./mapStyle";
import { FC } from "react";

interface Props {}
export const MapComponent: FC<Props> = () => {
  return (
    <Map
      initialViewState={{
        longitude: 13.41,
        latitude: 52.52,
        zoom: 12,
      }}
      mapStyle={mapStyle()}
      style={{ width: "100%", height: "50vh" }}
    />
  );
};
