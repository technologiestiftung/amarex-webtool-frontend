import ProjectUploader from "../projectUploader/components/ProjectUploader.vue";
import ProjectDownloader from "../projectDownloader/components/ProjectDownloader.vue";

const getters = {
  componentMap: () => {
    const coreModules = {
      projectUploader: ProjectUploader,
      projectDownloader: ProjectDownloader,
    };

    moduleCollection = { ...coreModules, ...moduleCollection };
    return moduleCollection;
  },
};

export default getters;

