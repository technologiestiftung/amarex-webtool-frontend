<script>
import {mapMutations, mapActions} from "vuex";
import mutations from "../../store/mutationsOrientation";
import Icon from "ol/style/Icon";

export default {
    name: "PoiOrientation",
    methods: {
        ...mapMutations("controls/orientation", Object.keys(mutations)),
        ...mapActions("Maps", ["zoomToExtent"]),

        /**
         * Getting the image path from feature
         * @param  {ol/feature} feat Feature
         * @return {string} imgPath the image path
         */
        getImgPath (feat) {
            let imagePath = "";
            const style = Radio.request("StyleList", "returnModelById", feat.styleId);

            if (style) {
                const featureStyle = style.createStyle(feat, false);

                if (featureStyle?.getImage?.() instanceof Icon) {
                    imagePath = featureStyle.getImage()?.getSrc() ? featureStyle.getImage()?.getSrc() : "";
                }
                else {
                    style.getLegendInfos().forEach(legendInfo => {
                        if (legendInfo.geometryType === "Point" && legendInfo.styleObject.get("type") === "circle") {
                            imagePath = this.createCircleSVG(legendInfo.styleObject);
                        }
                        else if (legendInfo.geometryType === "LineString") {
                            imagePath = this.createLineSVG(legendInfo.styleObject);
                        }
                        else if (legendInfo.geometryType === "Polygon") {
                            imagePath = this.createPolygonGraphic(legendInfo.styleObject);
                        }
                    });
                }
            }

            return imagePath;
        },

        /**
         * Creating the circle svg
         * @param  {ol/style} style ol style
         * @return {string} SVG
         */
        createCircleSVG (style) {
            let svg = "";
            const circleStrokeColor = style.returnColor(style.get("circleStrokeColor"), "hex"),
                circleStrokeOpacity = style.get("circleStrokeColor")[3].toString() || 0,
                circleStrokeWidth = style.get("circleStrokeWidth"),
                circleFillColor = style.returnColor(style.get("circleFillColor"), "hex"),
                circleFillOpacity = style.get("circleFillColor")[3].toString() || 0;

            svg += "<svg height='35' width='35'>";
            svg += "<circle cx='17.5' cy='17.5' r='15' stroke='";
            svg += circleStrokeColor;
            svg += "' stroke-opacity='";
            svg += circleStrokeOpacity;
            svg += "' stroke-width='";
            svg += circleStrokeWidth;
            svg += "' fill='";
            svg += circleFillColor;
            svg += "' fill-opacity='";
            svg += circleFillOpacity;
            svg += "'/>";
            svg += "</svg>";

            return svg;
        },

        /**
         * Creating the line svg
         * @param  {ol/style} style ol style
         * @return {string} SVG
         */
        createLineSVG (style) {
            let svg = "";
            const strokeColor = style.returnColor(style.get("lineStrokeColor"), "hex"),
                strokeWidth = parseInt(style.get("lineStrokeWidth"), 10),
                strokeOpacity = style.get("lineStrokeColor")[3].toString() || 0;

            svg += "<svg height='35' width='35'>";
            svg += "<path d='M 05 30 L 30 05' stroke='";
            svg += strokeColor;
            svg += "' stroke-opacity='";
            svg += strokeOpacity;
            svg += "' stroke-width='";
            svg += strokeWidth;
            svg += "' fill='none'/>";
            svg += "</svg>";

            return svg;
        },

        /**
         * Creating the polygon graphic
         * @param  {ol/style} style ol style
         * @return {string} SVG or data URL
         */
        createPolygonGraphic (style) {
            let svg = "";
            const fillColor = style.returnColor(style.get("polygonFillColor") || "black", "hex"),
                strokeColor = style.returnColor(style.get("polygonStrokeColor"), "hex"),
                strokeWidth = parseInt(style.get("polygonStrokeWidth"), 10),
                fillOpacity = style.get("polygonFillColor")?.[3]?.toString() || 0,
                strokeOpacity = style.get("polygonStrokeColor")[3].toString() || 0,
                fillHatch = style.get("polygonFillHatch");

            if (fillHatch) {
                return style.getPolygonFillHatchLegendDataUrl();
            }

            svg += "<svg height='35' width='35'>";
            svg += "<polygon points='5,5 30,5 30,30 5,30' style='fill:";
            svg += fillColor;
            svg += ";fill-opacity:";
            svg += fillOpacity;
            svg += ";stroke:";
            svg += strokeColor;
            svg += ";stroke-opacity:";
            svg += strokeOpacity;
            svg += ";stroke-width:";
            svg += strokeWidth;
            svg += ";'/>";
            svg += "</svg>";

            return svg;
        }
    }
};
</script>
