# Changelog Masterportal v3.0.0
 All important changes in this project are stored in this file.

[Semantic versioning](https://semver.org/spec/v2.0.0.html) is used.

## Unreleased - in development
### __Breaking Changes__

### Added
- Added config.json-Parameter Portalconfig.tree.singleBaselayer. Specifies whether only one base layer may be active at any time selectable by radio-buttons in visible layers.
- Added config.json-Parameter `Portalconfig.tree.showFolderPath`. Determines whether the folder structure of visible layers is displayed. Default is false.
- Added Shared Component for spinner.
- 3D: Min- and MaxScale are now available for layers.
- Print: An option "Improve scaling resolution" is implemented for 3d Layers to supply an improved and better resolution.
- WfsSearch:
  - A prop "resetParcelSearch" so that the wfs search parameter could be reset from outside component.
  - A prop "zoomLevelProp" has been added. Can be used to set a zoom level (after search) that is different from the configured one.
- Filter:
  - a new parameter "closeGfi" to give an option if a gfi window is open, and it could be closed after a new filtering.
  - a new parameter "universalSearch" in snippet with type "featureInfo" to enable to search the attribute value in webpage.

### Changed
- CoordToolkit: Toast added instead of Alert for feedback after copying coordinates.
- ShareView: Added more configuration.
- LayerMenu: Breadcrumbs with folder location will now stick to the top when scrolling.
- 3D tileset layer supports hiddenFeatures.

### Deprecated

### Removed
- RoutingLoadingSpinner: Was replaced with share component SpinnerItem.

### Fixed
- Issue #1084: fix wrong pointMarker placement when featureType is MultiPolygon.
- Issue #1118: The `wfsSearch` module now works with multiple select boxes.
- Issue #1119: Routing module: the route is also displayed when the start and end points are selected via the search.
- Issue #1120: The map view gets centered on searched coordinate again.
- Layer selection: The order of the layers corresponds to the order of the layers in config.json.
- Fixed HighlightFeature for MultiPolygons: In certain WFS layers, when polygon selection is enabled,
    clicking on a polygon would highlight it, but multiPolygons wouldn't. This has now been corrected.
- UrlParams: The correct layers will be visible when copying the URL.
- Routing: Spinner will spin again when loading.
- Contact Form: Telephone Field shows Error when entering letters and fields provide better feedback.
- FileImport: Import of GPX-files imports routes, tracks and points. Import of geojson-files imports all besides circles.
- ShareView: Legend and Layer information can be shared.
- MainMenu: Resizing doesn't cause layout problems anymore.
- The TopicTree-Searchinterface failed if there is an empty folder in the topic tree. Now it runs over empty folders.
---

---
## 2023-12-18 v3.0.0 - beta2
### __Breaking Changes__
- Dropped support for NodeJS 16 and Npm 8
- e2e tests are no longer supported
- The following attributes have been renamed:
    - Baselayer --> baselayer
    - Fachdaten --> subjectlayer
    - Portalconfig --> portalConfig
    - Themenconfig --> layerConfig
- The following attributes have been moved within config.json:
    - Portalconfig.baselayerSwitcher -> portalConfig.map.baselayerSwitcher
    - Portalconfig.controls -> portalConfig.map.controls
    - Portalconfig.getFeatureInfo -> portalConfig.map.getFeatureInfo
    - Portalconfig.mapView -> portalConfig.map.mapView
    - Portalconfig.mouseHover -> portalConfig.map.mouseHover
    - Portalconfig.tree.layerPills -> portalConfig.map.layerPills
- The following attributes have been moved from config.json to config.js
    - Portalconfig.alerts -> alerting.initialAlerts (`alerts` has been renamed to `initialAlerts`)
- The following attributes have been moved from config.js to config.json
    - cesiumParameter -> portalConfig.map.map3dParameter (`cesiumParameter` has been renamed to `map3dParameter`)
    - featureViaURL -> portalConfig.map.featureViaURL
    - mapInteractions -> portalConfig.map.mapView.mapInteractions
    - mapMarker -> portalConfig.map.mapMarker
    - startingMap3D -> portalConfig.map.startingMapMode (`startingMap3D` has been renamed to `startingMapMode`)
    - zoomTo -> portalConfig.map.zoomTo

### Added
- Add roadmap information to the readme file.
- Add documentation for the [config.js](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev_vue/doc/config_3_0_0.js.md) and [config.json](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev_vue/doc/config_3_0_0.json.md).
- Configurable searchBar for the layerselection.
- To manage dependencies of dependencies "overrides" for cesium are added to package.json and create dummy packages for it.
- New config.json parameter `sldVersion` for legend configuration to define a `Styled Layer Descriptor` for the GetLegendGraphic requests.
- The following packages have been added:
    - devDependencies:
        - webpack-bundle-analyzer: 4.9.1 (For usage comment in "webpack-bundle-analyzer"-code in webpack.dev.js)
- shared\js\utils\convertColor: added an option to convert an rgba array into a hex color with alpha value.
- Configurable searchbar for the layerSelection.
- Add layerParam `gfiThemeSetting`.

### Changed
- GetFeatureInfo: module opens in other menu when print module is opened
- LayerInformation: for layers that do not have metadata, the layer information can now be displayed so that the URLs and legend can be accessed.
- The following NPM packages have been updated:
    - dependencies:
        - @masterportal/masterportalapi: 2.28.0 to 2.30.0  (This also raised ol to version 8.1.0 and olcs to version 2.16.0)
        - @popperjs/core: 2.11.6 to 2.11.8
        - @vue/compat: 3.2.47 to 3.3.4
        - axios: 1.3.4 to 1.5.1
        - bootstrap: 5.2.3 to 5.3.2
        - bootstrap-icons: 1.10.3 to 1.11.1
        - chart.js: 4.2.1 to 4.4.0
        - i18next: 22.4.11 to 23.5.1
        - i18next-browser-languagedetector: 7.0.1 to 7.1.0
        - i18next-http-backend: 2.2.0 to 2.2.2
        - i18next-vue: 2.1.1 to 3.0.0
        - jsts: 2.9.2 to 2.11.0
        - qrcode: 1.5.1 to 1.5.3
        - vue: 3.2.47 to 3.3.4
        - vue-datepicker-next: 1.0.2 to 1.0.3
        - vue-multiselect: 3.0.0-beta.1 to 3.0.0-beta.2
    - devDependencies:
        - @geoblocks/print: 0.7.3 to 0.7.4
        - @sinonjs/fake-timers: 10.0.2 to 11.1.0
        - @vue/compiler-sfc: 3.3.2 to 3.3.4
        - @vue/test-utils: 2.3.1 to 2.4.1
        - canvas: 2.11.0 to 2.11.2
        - chai: 4.3.7 to 4.3.10
        - esbuild-loader: 3.0.1 to 4.0.2
        - eslint: 8.36.0 to 8.51.0
        - eslint-plugin-vue: 9.9.0 to 9.17.0
        - fs-extra: 11.1.0 to 11.1.1
        - markdown-it: 13.0.1 to 13.0.2
        - mock-local-storage: 1.1.23 to 1.1.24
        - regenerator-runtime: 0.13.11 to 0.14.0
        - replace-in-file: 6.3.5 to 7.0.1
        - sass: 1.59.3 to 1.69.0
        - sinon: 15.0.2 to 16.1.0
        - vue-loader: 17.0.1 to 17.3.0
        - webpack: 4.46.0 to 4.47.0
        - zip-a-folder: 1.1.5 to 3.1.3

- SearchBar: styled the input field.
- Print: styled loading button.
- The roadmap dates have been updated. See [Readme](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev_vue/README.md).
- Layers are only displayed on the 2D-map, if layers attributes minScale and maxScale are in maps scale-range. The layer is grayed out in the topic tree if it is not displayed on the map.
- Main Menu: added margin so scrollbar is visible on desktop.
- Search results: layers can now be added/removed directly to/from the map by activating the checkbox. The add layer button has been removed.
- Highlighting features via URL:
    - Now accepts multiple feature ids, seperated with commas.
    - Zooms the map, so that all highlighted features are visible.
- Layer selection: layers can now be added directly to the map by activating the checkbox. The add layer button has been removed. All layers are always displayed, including the layers that have already been added.
- Searchbar configuration 'minChars' was renamed to 'minCharacters'.
- ShareView: new wording for buttons and toast added for feedback after link copying.
- Tutorial: ScaleSwitcher tutorial was updated.
- Layerinformation: different labels have been updated.
- Migrated the tool `login` to MP3.0.0

### Deprecated

### Removed
- The following NPM packages have been removed:
    - dependencies
        - @panter/vue-i18next
        - dayjs (is loaded via @masterportal/masterportalapi)
        - moment
        - moment-timezone
    - devDependencies:
        - cross-env
- `Legend` : The `showLegend` and `showCollapseAllButton` attributes have been removed

### Fixed
- Issue #1073: Routing: the route is updated after moving a waypoint in the map.
- Issue #1085: Corrected case at import of layer2dRasterWmsTime in src_3_0_0\core\layers\js\layerFactory.js.
- Issue #1091: VectorStyle: read geometry type from geoserver featureTypeRequest and do not fail if some rules in style.json have no condition.
- Issue #1094: Measure Tool: unit changes not connected anymore.
- Issue #1099: The package.json is adapted, now the size of the bundle, created with "npm run build" is reduced.
- Issue #1105: Added easting and nothing labels for utm projections in CoordToolkit
- Mobile View: switching vertical and horizontal view works better now.
- Fix click issue between link of logo area and searchbar.
- Close Button is now in line with Menu navigation.
- Tools: open tools are closed when switching to a mode, that they do not support.
- Tree: sorting the layers in the topic tree in the same order as via share link.
- GFI: shown GFI is closed if dedicated layer is removed from map.
- OAF layers are now loaded and displayed correctly.
- Draw: imported features can be modified and deleted. GetFeatureInfo attributes are shown on click on imported feature.
- The routing module can now be saved via shareView.
- Print: only layers are printed that are also displayed in the current scale

---

## 2023-10-04 v3.0.0 - beta1
### __Breaking Changes__
- Configuration:
    - The `wfsSearch` modules config.json parameter 'field'-property `type` was renamed to `queryType`
    - New config.json parameter 'tree' added. Contains:
        - 'type' (was 'treeType' at root before), the following params are possible: "auto" ( = old "default")
        - 'addLayerButton': if active:true, a button to add layers is shown. On the first menu side only Layers configured in config.json with attribute 'showInLayerTree':true or "visibility": true is shown.
        - 'validLayerTypesAutoTree' (new parameter) only for tree type 'auto'
        - 'layerIDsToIgnore' (moved from config.js) only for tree type 'auto'
        - 'metaIDsToMerge' (moved from config.js) only for tree type 'auto'
        - 'metaIDsToIgnore' (moved from config.js) only for tree type 'auto'
        - 'layerIDsToStyle' (moved from config.js) only for tree type 'auto'
        - 'categories': only for tree type 'auto', contains categories in datasets of layers. Tree is structured by them.
    - The configuration of 'Themenconfig' changed: Layers are contained in "elements"-Array and have type "layer", folders have type "folder." Type "layer" is default and can be omitted.
    - The attribute 'cache' on the layer is no longer taken into account with tree.type 'auto
    - 'supportedTreeTypes': attributes 'supportedDevices' and 'supportedMapModes' are added to each module to make it configurable in which tree type the module should be displayed.
    - The configuration for `mouseHover` is moved from config.js to config.json. Also, the configuration is now optional.
    - The width of the ScaleLine [in cm] can now be configured with the attribute `scaleLineWidth`.
    - It is now possible to configure a search interface more than once. For example `elasticSearch`.
- Modules/Controls:
    - Controls: a control can only be configured in config.json as "expandable". "bottomControl" is no longer supported.
    - GetFeatureInfo:
        - The `gfi` module has been renamed to `getFeatureInfo` and is now configured at the top level in config.json/portalconfigs.
        - The menu side can be accessed under `Portalconfig.getFeatureInfo.menuSide`.
    - The `startTool` control has been renamed to `startModule`. Modules are now completely configured within the control.
    - The `saveSelection` module can now be found as `Copy link` within the `shareSelection` module.
    - PortalFooter
        - The Footer has been renamed to `portalFooter` and its configuration has been moved from config.js to config.json.
        - The `scaleLine` is now a fixed part of the `portalFooter` and is configured within it.
        - In the `portalFooter` only `urls` and the `scaleLine` are configured. For the other contents e.g. `version` or `footerInfo` a module is created in the menu. Language switching has also been moved to a separate `language` module.
    - The 'active' attribute has been removed from the modules. Instead, a module to be displayed initially can now be defined centrally for each menu window with the attribute `currentComponent`.
    - LayerIds can no longer be configured as Object in the layer configuration (config.json). Instead the suffix `#` should be used to use a LayerId more than once.
    - The `mapMarker` is now a part of `map`.
    - You can configure the possibility to add attachments to the `contact` form.
    - `Menu`: the menu has been refactored and changed completely from horizontal menu bar to sidebar navigation.
    - `Searchbar`: The searchbar has been refactored with new options e.g. that the order of the search results can be configured accordingly the order of the searchInstances in the config.json. Furthermore, the search results are categorized by the different search categories. ClickEvents can be defined for search results (e.g. zooming to results). Furthermore, buttons can be defined for the individual search interfaces, which are displayed at each search result that is visible after clicking on "show all". E.g. for addresses, a button can be configured that allows to open the routing module with a certain start address. Starting a search directly with an address zooms to the search result and places a mapMarker.
- Libraries:
    - Update from vue 2 to vue 3
    - Time library moment.js has been replaced with day.js.
- Script to migrate masterportal configuration files to version 3.0.0 was added. The command `npm run migrateConfig` prompts for input and `npm run migrateConfig help` describes usage with parameters.
- The layer attribution is now displayed in an alert when a layer is activated for the first time.

### Added
- Added documentation file doc\jsdoc.md for jsdoc in vue-components and vuex-files.
- LayerPreview: Preview images can be generated and displayed for layer types WMS, WMTS and VectorTile. The layer preview was added to the layerTree.
- The following NPM packages are added:
    - dependencies:
        - @panter/vue-i18next
        - dayjs
    - devDependencies:
        - @vue/compiler-sfc
        - cross-env
        - jsdoc
        - jsdoc-vuejs
        - shelljs
        - sinon-chai
- A new module `about` has been implemented, which can be used to show detailed information about a portal.
- A new module `baseLayerSwitcher` allows to select base layers by preview images from a configurable base layer set.
- Different modules were refactored from masterportal dev: `draw`, `filter`, `legend`, `search`, `wmsTime`, `wfst`
- The new control `tiltView` adds two controls that allow you to tilt the 3d map up or down
- Following [Addons](https://bitbucket.org/geowerkstatt-hamburg/addons/src/3.0.0-beta1/addons_3_0_0/) have been refactored:
    - `sdpDownload`, `populationRequest`, `sdpDownload`, `streetsmart`, `vcOblique` and different `gfiThemes`.
    - Additionally a mechanism was added to define searchInterfaces for the searchBar as an addon.
- The layer tree can be filtered by categories e. g. `opendata`.
- 3D print support has been added.
- 3D tile highlighting was refactored from masterportal dev.
- Possibility to use urlParams including searching within searchInterfaces.
- Printing functions for vector styling and legend has been added.
- New draw module (still in development) has been added to the code structure parallel to the refactored draw within the module folder.

### Changed
- The following NPM packages have been updated:
    - dependencies:
        - @masterportal/masterportalapi: 2.14.0 to 2.28.0
        - @vue/compat: 3.2.45 to 3.2.47
        - axios: 1.2.2 to 1.3.4
        - charts.js: 4.1.1 to 4.2.1
        - i18next: 22.4.8 to 22.4.11
        - i18next-http-backend: 2.1.1 to 2.2.0
        - moment-timezone: 0.5.40 to 0.5.41
        - vue: 3.2.45 to 3.2.47
        - vue-multiselect: 2.1.6 to 3.0.0-beta.1
    - devDependencies:
        - @vue/devtools-api: 6.4.5 to 6.5.0
        - @vue/test-utils: 2.2.7 to 2.3.1
        - esbuild-loader: 2.20.0 to 3.0.1
        - eslint: 8.31.0 to 8.36.0
        - eslint-plugin-vue: 9.8.0 to 9.9.0
        - eslint-plugin-vuejs-accessibility: 2.0.0 to 2.2.0
        - sass: 1.57.1 to 1.59.3
        - sinon: 15.0.1 to 15.0.2
- Support for node 18.16.0 and npm 9.5.1
- UI: SDP-Download UI was updated
- Different terms for baselayer (basemap, backgroundlayer, basemap, hintergrundkarte) have been unified to baselayer
- Searchbar: custom actions can be configured as buttons at each search result in list of all search results.
- Changes in routing-components in order to improve accessibility.
- The layer pills are now animated, work with the menu and only show the arrow buttons when useful.
- Proxy function handling has been centralized.

### Removed
- The url parameter `TOOLS/[tool-id]` was removed. The `MENU` parameter can be used instead.
- The following NPM packages are removed:
    - dependencies
        - @vue/compiler-sfc
        - rbush
        - rbush-knn
        - vcs-oblique
        - vue-template-compiler
        - vue2-datepicker
    - devDependencies:
        - raf
        - string-replace-loader
        - sinon-chai
        - webpack-visualizer-plugin
- The loader start screen has been removed.
- The layerAttribution control no longer exists. Instead, when a layer that has a layerAttribution is turned on, it is displayed as an alert.
- Several warnings have been removed from alerting as they are unnecessary.
- LayerAttribution is shown only once when the layer has been selected.
- The control `overViewMap` has been removed.
- `styleWMS` is no longer supported.

### Fixed
- Issue #1072: Fixed a problem when launching the portal with addons_3_0_0.
- 3D layer tree folder issues have been fixed. Vectortile layer appearing again.
- SpecialWFS search: Bugs related to MultiPolygon and Point handling, result handling, getWKTGeom have been resolved.
- Controls can be shown now on mobile mode.
- Errors in `selectFeatures` have been fixed.
- Printing Bugs with area and line measurements have been fixed in `measure` module.
- Design Bugs of the GFI window have been fixed e.g. the display of arrows.
- Different mobil bugs within `coordToolkit` have been fixed.
- Errors within the menu navigation in combination with different modules have been removed.
- UI: different Issues have been resolved and the design has been generalized.
- Legend display for WFS layer has been fixed.

---

## 2023-03-01 v3.0.0 - alpha1
### Added
- The following NPM packages are added:
    - devDependencies:
        - @babel/plugin-transform-modules-commonjs
        - @vue/devtools-api
        - @vue/compiler-sfc
        - i18next-vue
- A new module `OpenConfig` has been implemented, which can be used to load a new configuration file (config.json) at runtime.
- A new module `News` has been implemented, it displays the recent alerts.
- A new module in menu `CustomMenuElement` has been implemented. It can open a link, display html from config.json or from external file or dispatch an action.
- Modules can now have an attribute `hasMouseMapInteractions`. Only one module that has this attribute set to `true` can be open at the same time.

### Changed
- Parameters moved from config.js to config.json:
  - 'layerIDsToIgnore'
  - 'metaIDsToMerge'
  - 'metaIDsToIgnore'
  - 'layerIDsToStyle'
- The Control-Bar Design

### Removed
- The following NPM packages are removed:
    - dependencies
        - @panter/vue-i18next
        - backbone
        - backbone.radio
        - bootstrap-colorpicker
        - bootstrap-datepicker
        - bootstrap-toggle
        - jquery
        - jquery-ui
        - rbush
        - rbush-knn
        - vcs-oblique
        - vue-template-compiler
        - vue2-datepicker
    - devDependencies:
        - eslint-plugin-backbone
        - eslint-plugin-you-dont-need-lodash-underscore
        - jsdoc
        - sinon-chai
- Module print: The attribute `mapfishServiceId` has been removed. Use `printServiceId` instead.
- Module contact: The attribute `serviceID` has been removed. Use `serviceId` instead.
