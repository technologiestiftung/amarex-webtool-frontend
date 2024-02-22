<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import ContactFormularInput from "./ContactFormularInput.vue";
import FlatButton from "../../../shared/modules/buttons/components/FlatButton.vue";
import IconButton from "../../../shared/modules/buttons/components/IconButton.vue";
import FileUpload from "../../../shared/modules/inputs/components/FileUpload.vue";

/**
 * The Contact Form
 * @module modules/ContactFormular
 * @vue-data {String} sendIcon - The icon for the send button.
 * @vue-data {Boolean} fileUploaded - Shows if file was uploaded.
 * @vue-data {Array} uploadedImages - All uploaded images.
 */
export default {
    name: "ContactFormular",
    components: {
        ContactFormularInput,
        FlatButton,
        IconButton,
        FileUpload
    },
    data () {
        return {
            sendIcon: "bi-send",
            fileUploaded: false,
            uploadedImages: []
        };
    },
    computed: {
        ...mapGetters("Modules/Contact", [
            "contactInfo",
            "maxLines",
            "username",
            "mail",
            "message",
            "phone",
            "showPrivacyPolicy",
            "privacyPolicyAccepted",
            "privacyPolicyLink",
            "validForm",
            "validMail",
            "validMessage",
            "validPhone",
            "validUsername",
            "fileUpload",
            "fileArray",
            "maxFileSize",
            "configuredFileExtensions"
        ])
    },
    methods: {
        ...mapMutations("Modules/Contact", [
            "setUsername",
            "setMail",
            "setPhone",
            "setMessage",
            "togglePrivacyPolicyAccepted",
            "setFileArray"
        ]),
        ...mapActions("Modules/Contact", ["send", "importFile"]),
        ...mapActions("Alerting", ["addSingleAlert"]),
        triggerClickOnFileInput (event) {
            if (event.which === 32 || event.which === 13) {
                this.$refs["upload-input-file"].click();
            }
        },
        onInputChange (e) {
            if (e.target.files !== undefined) {
                this.addFile(e.target.files);
                e.target.value = null;
            }
        },
        onDrop (e) {
            if (e.dataTransfer.files !== undefined) {
                this.addFile(e.dataTransfer.files);
            }
        },
        addFile (files) {
            const allFiles = [];

            Array.from(files).forEach(file => {
                if (this.checkValid(file)) {
                    const reader = new FileReader();

                    reader.addEventListener("load", () => {
                        const fileNameSplit = file.name.split("."),
                            fileExtension = fileNameSplit.length > 0 ? fileNameSplit[fileNameSplit.length - 1].toLowerCase() : "";

                        if (fileExtension === "png" || fileExtension === "jpg" || fileExtension === "jpeg" || this.configuredFileExtensions.includes(fileExtension)) {
                            this.fileUploaded = true;
                            const src = file.type.includes("image") ? reader.result : URL.createObjectURL(file);

                            this.uploadedImages.push({src: src, name: file.name});
                            allFiles.push({imgString: reader.result, name: file.name, fileExtension: fileExtension});
                        }
                        else {
                            this.addSingleAlert({
                                category: "error",
                                content: this.$t("common:modules.contact.fileFormatMessage")
                            });
                        }

                    }, false);

                    if (file) {
                        // convert image file to base64 string
                        reader.readAsDataURL(file);
                    }
                }
            });
            this.setFileArray(allFiles);
        },
        removeAttachment (target) {
            this.fileArray.forEach(image => {
                if (image.imgString === target) {
                    const index = this.fileArray[image];

                    this.fileArray.splice(index, 1);
                }
            });
            this.uploadedImages.forEach(image => {
                if (image === target) {
                    const index = this.uploadedImages[image];

                    this.uploadedImages.splice(index, 1);
                }
            });
        },
        checkValid (file) {
            if (!file.type.includes("image") && this.configuredFileExtensions.length === 0) {
                this.addSingleAlert({
                    category: "error",
                    content: this.$t("common:modules.contact.fileFormatMessage")
                });
                return false;
            }
            // Check if filesize exceeds configured size
            // Default 1MB
            if (file.size > this.maxFileSize) {
                this.addSingleAlert({
                    category: "error",
                    content: this.$t("common:modules.contact.fileSizeMessage")
                });
                return false;
            }

            return true;
        }
    }
};
</script>

