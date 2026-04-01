"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[323],{

/***/ 416:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   R: () => (/* binding */ useMDXComponents),
/* harmony export */   x: () => (/* binding */ MDXProvider)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9471);
/**
 * @import {MDXComponents} from 'mdx/types.js'
 * @import {Component, ReactElement, ReactNode} from 'react'
 */

/**
 * @callback MergeComponents
 *   Custom merge function.
 * @param {Readonly<MDXComponents>} currentComponents
 *   Current components from the context.
 * @returns {MDXComponents}
 *   Additional components.
 *
 * @typedef Props
 *   Configuration for `MDXProvider`.
 * @property {ReactNode | null | undefined} [children]
 *   Children (optional).
 * @property {Readonly<MDXComponents> | MergeComponents | null | undefined} [components]
 *   Additional components to use or a function that creates them (optional).
 * @property {boolean | null | undefined} [disableParentContext=false]
 *   Turn off outer component context (default: `false`).
 */



/** @type {Readonly<MDXComponents>} */
const emptyComponents = {}

const MDXContext = react__WEBPACK_IMPORTED_MODULE_0__.createContext(emptyComponents)

/**
 * Get current components from the MDX Context.
 *
 * @param {Readonly<MDXComponents> | MergeComponents | null | undefined} [components]
 *   Additional components to use or a function that creates them (optional).
 * @returns {MDXComponents}
 *   Current components.
 */
function useMDXComponents(components) {
  const contextComponents = react__WEBPACK_IMPORTED_MODULE_0__.useContext(MDXContext)

  // Memoize to avoid unnecessary top-level context changes
  return react__WEBPACK_IMPORTED_MODULE_0__.useMemo(
    function () {
      // Custom merge via a function prop
      if (typeof components === 'function') {
        return components(contextComponents)
      }

      return {...contextComponents, ...components}
    },
    [contextComponents, components]
  )
}

/**
 * Provider for MDX context.
 *
 * @param {Readonly<Props>} properties
 *   Properties.
 * @returns {ReactElement}
 *   Element.
 * @satisfies {Component}
 */
function MDXProvider(properties) {
  /** @type {Readonly<MDXComponents>} */
  let allComponents

  if (properties.disableParentContext) {
    allComponents =
      typeof properties.components === 'function'
        ? properties.components(emptyComponents)
        : properties.components || emptyComponents
  } else {
    allComponents = useMDXComponents(properties.components)
  }

  return react__WEBPACK_IMPORTED_MODULE_0__.createElement(
    MDXContext.Provider,
    {value: allComponents},
    properties.children
  )
}


/***/ }),

/***/ 9463:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_api_keycloak_admin_client_fluent_mdx_9cd_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-api-keycloak-admin-client-fluent-mdx-9cd.json
const site_docs_api_keycloak_admin_client_fluent_mdx_9cd_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"api/keycloak-admin-client-fluent","title":"KeycloakAdminClientFluent API","description":"KeycloakAdminClientFluent is the root entry point for the library. It wraps a @keycloak/keycloak-admin-client instance and gives you fluent access to realm-scoped handles, root-scoped system helpers, and convenience authentication helpers.","source":"@site/docs/api/keycloak-admin-client-fluent.mdx","sourceDirName":"api","slug":"/api/keycloak-admin-client-fluent","permalink":"/api/keycloak-admin-client-fluent","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":0,"frontMatter":{"sidebar_label":"Client Fluent","sidebar_position":0},"sidebar":"api","next":{"title":"Realm","permalink":"/api/realm"}}');
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.4/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(2615);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.14_react@19.2.4/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(416);
;// ./docs/api/keycloak-admin-client-fluent.mdx


const frontMatter = {
	sidebar_label: 'Client Fluent',
	sidebar_position: 0
};
const contentTitle = 'KeycloakAdminClientFluent API';

const assets = {

};



