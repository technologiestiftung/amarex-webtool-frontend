import getters from "./gettersAddons";

import ExporterAddon from "../exporterAddon/store/indexExporterAddon";
import ProjectUploader from "../projectUploader/store/indexProjectUploader";
import ProjectDownloader from "../projectDownloader/store/indexProjectDownloader";

export default {
  namespaced: true,
  getters,
  modules: {
    // modules must be copied, else tests fail in watch mode
    ProjectUploader: { ...ProjectUploader },
    ExporterAddon: { ...ExporterAddon },
    ProjectDownloader: { ...ProjectDownloader },
  },
};