<template lang="html">
    <div id="contact-formular">
        <div
            v-if="contactInfo"
            id="module-contact-addionalInformation"
            class="form-floating"
        >
            {{ contactInfo }}
        </div>
        <form
            @submit.prevent="send"
        >
            <ContactFormularInput
                :change-function="setUsername"
                :input-name="'username'"
                :input-value="username"
                :label-text="'Name'"
                :valid-input="validUsername"
                :focus-on-creation="true"
            />
            <ContactFormularInput
                :change-function="setMail"
                :input-name="'mail'"
                :input-type="'email'"
                :input-value="mail"
                :label-text="'E-Mail'"
                :valid-input="validMail"
            />
            <ContactFormularInput
                :change-function="setPhone"
                :input-name="'phone'"
                :input-type="'tel'"
                :input-value="phone"
                :label-text="'Tel.'"
                :valid-input="validPhone"
            />
            <ContactFormularInput
                :change-function="setMessage"
                :html-element="'textarea'"
                :input-name="'message'"
                :input-value="message"
                :label-text="$t('common:modules.contact.messageLabel')"
                :rows="maxLines"
                :valid-input="validMessage"
            />
            <div
                v-if="showPrivacyPolicy"
                id="module-contact-privacyPolicy"
                class="form-group"
            >
                <label
                    id="module-contact-privacyPolicy-label"
                    for="module-contact-privacyPolicy-input"
                >
                    <input
                        id="module-contact-privacyPolicy-input"
                        :value="privacyPolicyAccepted"
                        type="checkbox"
                        @click="togglePrivacyPolicyAccepted"
                    >
                    {{ $t("common:modules.contact.privacyPolicy.label") }}
                </label>
                <p v-html="$t('common:modules.contact.privacyPolicy.info', {privacyPolicyLink})" />
            </div>
            <div v-if="fileUpload">
                <div
                    id="accordionFlushFile"
                    class="accordion accordion-flush mb-3"
                >
                    <div class="accordion-item">
                        <h2
                            id="flush-heading-contact"
                            class="accordion-header"
                        >
                            <button
                                class="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapse-contact"
                                aria-expanded="false"
                                aria-controls="collapse-contact"
                            >
                                <i class="bi-image me-2" />
                                {{ $t('common:modules.contact.addFileButton') }}
                            </button>
                        </h2>
                        <div
                            id="collapse-contact"
                            class="accordion-collapse collapse"
                            aria-labelledby="flush-heading"
                            data-bs-parent="#accordionFlushFile"
                        >
                            <div class="accordion-body">
                                <FileUpload
                                    :id="'attachmentUpload'"
                                    :keydown="(e) => triggerClickOnFileInput(e)"
                                    :change="(e) => onInputChange(e)"
                                    :drop="(e) => onDrop(e)"
                                >
                                    <div v-if="fileUploaded">
                                        <div
                                            v-for="image in uploadedImages"
                                            :key="image"
                                            class="row d-flex mb-1"
                                        >
                                            <embed
                                                :src="image.src"
                                                height="30"
                                                class="col-2"
                                            >
                                            <span class="d-flex align-items-center col">
                                                {{ image.name }}
                                            </span>
                                            <IconButton
                                                :aria="$t('common:modules.contact.removeAttachment')"
                                                :icon="'bi-trash'"
                                                :interaction="() => removeAttachment(image)"
                                                class="remove-btn col-3"
                                            />
                                        </div>
                                    </div>
                                </FileUpload>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-center">
                <FlatButton
                    id="module-contact-send-message"
                    aria-label="$t('common:modules.contact.sendButton')"
                    type="submit"
                    :text="$t('common:modules.contact.sendButton')"
                    :icon="sendIcon"
                    :disabled="!validForm"
                />
            </div>
        </form>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
    input[type="checkbox"] {
        cursor: pointer;
    }

    #module-contact-privacyPolicy {
        label, span {
            cursor: pointer;
        }
    }

    .remove-btn {
        z-index: 20;
        position: relative;
    }
</style>
