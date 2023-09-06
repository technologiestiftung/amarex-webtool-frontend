"use client";
import mapStyle from "./mapStyle";
import { FC, useRef } from "react";
import maplibregl from "maplibre-gl";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import { layerStyles } from "./layerStyles";
import { boroughs } from "public/data/berlin_bezirke";

const geojson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [13.41, 52.52] },
    },
  ],
};

interface Props {
  data?: any;
}
export const MapComponent: FC<Props> = ({ data }) => {
  const mapRef = useRef<mapboxgl.Map>();
  return (
    <Map
      initialViewState={{
        longitude: 13.41,
        latitude: 52.52,
        zoom: 12,
      }}
      mapStyle={mapStyle()}
      // @ts-ignore
      ref={mapRef}
      // @ts-ignore
      mapLib={maplibregl}
      style={{ width: "100%", height: "50vh" }}
    >
      <Source id="boroughs" type="geojson" data={boroughs}>
        {/* @ts-ignore */}
        <Layer {...layerStyles["boroughs"]} />
      </Source>
      <Source id="my-data" type="geojson" data={geojson}>
        {/* @ts-ignore */}
        <Layer {...layerStyles["marker"]} />
      </Source>
    </Map>
  );
};
