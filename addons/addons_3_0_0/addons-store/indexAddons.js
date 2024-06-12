import getters from "./gettersAddons";

import ProjectUploader from "../projectUploader/store/indexProjectUploader";
import ProjectDownloader from "../projectDownloader/store/indexProjectDownloader";

export default {
  namespaced: true,
  getters,
  modules: {
    // modules must be copied, else tests fail in watch mode
    ProjectUploader: { ...ProjectUploader },
    ProjectDownloader: { ...ProjectDownloader },
  },
};

