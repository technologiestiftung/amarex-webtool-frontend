import ProjectUploader from "../projectUploader/components/ProjectUploader.vue";
import ProjectDownloader from "../projectDownloader/components/ProjectDownloader.vue";
import ReportPrinter from "../reportPrinter/components/ReportPrinter.vue";

const getters = {
  componentMap: () => {
    const coreModules = {
      projectUploader: ProjectUploader,
      projectDownloader: ProjectDownloader,
      ReportPrinter: ReportPrinter,
    };

    moduleCollection = { ...coreModules, ...moduleCollection };
    return moduleCollection;
  },
};

export default getters;

