import { FillLayer, LineLayer } from "react-map-gl/maplibre";

export const getDistrictLayerFillStyle = (id: string): FillLayer => ({
  id,
  type: "fill",
  paint: {
    "fill-color": "#bf5900",
    "fill-opacity": 0.5,
  },
  source: "districts",
});

export const getDistrictLayerLineStyle = (id: string): LineLayer => ({
  id,
  type: "line",
  paint: {
    "line-color": "#000000",
    "line-width": 2,
  },
  source: "districts",
});
