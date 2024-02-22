/**
 * state of the WMSTime
 * @module modules/WMSTime/state
 *
 * @property {String} layerAppendix Value to be added to the second layer, which is added when using the layerSwiper.
 * @property {Number} windowWidth Current width (window.innerWidth) of the window in px.
 * @property {Object} layerSwiper Values for the layerSwiper.
 * @property {Number} layerSwiper.active Whether the swiper should be active.
 * @property {Number} layerSwiper.isMoving Whether the swiper is currently being moved.
 * @property {Number} layerSwiper.swiper The DOM element for the swiper.
 * @property {Number} layerSwiper.targetLayer The layer that is supposed to be manipulated.
 * @property {Number} layerSwiper.valueX The current x-axis position of the swiper.
 * @property {Object} timeSlider Values for the timeSlider.
 * @property {Boolean} timeSlider.active Whether the timeSlider window should be active.
 * @property {String} timeSlider.currentLayerId Id of the currently selected WMS-T.
 * @property {timeSliderObject[]} timeSlider.objects Array of objects containing values that are relevant for every WMS-T layer configured.
 * @property {Number} timeSlider.playbackDelay Time in seconds that a moment should be shown when using the playback function.
 * @property {Boolean} timeSlider.playing Whether the playback function is currently active in either of the TimeSlider windows.
 */
const state = {
    layerAppendix: "_secondLayer",
    windowWidth: 1280,
    visibility: true,
    layerSwiper: {
        active: false,
        isMoving: false,
        swiper: null,
        targetLayer: null,
        sourceLayer: null,
        valueX: null
    },
    timeSlider: {
        active: false,
        currentLayerId: "",
        objects: [],
        playbackDelay: 1,
        playing: false
    }
};

export default state;
