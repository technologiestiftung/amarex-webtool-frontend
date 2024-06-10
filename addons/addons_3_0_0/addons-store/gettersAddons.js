import ExporterAddon from "../exporterAddon/components/ExporterAddon.vue";
import ProjectUploader from "../projectUploader/components/ProjectUploader.vue";

const getters = {
  componentMap: () => {
    const coreModules = {
      projectUploader: ProjectUploader,
      exporterAddon: ExporterAddon,
    };

    moduleCollection = { ...coreModules, ...moduleCollection };
    return moduleCollection;
  },
};

export default getters;

