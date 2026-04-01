"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[2161],{

/***/ 556:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_example_general_mdx_b86_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-example-general-mdx-b86.json
const site_docs_example_general_mdx_b86_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"example/general","title":"Examples Overview","description":"This example demonstrates a full end-to-end setup using keycloak-fluent. It shows how to authenticate against the master realm, create and configure a custom realm, and then provision common Keycloak resources such as users, roles, groups, clients, service accounts, and protocol mappers using a fluent, chainable API.","source":"@site/docs/example/general.mdx","sourceDirName":"example","slug":"/example/general","permalink":"/example/general","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":0,"frontMatter":{"sidebar_label":"Overview","sidebar_position":0},"sidebar":"example","next":{"title":"Realm Bootstrap","permalink":"/example/bootstrap-realm"}}');
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.4/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(2615);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.14_react@19.2.4/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(416);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.2.14_acorn@8.15.0_react-dom@19.2.4_reac_c605bc6be7265f0399fba11c0699f091/node_modules/@docusaurus/theme-classic/lib/theme/CodeBlock/index.js + 27 modules
var CodeBlock = __webpack_require__(804);
;// ./node_modules/.pnpm/raw-loader@4.0.2_webpack@5.99.9/node_modules/raw-loader/dist/cjs.js!./.samples/general.ts
/* harmony default export */ const general = ("import KeycloakAdminClientFluent from '@egose/keycloak-fluent';\n\nconst kcMaster = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName: 'master' });\nawait kcMaster.simpleAuth({\n  username: 'admin',\n  password: 'password', // pragma: allowlist secret\n});\n\nconst realmName = 'my-custom-realm';\nconst realmDisplayName = 'My custom realm';\nconst realmAdminClientId = 'my-custom-realm-admin-sa';\nconst realmAdminClientSecret = 'my-custom-realm-admin-sa-password'; // pragma: allowlist secret\nconst realmAdminClientDescription = 'My realm admin service account';\nconst realmUserUsername = 'myuser';\nconst realmUserPassword = 'myuser-password'; // pragma: allowlist secret\nconst realmUserFirstName = 'Jone';\nconst realmUserLastName = 'Doe';\nconst realmRoleName = 'my-role';\nconst realmRoleDescription = 'My role';\nconst realmGroupName = 'my-group';\nconst realmGroupDescription = 'My group';\nconst realmChildGroupName = 'my-child-group';\nconst realmChildGroupDescription = 'My child group';\nconst clientId = 'my-client';\nconst clientDescription = 'My client';\nconst clientRoleName = 'my-client-role';\nconst clientRoleDescription = 'My client role';\nconst serviceAccountId = 'my-service-account';\nconst serviceAccountSecret = 'my-service-account-password'; // pragma: allowlist secret\nconst publicBrowserLoginClientId = 'my-public-browser-login-client';\nconst confidentialBrowserLoginClientId = 'my-confidential-browser-login-client';\nconst confidentialBrowserLoginClientSecret = 'my-confidential-browser-login-client-password'; // pragma: allowlist secret\nconst clientProtocolMapperName = 'my-client-mapper';\nconst clientAudienceMapperName = 'my-audience-mapper';\nconst clientHardcodedClaimMapperName = 'my-hardcoded-claim-mapper';\nconst clientUserAttributeMapperName = 'my-user-attribute-mapper';\n\nconst customRealm = await kcMaster.realm(realmName).ensure({ displayName: realmDisplayName });\nawait customRealm\n  .realmAdminServiceAccount(realmAdminClientId)\n  .ensure({ description: realmAdminClientDescription, secret: realmAdminClientSecret });\n\nconst kcCustom = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName });\nawait kcCustom.simpleAuth({\n  clientId: realmAdminClientId,\n  clientSecret: realmAdminClientSecret,\n});\n\nconst realmUser = await customRealm\n  .user(realmUserUsername)\n  .ensure({ firstName: realmUserFirstName, lastName: realmUserLastName, password: realmUserPassword });\n\nconst realmRole = await customRealm.role(realmRoleName).ensure({ description: realmRoleDescription });\nconst realmGroup = await customRealm.group(realmGroupName).ensure({ description: realmGroupDescription });\nconst realmChildGroup = await realmGroup\n  .childGroup(realmChildGroupName)\n  .ensure({ description: realmChildGroupDescription });\n\nawait realmUser.assignRole(realmRole);\nawait realmUser.assignGroup(realmGroup);\nawait realmUser.assignGroup(realmChildGroup);\n\nconst client = await customRealm.client(clientId).ensure({ description: clientDescription });\nconst clientRole = await client.role(clientRoleName).ensure({ description: clientRoleDescription });\nawait realmUser.assignClientRole(clientRole);\n\nconst serviceAccount = await customRealm.serviceAccount(serviceAccountId).ensure({ secret: serviceAccountSecret });\nconst publicBrowserLoginClient = await customRealm.publicBrowserLoginClient(publicBrowserLoginClientId).ensure({});\nconst confidentialBrowserLoginClient = await customRealm\n  .serviceAccount(confidentialBrowserLoginClientId)\n  .ensure({ secret: confidentialBrowserLoginClientSecret });\n\nawait serviceAccount.protocolMapper(clientProtocolMapperName).ensure({});\nawait publicBrowserLoginClient.audienceProtocolMapper(clientAudienceMapperName).ensure({ audience: 'myname' });\n\nawait confidentialBrowserLoginClient\n  .hardcodedClaimProtocolMapper(clientHardcodedClaimMapperName)\n  .ensure({ claimName: 'fruite', claimValue: 'apple' });\nawait confidentialBrowserLoginClient\n  .userAttributeProtocolMapper(clientUserAttributeMapperName)\n  .ensure({ claimName: 'myemail', userAttribute: 'email' });\n");
;// ./docs/example/general.mdx


