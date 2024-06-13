import { generateSimpleGetters } from "../../../../src_3_0_0/shared/js/utils/generators";
import ProjectUploaderState from "./stateProjectUploader";

const getters = {
  ...generateSimpleGetters(ProjectUploaderState),
};

export default getters;
