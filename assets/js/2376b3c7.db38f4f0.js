"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[38],{

/***/ 4523:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   R: () => (/* binding */ useMDXComponents),
/* harmony export */   x: () => (/* binding */ MDXProvider)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7140);
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

/***/ 9290:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_fluent_api_realm_mdx_237_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-fluent-api-realm-mdx-237.json
const site_docs_fluent_api_realm_mdx_237_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"fluent-api/realm","title":"Realm API","description":"The RealmHandle class provides a fluent API for managing Keycloak realms. It allows you to create, update, delete, and search for realms, as well as interact with various Keycloak entities such as clients, roles, groups, and users.","source":"@site/docs/fluent-api/realm.mdx","sourceDirName":"fluent-api","slug":"/fluent-api/realm","permalink":"/fluent-api/realm","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":2,"frontMatter":{"sidebar_label":"Realm","sidebar_position":2},"sidebar":"fluentApi","previous":{"title":"Quick Start","permalink":"/fluent-api/quick-start"},"next":{"title":"User","permalink":"/fluent-api/user"}}');
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.3/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(5656);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.1.8_react@19.2.3/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(4523);
;// ./docs/fluent-api/realm.mdx


const frontMatter = {
	sidebar_label: 'Realm',
	sidebar_position: 2
};
const contentTitle = 'Realm API';

const assets = {

};



