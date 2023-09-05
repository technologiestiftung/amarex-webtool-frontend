import { StyleSpecification } from "maplibre-gl";

export default function mapStyle() {
  return {
    name: "amarex-webtool",
    version: 8,
    metadata: {},
    sources: {
      osmBaseMap: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution:
          "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
        // bounds: [13.076477, 52.340374, 13.760376, 52.664723],
      },
    },
    // "glyphs": "./data/{fontstack}/{range}.pbf",
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
  } as StyleSpecification;
}
