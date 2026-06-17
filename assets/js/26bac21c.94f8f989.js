"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([["2328"], {
8997(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  metadata: () => (/* reexport */ site_docs_example_users_roles_groups_mdx_26b_namespaceObject),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  contentTitle: () => (/* binding */ contentTitle),
  toc: () => (/* binding */ toc),
  assets: () => (/* binding */ assets)
});

;// CONCATENATED MODULE: ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-example-users-roles-groups-mdx-26b.json
var site_docs_example_users_roles_groups_mdx_26b_namespaceObject = JSON.parse('{"id":"example/users-roles-groups","title":"Users, Roles, and Groups","description":"This example focuses on realm-level identity provisioning: creating a user, creating a realm role, creating nested groups, and assigning those relationships fluently.","source":"@site/docs/example/users-roles-groups.mdx","sourceDirName":"example","slug":"/example/users-roles-groups","permalink":"/example/users-roles-groups","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":2,"frontMatter":{"sidebar_label":"Users, Roles, Groups","sidebar_position":2},"sidebar":"example","previous":{"title":"Realm Bootstrap","permalink":"/example/bootstrap-realm"},"next":{"title":"Clients and Service Accounts","permalink":"/example/clients-and-service-accounts"}}')
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.7/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(1684);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.17_react@19.2.7/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(506);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.10.0_@docusaurus+faster@3.10.0_@docusaurus+types@3.10.0_@sw_6e61f7c9ea0438c3f9879c5b260e6fb1/node_modules/@docusaurus/theme-classic/lib/theme/CodeBlock/index.js + 27 modules
var CodeBlock = __webpack_require__(3021);
;// CONCATENATED MODULE: ./node_modules/.pnpm/raw-loader@4.0.2_webpack@5.107.2_@swc+core@1.15.41_postcss@8.5.15_/node_modules/raw-loader/dist/cjs.js!./.samples/users-roles-groups.ts
/* export default */ const users_roles_groups = ("import KeycloakAdminClientFluent from '@egose/keycloak-fluent';\n\nconst realmName = 'my-custom-realm';\nconst realmAdminClientId = 'my-custom-realm-admin-sa';\nconst realmAdminClientSecret = 'my-custom-realm-admin-sa-password'; // pragma: allowlist secret\nconst realmUserUsername = 'myuser';\nconst realmUserPassword = 'myuser-password'; // pragma: allowlist secret\nconst realmUserFirstName = 'Jone';\nconst realmUserLastName = 'Doe';\nconst realmRoleName = 'my-role';\nconst realmRoleDescription = 'My role';\nconst realmGroupName = 'my-group';\nconst realmGroupDescription = 'My group';\nconst realmChildGroupName = 'my-child-group';\nconst realmChildGroupDescription = 'My child group';\n\nconst kc = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName });\nawait kc.simpleAuth({\n  clientId: realmAdminClientId,\n  clientSecret: realmAdminClientSecret,\n});\n\nconst realm = kc.realm(realmName);\n\nconst user = await realm\n  .user(realmUserUsername)\n  .ensure({ firstName: realmUserFirstName, lastName: realmUserLastName, password: realmUserPassword });\n\nconst role = await realm.role(realmRoleName).ensure({ description: realmRoleDescription });\nconst group = await realm.group(realmGroupName).ensure({ description: realmGroupDescription });\nconst childGroup = await group.childGroup(realmChildGroupName).ensure({ description: realmChildGroupDescription });\n\nawait user.assignRole(role);\nawait user.assignGroup(group);\nawait user.assignGroup(childGroup);\n");
;// CONCATENATED MODULE: ./docs/example/users-roles-groups.mdx


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
    ...(0,lib/* .useMDXComponents */.R)(),
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
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", "\n", (0,jsx_runtime.jsx)(CodeBlock/* ["default"] */.A, {
      language: "ts",
      children: users_roles_groups
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