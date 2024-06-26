import store from "../../../../app-store";
/**
 * Translates the AvoidOption in the corresponding value for the service
 * @param {String} avoidOption set by the user
 * @param {String} speedProfile set by the user
 * @returns {String} translated service value
 */
export default function routingOrsAvoidOption(avoidOption, speedProfile) {
  const avoidFeatureConfig =
    store.getters["Modules/Routing/directionsSettings"]?.customAvoidFeatures;

  if (
    avoidFeatureConfig &&
    avoidFeatureConfig[speedProfile] &&
    avoidFeatureConfig[speedProfile].includes(avoidOption)
  ) {
    return avoidOption.toLowerCase();
  }
  switch (avoidOption) {
    case "HIGHWAYS":
      return "highways";
    case "TOLLWAYS":
      return "tollways";
    case "FERRIES":
      return "ferries";
    case "STEPS":
      return "steps";
    case "UNPAVEDROADS":
      return "unpavedroads";
    default:
      throw new Error("Missing avoidOption translation.");
  }
}
