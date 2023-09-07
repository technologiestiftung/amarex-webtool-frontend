"use client";
import mapStyle from "./mapStyle";
import { FC, useRef } from "react";
import maplibregl from "maplibre-gl";
import Map, { Source, Layer, MapLayerMouseEvent } from "react-map-gl/maplibre";
import { layerStyles } from "./layerStyles";

interface Props {
  mapData: any;
  activeDistrictSet: (label: string) => void;
}

const districtIDs = [
  "district_1",
  "district_2",
  "district_3",
  "district_4",
  "district_5",
];

export const MapComponent: FC<Props> = ({ mapData, activeDistrictSet }) => {
  const mapRef = useRef<mapboxgl.Map>();
  const onMapCLick = (event: MapLayerMouseEvent) => {
    event.preventDefault();
    if (!mapRef || !mapRef.current) {
      return;
    }
    /* @ts-ignore */
    const districtName = mapRef.current.queryRenderedFeatures(event.point, {
      layers: districtIDs,
    })[0]?.properties?.name;
    console.log(districtName);
    activeDistrictSet(districtName);
  };
  const districtsFromGEO = JSON.parse(mapData.value).berlinDistricts.features;
  return (
    <Map
      initialViewState={{
        longitude: 13.41,
        latitude: 52.52,
        zoom: 8,
      }}
      maxBounds={[13.0, 52.3, 13.7, 52.7]}
      // @ts-ignore
      mapStyle={mapStyle()}
      onClick={onMapCLick}
      // @ts-ignore
      ref={mapRef}
      mapLib={maplibregl}
      style={{ width: "100%", height: "90vh" }}
    >
      {districtIDs.map((id, index) => (
        <Source key={id} id={id} type="geojson" data={districtsFromGEO[index]}>
          {/* @ts-ignore */}
          <Layer {...{ ...layerStyles["districts"], id }} />
          {/* @ts-ignore */}
          <Layer {...{ ...layerStyles["districtsLine"], id: `${id}Line` }} />
        </Source>
      ))}
    </Map>
  );
};
