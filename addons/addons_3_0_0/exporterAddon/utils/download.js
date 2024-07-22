import GeoJSON from "ol/format/GeoJSON";
import KML from "ol/format/KML";
import VectorLayer from "ol/layer/Vector";
import { transform } from "ol/proj";

/**
 * Reproject coordinates from one projection to another
 * @param {Array} coordinates - The coordinates to reproject
 * @param {string} sourceProj - The source projection
 * @param {string} destProj - The destination projection
 * @returns {Array} - The reprojected coordinates
 */
function reprojectCoordinates(coordinates, sourceProj, destProj) {
  if (!coordinates || coordinates.length === 0) {
    return [];
  }
  if (Array.isArray(coordinates[0][0])) {
    return coordinates.map((coord) =>
      reprojectCoordinates(coord, sourceProj, destProj),
    );
  } else {
    return coordinates.map((coord) => transform(coord, sourceProj, destProj));
  }
}

/**
 * Export layer as GeoJSON
 * @param {VectorLayer} layer - The vector layer to export
 * @param {string} sourceProjectionCode - The source projection code
 * @returns {string} - The GeoJSON string
 */
function exportLayerAsGeoJSON(layer, sourceProjectionCode) {
  const source = layer.getSource();
  const features = source.getFeatures();

  const geoJSONFormatter = new GeoJSON();
  let geoJSONData = geoJSONFormatter.writeFeaturesObject(features);

  // Reproject the coordinates to EPSG:4326
  // todo: check if EPSG:4326 is the correct EPSG code
  geoJSONData.features = geoJSONData.features.map((feature) => {
    feature.geometry.coordinates = reprojectCoordinates(
      feature.geometry.coordinates,
      sourceProjectionCode,
      "EPSG:4326",
    );
    return feature;
  });

  const geoJSONString = JSON.stringify(geoJSONData, null, 2);

  return geoJSONString;
}

/**
 * Export layer as KML
 * @param {VectorLayer} layer - The vector layer to export
 * @param {string} sourceProjectionCode - The source projection code
 * @returns {string} - The KML string
 */
function exportLayerAsKML(layer, sourceProjectionCode) {
  const source = layer.getSource();
  const features = source.getFeatures();

  const kmlFormatter = new KML({
    featureProjection: sourceProjectionCode,
  });
  const kmlString = kmlFormatter.writeFeatures(features, {
    featureProjection: "EPSG:4326",
  });

  return kmlString;
}

export { exportLayerAsGeoJSON, exportLayerAsKML };

