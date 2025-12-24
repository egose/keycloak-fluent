"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[98],{

/***/ 5031:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ DocVersionRoot)
});

// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.3/node_modules/react/index.js
var react = __webpack_require__(7140);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-common@3.9.2_@docusaurus+plugin-content-docs@3.9.2_@mdx-js+react@3.1._bf2353ac6f36851c10218cc0f54a2a94/node_modules/@docusaurus/theme-common/lib/utils/metadataUtils.js
var metadataUtils = __webpack_require__(8257);
;// ./node_modules/.pnpm/@docusaurus+plugin-content-docs@3.9.2_@mdx-js+react@3.1.1_@types+react@19.1.8_react@19._e18a7ac431fae46977eb254edf12f4be/node_modules/@docusaurus/plugin-content-docs/lib/client/docsSearch.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *//** The search tag to append as each doc's metadata. */function getDocsVersionSearchTag(pluginId,versionName){return`docs-${pluginId}-${versionName}`;}/**
 * Gets the relevant docs tags to search.
 * This is the logic that powers the contextual search feature.
 *
 * If user is browsing Android 1.4 docs, he'll get presented with:
 * - Android '1.4' docs
 * - iOS 'preferred | latest' docs
 *
 * The result is generic and not coupled to Algolia/DocSearch on purpose.
 */function useDocsContextualSearchTags(){const allDocsData=useAllDocsData();const activePluginAndVersion=useActivePluginAndVersion();const docsPreferredVersionByPluginId=useDocsPreferredVersionByPluginId();// This can't use more specialized hooks because we are mapping over all
// plugin instances.
function getDocPluginTags(pluginId){const activeVersion=activePluginAndVersion?.activePlugin.pluginId===pluginId?activePluginAndVersion.activeVersion:undefined;const preferredVersion=docsPreferredVersionByPluginId[pluginId];const latestVersion=allDocsData[pluginId].versions.find(v=>v.isLast);const version=activeVersion??preferredVersion??latestVersion;return getDocsVersionSearchTag(pluginId,version.name);}return[...Object.keys(allDocsData).map(getDocPluginTags)];}
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+plugin-content-docs@3.9.2_@mdx-js+react@3.1.1_@types+react@19.1.8_react@19._e18a7ac431fae46977eb254edf12f4be/node_modules/@docusaurus/plugin-content-docs/lib/client/docsVersion.js
var docsVersion = __webpack_require__(4812);
// EXTERNAL MODULE: ./node_modules/.pnpm/react-router-config@5.1.1_react-router@5.3.4_react@19.2.3__react@19.2.3/node_modules/react-router-config/esm/react-router-config.js
var react_router_config = __webpack_require__(8713);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/SearchMetadata/index.js
var SearchMetadata = __webpack_require__(2225);
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.3/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(5656);
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/DocVersionRoot/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function DocVersionRootMetadata(props){const{version}=props;return/*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment,{children:[/*#__PURE__*/(0,jsx_runtime.jsx)(SearchMetadata/* default */.A,{version:version.version,tag:getDocsVersionSearchTag(version.pluginId,version.version)}),/*#__PURE__*/(0,jsx_runtime.jsx)(metadataUtils/* PageMetadata */.be,{children:version.noIndex&&/*#__PURE__*/(0,jsx_runtime.jsx)("meta",{name:"robots",content:"noindex, nofollow"})})]});}function DocVersionRootContent(props){const{version,route}=props;return/*#__PURE__*/(0,jsx_runtime.jsx)(metadataUtils/* HtmlClassNameProvider */.e3,{className:version.className,children:/*#__PURE__*/(0,jsx_runtime.jsx)(docsVersion/* DocsVersionProvider */.n,{version:version,children:(0,react_router_config/* renderRoutes */.v)(route.routes)})});}function DocVersionRoot(props){return/*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment,{children:[/*#__PURE__*/(0,jsx_runtime.jsx)(DocVersionRootMetadata,{...props}),/*#__PURE__*/(0,jsx_runtime.jsx)(DocVersionRootContent,{...props})]});}

/***/ })

}]);