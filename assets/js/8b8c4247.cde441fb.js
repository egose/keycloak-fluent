"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[475],{

/***/ 2150:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_fluent_api_client_scope_mdx_8b8_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-fluent-api-client-scope-mdx-8b8.json
const site_docs_fluent_api_client_scope_mdx_8b8_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"fluent-api/client-scope","title":"Client Scope API","description":"The ClientScopeHandle class provides a fluent API for managing Keycloak client scopes. It allows you to create, update, delete, and retrieve client scopes within a specific realm.","source":"@site/docs/fluent-api/client-scope.mdx","sourceDirName":"fluent-api","slug":"/fluent-api/client-scope","permalink":"/fluent-api/client-scope","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":6,"frontMatter":{"sidebar_label":"Client Scope","sidebar_position":6},"sidebar":"fluentApi","previous":{"title":"Nested Child Group","permalink":"/fluent-api/groups/nested-child-group"},"next":{"title":"Identity Provider","permalink":"/fluent-api/identity-provider"}}');
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.3/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(5656);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.1.8_react@19.2.3/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(4523);
;// ./docs/fluent-api/client-scope.mdx


const frontMatter = {
	sidebar_label: 'Client Scope',
	sidebar_position: 6
};
const contentTitle = 'Client Scope API';

const assets = {

};



const toc = [{
  "value": "Class: <code>ClientScopeHandle</code>",
  "id": "class-clientscopehandle",
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
  "value": "<code>create(data: ClientScopeInputData)</code>",
  "id": "createdata-clientscopeinputdata",
  "level": 4
}, {
  "value": "<code>update(data: ClientScopeInputData)</code>",
  "id": "updatedata-clientscopeinputdata",
  "level": 4
}, {
  "value": "<code>delete()</code>",
  "id": "delete",
  "level": 4
}, {
  "value": "<code>ensure(data: ClientScopeInputData)</code>",
  "id": "ensuredata-clientscopeinputdata",
  "level": 4
}, {
  "value": "<code>discard()</code>",
  "id": "discard",
  "level": 4
}, {
  "value": "Constants",
  "id": "constants",
  "level": 3
}, {
  "value": "<code>defaultScopeData</code>",
  "id": "defaultscopedata",
  "level": 4
}, {
  "value": "Types",
  "id": "types",
  "level": 3
}, {
  "value": "<code>ClientScopeType</code>",
  "id": "clientscopetype",
  "level": 4
}, {
  "value": "<code>ClientScopeProtocol</code>",
  "id": "clientscopeprotocol",
  "level": 4
}, {
  "value": "<code>ClientScopeInputData</code>",
  "id": "clientscopeinputdata",
  "level": 4
}, {
  "value": "<code>ClientScopeRepresentationExt</code>",
  "id": "clientscoperepresentationext",
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
        id: "client-scope-api",
        children: "Client Scope API"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["The ", (0,jsx_runtime.jsx)(_components.code, {
        children: "ClientScopeHandle"
      }), " class provides a fluent API for managing Keycloak client scopes. It allows you to create, update, delete, and retrieve client scopes within a specific realm."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.h2, {
      id: "class-clientscopehandle",
      children: ["Class: ", (0,jsx_runtime.jsx)(_components.code, {
        children: "ClientScopeHandle"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "constructor",
      children: "Constructor"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, scopeName: string)\n"
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
              children: "realmHandle"
            }), ": A handle to the realm where the client scope resides."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "scopeName"
            }), ": The name of the client scope to manage."]
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
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Fetches the client scope by its name and updates the instance's ", (0,jsx_runtime.jsx)(_components.code, {
        children: "clientScope"
      }), " property."]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async get(): Promise<ClientScopeRepresentation | null>\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Returns"
        }), ": The client scope representation or ", (0,jsx_runtime.jsx)(_components.code, {
          children: "null"
        }), " if the client scope does not exist."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "createdata-clientscopeinputdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "create(data: ClientScopeInputData)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Creates a new client scope."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async create(data: ClientScopeInputData)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "data"
            }), ": The data for the new client scope."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Throws"
        }), ": An error if the client scope already exists."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "updatedata-clientscopeinputdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "update(data: ClientScopeInputData)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Updates the client scope's details."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async update(data: ClientScopeInputData)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "data"
            }), ": The updated data for the client scope."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Throws"
        }), ": An error if the client scope does not exist."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "delete",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "delete()"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Deletes the client scope."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async delete()\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Throws"
        }), ": An error if the client scope does not exist."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "ensuredata-clientscopeinputdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "ensure(data: ClientScopeInputData)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Ensures the client scope exists. If it does, updates it; otherwise, creates it."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async ensure(data: ClientScopeInputData)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "data"
            }), ": The data for the client scope."]
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "discard",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "discard()"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Deletes the client scope if it exists."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async discard()\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Returns"
        }), ": The name of the deleted client scope."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "constants",
      children: "Constants"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "defaultscopedata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "defaultScopeData"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Default data for creating a client scope."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "export const defaultScopeData = Object.freeze({\n  description: '',\n  type: 'none',\n  protocol: 'openid-connect',\n  attributes: {\n    'display.on.consent.screen': 'true',\n    'include.in.token.scope': 'false',\n    'consent.screen.text': '',\n    'gui.order': '',\n  },\n});\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "types",
      children: "Types"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "clientscopetype",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "ClientScopeType"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The type of the client scope."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "export type ClientScopeType = 'none' | 'default' | 'optional';\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "clientscopeprotocol",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "ClientScopeProtocol"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The protocol of the client scope."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "export type ClientScopeProtocol = 'openid-connect' | 'saml';\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "clientscopeinputdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "ClientScopeInputData"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The input data type for creating or updating a client scope."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "export type ClientScopeInputData = Omit<ClientScopeRepresentationExt, 'name | id'>;\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "clientscoperepresentationext",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "ClientScopeRepresentationExt"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "An extended representation of the client scope."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "export interface ClientScopeRepresentationExt extends ClientScopeRepresentation {\n  type?: ClientScopeType;\n  protocol?: ClientScopeProtocol;\n}\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "This API provides a comprehensive interface for managing Keycloak client scopes within a specific realm."
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



/***/ }),

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


/***/ })

}]);