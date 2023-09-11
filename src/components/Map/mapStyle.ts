import { StyleSpecification } from "maplibre-gl";

export default function getMapStyle(): StyleSpecification {
  return {
    version: 8,
    name: "amarex-webtool",
    metadata: {},
    sources: {
      osmBaseMap: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution:
          "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": "#2b2c4e",
        },
      },
      {
        id: "osmBaseMap",
        type: "raster",
        source: "osmBaseMap",
        layout: {
          // visibility: "visisible",
        },
        paint: {
          "raster-saturation": -1,
          "raster-contrast": 0.1,
        },
      },
    ],
  };
}
