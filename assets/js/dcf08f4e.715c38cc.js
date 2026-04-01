"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[6621],{

/***/ 2691:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_example_realm_operations_mdx_dcf_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-example-realm-operations-mdx-dcf.json
const site_docs_example_realm_operations_mdx_dcf_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"example/realm-operations","title":"Realm Operations","description":"Not every automation task creates users or clients. This example focuses on operational helpers that are useful during maintenance windows, recovery flows, or environment reconciliation.","source":"@site/docs/example/realm-operations.mdx","sourceDirName":"example","slug":"/example/realm-operations","permalink":"/example/realm-operations","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":7,"frontMatter":{"sidebar_label":"Realm Operations","sidebar_position":7},"sidebar":"example","previous":{"title":"Authentication Flows","permalink":"/example/authentication-flows"},"next":{"title":"System Introspection","permalink":"/example/system-introspection"}}');
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.4/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(2615);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.14_react@19.2.4/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(416);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.2.14_acorn@8.15.0_react-dom@19.2.4_reac_c605bc6be7265f0399fba11c0699f091/node_modules/@docusaurus/theme-classic/lib/theme/CodeBlock/index.js + 27 modules
var CodeBlock = __webpack_require__(804);
;// ./node_modules/.pnpm/raw-loader@4.0.2_webpack@5.99.9/node_modules/raw-loader/dist/cjs.js!./.samples/realm-operations.ts
/* harmony default export */ const realm_operations = ("import KeycloakAdminClientFluent from '@egose/keycloak-fluent';\n\nconst realmName = 'my-custom-realm';\nconst realmAdminClientId = 'my-custom-realm-admin-sa';\nconst realmAdminClientSecret = 'my-custom-realm-admin-sa-password'; // pragma: allowlist secret\n\nconst kc = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName });\nawait kc.simpleAuth({\n  clientId: realmAdminClientId,\n  clientSecret: realmAdminClientSecret,\n});\n\nconst realm = kc.realm(realmName);\n\nawait realm.cache().clearUserCache();\nawait realm.cache().clearKeysCache();\n\nconst bruteForceStatus = await realm.attackDetection('user-id-123').get();\nif (bruteForceStatus && !bruteForceStatus.disabled) {\n  await realm.attackDetection('user-id-123').clear();\n}\n\nawait realm.clientPolicies().updateProfiles({\n  profiles: [{ name: 'secure-clients' }],\n});\n\nawait realm.clientPolicies().updatePolicies({\n  policies: [{ name: 'enforce-pkce' }],\n});\n\nconst approvalWorkflow = await realm.workflow('approval').ensure({ enabled: true });\nconst workflows = await approvalWorkflow.list({ page: 1, pageSize: 20 });\n");
;// ./docs/example/realm-operations.mdx


const frontMatter = {
	sidebar_label: 'Realm Operations',
	sidebar_position: 7
};
const contentTitle = 'Realm Operations';

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
        id: "realm-operations",
        children: "Realm Operations"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Not every automation task creates users or clients. This example focuses on operational helpers that are useful during maintenance windows, recovery flows, or environment reconciliation."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "It covers cache clearing, attack-detection cleanup, client policies, and workflows."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", "\n", (0,jsx_runtime.jsx)(CodeBlock/* default */.A, {
      language: "ts",
      children: realm_operations
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