const toc = [{
  "value": "Constructor",
  "id": "constructor",
  "level": 2
}, {
  "value": "Common Usage",
  "id": "common-usage",
  "level": 2
}, {
  "value": "Methods",
  "id": "methods",
  "level": 2
}, {
  "value": "<code>auth(credentials)</code>",
  "id": "authcredentials",
  "level": 3
}, {
  "value": "<code>simpleAuth({ username?, password?, refreshToken?, clientId?, clientSecret? })</code>",
  "id": "simpleauth-username-password-refreshtoken-clientid-clientsecret-",
  "level": 3
}, {
  "value": "<code>realm(name)</code>",
  "id": "realmname",
  "level": 3
}, {
  "value": "<code>serverInfo()</code>",
  "id": "serverinfo",
  "level": 3
}, {
  "value": "<code>whoAmI(currentRealm, realmName?)</code>",
  "id": "whoamicurrentrealm-realmname",
  "level": 3
}, {
  "value": "<code>searchRealms(keyword)</code>",
  "id": "searchrealmskeyword",
  "level": 3
}, {
  "value": "Related Pages",
  "id": "related-pages",
  "level": 2
}];
function _createMdxContent(props) {
  const _components = {
    code: "code",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    header: "header",
    li: "li",
    p: "p",
    pre: "pre",
    ul: "ul",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "keycloakadminclientfluent-api",
        children: "KeycloakAdminClientFluent API"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "KeycloakAdminClientFluent"
      }), " is the root entry point for the library. It wraps a ", (0,jsx_runtime.jsx)(_components.code, {
        children: "@keycloak/keycloak-admin-client"
      }), " instance and gives you fluent access to realm-scoped handles, root-scoped system helpers, and convenience authentication helpers."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "constructor",
      children: "Constructor"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "new KeycloakAdminClientFluent(connectionConfig?)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "connectionConfig"
      }), " is passed straight to the underlying ", (0,jsx_runtime.jsx)(_components.code, {
        children: "KeycloakAdminClient"
      }), " constructor."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "common-usage",
      children: "Common Usage"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "import KeycloakAdminClientFluent from '@egose/keycloak-fluent';\n\nconst kc = new KeycloakAdminClientFluent({\n  baseUrl: 'http://localhost:8080',\n  realmName: 'master',\n});\n\nawait kc.simpleAuth({\n  username: 'admin',\n  password: 'admin', // pragma: allowlist secret\n});\n\nconst realm = await kc.realm('demo').ensure({ displayName: 'Demo Realm' });\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "methods",
      children: "Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "authcredentials",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "auth(credentials)"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Calls the underlying Keycloak admin client's ", (0,jsx_runtime.jsx)(_components.code, {
        children: "auth"
      }), " method directly."]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "await kc.auth({\n  grantType: 'password',\n  clientId: 'admin-cli',\n  username: 'admin',\n  password: 'admin', // pragma: allowlist secret\n});\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Use this when you want full control over the exact grant configuration."
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "simpleauth-username-password-refreshtoken-clientid-clientsecret-",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "simpleAuth({ username?, password?, refreshToken?, clientId?, clientSecret? })"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Chooses the grant type for you:"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "password"
        }), " grant when ", (0,jsx_runtime.jsx)(_components.code, {
          children: "password"
        }), " is provided"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "refresh_token"
        }), " grant when ", (0,jsx_runtime.jsx)(_components.code, {
          children: "refreshToken"
        }), " is provided"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "client_credentials"
        }), " grant otherwise"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "await kc.simpleAuth({ username: 'admin', password: 'admin' }); // pragma: allowlist secret\nawait kc.simpleAuth({ refreshToken, clientId: 'admin-cli' });\nawait kc.simpleAuth({ clientId: 'svc-admin', clientSecret: 'secret' }); // pragma: allowlist secret\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["By default, ", (0,jsx_runtime.jsx)(_components.code, {
        children: "clientId"
      }), " is ", (0,jsx_runtime.jsx)(_components.code, {
        children: "admin-cli"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "realmname",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "realm(name)"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Returns a ", (0,jsx_runtime.jsx)(_components.code, {
        children: "RealmHandle"
      }), " for a specific realm."]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const realm = kc.realm('demo');\nawait realm.user('alice').ensure({ email: 'alice@example.com' });\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "serverinfo",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "serverInfo()"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Returns a ", (0,jsx_runtime.jsx)(_components.code, {
        children: "ServerInfoHandle"
      }), " for root-scoped server metadata and effective message bundle lookups."]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const serverInfo = await kc.serverInfo().get();\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "whoamicurrentrealm-realmname",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "whoAmI(currentRealm, realmName?)"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Returns a ", (0,jsx_runtime.jsx)(_components.code, {
        children: "WhoAmIHandle"
      }), " for inspecting the currently authenticated admin user."]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const me = await kc.whoAmI('master').get();\nconst inDemoRealm = await kc.whoAmI('master', 'demo').get();\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The first argument is always the current realm used for the admin request. The optional second argument asks Keycloak to resolve the user within another realm."
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "searchrealmskeyword",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "searchRealms(keyword)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Lists realms through the admin client and filters them locally by name."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const matches = await kc.searchRealms('demo');\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "related-pages",
      children: "Related Pages"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "RealmHandle"
        }), ": realm-scoped resource entry point"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "ServerInfoHandle"
        }), ": server metadata helpers"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "WhoAmIHandle"
        }), ": current admin identity lookup"]
      }), "\n"]
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