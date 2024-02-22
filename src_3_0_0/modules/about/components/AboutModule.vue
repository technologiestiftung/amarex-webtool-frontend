<script>
import {mapActions, mapGetters} from "vuex";

/**
 * The About Module gives information about the metadata, contact and current version of the portal
 * @module modules/AboutModule
 */
export default {
    name: "AboutModule",
    computed: {
        ...mapGetters(["configJs"]),
        ...mapGetters("Modules/About", [
            "abstractText",
            "contact",
            "cswUrl",
            "logo",
            "logoLink",
            "logoText",
            "metaUrl",
            "showAdditionalMetaData",
            "version",
            "versionLink"
        ])
    },
    mounted () {
        this.initializeAboutInfo();
    },

    methods: {
        ...mapActions("Modules/About", ["initializeAboutInfo"])
    }
};
</script>

<template lang="html">
    <div
        id="modules-about"
        class="d-flex flex-column justify-content-between"
    >
        <div class="content d-flex flex-column">
            <div
                class="pb-2 abstract"
                v-html="abstractText"
            />
            <div v-if="showAdditionalMetaData && metaUrl.length > 0">
                <p
                    class="float-end"
                >
                    <a
                        :href="metaUrl"
                        target="_blank"
                    >
                        {{ $t("common:modules.about.additionalMetadata") }}
                    </a>
                </p>
            </div>
            <div
                v-if="contact"
                class="pt-5 contact"
            >
                <h4>{{ $t("common:modules.about.contact") }}</h4>
                <p
                    v-html="contact.name"
                />
                <p
                    v-for="(positionName) in contact.positionName"
                    :key="positionName"
                    v-html="positionName"
                />
                <p>
                    {{ contact.street + "  " + contact.postalCode }}
                </p>
                <p>
                    {{ contact.city }}
                </p>
                <a
                    :href="'mailto:' + contact.email"
                >
                    {{ contact.email }}
                </a>
            </div>
        </div>
        <div
            class="d-flex flex-row justify-content-between mb-3 mt-5 align-items-center logoAndVersion"
        >
            <a
                class="logo"
                :href="logoLink ? logoLink : '#'"
                :target="logoLink ? '_blank' : '_self'"
            >
                <img
                    v-if="logo"
                    :src="logo"
                    :alt="logoText"
                >
            </a>
            <span class="version">
                <a
                    :href="versionLink ? versionLink : '#'"
                    :target="versionLink ? '_blank' : '_self'"
                >
                    {{ $t("common:modules.about.version") + version }}

                </a>
            </span>
        </div>
    </div>
</template>

<style lang="scss">
    @import "~variables";

    #modules-about {
        height: 100%;
        overflow-y: hidden;

        .content {
            overflow-y: auto;

            .abstract > p {
                font-size: $font-size-base;
            }
        }

        .logoAndVersion {
            background-color: white;
            margin-top: auto;

            .logo {
                width: 7rem;
            }
            .version {
                display: flex;
                font-size: 1.5rem;
            }
        }
    }

</style>