const frontMatter = {
	sidebar_label: 'Overview',
	sidebar_position: 0
};
const contentTitle = 'Examples Overview';

const assets = {

};





const toc = [];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    code: "code",
    h1: "h1",
    header: "header",
    hr: "hr",
    li: "li",
    p: "p",
    ul: "ul",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "examples-overview",
        children: "Examples Overview"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["This example demonstrates a full end-to-end setup using ", (0,jsx_runtime.jsx)(_components.code, {
        children: "keycloak-fluent"
      }), ". It shows how to authenticate against the master realm, create and configure a custom realm, and then provision common Keycloak resources such as users, roles, groups, clients, service accounts, and protocol mappers using a fluent, chainable API."]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The snippet is intentionally comprehensive to illustrate how different building blocks fit together in a real-world scenario. In practice, you would typically split this logic across smaller scripts or services depending on your provisioning needs."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "For smaller focused walkthroughs, use the dedicated pages in this section:"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.a, {
          href: "/example/bootstrap-realm/",
          children: "Realm bootstrap"
        }), " for creating a realm and its admin service account."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.a, {
          href: "/example/users-roles-groups/",
          children: "Users, roles, and groups"
        }), " for basic identity provisioning."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.a, {
          href: "/example/clients-and-service-accounts/",
          children: "Clients and service accounts"
        }), " for application and machine client setup."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.a, {
          href: "/example/protocol-mappers/",
          children: "Protocol mappers"
        }), " for token shaping and claim configuration."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.a, {
          href: "/example/organizations/",
          children: "Organizations"
        }), " for membership, invitations, and linked identity providers."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.a, {
          href: "/example/authentication-flows/",
          children: "Authentication flows"
        }), " for copied flows, executions, and required actions."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.a, {
          href: "/example/realm-operations/",
          children: "Realm operations"
        }), " for cache, attack detection, client policies, and workflows."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.a, {
          href: "/example/system-introspection/",
          children: "System introspection"
        }), " for ", (0,jsx_runtime.jsx)(_components.code, {
          children: "serverInfo()"
        }), " and ", (0,jsx_runtime.jsx)(_components.code, {
          children: "whoAmI()"
        }), " checks."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.a, {
          href: "/example/components/",
          children: "Components"
        }), " for precise component lookup and subcomponent discovery."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.a, {
          href: "/example/user-storage-providers/",
          children: "User storage providers"
        }), " for LDAP sync and cleanup operations."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", "\n", (0,jsx_runtime.jsx)(CodeBlock/* default */.A, {
      language: "ts",
      children: general
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