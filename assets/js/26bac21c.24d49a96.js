"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[5403],{

/***/ 9338:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_example_users_roles_groups_mdx_26b_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-example-users-roles-groups-mdx-26b.json
const site_docs_example_users_roles_groups_mdx_26b_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"example/users-roles-groups","title":"Users, Roles, and Groups","description":"This example focuses on realm-level identity provisioning: creating a user, creating a realm role, creating nested groups, and assigning those relationships fluently.","source":"@site/docs/example/users-roles-groups.mdx","sourceDirName":"example","slug":"/example/users-roles-groups","permalink":"/example/users-roles-groups","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":2,"frontMatter":{"sidebar_label":"Users, Roles, Groups","sidebar_position":2},"sidebar":"example","previous":{"title":"Realm Bootstrap","permalink":"/example/bootstrap-realm"},"next":{"title":"Clients and Service Accounts","permalink":"/example/clients-and-service-accounts"}}');
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.5/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(4934);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.14_react@19.2.5/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(1137);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.2.14_acorn@8.15.0_react-dom@19.2.5_reac_2e3963f132f0f3e3369e75c0e4ad8ace/node_modules/@docusaurus/theme-classic/lib/theme/CodeBlock/index.js + 27 modules
var CodeBlock = __webpack_require__(2974);
;// ./node_modules/.pnpm/raw-loader@4.0.2_webpack@5.99.9/node_modules/raw-loader/dist/cjs.js!./.samples/users-roles-groups.ts
/* harmony default export */ const users_roles_groups = ("import KeycloakAdminClientFluent from '@egose/keycloak-fluent';\n\nconst realmName = 'my-custom-realm';\nconst realmAdminClientId = 'my-custom-realm-admin-sa';\nconst realmAdminClientSecret = 'my-custom-realm-admin-sa-password'; // pragma: allowlist secret\nconst realmUserUsername = 'myuser';\nconst realmUserPassword = 'myuser-password'; // pragma: allowlist secret\nconst realmUserFirstName = 'Jone';\nconst realmUserLastName = 'Doe';\nconst realmRoleName = 'my-role';\nconst realmRoleDescription = 'My role';\nconst realmGroupName = 'my-group';\nconst realmGroupDescription = 'My group';\nconst realmChildGroupName = 'my-child-group';\nconst realmChildGroupDescription = 'My child group';\n\nconst kc = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName });\nawait kc.simpleAuth({\n  clientId: realmAdminClientId,\n  clientSecret: realmAdminClientSecret,\n});\n\nconst realm = kc.realm(realmName);\n\nconst user = await realm\n  .user(realmUserUsername)\n  .ensure({ firstName: realmUserFirstName, lastName: realmUserLastName, password: realmUserPassword });\n\nconst role = await realm.role(realmRoleName).ensure({ description: realmRoleDescription });\nconst group = await realm.group(realmGroupName).ensure({ description: realmGroupDescription });\nconst childGroup = await group.childGroup(realmChildGroupName).ensure({ description: realmChildGroupDescription });\n\nawait user.assignRole(role);\nawait user.assignGroup(group);\nawait user.assignGroup(childGroup);\n");
;// ./docs/example/users-roles-groups.mdx


const frontMatter = {
	sidebar_label: 'Users, Roles, Groups',
	sidebar_position: 2
};
const contentTitle = 'Users, Roles, and Groups';

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
        id: "users-roles-and-groups",
        children: "Users, Roles, and Groups"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "This example focuses on realm-level identity provisioning: creating a user, creating a realm role, creating nested groups, and assigning those relationships fluently."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Use this pattern when you are seeding test tenants, bootstrapping internal users, or codifying access-control setup during environment creation."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", "\n", (0,jsx_runtime.jsx)(CodeBlock/* default */.A, {
      language: "ts",
      children: users_roles_groups
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