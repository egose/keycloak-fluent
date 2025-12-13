"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[553],{

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

/***/ 8124:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_fluent_api_clients_confidential_browser_login_client_mdx_6e5_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-fluent-api-clients-confidential-browser-login-client-mdx-6e5.json
const site_docs_fluent_api_clients_confidential_browser_login_client_mdx_6e5_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"fluent-api/clients/confidential-browser-login-client","title":"Confidential Browser Login Client API","description":"The ConfidentialBrowserLoginClientHandle class extends the ClientHandle class and provides a specialized API for managing confidential browser login clients in Keycloak. These clients are configured for confidential access and browser-based login flows.","source":"@site/docs/fluent-api/clients/confidential-browser-login-client.mdx","sourceDirName":"fluent-api/clients","slug":"/fluent-api/clients/confidential-browser-login-client","permalink":"/fluent-api/clients/confidential-browser-login-client","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":1,"frontMatter":{"sidebar_label":"Confidential Browser Login Client","sidebar_position":1},"sidebar":"fluentApi","previous":{"title":"Client","permalink":"/fluent-api/clients/client"},"next":{"title":"Public Browser Login Client","permalink":"/fluent-api/clients/public-browser-login-client"}}');
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.3/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(5656);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.1.8_react@19.2.3/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(4523);
;// ./docs/fluent-api/clients/confidential-browser-login-client.mdx


const frontMatter = {
	sidebar_label: 'Confidential Browser Login Client',
	sidebar_position: 1
};
const contentTitle = 'Confidential Browser Login Client API';

const assets = {

};



const toc = [{
  "value": "Class: <code>ConfidentialBrowserLoginClientHandle</code>",
  "id": "class-confidentialbrowserloginclienthandle",
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
  "value": "<code>create(data: ConfidentialBrowserLoginClientInputData)</code>",
  "id": "createdata-confidentialbrowserloginclientinputdata",
  "level": 4
}, {
  "value": "<code>update(data: ConfidentialBrowserLoginClientInputData)</code>",
  "id": "updatedata-confidentialbrowserloginclientinputdata",
  "level": 4
}, {
  "value": "<code>ensure(data: ConfidentialBrowserLoginClientInputData)</code>",
  "id": "ensuredata-confidentialbrowserloginclientinputdata",
  "level": 4
}, {
  "value": "Types",
  "id": "types",
  "level": 3
}, {
  "value": "<code>ConfidentialBrowserLoginClientInputData</code>",
  "id": "confidentialbrowserloginclientinputdata",
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
        id: "confidential-browser-login-client-api",
        children: "Confidential Browser Login Client API"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["The ", (0,jsx_runtime.jsx)(_components.code, {
        children: "ConfidentialBrowserLoginClientHandle"
      }), " class extends the ", (0,jsx_runtime.jsx)(_components.code, {
        children: "ClientHandle"
      }), " class and provides a specialized API for managing confidential browser login clients in Keycloak. These clients are configured for confidential access and browser-based login flows."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.h2, {
      id: "class-confidentialbrowserloginclienthandle",
      children: ["Class: ", (0,jsx_runtime.jsx)(_components.code, {
        children: "ConfidentialBrowserLoginClientHandle"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "constructor",
      children: "Constructor"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, clientId: string)\n"
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
            }), ": A handle to the realm where the client resides."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "clientId"
            }), ": The ID of the confidential browser login client to manage."]
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "instance-methods",
      children: "Instance Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "createdata-confidentialbrowserloginclientinputdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "create(data: ConfidentialBrowserLoginClientInputData)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Creates a new confidential browser login client."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async create(data: ConfidentialBrowserLoginClientInputData)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "data"
            }), ": The data for the new confidential browser login client."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Throws"
        }), ": An error if the client already exists."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "updatedata-confidentialbrowserloginclientinputdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "update(data: ConfidentialBrowserLoginClientInputData)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Updates the confidential browser login client's details."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async update(data: ConfidentialBrowserLoginClientInputData)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "data"
            }), ": The updated data for the confidential browser login client."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Throws"
        }), ": An error if the client does not exist."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "ensuredata-confidentialbrowserloginclientinputdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "ensure(data: ConfidentialBrowserLoginClientInputData)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Ensures the confidential browser login client exists. If it does, updates it; otherwise, creates it."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async ensure(data: ConfidentialBrowserLoginClientInputData)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "data"
            }), ": The data for the confidential browser login client."]
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "types",
      children: "Types"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "confidentialbrowserloginclientinputdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "ConfidentialBrowserLoginClientInputData"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The input data type for creating or updating a confidential browser login client."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "export type ConfidentialBrowserLoginClientInputData = Omit<\n  ClientInputData,\n  | 'protocol'\n  | 'publicClient'\n  | 'standardFlowEnabled'\n  | 'directAccessGrantsEnabled'\n  | 'implicitFlowEnabled'\n  | 'serviceAccountsEnabled'\n>;\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "This API provides a specialized interface for managing confidential browser login clients in Keycloak, ensuring they are configured with the appropriate defaults for secure and browser-based login flows."
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