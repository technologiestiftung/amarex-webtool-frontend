/**
 * The state for the control rotation.
 * @module modules/controls/rotation/store/stateRotation
 * @typedef {Object} RotationState
 * @property {String} [icon="bi-cursor"] Icon of the rotation button.
 * @property {Boolean} [showAlways=false] Defines whether the control is shown permanently.
 * @property {String[]} [supportedDevices=["Desktop", "Mobile"]] Devices on which the module is displayed.
 * @property {String[]} [supportedMapModes=["2D", "3D"]] Map mode in which this module can be used.
 */
const state = {
    icon: "bi-cursor",
    showAlways: false,
    supportedDevices: ["Desktop", "Mobile"],
    supportedMapModes: ["2D", "3D"]
};

export default state;
