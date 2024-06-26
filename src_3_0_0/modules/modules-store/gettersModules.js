import GraphicalSelect from "../../shared/modules/graphicalSelect/components/GraphicalSelect.vue";
import LayerPreview from "../../shared/modules/layerPreview/components/LayerPreview.vue";
import AbimoMeasure from "../abimo/components/AbimoMeasure.vue";
import About from "../about/components/AboutModule.vue";
import AddWMS from "../addWMS/components/AddWMS.vue";
import AppFileImport from "../appFileImport/components/AppFileImport.vue";
import BaselayerSwitcher from "../baselayerSwitcher/components/BaselayerSwitcher.vue";
import BufferAnalysis from "../bufferAnalysis/components/BufferAnalysis.vue";
import Contact from "../contact/components/ContactFormular.vue";
import CoordToolkit from "../coordToolkit/components/CoordToolkit.vue";
import Draw from "../draw/components/DrawModule.vue";
import Draw_old from "../draw_old/components/DrawItem.vue";
import FeatureLister from "../featureLister/components/FeatureLister.vue";
import FileImport from "../fileImport/components/FileImport.vue";
import FilterGeneral from "../filter/components/FilterGeneral.vue";
import Language from "../language/components/LanguageItem.vue";
import LayerClusterToggler from "../layerClusterToggler/components/LayerClusterToggler.vue";
import LayerInformation from "../layerInformation/components/LayerInformation.vue";
import LayerPills from "../layerPills/components/LayerPills.vue";
import LayerSelection from "../layerSelection/components/LayerSelection.vue";
import LayerSlider from "../layerSlider/components/LayerSlider.vue";
import LayerTree from "../layerTree/components/LayerTree.vue";
import Legend from "../legend/components/LegendContainer.vue";
import LoginComponent from "../login/components/LoginComponent.vue";
import Measure from "../measure/components/MeasureInMap.vue";
import CustomMenuElement from "../menu/components/CustomMenuElement.vue";
import Folder from "../menu/components/MenuFolder.vue";
import MouseHover from "../mouseHover/components/MouseHover.vue";
import NewsView from "../news/components/NewsView.vue";
import OpenConfig from "../openConfig/components/OpenConfig.vue";
import PortalFooter from "../portalFooter/components/PortalFooter.vue";
import PrintMap from "../print/components/PrintMap.vue";
import Routing from "../routing/components/RoutingTemplate.vue";
import ScaleSwitcher from "../scaleSwitcher/components/ScaleSwitcher.vue";
import SearchBar from "../searchBar/components/SearchBar.vue";
import SearchBarResultList from "../searchBar/components/SearchBarResultList.vue";
import SelectFeatures from "../selectFeatures/components/SelectFeatures.vue";
import Shadow from "../shadow/components/ShadowTool.vue";
import ShareView from "../shareView/components/ShareView.vue";
import StyleVT from "../styleVT/components/StyleVT.vue";
import WfsSearch from "../wfsSearch/components/WfsSearch.vue";
import Wfst from "../wfst/components/WfsTransaction.vue";
import WmsTime from "../wmsTime/components/WmsTime.vue";

const getters = {
  componentMap: () => {
    const coreModules = {
      abimo: AbimoMeasure,
      about: About,
      addWMS: AddWMS,
      appFileImport: AppFileImport,
      baselayerSwitcher: BaselayerSwitcher,
      bufferAnalysis: BufferAnalysis,
      contact: Contact,
      coordToolkit: CoordToolkit,
      customMenuElement: CustomMenuElement,
      draw: Draw,
      draw_old: Draw_old,
      featureLister: FeatureLister,
      fileImport: FileImport,
      filter: FilterGeneral,
      folder: Folder,
      graphicalSelect: GraphicalSelect,
      language: Language,
      layerClusterToggler: LayerClusterToggler,
      layerInformation: LayerInformation,
      layerPills: LayerPills,
      layerPreview: LayerPreview,
      layerSelection: LayerSelection,
      layerSlider: LayerSlider,
      layerTree: LayerTree,
      legend: Legend,
      login: LoginComponent,
      measure: Measure,
      mouseHover: MouseHover,
      news: NewsView,
      openConfig: OpenConfig,
      portalFooter: PortalFooter,
      print: PrintMap,
      routing: Routing,
      searchbar: SearchBar,
      searchbarresultlist: SearchBarResultList,
      scaleSwitcher: ScaleSwitcher,
      selectFeatures: SelectFeatures,
      shadow: Shadow,
      shareView: ShareView,
      styleVT: StyleVT,
      wfsSearch: WfsSearch,
      wfst: Wfst,
      wmsTime: WmsTime,
    };

    moduleCollection = { ...coreModules, ...moduleCollection };
    return moduleCollection;
  },
};

export default getters;

