"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[61],{

/***/ 1479:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ AdmonitionWrapper)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7140);
/* harmony import */ var _theme_original_Admonition__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(63);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5656);
function AdmonitionWrapper(props){return/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.Fragment,{children:[/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div",{className:"text-right -mb-10 mr-2",children:/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("button",{className:"cursor-pointer",onClick:event=>{const btn=event.currentTarget;const siblingDiv=btn.parentElement.nextElementSibling;const contentElm=siblingDiv.querySelector('p > strong');if(contentElm){const text=contentElm.textContent;const utterance=new SpeechSynthesisUtterance(text);utterance.lang='en-US';// or "ko-KR", "fr-FR", etc.
speechSynthesis.speak(utterance);}},children:/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round",class:"icon icon-tabler icons-tabler-outline icon-tabler-volume",children:[/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("path",{stroke:"none",d:"M0 0h24v24H0z",fill:"none"}),/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("path",{d:"M15 8a5 5 0 0 1 0 8"}),/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("path",{d:"M17.7 5a9 9 0 0 1 0 14"}),/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("path",{d:"M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"})]})})}),/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_theme_original_Admonition__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .A,{...props})]});}

/***/ }),

/***/ 2052:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ MDXPage)
});

// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.3/node_modules/react/index.js
var react = __webpack_require__(7140);
// EXTERNAL MODULE: ./node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
var clsx = __webpack_require__(3526);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-common@3.8.1_@docusaurus+plugin-content-docs@3.8.1_@mdx-js+react@3.1._19147e7e1825160570a1d374704d7507/node_modules/@docusaurus/theme-common/lib/utils/metadataUtils.js
var metadataUtils = __webpack_require__(6042);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-common@3.8.1_@docusaurus+plugin-content-docs@3.8.1_@mdx-js+react@3.1._19147e7e1825160570a1d374704d7507/node_modules/@docusaurus/theme-common/lib/utils/ThemeClassNames.js
var ThemeClassNames = __webpack_require__(469);
// EXTERNAL MODULE: ./src/theme/Layout/index.tsx + 73 modules
var Layout = __webpack_require__(7186);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.8.1_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_9eedc41964577f96abca3b41bfd5bda1/node_modules/@docusaurus/theme-classic/lib/theme/MDXContent/index.js + 16 modules
var MDXContent = __webpack_require__(3761);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.8.1_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_9eedc41964577f96abca3b41bfd5bda1/node_modules/@docusaurus/theme-classic/lib/theme/TOC/index.js + 1 modules
var TOC = __webpack_require__(2582);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.8.1_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_9eedc41964577f96abca3b41bfd5bda1/node_modules/@docusaurus/theme-classic/lib/theme/ContentVisibility/index.js + 3 modules
var ContentVisibility = __webpack_require__(4463);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.8.1_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_9eedc41964577f96abca3b41bfd5bda1/node_modules/@docusaurus/theme-classic/lib/theme/EditMetaRow/index.js + 6 modules
var EditMetaRow = __webpack_require__(2673);
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.8.1_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_9eedc41964577f96abca3b41bfd5bda1/node_modules/@docusaurus/theme-classic/lib/theme/MDXPage/styles.module.css
// extracted by mini-css-extract-plugin
/* harmony default export */ const styles_module = ({"mdxPageWrapper":"mdxPageWrapper_spko"});
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.3/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(5656);
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.8.1_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_9eedc41964577f96abca3b41bfd5bda1/node_modules/@docusaurus/theme-classic/lib/theme/MDXPage/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function MDXPage(props){const{content:MDXPageContent}=props;const{metadata,assets}=MDXPageContent;const{title,editUrl,description,frontMatter,lastUpdatedBy,lastUpdatedAt}=metadata;const{keywords,wrapperClassName,hide_table_of_contents:hideTableOfContents}=frontMatter;const image=assets.image??frontMatter.image;const canDisplayEditMetaRow=!!(editUrl||lastUpdatedAt||lastUpdatedBy);return/*#__PURE__*/(0,jsx_runtime.jsx)(metadataUtils/* HtmlClassNameProvider */.e3,{className:(0,clsx/* default */.A)(wrapperClassName??ThemeClassNames/* ThemeClassNames */.G.wrapper.mdxPages,ThemeClassNames/* ThemeClassNames */.G.page.mdxPage),children:/*#__PURE__*/(0,jsx_runtime.jsxs)(Layout/* default */.A,{children:[/*#__PURE__*/(0,jsx_runtime.jsx)(metadataUtils/* PageMetadata */.be,{title:title,description:description,keywords:keywords,image:image}),/*#__PURE__*/(0,jsx_runtime.jsx)("main",{className:"container container--fluid margin-vert--lg",children:/*#__PURE__*/(0,jsx_runtime.jsxs)("div",{className:(0,clsx/* default */.A)('row',styles_module.mdxPageWrapper),children:[/*#__PURE__*/(0,jsx_runtime.jsxs)("div",{className:(0,clsx/* default */.A)('col',!hideTableOfContents&&'col--8'),children:[/*#__PURE__*/(0,jsx_runtime.jsx)(ContentVisibility/* default */.A,{metadata:metadata}),/*#__PURE__*/(0,jsx_runtime.jsx)("article",{children:/*#__PURE__*/(0,jsx_runtime.jsx)(MDXContent/* default */.A,{children:/*#__PURE__*/(0,jsx_runtime.jsx)(MDXPageContent,{})})}),canDisplayEditMetaRow&&/*#__PURE__*/(0,jsx_runtime.jsx)(EditMetaRow/* default */.A,{className:(0,clsx/* default */.A)('margin-top--sm',ThemeClassNames/* ThemeClassNames */.G.pages.pageFooterEditMetaRow),editUrl:editUrl,lastUpdatedAt:lastUpdatedAt,lastUpdatedBy:lastUpdatedBy})]}),!hideTableOfContents&&MDXPageContent.toc.length>0&&/*#__PURE__*/(0,jsx_runtime.jsx)("div",{className:"col col--2",children:/*#__PURE__*/(0,jsx_runtime.jsx)(TOC/* default */.A,{toc:MDXPageContent.toc,minHeadingLevel:frontMatter.toc_min_heading_level,maxHeadingLevel:frontMatter.toc_max_heading_level})})]})})]})});}

/***/ })

}]);