"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([["6232"], {
3577(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  metadata: () => (/* reexport */ site_docs_api_handle_identity_mdx_ea3_namespaceObject),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  contentTitle: () => (/* binding */ contentTitle),
  toc: () => (/* binding */ toc),
  assets: () => (/* binding */ assets)
});

;// CONCATENATED MODULE: ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-api-handle-identity-mdx-ea3.json
var site_docs_api_handle_identity_mdx_ea3_namespaceObject = JSON.parse('{"id":"api/handle-identity","title":"Handle Identity, Caching, And Rebinding","description":"Fluent handles (RealmHandle, ClientHandle, ClientScopeHandle, RoleHandle,","source":"@site/docs/api/handle-identity.mdx","sourceDirName":"api","slug":"/api/handle-identity","permalink":"/api/handle-identity","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":1,"frontMatter":{"sidebar_label":"Handle Identity & Rebinding","sidebar_position":1},"sidebar":"api","previous":{"title":"Client Fluent","permalink":"/api/keycloak-admin-client-fluent"},"next":{"title":"Realm","permalink":"/api/realm"}}')
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.7/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(1684);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.17_react@19.2.7/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(506);
;// CONCATENATED MODULE: ./docs/api/handle-identity.mdx


const frontMatter = {
	sidebar_label: 'Handle Identity & Rebinding',
	sidebar_position: 1
};
const contentTitle = 'Handle Identity, Caching, And Rebinding';

const assets = {

};



