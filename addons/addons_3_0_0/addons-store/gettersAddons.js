import ExporterAddon from "../exporterAddon/components/ExporterAddon.vue";
import ProjectUploader from "../projectUploader/components/ProjectUploader.vue";
import ProjectDownloader from "../projectDownloader/components/ProjectDownloader.vue";

const getters = {
  componentMap: () => {
    const coreModules = {
      projectUploader: ProjectUploader,
      exporterAddon: ExporterAddon,
      projectDownloader: ProjectDownloader,
    };

    moduleCollection = { ...coreModules, ...moduleCollection };
    return moduleCollection;
  },
};

export default getters;

