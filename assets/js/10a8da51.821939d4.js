"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[9160],{

/***/ 9070:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_example_protocol_mappers_mdx_10a_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-example-protocol-mappers-mdx-10a.json
const site_docs_example_protocol_mappers_mdx_10a_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"example/protocol-mappers","title":"Protocol Mappers","description":"Protocol mappers are where token shape often becomes repetitive in raw Keycloak automation. This example isolates the mapper-focused part of a broader setup so you can copy only the claim wiring you need.","source":"@site/docs/example/protocol-mappers.mdx","sourceDirName":"example","slug":"/example/protocol-mappers","permalink":"/example/protocol-mappers","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":4,"frontMatter":{"sidebar_label":"Protocol Mappers","sidebar_position":4},"sidebar":"example","previous":{"title":"Clients and Service Accounts","permalink":"/example/clients-and-service-accounts"},"next":{"title":"Organizations","permalink":"/example/organizations"}}');
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.4/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(2615);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.14_react@19.2.4/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(416);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.2.14_acorn@8.15.0_react-dom@19.2.4_reac_c605bc6be7265f0399fba11c0699f091/node_modules/@docusaurus/theme-classic/lib/theme/CodeBlock/index.js + 27 modules
var CodeBlock = __webpack_require__(804);
;// ./node_modules/.pnpm/raw-loader@4.0.2_webpack@5.99.9/node_modules/raw-loader/dist/cjs.js!./.samples/protocol-mappers.ts
/* harmony default export */ const protocol_mappers = ("import KeycloakAdminClientFluent from '@egose/keycloak-fluent';\n\nconst realmName = 'my-custom-realm';\nconst realmAdminClientId = 'my-custom-realm-admin-sa';\nconst realmAdminClientSecret = 'my-custom-realm-admin-sa-password'; // pragma: allowlist secret\nconst serviceAccountId = 'my-service-account';\nconst serviceAccountSecret = 'my-service-account-password'; // pragma: allowlist secret\nconst publicBrowserLoginClientId = 'my-public-browser-login-client';\nconst confidentialBrowserLoginClientId = 'my-confidential-browser-login-client';\nconst confidentialBrowserLoginClientSecret = 'my-confidential-browser-login-client-password'; // pragma: allowlist secret\nconst clientProtocolMapperName = 'my-client-mapper';\nconst clientAudienceMapperName = 'my-audience-mapper';\nconst clientHardcodedClaimMapperName = 'my-hardcoded-claim-mapper';\nconst clientUserAttributeMapperName = 'my-user-attribute-mapper';\n\nconst kc = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName });\nawait kc.simpleAuth({\n  clientId: realmAdminClientId,\n  clientSecret: realmAdminClientSecret,\n});\n\nconst realm = kc.realm(realmName);\n\nconst serviceAccount = await realm.serviceAccount(serviceAccountId).ensure({ secret: serviceAccountSecret });\nconst publicBrowserLoginClient = await realm.publicBrowserLoginClient(publicBrowserLoginClientId).ensure({});\nconst confidentialBrowserLoginClient = await realm\n  .serviceAccount(confidentialBrowserLoginClientId)\n  .ensure({ secret: confidentialBrowserLoginClientSecret });\n\nawait serviceAccount.protocolMapper(clientProtocolMapperName).ensure({});\nawait publicBrowserLoginClient.audienceProtocolMapper(clientAudienceMapperName).ensure({ audience: 'myname' });\n\nawait confidentialBrowserLoginClient\n  .hardcodedClaimProtocolMapper(clientHardcodedClaimMapperName)\n  .ensure({ claimName: 'fruite', claimValue: 'apple' });\n\nawait confidentialBrowserLoginClient\n  .userAttributeProtocolMapper(clientUserAttributeMapperName)\n  .ensure({ claimName: 'myemail', userAttribute: 'email' });\n");
;// ./docs/example/protocol-mappers.mdx


const frontMatter = {
	sidebar_label: 'Protocol Mappers',
	sidebar_position: 4
};
const contentTitle = 'Protocol Mappers';

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
        id: "protocol-mappers",
        children: "Protocol Mappers"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Protocol mappers are where token shape often becomes repetitive in raw Keycloak automation. This example isolates the mapper-focused part of a broader setup so you can copy only the claim wiring you need."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The snippet shows a few common mapper helpers across different client types."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", "\n", (0,jsx_runtime.jsx)(CodeBlock/* default */.A, {
      language: "ts",
      children: protocol_mappers
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