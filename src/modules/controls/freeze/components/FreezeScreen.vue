<script>
import {mapGetters} from "vuex";
import ControlIcon from "../../ControlIcon.vue";
import TableStyleControl from "../../TableStyleControl.vue";
import uiStyle from "../../../../utils/uiStyle";

/**
 * Freeze control that allows the user to freeze the current window
 * of desktop and Mobile browser
 */
export default {
    name: "FreezeScreen",
    computed: {
        ...mapGetters(["uiStyle"]),

        component () {
            return uiStyle.getUiStyle() === "TABLE" ? TableStyleControl : ControlIcon;
        }
    }
};
</script>

<!-- <template>
    <div class="freeze-view-start">
        <component
            :is="component"
            :class="[component ? 'control' : 'Table']" // Table nicht übernommen
            :title="$t(`common:modules.controls.freeze.freeze`)"
            :icon-name="'lock-fill'"
            :on-click="showFreezeWin"
        />
    </div>
</template> -->

<style lang="scss" scoped>
    @import "~variables";

    .controls-row-right {
        .freeze-view-start {
            margin-top: 20px;
        }
    }
</style>
