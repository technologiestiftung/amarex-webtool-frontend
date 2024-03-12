import getters from "./gettersModules";

import About from "../about/store/indexAbout";
import AddWMS from "../addWMS/store/indexAddWMS";
import BaselayerSwitcher from "../baselayerSwitcher/store/indexBaselayerSwitcher";
import BufferAnalysis from "../bufferAnalysis/store/indexBufferAnalysis";
import Contact from "../contact/store/indexContact";
import CoordToolkit from "../coordToolkit/store/indexCoordToolkit";
import Draw from "../draw/store/indexDraw";
import Draw_old from "../draw_old/store/indexDraw";
import FeatureLister from "../featureLister/store/indexFeatureLister";
import FileImport from "../fileImport/store/indexFileImport";
import Filter from "../filter/store/indexFilter";
import GetFeatureInfo from "../getFeatureInfo/store/indexGetFeatureInfo";
import GraphicalSelect from "../../shared/modules/graphicalSelect/store/indexGraphicalSelect";
import Language from "../language/store/indexLanguage";
import LayerClusterToggler from "../layerClusterToggler/store/indexLayerClusterToggler";
import LayerInformation from "../layerInformation/store/indexLayerInformation";
import LayerPills from "../layerPills/store/indexLayerPills";
import LayerPreview from "../../shared/modules/layerPreview/store/indexLayerPreview";
import LayerSelection from "../layerSelection/store/indexLayerSelection";
import LayerSlider from "../layerSlider/store/indexLayerSlider";
import LayerTree from "../layerTree/store/indexLayerTree";
import Legend from "../legend/store/indexLegend";
import Login from "../login/store/indexLogin";
import Measure from "../measure/store/indexMeasure";
import MouseHover from "../mouseHover/store/indexMouseHover";
import News from "../news/store/indexNewsView";
import OpenConfig from "../openConfig/store/indexOpenConfig";
import PortalFooter from "../portalFooter/store/indexPortalFooter";
import Print from "../print/store/indexPrint";
import Routing from "../routing/store/indexRouting";
import ScaleSwitcher from "../scaleSwitcher/store/indexScaleSwitcher";
import SearchBar from "../searchBar/store/indexSearchBar";
import SelectFeatures from "../selectFeatures/store/indexSelectFeatures";
import Shadow from "../shadow/store/indexShadow";
import ShareView from "../shareView/store/indexShareView";
import StyleVT from "../styleVT/store/indexStyleVT";
import WfsSearch from "../wfsSearch/store/indexWfsSearch";
import Wfst from "../wfst/store/indexWfst";
import WmsTime from "../wmsTime/store/indexWmsTime";

export default {
    namespaced: true,
    getters,
    modules: {
        // modules must be copied, else tests fail in watch mode
        About: {...About},
        AddWMS: {...AddWMS},
        BaselayerSwitcher: {...BaselayerSwitcher},
        BufferAnalysis: {...BufferAnalysis},
        Contact: {...Contact},
        CoordToolkit: {...CoordToolkit},
        Draw: {...Draw},
        Draw_old: {...Draw_old},
        FeatureLister: {...FeatureLister},
        FileImport: {...FileImport},
        Filter: {...Filter},
        GetFeatureInfo: {...GetFeatureInfo},
        GraphicalSelect: {...GraphicalSelect},
        Language: {...Language},
        LayerClusterToggler: {...LayerClusterToggler},
        LayerInformation: {...LayerInformation},
        LayerPills: {...LayerPills},
        LayerPreview: {...LayerPreview},
        LayerSelection: {...LayerSelection},
        LayerSlider: {...LayerSlider},
        LayerTree: {...LayerTree},
        Legend: {...Legend},
        Login: {...Login},
        Measure: {...Measure},
        MouseHover: {...MouseHover},
        News: {...News},
        OpenConfig: {...OpenConfig},
        Routing: {...Routing},
        PortalFooter: {...PortalFooter},
        Print: {...Print},
        ScaleSwitcher: {...ScaleSwitcher},
        SearchBar: {...SearchBar},
        SelectFeatures: {...SelectFeatures},
        Shadow: {...Shadow},
        ShareView: {...ShareView},
        StyleVT: {...StyleVT},
        WfsSearch: {...WfsSearch},
        Wfst: {...Wfst},
        WmsTime: {...WmsTime}
    }
};
