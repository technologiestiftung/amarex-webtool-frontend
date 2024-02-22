<script>
import {mapGetters} from "vuex";

import uiStyle from "../../../../utils/uiStyle";
/**
 * Freeze control that allows the user to freeze the current window
 * of desktop and Mobile browser
 */
export default {
    name: "FreezeScreenWindow",
    data: function () {
        return {
            posValues: ""
        };
    },
    computed: {
        ...mapGetters(["uiStyle"]),

        cssVars () {
            const rotationValue = document.getElementById("table-navigation").className.match(/\d+/g)[0];
            let xVal,
                yVal,
                xDif = 0;

            if (rotationValue === "0") {
                xVal = 45;
                yVal = 50;
                xDif = 10;
            }
            else if (rotationValue === "90") {
                xVal = 5;
                yVal = 30;
            }
            else if (rotationValue === "180") {
                xVal = 48;
                yVal = 50;
            }
            else if (rotationValue === "270") {
                xVal = 47;
                yVal = 477;
            }

            return {
                "--topValue": Math.round(document.getElementById("table-navigation").getBoundingClientRect().top) + "px",
                "--leftValue": Math.round(document.getElementById("table-navigation").getBoundingClientRect().left - xDif) + "px",
                "--rotationValue": rotationValue + "deg",
                "--xOrigin": xVal + "%",
                "--yOrigin": yVal + "%"
            };
        },
        isTable () {
            return uiStyle.getUiStyle() === "TABLE";
        }
    },
    methods: {
        /**
         * Does nothing to avoid that user tabs through the menu.
         * @returns {void}
         */
        suppressKeyEvent () {
            // do nothing, event has already been prevented/stopped.
        }
    }
};
</script>

<template>
    <div
        id="freeze-view"
        class="freeze-view freeze-activated"
        role="presentation"
        @keydown.prevent.stop="suppressKeyEvent()"
    >
        <p
            ref="unfreeze"
            :class="isTable ? 'table freeze-view-close' : 'freeze-view-close'"
            :title="$t(`common:modules.controls.freeze.unfreeze`)"
            :style="isTable ? cssVars : ''"
            tabindex="0"
            role="button"
            @click="hideFreezeWin($event)"
            @keydown="hideFreezeWin($event)"
        >
            {{ $t(`common:modules.controls.freeze.unfreeze`) }}
        </p>
    </div>
</template>

<style lang="scss" scoped>
    .freeze-view-close {
        &.table {
            left: var(--leftValue);
            top: var(--topValue);
            margin-left: auto;
            margin-right: auto;
            transform: rotate(var(--rotationValue));
            transform-origin: var(--xOrigin) var(--yOrigin);
            -webkit-transform-origin: var(--xOrigin) var(--yOrigin);
            -ms-transform-origin: var(--xOrigin) var(--yOrigin);
            -moz-transform-origin: var(--xOrigin) var(--yOrigin);
        }
    }
 #table-navigation {
        &.table-nav-0deg, &.table-nav-0deg.ui-draggable {
            .freeze-view-close {
                transform: rotate(0deg);
                transform-origin: 50% 50%;
                -webkit-transform-origin: 50% 50%;
                -ms-transform-origin: 50% 50%;
                -moz-transform-origin: 50% 50%;
            }
        }
        &.table-nav-90deg {
            .freeze-view-close {
                transform: rotate(90deg);
                transform-origin: 5% 50%;
                -webkit-transform-origin: 5% 50%;
                -ms-transform-origin: 5% 50%;
                -moz-transform-origin: 5% 50%;
            }
        }
        &.table-nav-180deg {
            .freeze-view-close {
                transform: rotate(180deg);
                transform-origin: 40% 50%;
                -webkit-transform-origin: 40% 50%;
                -ms-transform-origin: 40% 50%;
                -moz-transform-origin: 40% 50%;
            }
        }
        &.table-nav-270deg {
            .freeze-view-close {
                transform: rotate(270deg);
                transform-origin: 42% 405%;
                -webkit-transform-origin: 42% 405%;
                -ms-transform-origin: 42% 405%;
                -moz-transform-origin: 42% 405%;
            }
        }
    }
</style>
