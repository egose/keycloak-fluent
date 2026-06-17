"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([["6446"], {
3573(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  metadata: () => (/* reexport */ site_docs_example_user_storage_providers_mdx_2f4_namespaceObject),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  contentTitle: () => (/* binding */ contentTitle),
  toc: () => (/* binding */ toc),
  assets: () => (/* binding */ assets)
});

;// CONCATENATED MODULE: ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-example-user-storage-providers-mdx-2f4.json
var site_docs_example_user_storage_providers_mdx_2f4_namespaceObject = JSON.parse('{"id":"example/user-storage-providers","title":"User Storage Providers","description":"This guide focuses on the operational endpoints behind an existing user storage provider such as LDAP.","source":"@site/docs/example/user-storage-providers.mdx","sourceDirName":"example","slug":"/example/user-storage-providers","permalink":"/example/user-storage-providers","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":10,"frontMatter":{"sidebar_label":"User Storage Providers","sidebar_position":10},"sidebar":"example","previous":{"title":"Components","permalink":"/example/components"}}')
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.7/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(1684);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.17_react@19.2.7/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(506);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.10.0_@docusaurus+faster@3.10.0_@docusaurus+types@3.10.0_@sw_6e61f7c9ea0438c3f9879c5b260e6fb1/node_modules/@docusaurus/theme-classic/lib/theme/CodeBlock/index.js + 27 modules
var CodeBlock = __webpack_require__(3021);
;// CONCATENATED MODULE: ./node_modules/.pnpm/raw-loader@4.0.2_webpack@5.107.2_@swc+core@1.15.41_postcss@8.5.15_/node_modules/raw-loader/dist/cjs.js!./.samples/user-storage-providers.ts
/* export default */ const user_storage_providers = ("import KeycloakAdminClientFluent from '@egose/keycloak-fluent';\n\nconst realmName = 'my-custom-realm';\nconst realmAdminClientId = 'my-custom-realm-admin-sa';\nconst realmAdminClientSecret = 'my-custom-realm-admin-sa-password'; // pragma: allowlist secret\nconst providerId = 'federation-provider-id';\nconst mapperParentId = 'ldap-mapper-parent-id';\n\nconst kc = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName });\nawait kc.simpleAuth({\n  clientId: realmAdminClientId,\n  clientSecret: realmAdminClientSecret,\n});\n\nconst provider = kc.realm(realmName).userStorageProvider(providerId);\n\nconst providerMetadata = await provider.getName();\nconst fullSyncResult = await provider.sync('triggerFullSync');\nconst changedUsersSyncResult = await provider.sync('triggerChangedUsersSync');\nconst mapperSyncResult = await provider.syncMappers(mapperParentId, 'fedToKeycloak');\n\nawait provider.unlinkUsers();\nawait provider.removeImportedUsers();\n");
;// CONCATENATED MODULE: ./docs/example/user-storage-providers.mdx


const frontMatter = {
	sidebar_label: 'User Storage Providers',
	sidebar_position: 10
};
const contentTitle = 'User Storage Providers';

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
        id: "user-storage-providers",
        children: "User Storage Providers"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "This guide focuses on the operational endpoints behind an existing user storage provider such as LDAP."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Use it when your automation needs to trigger imports, incremental syncs, mapper syncs, or cleanup after provider changes."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", "\n", (0,jsx_runtime.jsx)(CodeBlock/* ["default"] */.A, {
      language: "ts",
      children: user_storage_providers
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