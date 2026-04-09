"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[6359],{

/***/ 7964:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_example_components_mdx_a35_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-example-components-mdx-a35.json
const site_docs_example_components_mdx_a35_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"example/components","title":"Components","description":"Use ComponentHandle when you need to manage realm components that are identified by a combination of name and lookup metadata, not just a single stable id.","source":"@site/docs/example/components.mdx","sourceDirName":"example","slug":"/example/components","permalink":"/example/components","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":9,"frontMatter":{"sidebar_label":"Components","sidebar_position":9},"sidebar":"example","previous":{"title":"System Introspection","permalink":"/example/system-introspection"},"next":{"title":"User Storage Providers","permalink":"/example/user-storage-providers"}}');
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.5/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(4934);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.14_react@19.2.5/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(1137);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.2.14_acorn@8.15.0_react-dom@19.2.5_reac_2e3963f132f0f3e3369e75c0e4ad8ace/node_modules/@docusaurus/theme-classic/lib/theme/CodeBlock/index.js + 27 modules
var CodeBlock = __webpack_require__(2974);
;// ./node_modules/.pnpm/raw-loader@4.0.2_webpack@5.99.9/node_modules/raw-loader/dist/cjs.js!./.samples/components.ts
/* harmony default export */ const components = ("import KeycloakAdminClientFluent from '@egose/keycloak-fluent';\n\nconst realmName = 'my-custom-realm';\nconst realmAdminClientId = 'my-custom-realm-admin-sa';\nconst realmAdminClientSecret = 'my-custom-realm-admin-sa-password'; // pragma: allowlist secret\n\nconst kc = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName });\nawait kc.simpleAuth({\n  clientId: realmAdminClientId,\n  clientSecret: realmAdminClientSecret,\n});\n\nconst realm = kc.realm(realmName);\n\nconst ldapComponent = await realm\n  .component('ldap-users', {\n    parentId: realmName,\n    providerId: 'ldap',\n    providerType: 'org.keycloak.storage.UserStorageProvider',\n  })\n  .ensure({\n    parentId: realmName,\n    providerId: 'ldap',\n    providerType: 'org.keycloak.storage.UserStorageProvider',\n    config: {\n      enabled: ['true'],\n      priority: ['0'],\n    },\n  });\n\nconst ldapMappers = await ldapComponent.listSubComponents('org.keycloak.storage.ldap.mappers.LDAPStorageMapper');\n");
;// ./docs/example/components.mdx


const frontMatter = {
	sidebar_label: 'Components',
	sidebar_position: 9
};
const contentTitle = 'Components';

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
        id: "components",
        children: "Components"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Use ", (0,jsx_runtime.jsx)(_components.code, {
        children: "ComponentHandle"
      }), " when you need to manage realm components that are identified by a combination of name and lookup metadata, not just a single stable id."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["This is especially useful for user-storage components and other admin objects where ambiguity is common unless you narrow by ", (0,jsx_runtime.jsx)(_components.code, {
        children: "parentId"
      }), ", ", (0,jsx_runtime.jsx)(_components.code, {
        children: "providerId"
      }), ", or ", (0,jsx_runtime.jsx)(_components.code, {
        children: "providerType"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", "\n", (0,jsx_runtime.jsx)(CodeBlock/* default */.A, {
      language: "ts",
      children: components
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