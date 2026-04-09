"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[8837],{

/***/ 5718:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_example_organizations_mdx_61a_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-example-organizations-mdx-61a.json
const site_docs_example_organizations_mdx_61a_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"example/organizations","title":"Organizations","description":"This guide shows a realm-scoped organization workflow: create or update the organization, add a managed member, invite an external user, and link an existing identity provider.","source":"@site/docs/example/organizations.mdx","sourceDirName":"example","slug":"/example/organizations","permalink":"/example/organizations","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":5,"frontMatter":{"sidebar_label":"Organizations","sidebar_position":5},"sidebar":"example","previous":{"title":"Protocol Mappers","permalink":"/example/protocol-mappers"},"next":{"title":"Authentication Flows","permalink":"/example/authentication-flows"}}');
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.5/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(4934);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.14_react@19.2.5/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(1137);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.2.14_acorn@8.15.0_react-dom@19.2.5_reac_2e3963f132f0f3e3369e75c0e4ad8ace/node_modules/@docusaurus/theme-classic/lib/theme/CodeBlock/index.js + 27 modules
var CodeBlock = __webpack_require__(2974);
;// ./node_modules/.pnpm/raw-loader@4.0.2_webpack@5.99.9/node_modules/raw-loader/dist/cjs.js!./.samples/organizations.ts
/* harmony default export */ const organizations = ("import KeycloakAdminClientFluent from '@egose/keycloak-fluent';\n\nconst realmName = 'my-custom-realm';\nconst realmAdminClientId = 'my-custom-realm-admin-sa';\nconst realmAdminClientSecret = 'my-custom-realm-admin-sa-password'; // pragma: allowlist secret\n\nconst kc = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName });\nawait kc.simpleAuth({\n  clientId: realmAdminClientId,\n  clientSecret: realmAdminClientSecret,\n});\n\nconst realm = kc.realm(realmName);\nconst organization = await realm.organization('acme').ensure({\n  name: 'Acme Corp',\n  description: 'Default organization for Acme users',\n});\n\nconst alice = await realm.user('alice').ensure({\n  email: 'alice@example.com',\n  firstName: 'Alice',\n  lastName: 'Admin',\n  enabled: true,\n});\n\nawait organization.addMember(alice);\n\nconst invite = new FormData();\ninvite.set('email', 'contractor@example.com');\nawait organization.invite(invite);\n\n// Assumes the identity provider already exists in the realm.\nawait organization.linkIdentityProvider(realm.identityProvider('google'));\n\nconst members = await organization.listMembers({ membershipType: 'managed' });\nconst linkedIdentityProviders = await organization.listIdentityProviders();\n");
;// ./docs/example/organizations.mdx


const frontMatter = {
	sidebar_label: 'Organizations',
	sidebar_position: 5
};
const contentTitle = 'Organizations';

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
        id: "organizations",
        children: "Organizations"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "This guide shows a realm-scoped organization workflow: create or update the organization, add a managed member, invite an external user, and link an existing identity provider."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "It is a good fit when you treat organizations as part of tenant bootstrap rather than manual admin-console setup."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", "\n", (0,jsx_runtime.jsx)(CodeBlock/* default */.A, {
      language: "ts",
      children: organizations
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