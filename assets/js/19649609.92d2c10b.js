"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[8763],{

/***/ 9774:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_example_clients_and_service_accounts_mdx_196_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-example-clients-and-service-accounts-mdx-196.json
const site_docs_example_clients_and_service_accounts_mdx_196_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"example/clients-and-service-accounts","title":"Clients and Service Accounts","description":"This walkthrough covers a few common client shapes in the same realm: a standard client with client roles, a service-account client for machine access, and browser login clients for interactive applications.","source":"@site/docs/example/clients-and-service-accounts.mdx","sourceDirName":"example","slug":"/example/clients-and-service-accounts","permalink":"/example/clients-and-service-accounts","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":3,"frontMatter":{"sidebar_label":"Clients and Service Accounts","sidebar_position":3},"sidebar":"example","previous":{"title":"Users, Roles, Groups","permalink":"/example/users-roles-groups"},"next":{"title":"Protocol Mappers","permalink":"/example/protocol-mappers"}}');
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.4/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(2615);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.14_react@19.2.4/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(416);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.2.14_acorn@8.15.0_react-dom@19.2.4_reac_c605bc6be7265f0399fba11c0699f091/node_modules/@docusaurus/theme-classic/lib/theme/CodeBlock/index.js + 27 modules
var CodeBlock = __webpack_require__(804);
;// ./node_modules/.pnpm/raw-loader@4.0.2_webpack@5.99.9/node_modules/raw-loader/dist/cjs.js!./.samples/clients-and-service-accounts.ts
/* harmony default export */ const clients_and_service_accounts = ("import KeycloakAdminClientFluent from '@egose/keycloak-fluent';\n\nconst realmName = 'my-custom-realm';\nconst realmAdminClientId = 'my-custom-realm-admin-sa';\nconst realmAdminClientSecret = 'my-custom-realm-admin-sa-password'; // pragma: allowlist secret\nconst clientId = 'my-client';\nconst clientDescription = 'My client';\nconst clientRoleName = 'my-client-role';\nconst clientRoleDescription = 'My client role';\nconst serviceAccountId = 'my-service-account';\nconst serviceAccountSecret = 'my-service-account-password'; // pragma: allowlist secret\nconst publicBrowserLoginClientId = 'my-public-browser-login-client';\nconst confidentialBrowserLoginClientId = 'my-confidential-browser-login-client';\nconst confidentialBrowserLoginClientSecret = 'my-confidential-browser-login-client-password'; // pragma: allowlist secret\n\nconst kc = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName });\nawait kc.simpleAuth({\n  clientId: realmAdminClientId,\n  clientSecret: realmAdminClientSecret,\n});\n\nconst realm = kc.realm(realmName);\n\nconst client = await realm.client(clientId).ensure({ description: clientDescription });\nawait client.role(clientRoleName).ensure({ description: clientRoleDescription });\n\nawait realm.serviceAccount(serviceAccountId).ensure({ secret: serviceAccountSecret });\nawait realm.publicBrowserLoginClient(publicBrowserLoginClientId).ensure({});\nawait realm.serviceAccount(confidentialBrowserLoginClientId).ensure({ secret: confidentialBrowserLoginClientSecret });\n");
;// ./docs/example/clients-and-service-accounts.mdx


const frontMatter = {
	sidebar_label: 'Clients and Service Accounts',
	sidebar_position: 3
};
const contentTitle = 'Clients and Service Accounts';

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
        id: "clients-and-service-accounts",
        children: "Clients and Service Accounts"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "This walkthrough covers a few common client shapes in the same realm: a standard client with client roles, a service-account client for machine access, and browser login clients for interactive applications."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "It is useful when you want provisioning scripts that create both human-facing and machine-facing clients with minimal branching."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", "\n", (0,jsx_runtime.jsx)(CodeBlock/* default */.A, {
      language: "ts",
      children: clients_and_service_accounts
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