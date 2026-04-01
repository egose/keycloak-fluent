"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[2332],{

/***/ 7164:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_example_system_introspection_mdx_055_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-example-system-introspection-mdx-055.json
const site_docs_example_system_introspection_mdx_055_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"example/system-introspection","title":"System Introspection","description":"These root-scoped helpers are useful in health checks, admin diagnostics, and setup verification steps.","source":"@site/docs/example/system-introspection.mdx","sourceDirName":"example","slug":"/example/system-introspection","permalink":"/example/system-introspection","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":8,"frontMatter":{"sidebar_label":"System Introspection","sidebar_position":8},"sidebar":"example","previous":{"title":"Realm Operations","permalink":"/example/realm-operations"},"next":{"title":"Components","permalink":"/example/components"}}');
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.4/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(2615);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.14_react@19.2.4/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(416);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.2.14_acorn@8.15.0_react-dom@19.2.4_reac_88691989171a90613835c76f5914d8d5/node_modules/@docusaurus/theme-classic/lib/theme/CodeBlock/index.js + 27 modules
var CodeBlock = __webpack_require__(6375);
;// ./node_modules/.pnpm/raw-loader@4.0.2_webpack@5.99.9/node_modules/raw-loader/dist/cjs.js!./.samples/system-introspection.ts
/* harmony default export */ const system_introspection = ("import KeycloakAdminClientFluent from '@egose/keycloak-fluent';\n\nconst kc = new KeycloakAdminClientFluent({\n  baseUrl: 'http://localhost:8080',\n  realmName: 'master',\n});\n\nawait kc.simpleAuth({\n  username: 'admin',\n  password: 'password', // pragma: allowlist secret\n});\n\nconst info = await kc.serverInfo().get();\nconst loginMessages = await kc.serverInfo().getEffectiveMessageBundles({\n  realm: 'master',\n  themeType: 'login',\n  locale: 'en',\n});\n\nconst currentAdmin = await kc.whoAmI('master').get();\nconst currentAdminInRealm = await kc.whoAmI('master', 'my-custom-realm').get();\n");
;// ./docs/example/system-introspection.mdx


const frontMatter = {
	sidebar_label: 'System Introspection',
	sidebar_position: 8
};
const contentTitle = 'System Introspection';

const assets = {

};





const toc = [];
function _createMdxContent(props) {
  const _components = {
    h1: "h1",
    header: "header",
    hr: "hr",
    p: "p",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "system-introspection",
        children: "System Introspection"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "These root-scoped helpers are useful in health checks, admin diagnostics, and setup verification steps."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The sample shows how to inspect server metadata, load effective theme bundles, and confirm which admin identity the current credentials resolve to."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", "\n", (0,jsx_runtime.jsx)(CodeBlock/* default */.A, {
      language: "ts",
      children: system_introspection
    })]
  });
}
function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = {
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return MDXLayout ? (0,jsx_runtime.jsx)(MDXLayout, {
    ...props,
    children: (0,jsx_runtime.jsx)(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent(props);
}



/***/ })

}]);