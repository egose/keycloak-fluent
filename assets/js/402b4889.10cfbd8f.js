"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([["8187"], {
4966(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  metadata: () => (/* reexport */ site_docs_example_authentication_flows_mdx_402_namespaceObject),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  contentTitle: () => (/* binding */ contentTitle),
  toc: () => (/* binding */ toc),
  assets: () => (/* binding */ assets)
});

;// CONCATENATED MODULE: ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-example-authentication-flows-mdx-402.json
var site_docs_example_authentication_flows_mdx_402_namespaceObject = JSON.parse('{"id":"example/authentication-flows","title":"Authentication Flows","description":"Use this pattern when you need to clone a built-in flow, inspect its executions, add new executions or subflows, and tune required actions from the same provisioning script.","source":"@site/docs/example/authentication-flows.mdx","sourceDirName":"example","slug":"/example/authentication-flows","permalink":"/example/authentication-flows","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":6,"frontMatter":{"sidebar_label":"Authentication Flows","sidebar_position":6},"sidebar":"example","previous":{"title":"Organizations","permalink":"/example/organizations"},"next":{"title":"Realm Operations","permalink":"/example/realm-operations"}}')
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.7/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(1684);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.17_react@19.2.7/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(506);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.10.0_@docusaurus+faster@3.10.0_@docusaurus+types@3.10.0_@sw_6e61f7c9ea0438c3f9879c5b260e6fb1/node_modules/@docusaurus/theme-classic/lib/theme/CodeBlock/index.js + 27 modules
var CodeBlock = __webpack_require__(3021);
;// CONCATENATED MODULE: ./node_modules/.pnpm/raw-loader@4.0.2_webpack@5.107.2_@swc+core@1.15.41_postcss@8.5.15_/node_modules/raw-loader/dist/cjs.js!./.samples/authentication-flows.ts
/* export default */ const authentication_flows = ("import KeycloakAdminClientFluent from '@egose/keycloak-fluent';\n\nconst realmName = 'my-custom-realm';\nconst realmAdminClientId = 'my-custom-realm-admin-sa';\nconst realmAdminClientSecret = 'my-custom-realm-admin-sa-password'; // pragma: allowlist secret\n\nconst kc = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName });\nawait kc.simpleAuth({\n  clientId: realmAdminClientId,\n  clientSecret: realmAdminClientSecret,\n});\n\nconst realm = kc.realm(realmName);\n\nawait realm.authenticationFlow('browser').copy('browser-copy');\n\nconst flow = realm.authenticationFlow('browser-copy');\nawait flow.addExecution('auth-cookie');\nawait flow.addSubFlow({\n  alias: 'browser-copy-forms',\n  description: 'Custom subflow for additional form checks',\n});\n\nconst executions = await flow.listExecutions();\nconst cookieExecution = executions.find((execution) => execution.providerId === 'auth-cookie');\n\nif (cookieExecution?.id) {\n  await flow.updateExecution({ ...cookieExecution, requirement: 'ALTERNATIVE' });\n  await flow.raiseExecutionPriority(cookieExecution.id);\n}\n\nconst config = await flow.createConfig({\n  alias: 'cookie-config',\n  config: { 'cookie.max.age': '3600' },\n});\n\nawait flow.updateConfig({\n  ...config,\n  config: { 'cookie.max.age': '7200' },\n});\n\nawait flow.updateRequiredAction('UPDATE_PASSWORD', { enabled: true, defaultAction: false });\nawait flow.updateRequiredActionConfig('UPDATE_PASSWORD', { config: { max_auth_age: '600' } });\n");
;// CONCATENATED MODULE: ./docs/example/authentication-flows.mdx


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
    ...(0,lib/* .useMDXComponents */.R)(),
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
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", "\n", (0,jsx_runtime.jsx)(CodeBlock/* ["default"] */.A, {
      language: "ts",
      children: authentication_flows
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