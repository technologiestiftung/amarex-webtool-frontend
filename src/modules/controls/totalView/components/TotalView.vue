<script>
import {mapGetters} from "vuex";
import ControlIcon from "../../ControlIcon.vue";
import TableStyleControl from "../../TableStyleControl.vue";
import uiStyle from "../../../../utils/uiStyle";

/**
 * TotalView adds a control that lets the user reset the
 * view's state to the initial zoom and center coordinates.
 */
export default {
    name: "TotalView",
    props: {
        /** icon name for the control icon in style table */
        tableIcon: {
            type: String,
            default: "house-door-fill"
        }
    },
    computed: {
        ...mapGetters(["uiStyle"]),

        component () {
            return uiStyle.getUiStyle() === "TABLE" ? TableStyleControl : ControlIcon;
        },
        iconToUse () {
            return uiStyle.getUiStyle() === "TABLE" ? this.tableIcon : this.icon;
        }
    }
};
</script>
