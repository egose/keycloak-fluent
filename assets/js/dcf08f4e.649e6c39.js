"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([["4174"], {
2625(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  metadata: () => (/* reexport */ site_docs_example_realm_operations_mdx_dcf_namespaceObject),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  contentTitle: () => (/* binding */ contentTitle),
  toc: () => (/* binding */ toc),
  assets: () => (/* binding */ assets)
});

;// CONCATENATED MODULE: ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-example-realm-operations-mdx-dcf.json
var site_docs_example_realm_operations_mdx_dcf_namespaceObject = JSON.parse('{"id":"example/realm-operations","title":"Realm Operations","description":"Not every automation task creates users or clients. This example focuses on operational helpers that are useful during maintenance windows, recovery flows, or environment reconciliation.","source":"@site/docs/example/realm-operations.mdx","sourceDirName":"example","slug":"/example/realm-operations","permalink":"/example/realm-operations","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":7,"frontMatter":{"sidebar_label":"Realm Operations","sidebar_position":7},"sidebar":"example","previous":{"title":"Authentication Flows","permalink":"/example/authentication-flows"},"next":{"title":"System Introspection","permalink":"/example/system-introspection"}}')
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.7/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(1684);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.17_react@19.2.7/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(506);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.10.0_@docusaurus+faster@3.10.0_@docusaurus+types@3.10.0_@sw_6e61f7c9ea0438c3f9879c5b260e6fb1/node_modules/@docusaurus/theme-classic/lib/theme/CodeBlock/index.js + 27 modules
var CodeBlock = __webpack_require__(3021);
;// CONCATENATED MODULE: ./node_modules/.pnpm/raw-loader@4.0.2_webpack@5.107.2_@swc+core@1.15.41_postcss@8.5.15_/node_modules/raw-loader/dist/cjs.js!./.samples/realm-operations.ts
/* export default */ const realm_operations = ("import KeycloakAdminClientFluent from '@egose/keycloak-fluent';\n\nconst realmName = 'my-custom-realm';\nconst realmAdminClientId = 'my-custom-realm-admin-sa';\nconst realmAdminClientSecret = 'my-custom-realm-admin-sa-password'; // pragma: allowlist secret\n\nconst kc = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName });\nawait kc.simpleAuth({\n  clientId: realmAdminClientId,\n  clientSecret: realmAdminClientSecret,\n});\n\nconst realm = kc.realm(realmName);\n\nawait realm.cache().clearUserCache();\nawait realm.cache().clearKeysCache();\n\nconst bruteForceStatus = await realm.attackDetection('user-id-123').get();\nif (bruteForceStatus && !bruteForceStatus.disabled) {\n  await realm.attackDetection('user-id-123').clear();\n}\n\nawait realm.clientPolicies().updateProfiles({\n  profiles: [{ name: 'secure-clients' }],\n});\n\nawait realm.clientPolicies().updatePolicies({\n  policies: [{ name: 'enforce-pkce' }],\n});\n\nconst approvalWorkflow = await realm.workflow('approval').ensure({ enabled: true });\nconst workflows = await approvalWorkflow.list({ page: 1, pageSize: 20 });\n");
;// CONCATENATED MODULE: ./docs/example/realm-operations.mdx


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
    ...(0,lib/* .useMDXComponents */.R)(),
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
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", "\n", (0,jsx_runtime.jsx)(CodeBlock/* ["default"] */.A, {
      language: "ts",
      children: realm_operations
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