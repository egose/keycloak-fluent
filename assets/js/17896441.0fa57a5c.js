"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[401],{

/***/ 1479:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ AdmonitionWrapper)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7140);
/* harmony import */ var _theme_original_Admonition__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4384);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5656);
function AdmonitionWrapper(props){return/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.Fragment,{children:[/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div",{className:"text-right -mb-10 mr-2",children:/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("button",{className:"cursor-pointer",onClick:event=>{const btn=event.currentTarget;const siblingDiv=btn.parentElement.nextElementSibling;const contentElm=siblingDiv.querySelector('p > strong');if(contentElm){const text=contentElm.textContent;const utterance=new SpeechSynthesisUtterance(text);utterance.lang='en-US';// or "ko-KR", "fr-FR", etc.
speechSynthesis.speak(utterance);}},children:/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round",class:"icon icon-tabler icons-tabler-outline icon-tabler-volume",children:[/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("path",{stroke:"none",d:"M0 0h24v24H0z",fill:"none"}),/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("path",{d:"M15 8a5 5 0 0 1 0 8"}),/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("path",{d:"M17.7 5a9 9 0 0 1 0 14"}),/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("path",{d:"M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"})]})})}),/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_theme_original_Admonition__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .A,{...props})]});}

/***/ }),

/***/ 4226:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ DocItem)
});

// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.3/node_modules/react/index.js
var react = __webpack_require__(7140);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-common@3.9.2_@docusaurus+plugin-content-docs@3.9.2_@mdx-js+react@3.1._bf2353ac6f36851c10218cc0f54a2a94/node_modules/@docusaurus/theme-common/lib/utils/metadataUtils.js
var metadataUtils = __webpack_require__(8257);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-common@3.9.2_@docusaurus+plugin-content-docs@3.9.2_@mdx-js+react@3.1._bf2353ac6f36851c10218cc0f54a2a94/node_modules/@docusaurus/theme-common/lib/utils/reactUtils.js
var reactUtils = __webpack_require__(9423);
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.3/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(5656);
;// ./node_modules/.pnpm/@docusaurus+plugin-content-docs@3.9.2_@mdx-js+react@3.1.1_@types+react@19.1.8_react@19._e18a7ac431fae46977eb254edf12f4be/node_modules/@docusaurus/plugin-content-docs/lib/client/doc.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */const Context=/*#__PURE__*/react.createContext(null);/**
 * Note: we don't use `PropDoc` as context value on purpose. Metadata is
 * currently stored inside the MDX component, but we may want to change that in
 * the future. This layer is a good opportunity to decouple storage from
 * consuming API, potentially allowing us to provide metadata as both props and
 * route context without duplicating the chunks in the future.
 */function useContextValue(content){return (0,react.useMemo)(()=>({metadata:content.metadata,frontMatter:content.frontMatter,assets:content.assets,contentTitle:content.contentTitle,toc:content.toc}),[content]);}/**
 * This is a very thin layer around the `content` received from the MDX loader.
 * It provides metadata about the doc to the children tree.
 */function DocProvider({children,content}){const contextValue=useContextValue(content);return/*#__PURE__*/(0,jsx_runtime.jsx)(Context.Provider,{value:contextValue,children:children});}/**
 * Returns the data of the currently browsed doc. Gives access to the doc's MDX
 * Component, front matter, metadata, TOC, etc. When swizzling a low-level
 * component (e.g. the "Edit this page" link) and you need some extra metadata,
 * you don't have to drill the props all the way through the component tree:
 * simply use this hook instead.
 */function useDoc(){const doc=(0,react.useContext)(Context);if(doc===null){throw new reactUtils/* ReactContextError */.dV('DocProvider');}return doc;}
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/DocItem/Metadata/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function DocItemMetadata(){const{metadata,frontMatter,assets}=useDoc();return/*#__PURE__*/(0,jsx_runtime.jsx)(metadataUtils/* PageMetadata */.be,{title:metadata.title,description:metadata.description,keywords:frontMatter.keywords,image:assets.image??frontMatter.image});}
// EXTERNAL MODULE: ./node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
var clsx = __webpack_require__(3526);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-common@3.9.2_@docusaurus+plugin-content-docs@3.9.2_@mdx-js+react@3.1._bf2353ac6f36851c10218cc0f54a2a94/node_modules/@docusaurus/theme-common/lib/hooks/useWindowSize.js
var useWindowSize = __webpack_require__(8600);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+core@3.9.2_@mdx-js+react@3.1.1_@types+react@19.1.8_react@19.2.3__acorn@8.15_073d965244b4caa0aca1c65fb239aefe/node_modules/@docusaurus/core/lib/client/exports/Translate.js + 1 modules
var Translate = __webpack_require__(3265);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+core@3.9.2_@mdx-js+react@3.1.1_@types+react@19.1.8_react@19.2.3__acorn@8.15_073d965244b4caa0aca1c65fb239aefe/node_modules/@docusaurus/core/lib/client/exports/Link.js
var Link = __webpack_require__(455);
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/PaginatorNavLink/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function PaginatorNavLink(props){const{permalink,title,subLabel,isNext}=props;return/*#__PURE__*/(0,jsx_runtime.jsxs)(Link/* default */.A,{className:(0,clsx/* default */.A)('pagination-nav__link',isNext?'pagination-nav__link--next':'pagination-nav__link--prev'),to:permalink,children:[subLabel&&/*#__PURE__*/(0,jsx_runtime.jsx)("div",{className:"pagination-nav__sublabel",children:subLabel}),/*#__PURE__*/(0,jsx_runtime.jsx)("div",{className:"pagination-nav__label",children:title})]});}
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/DocPaginator/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function DocPaginator(props){const{className,previous,next}=props;return/*#__PURE__*/(0,jsx_runtime.jsxs)("nav",{className:(0,clsx/* default */.A)(className,'pagination-nav'),"aria-label":(0,Translate/* translate */.T)({id:'theme.docs.paginator.navAriaLabel',message:'Docs pages',description:'The ARIA label for the docs pagination'}),children:[previous&&/*#__PURE__*/(0,jsx_runtime.jsx)(PaginatorNavLink,{...previous,subLabel:/*#__PURE__*/(0,jsx_runtime.jsx)(Translate/* default */.A,{id:"theme.docs.paginator.previous",description:"The label used to navigate to the previous doc",children:"Previous"})}),next&&/*#__PURE__*/(0,jsx_runtime.jsx)(PaginatorNavLink,{...next,subLabel:/*#__PURE__*/(0,jsx_runtime.jsx)(Translate/* default */.A,{id:"theme.docs.paginator.next",description:"The label used to navigate to the next doc",children:"Next"}),isNext:true})]});}
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/DocItem/Paginator/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *//**
 * This extra component is needed, because <DocPaginator> should remain generic.
 * DocPaginator is used in non-docs contexts too: generated-index pages...
 */function DocItemPaginator(){const{metadata}=useDoc();return/*#__PURE__*/(0,jsx_runtime.jsx)(DocPaginator,{className:"docusaurus-mt-lg",previous:metadata.previous,next:metadata.next});}
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+core@3.9.2_@mdx-js+react@3.1.1_@types+react@19.1.8_react@19.2.3__acorn@8.15_073d965244b4caa0aca1c65fb239aefe/node_modules/@docusaurus/core/lib/client/exports/useDocusaurusContext.js
var useDocusaurusContext = __webpack_require__(239);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+plugin-content-docs@3.9.2_@mdx-js+react@3.1.1_@types+react@19.1.8_react@19._e18a7ac431fae46977eb254edf12f4be/node_modules/@docusaurus/plugin-content-docs/lib/client/index.js + 2 modules
var client = __webpack_require__(916);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-common@3.9.2_@docusaurus+plugin-content-docs@3.9.2_@mdx-js+react@3.1._bf2353ac6f36851c10218cc0f54a2a94/node_modules/@docusaurus/theme-common/lib/utils/ThemeClassNames.js
var ThemeClassNames = __webpack_require__(406);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+plugin-content-docs@3.9.2_@mdx-js+react@3.1.1_@types+react@19.1.8_react@19._e18a7ac431fae46977eb254edf12f4be/node_modules/@docusaurus/plugin-content-docs/lib/client/docsPreferredVersion.js
var docsPreferredVersion = __webpack_require__(29);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+plugin-content-docs@3.9.2_@mdx-js+react@3.1.1_@types+react@19.1.8_react@19._e18a7ac431fae46977eb254edf12f4be/node_modules/@docusaurus/plugin-content-docs/lib/client/docsVersion.js
var docsVersion = __webpack_require__(4812);
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/DocVersionBanner/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function UnreleasedVersionLabel({siteTitle,versionMetadata}){return/*#__PURE__*/(0,jsx_runtime.jsx)(Translate/* default */.A,{id:"theme.docs.versions.unreleasedVersionLabel",description:"The label used to tell the user that he's browsing an unreleased doc version",values:{siteTitle,versionLabel:/*#__PURE__*/(0,jsx_runtime.jsx)("b",{children:versionMetadata.label})},children:'This is unreleased documentation for {siteTitle} {versionLabel} version.'});}function UnmaintainedVersionLabel({siteTitle,versionMetadata}){return/*#__PURE__*/(0,jsx_runtime.jsx)(Translate/* default */.A,{id:"theme.docs.versions.unmaintainedVersionLabel",description:"The label used to tell the user that he's browsing an unmaintained doc version",values:{siteTitle,versionLabel:/*#__PURE__*/(0,jsx_runtime.jsx)("b",{children:versionMetadata.label})},children:'This is documentation for {siteTitle} {versionLabel}, which is no longer actively maintained.'});}const BannerLabelComponents={unreleased:UnreleasedVersionLabel,unmaintained:UnmaintainedVersionLabel};function BannerLabel(props){const BannerLabelComponent=BannerLabelComponents[props.versionMetadata.banner];return/*#__PURE__*/(0,jsx_runtime.jsx)(BannerLabelComponent,{...props});}function LatestVersionSuggestionLabel({versionLabel,to,onClick}){return/*#__PURE__*/(0,jsx_runtime.jsx)(Translate/* default */.A,{id:"theme.docs.versions.latestVersionSuggestionLabel",description:"The label used to tell the user to check the latest version",values:{versionLabel,latestVersionLink:/*#__PURE__*/(0,jsx_runtime.jsx)("b",{children:/*#__PURE__*/(0,jsx_runtime.jsx)(Link/* default */.A,{to:to,onClick:onClick,children:/*#__PURE__*/(0,jsx_runtime.jsx)(Translate/* default */.A,{id:"theme.docs.versions.latestVersionLinkLabel",description:"The label used for the latest version suggestion link label",children:"latest version"})})})},children:'For up-to-date documentation, see the {latestVersionLink} ({versionLabel}).'});}function DocVersionBannerEnabled({className,versionMetadata}){const{siteConfig:{title:siteTitle}}=(0,useDocusaurusContext/* default */.A)();const{pluginId}=(0,client/* useActivePlugin */.vT)({failfast:true});const getVersionMainDoc=version=>version.docs.find(doc=>doc.id===version.mainDocId);const{savePreferredVersionName}=(0,docsPreferredVersion/* useDocsPreferredVersion */.g1)(pluginId);const{latestDocSuggestion,latestVersionSuggestion}=(0,client/* useDocVersionSuggestions */.HW)(pluginId);// Try to link to same doc in latest version (not always possible), falling
// back to main doc of latest version
const latestVersionSuggestedDoc=latestDocSuggestion??getVersionMainDoc(latestVersionSuggestion);return/*#__PURE__*/(0,jsx_runtime.jsxs)("div",{className:(0,clsx/* default */.A)(className,ThemeClassNames/* ThemeClassNames */.G.docs.docVersionBanner,'alert alert--warning margin-bottom--md'),role:"alert",children:[/*#__PURE__*/(0,jsx_runtime.jsx)("div",{children:/*#__PURE__*/(0,jsx_runtime.jsx)(BannerLabel,{siteTitle:siteTitle,versionMetadata:versionMetadata})}),/*#__PURE__*/(0,jsx_runtime.jsx)("div",{className:"margin-top--md",children:/*#__PURE__*/(0,jsx_runtime.jsx)(LatestVersionSuggestionLabel,{versionLabel:latestVersionSuggestion.label,to:latestVersionSuggestedDoc.path,onClick:()=>savePreferredVersionName(latestVersionSuggestion.name)})})]});}function DocVersionBanner({className}){const versionMetadata=(0,docsVersion/* useDocsVersion */.r)();if(versionMetadata.banner){return/*#__PURE__*/(0,jsx_runtime.jsx)(DocVersionBannerEnabled,{className:className,versionMetadata:versionMetadata});}return null;}
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/DocVersionBadge/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function DocVersionBadge({className}){const versionMetadata=(0,docsVersion/* useDocsVersion */.r)();if(versionMetadata.badge){return/*#__PURE__*/(0,jsx_runtime.jsx)("span",{className:(0,clsx/* default */.A)(className,ThemeClassNames/* ThemeClassNames */.G.docs.docVersionBadge,'badge badge--secondary'),children:/*#__PURE__*/(0,jsx_runtime.jsx)(Translate/* default */.A,{id:"theme.docs.versionBadge.label",values:{versionLabel:versionMetadata.label},children:'Version: {versionLabel}'})});}return null;}
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/Tag/styles.module.css
// extracted by mini-css-extract-plugin
/* harmony default export */ const styles_module = ({"tag":"tag_XT4n","tagRegular":"tagRegular_VHZA","tagWithCount":"tagWithCount_pcSQ"});
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/Tag/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function Tag({permalink,label,count,description}){return/*#__PURE__*/(0,jsx_runtime.jsxs)(Link/* default */.A,{rel:"tag",href:permalink,title:description,className:(0,clsx/* default */.A)(styles_module.tag,count?styles_module.tagWithCount:styles_module.tagRegular),children:[label,count&&/*#__PURE__*/(0,jsx_runtime.jsx)("span",{children:count})]});}
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/TagsListInline/styles.module.css
// extracted by mini-css-extract-plugin
/* harmony default export */ const TagsListInline_styles_module = ({"tags":"tags__Xvt","tag":"tag_NviP"});
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/TagsListInline/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function TagsListInline({tags}){return/*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment,{children:[/*#__PURE__*/(0,jsx_runtime.jsx)("b",{children:/*#__PURE__*/(0,jsx_runtime.jsx)(Translate/* default */.A,{id:"theme.tags.tagsListLabel",description:"The label alongside a tag list",children:"Tags:"})}),/*#__PURE__*/(0,jsx_runtime.jsx)("ul",{className:(0,clsx/* default */.A)(TagsListInline_styles_module.tags,'padding--none','margin-left--sm'),children:tags.map(tag=>/*#__PURE__*/(0,jsx_runtime.jsx)("li",{className:TagsListInline_styles_module.tag,children:/*#__PURE__*/(0,jsx_runtime.jsx)(Tag,{...tag})},tag.permalink))})]});}
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/EditMetaRow/index.js + 6 modules
var EditMetaRow = __webpack_require__(7960);
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/DocItem/Footer/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function DocItemFooter(){const{metadata}=useDoc();const{editUrl,lastUpdatedAt,lastUpdatedBy,tags}=metadata;const canDisplayTagsRow=tags.length>0;const canDisplayEditMetaRow=!!(editUrl||lastUpdatedAt||lastUpdatedBy);const canDisplayFooter=canDisplayTagsRow||canDisplayEditMetaRow;if(!canDisplayFooter){return null;}return/*#__PURE__*/(0,jsx_runtime.jsxs)("footer",{className:(0,clsx/* default */.A)(ThemeClassNames/* ThemeClassNames */.G.docs.docFooter,'docusaurus-mt-lg'),children:[canDisplayTagsRow&&/*#__PURE__*/(0,jsx_runtime.jsx)("div",{className:(0,clsx/* default */.A)('row margin-top--sm',ThemeClassNames/* ThemeClassNames */.G.docs.docFooterTagsRow),children:/*#__PURE__*/(0,jsx_runtime.jsx)("div",{className:"col",children:/*#__PURE__*/(0,jsx_runtime.jsx)(TagsListInline,{tags:tags})})}),canDisplayEditMetaRow&&/*#__PURE__*/(0,jsx_runtime.jsx)(EditMetaRow/* default */.A,{className:(0,clsx/* default */.A)('margin-top--sm',ThemeClassNames/* ThemeClassNames */.G.docs.docFooterEditMetaRow),editUrl:editUrl,lastUpdatedAt:lastUpdatedAt,lastUpdatedBy:lastUpdatedBy})]});}
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-common@3.9.2_@docusaurus+plugin-content-docs@3.9.2_@mdx-js+react@3.1._bf2353ac6f36851c10218cc0f54a2a94/node_modules/@docusaurus/theme-common/lib/components/Collapsible/index.js
var Collapsible = __webpack_require__(8613);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/TOCItems/index.js + 3 modules
var TOCItems = __webpack_require__(5088);
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/TOCCollapsible/CollapseButton/styles.module.css
// extracted by mini-css-extract-plugin
/* harmony default export */ const CollapseButton_styles_module = ({"tocCollapsibleButton":"tocCollapsibleButton_Ira2","tocCollapsibleButtonExpanded":"tocCollapsibleButtonExpanded_VuLt"});
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/TOCCollapsible/CollapseButton/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function TOCCollapsibleCollapseButton({collapsed,...props}){return/*#__PURE__*/(0,jsx_runtime.jsx)("button",{type:"button",...props,className:(0,clsx/* default */.A)('clean-btn',CollapseButton_styles_module.tocCollapsibleButton,!collapsed&&CollapseButton_styles_module.tocCollapsibleButtonExpanded,props.className),children:/*#__PURE__*/(0,jsx_runtime.jsx)(Translate/* default */.A,{id:"theme.TOCCollapsible.toggleButtonLabel",description:"The label used by the button on the collapsible TOC component",children:"On this page"})});}
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/TOCCollapsible/styles.module.css
// extracted by mini-css-extract-plugin
/* harmony default export */ const TOCCollapsible_styles_module = ({"tocCollapsible":"tocCollapsible_waeK","tocCollapsibleContent":"tocCollapsibleContent_hKFi","tocCollapsibleExpanded":"tocCollapsibleExpanded_O_zc"});
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/TOCCollapsible/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function TOCCollapsible({toc,className,minHeadingLevel,maxHeadingLevel}){const{collapsed,toggleCollapsed}=(0,Collapsible/* useCollapsible */.u)({initialState:true});return/*#__PURE__*/(0,jsx_runtime.jsxs)("div",{className:(0,clsx/* default */.A)(TOCCollapsible_styles_module.tocCollapsible,!collapsed&&TOCCollapsible_styles_module.tocCollapsibleExpanded,className),children:[/*#__PURE__*/(0,jsx_runtime.jsx)(TOCCollapsibleCollapseButton,{collapsed:collapsed,onClick:toggleCollapsed}),/*#__PURE__*/(0,jsx_runtime.jsx)(Collapsible/* Collapsible */.N,{lazy:true,className:TOCCollapsible_styles_module.tocCollapsibleContent,collapsed:collapsed,children:/*#__PURE__*/(0,jsx_runtime.jsx)(TOCItems/* default */.A,{toc:toc,minHeadingLevel:minHeadingLevel,maxHeadingLevel:maxHeadingLevel})})]});}
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/DocItem/TOC/Mobile/styles.module.css
// extracted by mini-css-extract-plugin
/* harmony default export */ const Mobile_styles_module = ({"tocMobile":"tocMobile_kgI9"});
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/DocItem/TOC/Mobile/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function DocItemTOCMobile(){const{toc,frontMatter}=useDoc();return/*#__PURE__*/(0,jsx_runtime.jsx)(TOCCollapsible,{toc:toc,minHeadingLevel:frontMatter.toc_min_heading_level,maxHeadingLevel:frontMatter.toc_max_heading_level,className:(0,clsx/* default */.A)(ThemeClassNames/* ThemeClassNames */.G.docs.docTocMobile,Mobile_styles_module.tocMobile)});}
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/TOC/index.js + 1 modules
var TOC = __webpack_require__(460);
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/DocItem/TOC/Desktop/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function DocItemTOCDesktop(){const{toc,frontMatter}=useDoc();return/*#__PURE__*/(0,jsx_runtime.jsx)(TOC/* default */.A,{toc:toc,minHeadingLevel:frontMatter.toc_min_heading_level,maxHeadingLevel:frontMatter.toc_max_heading_level,className:ThemeClassNames/* ThemeClassNames */.G.docs.docTocDesktop});}
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/Heading/index.js + 1 modules
var Heading = __webpack_require__(3036);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/MDXContent/index.js + 16 modules
var MDXContent = __webpack_require__(6306);
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/DocItem/Content/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *//**
 Title can be declared inside md content or declared through
 front matter and added manually. To make both cases consistent,
 the added title is added under the same div.markdown block
 See https://github.com/facebook/docusaurus/pull/4882#issuecomment-853021120

 We render a "synthetic title" if:
 - user doesn't ask to hide it with front matter
 - the markdown content does not already contain a top-level h1 heading
