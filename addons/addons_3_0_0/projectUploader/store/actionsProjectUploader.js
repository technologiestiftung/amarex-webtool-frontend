import { createEmpty as createEmptyExtent, extend } from "ol/extent";
import { GPX, GeoJSON, KML } from "ol/format.js";
import Circle from "ol/geom/Circle";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Icon from "ol/style/Icon";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Text from "ol/style/Text";
import getRandomRGB from "../../../../src/utils/getRandomRGB.js";
import sanitizeSelector from "../../../../src/utils/sanitizeSelector.js";
import layerCollection from "../../../../src_3_0_0/core/layers/js/layerCollection.js";
import { createDrawStyle } from "../../../../src_3_0_0/modules/draw_old/js/style/createDrawStyle.js";
import {
  treeSubjectsKey,
  treeTopicConfigKey,
} from "../../../../src_3_0_0/shared/js/utils/constants.js";
import isObject from "../../../../src_3_0_0/shared/js/utils/isObject.js";
import { uniqueId } from "../../../../src_3_0_0/shared/js/utils/uniqueId.js";

const defaultFont = "16px Arial",
  supportedFormats = {
    kml: new KML({
      extractStyles: true,
      iconUrlFunction: (url) => url,
      defaultStyle: [
        new Style({
          image: new Icon({
            anchor: [20, 2],
            anchorOrigin: "bottom-left",
            anchorXUnits: "pixels",
            anchorYUnits: "pixels",
            crossOrigin: "anonymous",
            rotation: 0,
            scale: 1,
            size: [16, 16],
            src: `${window.location.origin}/img/tools/draw/circle_blue.svg`,
          }),
          text: new Text({
            fill: new Fill({
              color: [0, 0, 0, 1],
            }),
          }),
          zIndex: 0,
        }),
      ],
    }),
    gpx: new GPX(),
    geojson: new GeoJSON(),
  };

/**
 * Checks given file suffix for any defined Format. Default mappings are defined in state and may be
 * overridden in config.
 * @param {String} filename - Name of the given file.
 * @param {String} selectedFiletype - The name of type of file. This represents a key of supportedFiletypes
 * and defines, how the format will be chosen. Either directly if it matches an available format and
 * supported file type. Or automatically, when set to "auto".
 * @param {Object} supportedFiletypes - Object of supported file types. This has to include a regex for each
 * file type, that will be used to determine the filetype when selectedFiletype is "auto". The defaults are
 * defined in state and may be overridden in config.
 * @param {Object} availableFormats - Object of available formats provided by Openlayers. These are hardcoded
 * in this file and this is only a param for the sake of avoiding global variables.
 * @returns {Object|Boolean} Returns the chosen openlayers format object or false on error.
 */
function getFormat(
  filename,
  selectedFiletype,
  supportedFiletypes,
  availableFormats,
) {
  if (selectedFiletype !== "auto") {
    if (availableFormats[selectedFiletype] === undefined) {
      console.warn(
        'File import tool: Selected filetype "' +
          selectedFiletype +
          '" has no OL Format defined for it.',
      );
      return false;
    }
    return availableFormats[selectedFiletype];
  }

  for (const formatKey in supportedFiletypes) {
    if (supportedFiletypes[formatKey].rgx === undefined) {
      continue;
    }

    if (filename.match(supportedFiletypes[formatKey].rgx) !== null) {
      if (availableFormats[formatKey] === undefined) {
        console.warn(
          'File import tool: Filetype "' +
            formatKey +
            "\" is defined as supported, but there isn't any OL Format defined for it.",
        );
        continue;
      }
      return availableFormats[formatKey];
    }
  }
  return false;
}

/**
 * Checks for OL-unsupported tags and removes them.
 * Currently unsupported tags are:
 *      - cascadingStyle
 * Removes attributes from Placemark-tag, e.g. 'id': if same id is in different imported files, the features are overwritten by ol format.
 * @param {String} rawSource - KML source as string.
 * @returns {String} Returns raw string KML source without unsupported tags.
 */
function removeBadTags(rawSource) {
  let result = rawSource;

  // remove "cascadingStyle" Tags
  result = rawSource.replace(
    /<.*?cascadingstyle.*?kml:id="(.+)">\s*<style>/gim,
    (a, b) => {
      return '<Style id="' + b + '">';
    },
  );
  result = result.replace(/<\/Style>\s*<\/.*?cascadingstyle>/gim, "</Style>");
  result = result.replace(/<Placemark.*?(>)/gim, "<Placemark>");

  return result;
}

