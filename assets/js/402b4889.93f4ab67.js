"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[1430],{

/***/ 6869:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_example_authentication_flows_mdx_402_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-example-authentication-flows-mdx-402.json
const site_docs_example_authentication_flows_mdx_402_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"example/authentication-flows","title":"Authentication Flows","description":"Use this pattern when you need to clone a built-in flow, inspect its executions, add new executions or subflows, and tune required actions from the same provisioning script.","source":"@site/docs/example/authentication-flows.mdx","sourceDirName":"example","slug":"/example/authentication-flows","permalink":"/example/authentication-flows","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":6,"frontMatter":{"sidebar_label":"Authentication Flows","sidebar_position":6},"sidebar":"example","previous":{"title":"Organizations","permalink":"/example/organizations"},"next":{"title":"Realm Operations","permalink":"/example/realm-operations"}}');
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.4/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(2615);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.14_react@19.2.4/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(416);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.2.14_acorn@8.15.0_react-dom@19.2.4_reac_c605bc6be7265f0399fba11c0699f091/node_modules/@docusaurus/theme-classic/lib/theme/CodeBlock/index.js + 27 modules
var CodeBlock = __webpack_require__(804);
;// ./node_modules/.pnpm/raw-loader@4.0.2_webpack@5.99.9/node_modules/raw-loader/dist/cjs.js!./.samples/authentication-flows.ts
/* harmony default export */ const authentication_flows = ("import KeycloakAdminClientFluent from '@egose/keycloak-fluent';\n\nconst realmName = 'my-custom-realm';\nconst realmAdminClientId = 'my-custom-realm-admin-sa';\nconst realmAdminClientSecret = 'my-custom-realm-admin-sa-password'; // pragma: allowlist secret\n\nconst kc = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName });\nawait kc.simpleAuth({\n  clientId: realmAdminClientId,\n  clientSecret: realmAdminClientSecret,\n});\n\nconst realm = kc.realm(realmName);\n\nawait realm.authenticationFlow('browser').copy('browser-copy');\n\nconst flow = realm.authenticationFlow('browser-copy');\nawait flow.addExecution('auth-cookie');\nawait flow.addSubFlow({\n  alias: 'browser-copy-forms',\n  description: 'Custom subflow for additional form checks',\n});\n\nconst executions = await flow.listExecutions();\nconst cookieExecution = executions.find((execution) => execution.providerId === 'auth-cookie');\n\nif (cookieExecution?.id) {\n  await flow.updateExecution({ ...cookieExecution, requirement: 'ALTERNATIVE' });\n  await flow.raiseExecutionPriority(cookieExecution.id);\n}\n\nconst config = await flow.createConfig({\n  alias: 'cookie-config',\n  config: { 'cookie.max.age': '3600' },\n});\n\nawait flow.updateConfig({\n  ...config,\n  config: { 'cookie.max.age': '7200' },\n});\n\nawait flow.updateRequiredAction('UPDATE_PASSWORD', { enabled: true, defaultAction: false });\nawait flow.updateRequiredActionConfig('UPDATE_PASSWORD', { config: { max_auth_age: '600' } });\n");
;// ./docs/example/authentication-flows.mdx


const frontMatter = {
	sidebar_label: 'Authentication Flows',
	sidebar_position: 6
};
const contentTitle = 'Authentication Flows';

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
        id: "authentication-flows",
        children: "Authentication Flows"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Use this pattern when you need to clone a built-in flow, inspect its executions, add new executions or subflows, and tune required actions from the same provisioning script."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "This keeps flow customization in code instead of relying on manual realm exports."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", "\n", (0,jsx_runtime.jsx)(CodeBlock/* default */.A, {
      language: "ts",
      children: authentication_flows
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