const toc = [{
  "value": "Class: <code>RealmHandle</code>",
  "id": "class-realmhandle",
  "level": 2
}, {
  "value": "Constructor",
  "id": "constructor",
  "level": 3
}, {
  "value": "Instance Methods",
  "id": "instance-methods",
  "level": 3
}, {
  "value": "<code>get()</code>",
  "id": "get",
  "level": 4
}, {
  "value": "<code>create(data: RealmInputData)</code>",
  "id": "createdata-realminputdata",
  "level": 4
}, {
  "value": "<code>update(data: RealmInputData)</code>",
  "id": "updatedata-realminputdata",
  "level": 4
}, {
  "value": "<code>delete()</code>",
  "id": "delete",
  "level": 4
}, {
  "value": "<code>ensure(data: RealmInputData)</code>",
  "id": "ensuredata-realminputdata",
  "level": 4
}, {
  "value": "<code>discard()</code>",
  "id": "discard",
  "level": 4
}, {
  "value": "<code>searchClients(keyword: string, options?: { page?: number; pageSize?: number })</code>",
  "id": "searchclientskeyword-string-options--page-number-pagesize-number-",
  "level": 4
}, {
  "value": "<code>searchClientScopes(keyword: string)</code>",
  "id": "searchclientscopeskeyword-string",
  "level": 4
}, {
  "value": "<code>searchRoles(keyword: string, options?: { page?: number; pageSize?: number })</code>",
  "id": "searchroleskeyword-string-options--page-number-pagesize-number-",
  "level": 4
}, {
  "value": "<code>searchGroups(keyword: string, options?: { page?: number; pageSize?: number })</code>",
  "id": "searchgroupskeyword-string-options--page-number-pagesize-number-",
  "level": 4
}, {
  "value": "<code>searchUsers(keyword: string, options?: { page?: number; pageSize?: number; attribute?: &#39;username&#39; | &#39;firstName&#39; | &#39;lastName&#39; | &#39;email&#39; })</code>",
  "id": "searchuserskeyword-string-options--page-number-pagesize-number-attribute-username--firstname--lastname--email-",
  "level": 4
}, {
  "value": "<code>searchIdentityProviders(keyword: string)</code>",
  "id": "searchidentityproviderskeyword-string",
  "level": 4
}, {
  "value": "Entity-Specific Methods",
  "id": "entity-specific-methods",
  "level": 3
}, {
  "value": "<code>client(clientId: string)</code>",
  "id": "clientclientid-string",
  "level": 4
}, {
  "value": "<code>clientScope(scopeName: string)</code>",
  "id": "clientscopescopename-string",
  "level": 4
}, {
  "value": "<code>role(roleName: string)</code>",
  "id": "rolerolename-string",
  "level": 4
}, {
  "value": "<code>group(groupName: string)</code>",
  "id": "groupgroupname-string",
  "level": 4
}, {
  "value": "<code>user(username: string)</code>",
  "id": "userusername-string",
  "level": 4
}, {
  "value": "<code>identityProvider(alias: string)</code>",
  "id": "identityprovideralias-string",
  "level": 4
}, {
  "value": "<code>confidentialBrowserLoginClient(clientId: string)</code>",
  "id": "confidentialbrowserloginclientclientid-string",
  "level": 4
}, {
  "value": "<code>publicBrowserLoginClient(clientId: string)</code>",
  "id": "publicbrowserloginclientclientid-string",
  "level": 4
}, {
  "value": "<code>serviceAccount(clientId: string)</code>",
  "id": "serviceaccountclientid-string",
  "level": 4
}, {
  "value": "<code>realmAdminServiceAccount(clientId: string)</code>",
  "id": "realmadminserviceaccountclientid-string",
  "level": 4
}, {
  "value": "Constants",
  "id": "constants",
  "level": 3
}, {
  "value": "<code>defaultRealmData</code>",
  "id": "defaultrealmdata",
  "level": 4
}];
function _createMdxContent(props) {
  const _components = {
    code: "code",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    header: "header",
    hr: "hr",
    li: "li",
    p: "p",
    pre: "pre",
    strong: "strong",
    ul: "ul",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "realm-api",
        children: "Realm API"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["The ", (0,jsx_runtime.jsx)(_components.code, {
        children: "RealmHandle"
      }), " class provides a fluent API for managing Keycloak realms. It allows you to create, update, delete, and search for realms, as well as interact with various Keycloak entities such as clients, roles, groups, and users."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.h2, {
      id: "class-realmhandle",
      children: ["Class: ", (0,jsx_runtime.jsx)(_components.code, {
        children: "RealmHandle"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "constructor",
      children: "Constructor"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "constructor(core: KeycloakAdminClient, realmName: string)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "core"
            }), ": An instance of ", (0,jsx_runtime.jsx)(_components.code, {
              children: "KeycloakAdminClient"
            }), "."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "realmName"
            }), ": The name of the realm to manage."]
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "instance-methods",
      children: "Instance Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "get",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "get()"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Fetches the current realm's details."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async get(): Promise<RealmRepresentation | null>\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Returns"
        }), ": The realm representation or ", (0,jsx_runtime.jsx)(_components.code, {
          children: "null"
        }), " if the realm does not exist."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "createdata-realminputdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "create(data: RealmInputData)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Creates a new realm."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async create(data: RealmInputData)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "data"
            }), ": The data for the new realm."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Throws"
        }), ": An error if the realm already exists."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "updatedata-realminputdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "update(data: RealmInputData)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Updates the realm's details."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async update(data: RealmInputData)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "data"
            }), ": The updated data for the realm."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Throws"
        }), ": An error if the realm does not exist."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "delete",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "delete()"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Deletes the realm."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async delete()\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Throws"
        }), ": An error if the realm does not exist."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "ensuredata-realminputdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "ensure(data: RealmInputData)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Ensures the realm exists. If it does, updates it; otherwise, creates it."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async ensure(data: RealmInputData)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "data"
            }), ": The data for the realm."]
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "discard",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "discard()"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Deletes the realm if it exists."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async discard()\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Returns"
        }), ": The name of the deleted realm."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "searchclientskeyword-string-options--page-number-pagesize-number-",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "searchClients(keyword: string, options?: { page?: number; pageSize?: number })"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Searches for clients in the realm."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async searchClients(keyword: string, options?: { page?: number; pageSize?: number })\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "keyword"
            }), ": The search keyword."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "options"
            }), ": Pagination options."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Returns"
        }), ": A list of matching clients."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "searchclientscopeskeyword-string",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "searchClientScopes(keyword: string)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Searches for client scopes in the realm."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async searchClientScopes(keyword: string)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "keyword"
            }), ": The search keyword."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Returns"
        }), ": A list of matching client scopes."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "searchroleskeyword-string-options--page-number-pagesize-number-",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "searchRoles(keyword: string, options?: { page?: number; pageSize?: number })"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Searches for roles in the realm."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async searchRoles(keyword: string, options?: { page?: number; pageSize?: number })\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "keyword"
            }), ": The search keyword."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "options"
            }), ": Pagination options."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Returns"
        }), ": A list of matching roles."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "searchgroupskeyword-string-options--page-number-pagesize-number-",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "searchGroups(keyword: string, options?: { page?: number; pageSize?: number })"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Searches for groups in the realm."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async searchGroups(keyword: string, options?: { page?: number; pageSize?: number })\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "keyword"
            }), ": The search keyword."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "options"
            }), ": Pagination options."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Returns"
        }), ": A list of matching groups."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "searchuserskeyword-string-options--page-number-pagesize-number-attribute-username--firstname--lastname--email-",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "searchUsers(keyword: string, options?: { page?: number; pageSize?: number; attribute?: 'username' | 'firstName' | 'lastName' | 'email' })"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Searches for users in the realm."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async searchUsers(keyword: string, options?: { page?: number; pageSize?: number; attribute?: 'username' | 'firstName' | 'lastName' | 'email' })\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "keyword"
            }), ": The search keyword."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "options"
            }), ": Pagination options and the attribute to search by."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Returns"
        }), ": A list of matching users."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "searchidentityproviderskeyword-string",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "searchIdentityProviders(keyword: string)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Searches for identity providers in the realm."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async searchIdentityProviders(keyword: string)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "keyword"
            }), ": The search keyword."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Returns"
        }), ": A list of matching identity providers."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "entity-specific-methods",
      children: "Entity-Specific Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "clientclientid-string",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "client(clientId: string)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Returns a handle for managing a specific client."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public client(clientId: string)\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "clientscopescopename-string",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "clientScope(scopeName: string)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Returns a handle for managing a specific client scope."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public clientScope(scopeName: string)\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "rolerolename-string",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "role(roleName: string)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Returns a handle for managing a specific role."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public role(roleName: string)\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "groupgroupname-string",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "group(groupName: string)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Returns a handle for managing a specific group."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public group(groupName: string)\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "userusername-string",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "user(username: string)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Returns a handle for managing a specific user."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public user(username: string)\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "identityprovideralias-string",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "identityProvider(alias: string)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Returns a handle for managing a specific identity provider."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public identityProvider(alias: string)\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "confidentialbrowserloginclientclientid-string",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "confidentialBrowserLoginClient(clientId: string)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Returns a handle for managing a confidential browser login client."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public confidentialBrowserLoginClient(clientId: string)\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "publicbrowserloginclientclientid-string",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "publicBrowserLoginClient(clientId: string)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Returns a handle for managing a public browser login client."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public publicBrowserLoginClient(clientId: string)\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "serviceaccountclientid-string",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "serviceAccount(clientId: string)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Returns a handle for managing a service account."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public serviceAccount(clientId: string)\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "realmadminserviceaccountclientid-string",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "realmAdminServiceAccount(clientId: string)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Returns a handle for managing a realm admin service account."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public realmAdminServiceAccount(clientId: string)\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "constants",
      children: "Constants"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "defaultrealmdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "defaultRealmData"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Default data for creating a realm."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "export const defaultRealmData = Object.freeze({\n  enabled: true,\n});\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "This API provides a comprehensive interface for managing Keycloak realms and their associated entities."
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