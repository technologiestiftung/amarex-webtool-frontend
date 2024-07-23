
function calculatePrecisely(value, precision = 9) {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

function getDecimalPlaces(number) {
  const str = number.toString();
  const decimalIndex = str.indexOf(".");
  return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
}

function calculateAttributeSum(areas, attribute) {
  return calculatePrecisely(
    areas.reduce((sum, area) => sum + Number(area.values_[attribute]), 0),
  );
}

function calculateAttributeAverage(areas, attribute) {
  return calculatePrecisely(
    areas.reduce((sum, area) => sum + Number(area.values_[attribute]), 0) /
      areas.length,
  );
}

function getTotalArea(areas) {
  return calculatePrecisely(
    areas.reduce((sum, area) => sum + Number(area.values_.area), 0),
  );
}

function getTotalRoofArea(areas) {
  return calculatePrecisely(
    areas.reduce(
      (sum, area) =>
        sum + Number(area.values_.area) * Number(area.values_.roof),
      0,
    ),
  );
}

function getTotalGreenRoofArea(areas) {
  return calculatePrecisely(
    areas.reduce(
      (sum, area) =>
        sum +
        Number(area.values_.area) *
          Number(area.values_.roof) *
          Number(area.values_.green_roof),
      0,
    ),
  );
}

function getTotalPavedArea(areas) {
  return calculatePrecisely(
    areas.reduce(
      (sum, area) => sum + Number(area.values_.area) * Number(area.values_.pvd),
      0,
    ),
  );
}

function getTotalUnpavedArea(areas) {
  return calculatePrecisely(
    areas.reduce(
      (sum, area) =>
        sum +
        Number(area.values_.area) *
          (1 - Number(area.values_.roof) - Number(area.values_.pvd)),
      0,
    ),
  );
}

function getTotalSwaleConnectedArea(areas) {
  return calculatePrecisely(
    areas.reduce(
      (sum, area) =>
        sum +
        Number(area.values_.area) *
          (Number(area.values_.roof) + Number(area.values_.pvd)) *
          Number(area.values_.to_swale),
      0,
    ),
  );
}

function getTotalSealedArea(areas) {
  return calculatePrecisely(getTotalRoofArea(areas) + getTotalPavedArea(areas));
}

function getMeanRoof(areas) {
  const totalArea = getTotalArea(areas);
  return totalArea
    ? calculatePrecisely(getTotalRoofArea(areas) / totalArea)
    : 0;
}

function getMeanGreenRoof(areas) {
  const totalArea = getTotalArea(areas);
  return totalArea
    ? calculatePrecisely(getTotalGreenRoofArea(areas) / totalArea)
    : 0;
}

function getMeanPaved(areas) {
  const totalArea = getTotalArea(areas);
  return totalArea
    ? calculatePrecisely(getTotalPavedArea(areas) / totalArea)
    : 0;
}

function getMeanUnpaved(areas) {
  const totalArea = getTotalArea(areas);
  return totalArea
    ? calculatePrecisely(getTotalUnpavedArea(areas) / totalArea)
    : 0;
}

function getMeanSwaleConnected(areas) {
  const totalArea = getTotalArea(areas);
  return totalArea
    ? calculatePrecisely(getTotalSwaleConnectedArea(areas) / totalArea)
    : 0;
}

function getMaxGreenRoof(areas) {
  return getMeanRoof(areas);
}

function getMaxUnpaved(areas) {
  return calculatePrecisely(1 - getMeanRoof(areas));
}

function getMaxSwaleConnected(areas, unpaved_slider_value) {
  return calculatePrecisely(1 - unpaved_slider_value);
}

export default {
  getTotalArea,
  getTotalRoofArea,
  getTotalGreenRoofArea,
  getTotalPavedArea,
  getTotalUnpavedArea,
  getTotalSwaleConnectedArea,
  getTotalSealedArea,
  getMeanRoof,
  getMeanGreenRoof,
  getMeanPaved,
  getMeanUnpaved,
  getMeanSwaleConnected,
  getMaxGreenRoof,
  getMaxUnpaved,
  getMaxSwaleConnected,
  calculateAttributeSum,
  calculateAttributeAverage,

};