/**
 * Reads the JSON and extracts the coordinate system.
 * @param {String} rawSource - KML source as string.
 * @returns {String} Returns CRS.Properties.Name - if not found it defaults to EPSG:4326
 */
function getCrsPropertyName(rawSource) {
  let result = "EPSG:4326";

  try {
    const jsonDoc = JSON.parse(rawSource);

    if (
      jsonDoc &&
      Object.prototype.hasOwnProperty.call(jsonDoc, "crs") &&
      Object.prototype.hasOwnProperty.call(jsonDoc.crs, "properties") &&
      Object.prototype.hasOwnProperty.call(jsonDoc.crs.properties, "name")
    ) {
      result = jsonDoc.crs.properties.name;
    }
  } catch (e) {
    // no JSON input
  }

  return result;
}

/**
 * Gets the mapped CRS property name.
 * @param {String} crsPropName The original CRS property name.
 * @returns {String} The mapped CRS property name.
 */
function getMappedCrsPropName(crsPropName) {
  const epsg4326Codes = [
    "urn:ogc:def:crs:EPSG:6.6:4326",
    "urn:ogc:def:crs:OGC:1.3:CRS84",
    "urn:ogc:def:crs:OGC:1.3:CRS:84",
    "urn:ogc:def:crs:OGC:2:84",
    "urn:x-ogc:def:crs:EPSG:4326",
  ];

  const epsg3857Codes = [
    "EPSG:102100",
    "EPSG:102113",
    "EPSG:900913",
    "urn:ogc:def:crs:EPSG:6.18:3:3857",
  ];

  if (epsg4326Codes.includes(crsPropName)) {
    return "EPSG:4326";
  } else if (epsg3857Codes.includes(crsPropName)) {
    return "EPSG:3857";
  }

  return null;
}

/**
 * Checks for isVisible setting and in case it's not there adds it.
 * @param {Array} features The Features to be inspected.
 * @returns {Array} Returns Features with isVisible set.
 */
function checkIsVisibleSetting(features) {
  const resFeatures = features;

  resFeatures.forEach((feature) => {
    // in case File doesn't have the isVisible setting
    if (Object.prototype.hasOwnProperty.call(feature, "values_")) {
      if (!Object.prototype.hasOwnProperty.call(feature.values_, "isVisible")) {
        feature.values_.isVisible = true;
      }
    }
  });

  return resFeatures;
}

/**
 * Gets custom attributes from feature by parsing given feature keys.
 * @param {ol/Feature} feature The feature.
 * @returns {Object} The parsed attributes.
 */
function getParsedCustomAttributes(feature) {
  if (
    typeof feature.getKeys !== "function" ||
    !Array.isArray(feature.getKeys())
  ) {
    return {};
  }

  let attributes = feature.get("attributes");

  if (!isObject(attributes)) {
    attributes = {};
  }
  feature.getKeys().forEach((key) => {
    if (
      typeof key.split === "function" &&
      key.split("custom-attribute____").length > 1
    ) {
      const parsedKey = key.split("custom-attribute____")[1];

      attributes[parsedKey] = feature.get(key);
    }
  });
  return attributes;
}