*/function useSyntheticTitle(){const{metadata,frontMatter,contentTitle}=useDoc();const shouldRender=!frontMatter.hide_title&&typeof contentTitle==='undefined';if(!shouldRender){return null;}return metadata.title;}function DocItemContent({children}){const syntheticTitle=useSyntheticTitle();return/*#__PURE__*/(0,jsx_runtime.jsxs)("div",{className:(0,clsx/* default */.A)(ThemeClassNames/* ThemeClassNames */.G.docs.docMarkdown,'markdown'),children:[syntheticTitle&&/*#__PURE__*/(0,jsx_runtime.jsx)("header",{children:/*#__PURE__*/(0,jsx_runtime.jsx)(Heading/* default */.A,{as:"h1",children:syntheticTitle})}),/*#__PURE__*/(0,jsx_runtime.jsx)(MDXContent/* default */.A,{children:children})]});}
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+plugin-content-docs@3.9.2_@mdx-js+react@3.1.1_@types+react@19.1.8_react@19._e18a7ac431fae46977eb254edf12f4be/node_modules/@docusaurus/plugin-content-docs/lib/client/docsUtils.js
var docsUtils = __webpack_require__(6585);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-common@3.9.2_@docusaurus+plugin-content-docs@3.9.2_@mdx-js+react@3.1._bf2353ac6f36851c10218cc0f54a2a94/node_modules/@docusaurus/theme-common/lib/utils/routesUtils.js
var routesUtils = __webpack_require__(7716);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+core@3.9.2_@mdx-js+react@3.1.1_@types+react@19.1.8_react@19.2.3__acorn@8.15_073d965244b4caa0aca1c65fb239aefe/node_modules/@docusaurus/core/lib/client/exports/useBaseUrl.js
var useBaseUrl = __webpack_require__(2540);
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/Icon/Home/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function IconHome(props){return/*#__PURE__*/(0,jsx_runtime.jsx)("svg",{viewBox:"0 0 24 24",...props,children:/*#__PURE__*/(0,jsx_runtime.jsx)("path",{d:"M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.6c-.38-.34-.96-.34-1.34 0l-8.36 7.53c-.34.3-.13.87.33.87H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1z",fill:"currentColor"})});}
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/DocBreadcrumbs/Items/Home/styles.module.css
// extracted by mini-css-extract-plugin
/* harmony default export */ const Home_styles_module = ({"breadcrumbHomeIcon":"breadcrumbHomeIcon_GZAi"});
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/DocBreadcrumbs/Items/Home/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function HomeBreadcrumbItem(){const homeHref=(0,useBaseUrl/* default */.Ay)('/');return/*#__PURE__*/(0,jsx_runtime.jsx)("li",{className:"breadcrumbs__item",children:/*#__PURE__*/(0,jsx_runtime.jsx)(Link/* default */.A,{"aria-label":(0,Translate/* translate */.T)({id:'theme.docs.breadcrumbs.home',message:'Home page',description:'The ARIA label for the home page in the breadcrumbs'}),className:"breadcrumbs__link",href:homeHref,children:/*#__PURE__*/(0,jsx_runtime.jsx)(IconHome,{className:Home_styles_module.breadcrumbHomeIcon})})});}
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+core@3.9.2_@mdx-js+react@3.1.1_@types+react@19.1.8_react@19.2.3__acorn@8.15_073d965244b4caa0aca1c65fb239aefe/node_modules/@docusaurus/core/lib/client/exports/Head.js
var Head = __webpack_require__(1821);
;// ./node_modules/.pnpm/@docusaurus+plugin-content-docs@3.9.2_@mdx-js+react@3.1.1_@types+react@19.1.8_react@19._e18a7ac431fae46977eb254edf12f4be/node_modules/@docusaurus/plugin-content-docs/lib/client/structuredDataUtils.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function useBreadcrumbsStructuredData({breadcrumbs}){const{siteConfig}=(0,useDocusaurusContext/* default */.A)();return{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:breadcrumbs// We filter breadcrumb items without links, they are not allowed
// See also https://github.com/facebook/docusaurus/issues/9319#issuecomment-2643560845
.filter(breadcrumb=>breadcrumb.href).map((breadcrumb,index)=>({'@type':'ListItem',position:index+1,name:breadcrumb.label,item:`${siteConfig.url}${breadcrumb.href}`}))};}
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/DocBreadcrumbs/StructuredData/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function DocBreadcrumbsStructuredData(props){const structuredData=useBreadcrumbsStructuredData({breadcrumbs:props.breadcrumbs});return/*#__PURE__*/(0,jsx_runtime.jsx)(Head/* default */.A,{children:/*#__PURE__*/(0,jsx_runtime.jsx)("script",{type:"application/ld+json",children:JSON.stringify(structuredData)})});}
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/DocBreadcrumbs/styles.module.css
// extracted by mini-css-extract-plugin
/* harmony default export */ const DocBreadcrumbs_styles_module = ({"breadcrumbsContainer":"breadcrumbsContainer_PH6K"});
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/DocBreadcrumbs/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */// TODO move to design system folder
function BreadcrumbsItemLink({children,href,isLast}){const className='breadcrumbs__link';if(isLast){return/*#__PURE__*/(0,jsx_runtime.jsx)("span",{className:className,children:children});}return href?/*#__PURE__*/(0,jsx_runtime.jsx)(Link/* default */.A,{className:className,href:href,children:/*#__PURE__*/(0,jsx_runtime.jsx)("span",{children:children})}):/*#__PURE__*/(0,jsx_runtime.jsx)("span",{className:className,children:children});}// TODO move to design system folder
function BreadcrumbsItem({children,active}){return/*#__PURE__*/(0,jsx_runtime.jsx)("li",{className:(0,clsx/* default */.A)('breadcrumbs__item',{'breadcrumbs__item--active':active}),children:children});}function DocBreadcrumbs(){const breadcrumbs=(0,docsUtils/* useSidebarBreadcrumbs */.OF)();const homePageRoute=(0,routesUtils/* useHomePageRoute */.Dt)();if(!breadcrumbs){return null;}return/*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment,{children:[/*#__PURE__*/(0,jsx_runtime.jsx)(DocBreadcrumbsStructuredData,{breadcrumbs:breadcrumbs}),/*#__PURE__*/(0,jsx_runtime.jsx)("nav",{className:(0,clsx/* default */.A)(ThemeClassNames/* ThemeClassNames */.G.docs.docBreadcrumbs,DocBreadcrumbs_styles_module.breadcrumbsContainer),"aria-label":(0,Translate/* translate */.T)({id:'theme.docs.breadcrumbs.navAriaLabel',message:'Breadcrumbs',description:'The ARIA label for the breadcrumbs'}),children:/*#__PURE__*/(0,jsx_runtime.jsxs)("ul",{className:"breadcrumbs",children:[homePageRoute&&/*#__PURE__*/(0,jsx_runtime.jsx)(HomeBreadcrumbItem,{}),breadcrumbs.map((item,idx)=>{const isLast=idx===breadcrumbs.length-1;const href=item.type==='category'&&item.linkUnlisted?undefined:item.href;return/*#__PURE__*/(0,jsx_runtime.jsx)(BreadcrumbsItem,{active:isLast,children:/*#__PURE__*/(0,jsx_runtime.jsx)(BreadcrumbsItemLink,{href:href,isLast:isLast,children:item.label})},idx);})]})})]});}
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/ContentVisibility/index.js + 3 modules
var ContentVisibility = __webpack_require__(4150);
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/DocItem/Layout/styles.module.css
// extracted by mini-css-extract-plugin
/* harmony default export */ const Layout_styles_module = ({"docItemContainer":"docItemContainer_kyQ1","docItemCol":"docItemCol_y2Xy"});
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/DocItem/Layout/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *//**
 * Decide if the toc should be rendered, on mobile or desktop viewports
 */function useDocTOC(){const{frontMatter,toc}=useDoc();const windowSize=(0,useWindowSize/* useWindowSize */.l)();const hidden=frontMatter.hide_table_of_contents;const canRender=!hidden&&toc.length>0;const mobile=canRender?/*#__PURE__*/(0,jsx_runtime.jsx)(DocItemTOCMobile,{}):undefined;const desktop=canRender&&(windowSize==='desktop'||windowSize==='ssr')?/*#__PURE__*/(0,jsx_runtime.jsx)(DocItemTOCDesktop,{}):undefined;return{hidden,mobile,desktop};}function DocItemLayout({children}){const docTOC=useDocTOC();const{metadata}=useDoc();return/*#__PURE__*/(0,jsx_runtime.jsxs)("div",{className:"row",children:[/*#__PURE__*/(0,jsx_runtime.jsxs)("div",{className:(0,clsx/* default */.A)('col',!docTOC.hidden&&Layout_styles_module.docItemCol),children:[/*#__PURE__*/(0,jsx_runtime.jsx)(ContentVisibility/* default */.A,{metadata:metadata}),/*#__PURE__*/(0,jsx_runtime.jsx)(DocVersionBanner,{}),/*#__PURE__*/(0,jsx_runtime.jsxs)("div",{className:Layout_styles_module.docItemContainer,children:[/*#__PURE__*/(0,jsx_runtime.jsxs)("article",{children:[/*#__PURE__*/(0,jsx_runtime.jsx)(DocBreadcrumbs,{}),/*#__PURE__*/(0,jsx_runtime.jsx)(DocVersionBadge,{}),docTOC.mobile,/*#__PURE__*/(0,jsx_runtime.jsx)(DocItemContent,{children:children}),/*#__PURE__*/(0,jsx_runtime.jsx)(DocItemFooter,{})]}),/*#__PURE__*/(0,jsx_runtime.jsx)(DocItemPaginator,{})]})]}),docTOC.desktop&&/*#__PURE__*/(0,jsx_runtime.jsx)("div",{className:"col col--3",children:docTOC.desktop})]});}
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/DocItem/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function DocItem(props){const docHtmlClassName=`docs-doc-id-${props.content.metadata.id}`;const MDXComponent=props.content;return/*#__PURE__*/(0,jsx_runtime.jsx)(DocProvider,{content:props.content,children:/*#__PURE__*/(0,jsx_runtime.jsxs)(metadataUtils/* HtmlClassNameProvider */.e3,{className:docHtmlClassName,children:[/*#__PURE__*/(0,jsx_runtime.jsx)(DocItemMetadata,{}),/*#__PURE__*/(0,jsx_runtime.jsx)(DocItemLayout,{children:/*#__PURE__*/(0,jsx_runtime.jsx)(MDXComponent,{})})]})});}

/***/ })

}]);