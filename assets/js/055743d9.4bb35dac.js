"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([["2429"], {
5422(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  metadata: () => (/* reexport */ site_docs_example_system_introspection_mdx_055_namespaceObject),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  contentTitle: () => (/* binding */ contentTitle),
  toc: () => (/* binding */ toc),
  assets: () => (/* binding */ assets)
});

;// CONCATENATED MODULE: ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-example-system-introspection-mdx-055.json
var site_docs_example_system_introspection_mdx_055_namespaceObject = JSON.parse('{"id":"example/system-introspection","title":"System Introspection","description":"These root-scoped helpers are useful in health checks, admin diagnostics, and setup verification steps.","source":"@site/docs/example/system-introspection.mdx","sourceDirName":"example","slug":"/example/system-introspection","permalink":"/example/system-introspection","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":8,"frontMatter":{"sidebar_label":"System Introspection","sidebar_position":8},"sidebar":"example","previous":{"title":"Realm Operations","permalink":"/example/realm-operations"},"next":{"title":"Components","permalink":"/example/components"}}')
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.7/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(1684);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.17_react@19.2.7/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(506);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.10.0_@docusaurus+faster@3.10.0_@docusaurus+types@3.10.0_@sw_6e61f7c9ea0438c3f9879c5b260e6fb1/node_modules/@docusaurus/theme-classic/lib/theme/CodeBlock/index.js + 27 modules
var CodeBlock = __webpack_require__(3021);
;// CONCATENATED MODULE: ./node_modules/.pnpm/raw-loader@4.0.2_webpack@5.107.2_@swc+core@1.15.41_postcss@8.5.15_/node_modules/raw-loader/dist/cjs.js!./.samples/system-introspection.ts
/* export default */ const system_introspection = ("import KeycloakAdminClientFluent from '@egose/keycloak-fluent';\n\nconst kc = new KeycloakAdminClientFluent({\n  baseUrl: 'http://localhost:8080',\n  realmName: 'master',\n});\n\nawait kc.simpleAuth({\n  username: 'admin',\n  password: 'password', // pragma: allowlist secret\n});\n\nconst info = await kc.serverInfo().get();\nconst loginMessages = await kc.serverInfo().getEffectiveMessageBundles({\n  realm: 'master',\n  themeType: 'login',\n  locale: 'en',\n});\n\nconst currentAdmin = await kc.whoAmI('master').get();\nconst currentAdminInRealm = await kc.whoAmI('master', 'my-custom-realm').get();\n");
;// CONCATENATED MODULE: ./docs/example/system-introspection.mdx


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
    ...(0,lib/* .useMDXComponents */.R)(),
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
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", "\n", (0,jsx_runtime.jsx)(CodeBlock/* ["default"] */.A, {
      language: "ts",
      children: system_introspection
    })]
  });
}
function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = {
    ...(0,lib/* .useMDXComponents */.R)(),
    ...props.components
  };
  return MDXLayout ? (0,jsx_runtime.jsx)(MDXLayout, {
    ...props,
    children: (0,jsx_runtime.jsx)(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent(props);
}



},

}]);