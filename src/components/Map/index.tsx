"use client";
import mapStyle from "./mapStyle";
import { FC, useRef } from "react";
import maplibregl from "maplibre-gl";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import { layerStyles } from "./layerStyles";

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
  const boroughsFromGEO = JSON.parse(data.value).berlinBoroughs.features;
  return (
    <Map
      initialViewState={{
        longitude: 13.41,
        latitude: 52.52,
        zoom: 12,
      }}
      maxBounds={[13.1, 52.3, 13.7, 52.7]}
      // @ts-ignore
      mapStyle={mapStyle()}
      // @ts-ignore
      ref={mapRef}
      mapLib={maplibregl}
      style={{ width: "100%", height: "100vh" }}
    >
      <Source id="boroughs" type="geojson" data={boroughsFromGEO[1]}>
        {/* @ts-ignore */}
        <Layer {...layerStyles["boroughsFill"]} />
        {/* @ts-ignore */}
        <Layer {...layerStyles["boroughsLine"]} />
      </Source>
      <Source id="my-data" type="geojson" data={geojson}>
        {/* @ts-ignore */}
        <Layer {...layerStyles["marker"]} />
      </Source>
      <Source id="boroughs-2" type="geojson" data={boroughsFromGEO[0]}>
        {/* @ts-ignore */}
        <Layer {...layerStyles["boroughsFill2"]} />
        {/* @ts-ignore */}
        <Layer {...layerStyles["boroughsLine2"]} />
      </Source>
      <Source id="my-data" type="geojson" data={geojson}>
        {/* @ts-ignore */}
        <Layer {...layerStyles["marker"]} />
      </Source>
    </Map>
  );
};
