<script>
import Feature from "ol/Feature.js";

export default {
    name: "LegendWindow",
    methods: {

        /**
         * Creats an SVG for interval circle bar style.
         * @param {String} scalingAttribute attribute that contains the values of a feature
         * @param {ol.style} style style
         * @returns {String} - style as svg
         */
        drawIntervalCircleBars: function (scalingAttribute, style) {
            const olFeature = new Feature(),
                circleBarScalingFactor = style.circleBarScalingFactor,
                barHeight = String(20 / circleBarScalingFactor);
                // clonedStyle = style.clone(),
                // intervalCircleBar = clonedStyle.getStyle().getImage().getSrc();

            olFeature.set(scalingAttribute, barHeight);
            clonedStyle.setFeature(olFeature);
            clonedStyle.setIsClustered(false);

            // return intervalCircleBar;
        }
    }
};
</script>