const toc = [{
  "value": "What This Means For You",
  "id": "what-this-means-for-you",
  "level": 2
}, {
  "value": "Reads are unaffected",
  "id": "reads-are-unaffected",
  "level": 3
}, {
  "value": "Writes that previously worked now fail at compile time",
  "id": "writes-that-previously-worked-now-fail-at-compile-time",
  "level": 3
}, {
  "value": "Re-Targeting A Handle: <code>rebind(newId)</code>",
  "id": "re-targeting-a-handle-rebindnewid",
  "level": 2
}, {
  "value": "Child handles follow the parent automatically",
  "id": "child-handles-follow-the-parent-automatically",
  "level": 3
}, {
  "value": "Which Handles Support <code>rebind</code>?",
  "id": "which-handles-support-rebind",
  "level": 2
}, {
  "value": "Contract Stability",
  "id": "contract-stability",
  "level": 2
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    code: "code",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    header: "header",
    li: "li",
    ol: "ol",
    p: "p",
    pre: "pre",
    strong: "strong",
    table: "table",
    tbody: "tbody",
    td: "td",
    th: "th",
    thead: "thead",
    tr: "tr",
    ul: "ul",
    ...(0,lib/* .useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "handle-identity-caching-and-rebinding",
        children: "Handle Identity, Caching, And Rebinding"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Fluent handles (", (0,jsx_runtime.jsx)(_components.code, {
        children: "RealmHandle"
      }), ", ", (0,jsx_runtime.jsx)(_components.code, {
        children: "ClientHandle"
      }), ", ", (0,jsx_runtime.jsx)(_components.code, {
        children: "ClientScopeHandle"
      }), ", ", (0,jsx_runtime.jsx)(_components.code, {
        children: "RoleHandle"
      }), ",\n", (0,jsx_runtime.jsx)(_components.code, {
        children: "UserHandle"
      }), ", ...) carry two pieces of state:"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.ol, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Routing identity"
        }), " — the realm name, client id, role name, scope name,\nuser name, alias, etc. that the handle targets."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Cached representation"
        }), " — the most recently resolved upsert-able\nrepresentation (", (0,jsx_runtime.jsx)(_components.code, {
          children: "client"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "role"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "group"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "user"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "flow"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "workflow"
        }), ",\n", (0,jsx_runtime.jsx)(_components.code, {
          children: "organization"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "identityProvider"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "component"
        }), ", ...)."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Both are ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "read-only from outside the handle"
      }), ". This prevents callers from\ninadvertently redirecting a handle by mutating its identity, or from\npoisoning the cached representation in front of a destructive call. The\nonly supported way to retarget a handle after construction is the public\n", (0,jsx_runtime.jsx)(_components.code, {
        children: "rebind(newId)"
      }), " method described below."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "what-this-means-for-you",
      children: "What This Means For You"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "reads-are-unaffected",
      children: "Reads are unaffected"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "All the public read access patterns keep working:"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const role = await realm.role('manage-users').ensure({});\n\nrole.realmName; // 'demo'\nrole.roleName; // 'manage-users'\nrole.role; // the resolved RoleRepresentation (or null/undefined before get())\nrole.core; // the underlying KeycloakAdminClient (also reachable via kc.core)\nrole.realmHandle; // the parent RealmHandle\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "writes-that-previously-worked-now-fail-at-compile-time",
      children: "Writes that previously worked now fail at compile time"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "// These all fail to compile after the encapsulation contract landed:\nrole.roleName = 'other'; // readonly getter\nrole.role = undefined; // readonly getter\nclient.clientId = 'other'; // readonly getter\nclient.client = undefined; // readonly getter\nrealm.realmName = 'other'; // readonly getter\nrealm.realm = undefined; // readonly getter\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "kc.core"
      }), " and per-handle ", (0,jsx_runtime.jsx)(_components.code, {
        children: ".core"
      }), " / ", (0,jsx_runtime.jsx)(_components.code, {
        children: ".realmHandle"
      }), " remain ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "publicly readable"
      }), "\n(documented as such in the ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/keycloak-admin-client-fluent/",
        children: "Client Fluent API"
      }), ")\nand are declared ", (0,jsx_runtime.jsx)(_components.code, {
        children: "readonly"
      }), " so they cannot be redirected after construction."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.h2, {
      id: "re-targeting-a-handle-rebindnewid",
      children: ["Re-Targeting A Handle: ", (0,jsx_runtime.jsx)(_components.code, {
        children: "rebind(newId)"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Every parent handle exposes a ", (0,jsx_runtime.jsx)(_components.code, {
        children: "rebind(newId)"
      }), " method that:"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Updates the handle's routing identity to the new value."
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Clears the cached representation so the next read resolves against the\nnew target."
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["Returns ", (0,jsx_runtime.jsx)(_components.code, {
          children: "this"
        }), " for chaining."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const clientHandle = realm.client('app-a');\n\nawait clientHandle.ensure({ description: 'A' });\n\n// Re-target the SAME handle at 'app-b'. Subsequent operations resolve B,\n// never a stale snapshot of A.\nclientHandle.rebind('app-b');\nawait clientHandle.ensure({ description: 'B' });\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "child-handles-follow-the-parent-automatically",
      children: "Child handles follow the parent automatically"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Child handles derive their parent routing identity from a shared identity\nversion contract. Rebinding a parent bumps that version, so existing children\nnotice the parent-generation change, clear any cached representation from the\nold parent, and re-resolve on their next operation. There is no separate\n\"invalidate\" call and no child ", (0,jsx_runtime.jsx)(_components.code, {
        children: "rebind()"
      }), " call you need to make."]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const clientHandle = realm.client('app-a');\nconst roleHandle = clientHandle.role('reader');\n\nawait clientHandle.get(); // resolves app-a\nawait roleHandle.get(); // resolves the reader role on app-a\n\nclientHandle.rebind('app-b');\n\nawait roleHandle.get(); // now resolves the reader role on app-b\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["The same transitive behavior applies across multiple levels, including realm\nchildren, client roles, client protocol mappers, client-scope protocol mappers,\nidentity-provider mappers, and nested groups. For example, rebinding a\n", (0,jsx_runtime.jsx)(_components.code, {
        children: "ClientScopeHandle"
      }), " automatically invalidates an already-resolved protocol\nmapper under that scope, and rebinding a parent group changes the live path\nused by existing child-group handles. Realm-owned cached descendants such as\n", (0,jsx_runtime.jsx)(_components.code, {
        children: "UserStorageProviderHandle.providerName"
      }), " also clear cached values after a realm\nrebind before their next operation or cache read."]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "If neither the local identity nor any parent identity changed, handles keep\ntheir cached parent representation and preserve the no-duplicate-lookup fast\npath."
    }), "\n", (0,jsx_runtime.jsxs)(_components.h2, {
      id: "which-handles-support-rebind",
      children: ["Which Handles Support ", (0,jsx_runtime.jsx)(_components.code, {
        children: "rebind"
      }), "?"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.table, {
      children: [(0,jsx_runtime.jsx)(_components.thead, {
        children: (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.th, {
            children: "Handle"
          }), (0,jsx_runtime.jsxs)(_components.th, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "rebind(newId)"
            }), " parameter"]
          })]
        })
      }), (0,jsx_runtime.jsxs)(_components.tbody, {
        children: [(0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "RealmHandle"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "new realm name"
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsxs)(_components.td, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "ClientHandle"
            }), " (and confidential/public/service-account subclasses)"]
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "new client id"
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "ClientScopeHandle"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "new scope name"
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "RoleHandle"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "new role name"
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "ClientRoleHandle"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "new role name (parent client is followed live)"
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "UserHandle"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "new username"
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "OrganizationHandle"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "new organization alias"
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "IdentityProviderHandle"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "new alias"
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "IdentityProviderMapperHandle"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "new mapper name"
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "AuthenticationFlowHandle"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "new alias"
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "WorkflowHandle"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "new workflow name"
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "ComponentHandle"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "new component name"
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsxs)(_components.td, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "GroupHandle"
            }), " / ", (0,jsx_runtime.jsx)(_components.code, {
              children: "ChildGroupHandle"
            }), " / ", (0,jsx_runtime.jsx)(_components.code, {
              children: "NestedChildGroupHandle"
            })]
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "new group name"
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "ProtocolMapperHandle"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "new mapper name"
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "ClientScopeProtocolMapperHandle"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "new mapper name"
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "AttackDetectionHandle"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "new user id"
          })]
        })]
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "UserStorageProviderHandle"
      }), " is keyed by its provider ID and does not expose a\nlocal ", (0,jsx_runtime.jsx)(_components.code, {
        children: "rebind()"
      }), " method; when its parent realm is rebound, it follows the new\nrealm and invalidates its cached provider name automatically."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "CacheHandle"
      }), " and ", (0,jsx_runtime.jsx)(_components.code, {
        children: "ClientPoliciesHandle"
      }), " have no local cached representation or\nper-handle identity beyond the realm, so they do not expose ", (0,jsx_runtime.jsx)(_components.code, {
        children: "rebind"
      }), "; use\n", (0,jsx_runtime.jsx)(_components.code, {
        children: "RealmHandle.rebind"
      }), " to retarget their realm."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "contract-stability",
      children: "Contract Stability"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Re-targeting through ", (0,jsx_runtime.jsx)(_components.code, {
        children: "rebind"
      }), " is the only intentional way to reuse a handle\nacross identities. The fields previously exposed as ", (0,jsx_runtime.jsx)(_components.code, {
        children: "public"
      }), " mutable\n(", (0,jsx_runtime.jsx)(_components.code, {
        children: "clientId"
      }), ", ", (0,jsx_runtime.jsx)(_components.code, {
        children: "scopeName"
      }), ", ", (0,jsx_runtime.jsx)(_components.code, {
        children: "roleName"
      }), ", ", (0,jsx_runtime.jsx)(_components.code, {
        children: "username"
      }), ", ", (0,jsx_runtime.jsx)(_components.code, {
        children: "alias"
      }), ", ... and the\nmatching cached representations) are now backed by private storage accessed\nthrough ", (0,jsx_runtime.jsx)(_components.code, {
        children: "public readonly"
      }), " getters. This is a ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "TypeScript compile-time"
      }), "\ncontract change — runtime code that read these fields continues to work,\nand the ", (0,jsx_runtime.jsx)(_components.code, {
        children: "rebind()"
      }), " API replaces direct field mutation. The compile fixture\nin ", (0,jsx_runtime.jsx)(_components.code, {
        children: "tests/implementation-handle-visibility.spec.ts"
      }), " enforces the visibility\ncontract on every CI run so the encapsulation cannot regress silently."]
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
506(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
__webpack_require__.d(__webpack_exports__, {
  R: () => (useMDXComponents),
  x: () => (MDXProvider)
});
/* import */ var react__rspack_import_0 = __webpack_require__(2888);
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

const MDXContext = react__rspack_import_0.createContext(emptyComponents)

/**
 * Get current components from the MDX Context.
 *
 * @param {Readonly<MDXComponents> | MergeComponents | null | undefined} [components]
 *   Additional components to use or a function that creates them (optional).
 * @returns {MDXComponents}
 *   Current components.
 */
function useMDXComponents(components) {
  const contextComponents = react__rspack_import_0.useContext(MDXContext)

  // Memoize to avoid unnecessary top-level context changes
  return react__rspack_import_0.useMemo(
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

  return react__rspack_import_0.createElement(
    MDXContext.Provider,
    {value: allComponents},
    properties.children
  )
}


},

}]);