export default {
  /**
   * Sets the featureExtents
   * @param {Object} param.state the state
   * @param {Object} param.commit the commit
   * @param {ol/Feature[]} payload.features the parsed features
   * @param {String} payload.fileName the file name
   * @returns {void}
   */
  setFeatureExtents({ state, commit }, { features, fileName }) {
    const extents = state.featureExtents,
      extent = createEmptyExtent();

    for (let i = 0; i < features.length; i++) {
      extend(extent, features[i].getGeometry().getExtent());
    }

    extents[fileName] = extent;
    commit("setFeatureExtents", extents);
  },

  /**
   * Imports the given KML file from datasrc.raw, creating the features into datasrc.layer.
   * @param {Object} param.state the state
   * @param {Object} param.dispatch the dispatch
   * @param {Object} param.rootGetters the root getters
   * @param {Object} datasrc data source to import, with properties filename, layer and raw.
   * @returns {void}
   */
  importFile({ state, dispatch, rootGetters }, datasrc) {
    const vectorLayer = datasrc.layer,
      fileName = datasrc.filename,
      format = getFormat(
        fileName,
        state.selectedFiletype,
        state.supportedFiletypes,
        supportedFormats,
      ),
      crsPropName = getCrsPropertyName(datasrc.raw),
      customAttributes = {};

    let featureError = false,
      alertingMessage,
      features;

    if (format instanceof KML) {
      datasrc.raw = removeBadTags(datasrc.raw);
    }

    if (format === false) {
      const fileNameSplit = fileName.split("."),
        fileFormat =
          fileNameSplit.length > 0
            ? "*." + fileNameSplit[fileNameSplit.length - 1]
            : "unknown";

      alertingMessage = {
        category: "error",
        content: i18next.t(
          "common:modules.appFileImport.alertingMessages.missingFormat",
          { format: fileFormat },
        ),
      };

      dispatch("Alerting/addSingleAlert", alertingMessage, {
        root: true,
      });
      return;
    }

    try {
      features = format.readFeatures(datasrc.raw);

      if (format instanceof KML) {
        const indices = [];

        features.forEach((feature, i) => {
          if (
            feature.getGeometry() !== null &&
            feature.getGeometry().getType() === "Point"
          ) {
            if (feature.values_.name === undefined) {
              // import of point no text: showPointNames must be false
              indices.push(i);
            }
          }
        });
        if (indices.length > 0) {
          // type Point with no names (=Icons) have to be imported with special options, else if downloaded over draw tool again there will be an error
          const specialFormat = new KML({
              extractStyles: true,
              showPointNames: false,
              crossOrigin: null,
            }),
            featuresNoPointNames = specialFormat.readFeatures(datasrc.raw);

          indices.forEach((index) => {
            features[index] = featuresNoPointNames[index];
          });
        }
      }
    } catch (ex) {
      console.warn(ex);
      alertingMessage = {
        category: "error",
        content: i18next.t(
          "common:modules.appFileImport.alertingMessages.formatError",
          { filename: fileName },
        ),
      };

      dispatch("Alerting/addSingleAlert", alertingMessage, {
        root: true,
      });
      return;
    }

    if (!Array.isArray(features) || features.length === 0) {
      alertingMessage = {
        category: "error",
        content: i18next.t(
          "common:modules.appFileImport.alertingMessages.missingFileContent",
          { filename: fileName },
        ),
      };

      dispatch("Alerting/addSingleAlert", alertingMessage, {
        root: true,
      });
      return;
    }

    features.forEach((feature) => {
      const featureAttributes = getParsedCustomAttributes(feature);
      let geometries;

      feature.set("attributes", featureAttributes);
      feature.setProperties(featureAttributes);
      Object.keys(featureAttributes).forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(customAttributes, key)) {
          customAttributes[key] = key;
        }
      });

      if (feature.get("isGeoCircle")) {
        const circleCenter = feature
            .get("geoCircleCenter")
            .split(",")
            .map(parseFloat),
          circleRadius = parseFloat(feature.get("geoCircleRadius"));

        feature.setGeometry(new Circle(circleCenter, circleRadius));
      }
      if (
        /true/.test(feature.get("fromDrawTool")) &&
        feature.get("name") &&
        feature.getGeometry().getType() === "Point"
      ) {
        const style = feature.getStyleFunction()(feature).clone();

        feature.setStyle(
          new Style({
            image: new CircleStyle(),
            text: new Text({
              fill: style.getText().getFill(),
              font: defaultFont,
              scale: style.getText().getScale(),
              text: style.getText().getText(),
              textAlign: "left",
              textBaseline: "bottom",
            }),
          }),
        );
        feature.set("drawState", {
          fontSize:
            parseInt(defaultFont.split("px")[0], 10) *
            style.getText().getScale(),
          text: style.getText().getText(),
          color: style.getText().getFill().getColor(),
        });
      }
      if (feature.getGeometry() === null) {
        featureError = true;
        alertingMessage = {
          category: "error",
          content: i18next.t(
            "common:modules.appFileImport.alertingMessages.featureError",
          ),
        };

        dispatch("Alerting/addSingleAlert", alertingMessage, {
          root: true,
        });
      } else {
        if (feature.getGeometry().getType() === "GeometryCollection") {
          geometries = feature.getGeometry().getGeometries();
        } else {
          geometries = [feature.getGeometry()];
        }

        geometries.forEach((geometry) => {
          let mappedCrsPropName =
            getMappedCrsPropName(crsPropName) || crsPropName;

          geometry.transform(
            mappedCrsPropName,
            rootGetters["Maps/projectionCode"],
          );
          feature.set("source", fileName);
        });
      }
      if (
        typeof feature.get === "function" &&
        typeof feature.get("styleId") === "undefined"
      ) {
        feature.set("styleId", uniqueId(""));
      }
    });

    features = checkIsVisibleSetting(features);

    vectorLayer.getSource().addFeatures(features);
    vectorLayer.set("gfiAttributes", customAttributes);

    if (featureError) {
      alertingMessage = {
        category: "error",
        content: i18next.t(
          "common:modules.appFileImport.alertingMessages.successPartly",
          { filename: fileName },
        ),
      };
    } else {
      alertingMessage = {
        category: "success",
        content: i18next.t(
          "common:modules.appFileImport.alertingMessages.success",
          { filename: fileName },
        ),
      };
    }
    dispatch(
      "Alerting/addSingleAlert",
      {
        category: alertingMessage.category,
        content: alertingMessage.content,
      },
      { root: true },
    );

    dispatch("addImportedFilename", fileName);

    if (state.enableZoomToExtend && features.length) {
      dispatch("setFeatureExtents", {
        features: features,
        fileName: fileName,
      });
    }
  },

  /**
   * Imports the given GeoJSON file from datasrc.raw, creating the features into datasrc.layer.
   * @param {Object} param.state the state
   * @param {Object} param.dispatch the dispatch
   * @param {Object} param.rootGetters the root getters
   * @param {Object} datasrc data source to import, with properties filename, layer and raw.
   * @returns {void}
   */
  importGeoJSON({ state, dispatch, rootGetters }, datasrc) {
    const vectorLayer = datasrc.layer,
      fileName = datasrc.filename,
      format = getFormat(
        fileName,
        state.selectedFiletype,
        state.supportedFiletypes,
        supportedFormats,
      ),
      gfiAttributes = {},
      crsPropName = getCrsPropertyName(datasrc.raw);

    let alertingMessage, features;

    if (format === false) {
      const fileNameSplit = fileName.split("."),
        fileFormat =
          fileNameSplit.length > 0
            ? "*." + fileNameSplit[fileNameSplit.length - 1]
            : "unknown";

      alertingMessage = {
        category: "error",
        content: i18next.t(
          "common:modules.appFileImport.alertingMessages.missingFormat",
          { format: fileFormat },
        ),
      };

      dispatch("Alerting/addSingleAlert", alertingMessage, {
        root: true,
      });
      return;
    }

    try {
      features = format.readFeatures(datasrc.raw, {
        dataProjection: getCrsPropertyName(datasrc.raw),
        featureProjection: rootGetters["Maps/projectionCode"],
      });
    } catch (ex) {
      console.warn(ex);
      alertingMessage = {
        category: "error",
        content: i18next.t(
          "common:modules.appFileImport.alertingMessages.formatError",
          { filename: fileName },
        ),
      };

      dispatch("Alerting/addSingleAlert", alertingMessage, {
        root: true,
      });
      return;
    }

    if (!Array.isArray(features) || features.length === 0) {
      alertingMessage = {
        category: "error",
        content: i18next.t(
          "common:modules.appFileImport.alertingMessages.missingFileContent",
          { filename: fileName },
        ),
      };

      dispatch("Alerting/addSingleAlert", alertingMessage, {
        root: true,
      });
      return;
    }

    let { R, G, B } = getRandomRGB();

    if (datasrc.layer.values_.styleId === "default") {
      vectorLayer.setStyle((feature) => {
        const drawState = feature.getProperties().drawState;
        let style;

        if (!drawState) {
          const defaultColor = [R, G, B, 0.9],
            defaultFillColor = [R + 2 > 255 ? 255 : R + 2, G, B, 0.5],
            defaultPointSize = 16,
            defaultStrokeWidth = 1,
            defaultCircleRadius = 300,
            geometryType = feature ? feature.getGeometry().getType() : "Cesium";

          if (geometryType === "Point" || geometryType === "MultiPoint") {
            style = createDrawStyle(
              defaultColor,
              defaultColor,
              geometryType,
              defaultPointSize,
              1,
              1,
            );
          } else if (
            geometryType === "LineString" ||
            geometryType === "MultiLineString"
          ) {
            style = new Style({
              stroke: new Stroke({
                color: defaultColor,
                width: defaultStrokeWidth,
              }),
            });
          } else if (
            geometryType === "Polygon" ||
            geometryType === "MultiPolygon"
          ) {
            style = new Style({
              stroke: new Stroke({
                color: defaultColor,
                width: defaultStrokeWidth,
              }),
              fill: new Fill({
                color: defaultFillColor,
              }),
            });
          } else if (geometryType === "Circle") {
            style = new Style({
              stroke: new Stroke({
                color: defaultColor,
                width: defaultStrokeWidth,
              }),
              fill: new Fill({
                color: defaultFillColor,
              }),
              circleRadius: defaultCircleRadius,
              colorContour: defaultColor,
            });
          } else {
            console.warn("Geometry type not implemented: " + geometryType);
            style = new Style();
          }

          return style.clone();
        }

        if (drawState.drawType.geometry === "Point") {
          if (drawState.text) {
            style = new Style({
              image: new CircleStyle({}),
              text: new Text({
                text: drawState.text,
                font: drawState.fontSize + "px Arial,sans-serif",
                fill: new Fill({
                  color: drawState.color,
                }),
              }),
            });
          } else if (drawState.symbol.value !== "simple_point") {
            style = new Style({
              image: new Icon({
                crossOrigin: "anonymous",
                src:
                  drawState.symbol.value.indexOf("/") > 0
                    ? drawState.symbol.value
                    : drawState.imgPath + drawState.symbol.value,
                scale: drawState.symbol.scale,
              }),
            });
          } else {
            style = createDrawStyle(
              drawState.color,
              drawState.color,
              drawState.drawType.geometry,
              drawState.pointSize,
              1,
              drawState.zIndex,
            );
          }
        } else if (
          drawState.drawType.geometry === "LineString" ||
          drawState.drawType.geometry === "MultiLineString"
        ) {
          style = new Style({
            stroke: new Stroke({
              color: drawState.colorContour,
              width: drawState.strokeWidth,
            }),
          });
        } else if (
          drawState.drawType.geometry === "Polygon" ||
          drawState.drawType.geometry === "MultiPolygon"
        ) {
          style = new Style({
            stroke: new Stroke({
              color: drawState.colorContour,
              width: drawState.strokeWidth,
            }),
            fill: new Fill({
              color: drawState.color,
            }),
          });
        } else if (drawState.drawType.geometry === "Circle") {
          style = new Style({
            stroke: new Stroke({
              color: drawState.colorContour,
              width: drawState.strokeWidth,
            }),
            fill: new Fill({
              color: drawState.color,
            }),
            circleRadius: drawState.circleRadius,
            circleOuterRadius: drawState.circleOuterRadius,
            colorContour: drawState.colorContour,
            outerColorContour: drawState.outerColorContour,
          });
        } else {
          console.warn(
            "Geometry type not implemented: " + drawState.drawType.geometry,
          );
          style = new Style();
        }

        return style.clone();
      });
    }

    features = checkIsVisibleSetting(features);

    features.forEach((feature) => {
      if (isObject(feature.get("attributes"))) {
        Object.keys(feature.get("attributes")).forEach((key) => {
          gfiAttributes[key] = key;
        });
      }

      if (vectorLayer.getStyleFunction()(feature) !== undefined) {
        feature.setStyle(vectorLayer.getStyleFunction()(feature));
      }

      if (feature.get("isGeoCircle")) {
        const circleCenter = feature
            .get("geoCircleCenter")
            .split(",")
            .map(parseFloat),
          circleRadius = parseFloat(feature.get("geoCircleRadius"));

        feature.setGeometry(new Circle(circleCenter, circleRadius));
      }

      if (feature.getGeometry() === null) {
        featureError = true;
        alertingMessage = {
          category: "error",
          content: i18next.t(
            "common:modules.appFileImport.alertingMessages.featureError",
          ),
        };
        dispatch("Alerting/addSingleAlert", alertingMessage, {
          root: true,
        });
      } else {
        if (feature.getGeometry().getType() === "GeometryCollection") {
          geometries = feature.getGeometry().getGeometries();
        } else {
          geometries = [feature.getGeometry()];
        }

        geometries.forEach((geometry) => {
          const mappedCrsPropName = getMappedCrsPropName(crsPropName);

          if (mappedCrsPropName) {
            geometry.transform(
              mappedCrsPropName,
              rootGetters["Maps/projectionCode"],
            );
          }

          feature.set("source", fileName);
          vectorLayer.getSource().addFeature(feature);
        });
      }
    });

    if (!vectorLayer.get("gfiAttributes")) {
      dispatch(
        "replaceByIdInLayerConfig",
        {
          layerConfigs: [
            {
              id: fileName,
              layer: { gfiAttributes },
            },
          ],
        },
        { root: true },
      );
    }

    alertingMessage = {
      category: "success",
      content: i18next.t(
        "common:modules.appFileImport.alertingMessages.success",
        { filename: fileName },
      ),
    };

    dispatch("Alerting/addSingleAlert", alertingMessage, { root: true });
    dispatch("addImportedFilename", fileName);

    if (state.enableZoomToExtend && features.length) {
      dispatch("setFeatureExtents", {
        features: features,
        fileName: fileName,
      });
    }
  },

  /**
   * Adds the name of a successfully imported file to list of imported filenames
   * @param {Object} param.state the state
   * @param {Object} param.commit the commit
   * @param {String} fileName name of the file
   * @returns {void}
   */
  addImportedFilename({ state, commit }, fileName) {
    const fileNames = [...state.importedFileNames];

    fileNames.push(fileName);
    commit("setImportedFileNames", fileNames);
  },

  /**
   * Adds a layer Config to app-store layerConfigs
   * @param {Object} param.dispatch the dispatch
   * @param {Object} param.state the state
   * @returns {ol/layer} The created layer.
   */
  async addLayerConfig({ dispatch, state }, fileName) {
    const fileId = `${sanitizeSelector(fileName)}_${uniqueId("importedFile_")}`;

    const fileNameSplit = fileName.split("."),
      fileExtension =
        fileNameSplit.length > 0
          ? fileNameSplit[fileNameSplit.length - 1].toLowerCase()
          : "";

    if (!layerCollection.getLayerById(fileId)) {
      await dispatch(
        "addLayerToLayerConfig",
        {
          layerConfig: {
            id: fileId,
            name: fileName,
            showInLayerTree: true,
            typ:
              fileExtension === "geojson" || fileExtension === "json"
                ? "GeoJSON"
                : "VECTORBASE",
            type: "layer",
            visibility: true,
          },
          parentKey: treeSubjectsKey,
        },
        { root: true },
      );
    }
    return layerCollection.getLayerById(fileId);
  },

  /**
   * Opens the draw tool in the secondary Menu
   * @returns {void}
   */
  openDrawTool({ dispatch, rootGetters }) {
    const menuSide = "secondaryMenu",
      menuExpanded = "Menu/expanded";

    dispatch(
      "Menu/changeCurrentComponent",
      {
        type: "draw_old",
        side: menuSide,
        props: { name: i18next.t("common:modules.draw_old.name") },
      },
      { root: true },
    );

    if (!rootGetters[menuExpanded](menuSide)) {
      dispatch("Menu/toggleMenu", menuSide, { root: true });
    }
  },

  /**
   * Processes the config.json on file load.
   * @param {Object} param.commit the commit
   * @param {Object} param.dispatch the dispatch
   * @param {Progressevent} event Event contains the loaded file.
   * @returns {void}
   */
  processConfigJsonOnload({ commit, dispatch }, event) {
    const configJson = JSON.parse(event.target.result);

    layerCollection.clear();
    commit("setPortalConfig", configJson.portalConfig, { root: true });
    Object.keys(configJson[treeTopicConfigKey]).forEach((topic) => {
      commit(
        "setLayerConfigByParentKey",
        {
          layerConfigs: configJson[treeTopicConfigKey][topic],
          parentKey: topic,
        },
        { root: true },
      );
    });
    dispatch("extendLayers", null, { root: true });
  },
};

