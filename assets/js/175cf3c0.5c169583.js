"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[7351],{

/***/ 93:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_example_bootstrap_realm_mdx_175_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-example-bootstrap-realm-mdx-175.json
const site_docs_example_bootstrap_realm_mdx_175_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"example/bootstrap-realm","title":"Realm Bootstrap","description":"Use this flow when you need to create a realm from the master realm and immediately provision a dedicated realm-admin service account for follow-up automation.","source":"@site/docs/example/bootstrap-realm.mdx","sourceDirName":"example","slug":"/example/bootstrap-realm","permalink":"/example/bootstrap-realm","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":1,"frontMatter":{"sidebar_label":"Realm Bootstrap","sidebar_position":1},"sidebar":"example","previous":{"title":"Overview","permalink":"/example/general"},"next":{"title":"Users, Roles, Groups","permalink":"/example/users-roles-groups"}}');
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.5/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(4934);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.14_react@19.2.5/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(1137);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.2.14_acorn@8.15.0_react-dom@19.2.5_reac_2e3963f132f0f3e3369e75c0e4ad8ace/node_modules/@docusaurus/theme-classic/lib/theme/CodeBlock/index.js + 27 modules
var CodeBlock = __webpack_require__(2974);
;// ./node_modules/.pnpm/raw-loader@4.0.2_webpack@5.99.9/node_modules/raw-loader/dist/cjs.js!./.samples/realm-bootstrap.ts
/* harmony default export */ const realm_bootstrap = ("import KeycloakAdminClientFluent from '@egose/keycloak-fluent';\n\nconst kcMaster = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName: 'master' });\nawait kcMaster.simpleAuth({\n  username: 'admin',\n  password: 'password', // pragma: allowlist secret\n});\n\nconst realmName = 'my-custom-realm';\nconst realmDisplayName = 'My custom realm';\nconst realmAdminClientId = 'my-custom-realm-admin-sa';\nconst realmAdminClientSecret = 'my-custom-realm-admin-sa-password'; // pragma: allowlist secret\nconst realmAdminClientDescription = 'My realm admin service account';\n\nconst customRealm = await kcMaster.realm(realmName).ensure({ displayName: realmDisplayName });\nawait customRealm\n  .realmAdminServiceAccount(realmAdminClientId)\n  .ensure({ description: realmAdminClientDescription, secret: realmAdminClientSecret });\n\nconst kcCustom = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName });\nawait kcCustom.simpleAuth({\n  clientId: realmAdminClientId,\n  clientSecret: realmAdminClientSecret,\n});\n");
;// ./docs/example/bootstrap-realm.mdx


const frontMatter = {
	sidebar_label: 'Realm Bootstrap',
	sidebar_position: 1
};
const contentTitle = 'Realm Bootstrap';

const assets = {

};





const toc = [];
function _createMdxContent(props) {
  const _components = {
    code: "code",
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
        id: "realm-bootstrap",
        children: "Realm Bootstrap"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Use this flow when you need to create a realm from the ", (0,jsx_runtime.jsx)(_components.code, {
        children: "master"
      }), " realm and immediately provision a dedicated realm-admin service account for follow-up automation."]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "This is a common first step when your infrastructure code needs to hand off from cluster-wide admin access to realm-scoped credentials."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", "\n", (0,jsx_runtime.jsx)(CodeBlock/* default */.A, {
      language: "ts",
      children: realm_bootstrap
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