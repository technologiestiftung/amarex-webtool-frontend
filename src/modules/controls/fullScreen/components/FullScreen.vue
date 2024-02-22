<script>
import {mapGetters} from "vuex";
import ControlIcon from "../../ControlIcon.vue";
import TableStyleControl from "../../TableStyleControl.vue";
import uiStyle from "../../../../utils/uiStyle";

/**
 * FullScreen control that allows switching between fullscreen
 * and normal mode for the map. May also open a new tab if the
 * instance is running in an iFrame.
 */
export default {
    name: "FullScreen",
    computed: {
        ...mapGetters(["uiStyle"]),

        component () {
            return uiStyle.getUiStyle() === "TABLE" ? TableStyleControl : ControlIcon;
        }
    }
};
</script>
