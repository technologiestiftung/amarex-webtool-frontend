"use client";
import getMapStyle from "./mapStyle";
import { FC, useRef, useMemo } from "react";
import maplibregl from "maplibre-gl";
import Map, {
  Source,
  Layer,
  MapLayerMouseEvent,
  MapRef,
} from "react-map-gl/maplibre";
import {
  getDistrictLayerLineStyle,
  getDistrictLayerFillStyle,
} from "./layerStyles";

interface Props {
  mapData: any;
  activeDistrictSet: (label: string) => void;
}

const districtIDs = [...Array(12)].map((_, key) => `district_${key + 1}`);

export const MapComponent: FC<Props> = ({ mapData, activeDistrictSet }) => {
  const mapRef = useRef<MapRef>(null);
  const memoizedMapStyle = useMemo(() => getMapStyle(), []);

  const onMapCLick = (event: MapLayerMouseEvent) => {
    event.preventDefault();
    if (!mapRef.current) {
      return;
    }
    /* @ts-ignore */
    const districtName = mapRef.current.queryRenderedFeatures(event.point, {
      layers: districtIDs,
    })[0]?.properties?.name;
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
      mapStyle={memoizedMapStyle}
      onClick={onMapCLick}
      ref={mapRef}
      mapLib={maplibregl}
      style={{ width: "100%", height: "90vh" }}
    >
      {districtIDs.map((id, index) => (
        <Source key={id} id={id} type="geojson" data={districtsFromGEO[index]}>
          <Layer {...getDistrictLayerFillStyle(id)} />
          <Layer {...getDistrictLayerLineStyle(`${id}Line`)} />
        </Source>
      ))}
    </Map>
  );
};
