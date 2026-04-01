"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[697],{

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

/***/ 5412:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_api_authentication_flow_mdx_638_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-api-authentication-flow-mdx-638.json
const site_docs_api_authentication_flow_mdx_638_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"api/authentication-flow","title":"Authentication Flow API","description":"AuthenticationFlowHandle manages realm authentication flows and the lower-level execution and required-action helpers exposed by Keycloak.","source":"@site/docs/api/authentication-flow.mdx","sourceDirName":"api","slug":"/api/authentication-flow","permalink":"/api/authentication-flow","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":8,"frontMatter":{"sidebar_label":"Authentication Flow","sidebar_position":8},"sidebar":"api","previous":{"title":"Identity Provider","permalink":"/api/identity-provider"},"next":{"title":"Client","permalink":"/api/clients/client"}}');
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.4/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(2615);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.14_react@19.2.4/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(416);
;// ./docs/api/authentication-flow.mdx


const frontMatter = {
	sidebar_label: 'Authentication Flow',
	sidebar_position: 8
};
const contentTitle = 'Authentication Flow API';

const assets = {

};



const toc = [{
  "value": "Access",
  "id": "access",
  "level": 2
}, {
  "value": "Common Lifecycle",
  "id": "common-lifecycle",
  "level": 2
}, {
  "value": "Core Methods",
  "id": "core-methods",
  "level": 2
}, {
  "value": "<code>get()</code> and <code>getById(id)</code>",
  "id": "get-and-getbyidid",
  "level": 3
}, {
  "value": "<code>create(data)</code>, <code>update(data)</code>, <code>delete()</code>",
  "id": "createdata-updatedata-delete",
  "level": 3
}, {
  "value": "<code>ensure(data)</code> and <code>discard()</code>",
  "id": "ensuredata-and-discard",
  "level": 3
}, {
  "value": "<code>copy(newAlias)</code>",
  "id": "copynewalias",
  "level": 3
}, {
  "value": "Executions",
  "id": "executions",
  "level": 2
}, {
  "value": "Provider Discovery",
  "id": "provider-discovery",
  "level": 2
}, {
  "value": "Authenticator Config Helpers",
  "id": "authenticator-config-helpers",
  "level": 2
}, {
  "value": "Required Action Helpers",
  "id": "required-action-helpers",
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
        id: "authentication-flow-api",
        children: "Authentication Flow API"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "AuthenticationFlowHandle"
      }), " manages realm authentication flows and the lower-level execution and required-action helpers exposed by Keycloak."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "access",
      children: "Access"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const flow = realm.authenticationFlow('browser-copy');\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "common-lifecycle",
      children: "Common Lifecycle"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const flow = await realm.authenticationFlow('browser-copy').ensure({\n  description: 'Custom browser flow',\n  providerId: 'basic-flow',\n  topLevel: true,\n  builtIn: false,\n});\n\nawait flow.copy('browser-copy-v2');\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "core-methods",
      children: "Core Methods"
    }), "\n", (0,jsx_runtime.jsxs)(_components.h3, {
      id: "get-and-getbyidid",
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "get()"
      }), " and ", (0,jsx_runtime.jsx)(_components.code, {
        children: "getById(id)"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Resolve a flow by alias or internal id."
    }), "\n", (0,jsx_runtime.jsxs)(_components.h3, {
      id: "createdata-updatedata-delete",
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "create(data)"
      }), ", ", (0,jsx_runtime.jsx)(_components.code, {
        children: "update(data)"
      }), ", ", (0,jsx_runtime.jsx)(_components.code, {
        children: "delete()"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Standard CRUD operations for a named flow."
    }), "\n", (0,jsx_runtime.jsxs)(_components.h3, {
      id: "ensuredata-and-discard",
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "ensure(data)"
      }), " and ", (0,jsx_runtime.jsx)(_components.code, {
        children: "discard()"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "ensure"
      }), " creates or updates the flow and returns the handle. ", (0,jsx_runtime.jsx)(_components.code, {
        children: "discard"
      }), " removes it only when it already exists."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "copynewalias",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "copy(newAlias)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Copies the current flow and returns the copied flow representation."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "executions",
      children: "Executions"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The test suite exercises the execution helpers directly."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const executions = await realm.authenticationFlow('browser').listExecutions();\nawait flow.addExecution('auth-cookie');\nawait flow.updateExecution({ id: executions[0].id, requirement: 'REQUIRED' });\nawait flow.raiseExecutionPriority(executions[0].id!);\nawait flow.lowerExecutionPriority(executions[0].id!);\nawait flow.deleteExecution(executions[0].id!);\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Available helpers:"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "listExecutions()"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "addExecution(provider)"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "addSubFlow({ alias, type?, provider?, description? })"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "updateExecution(execution, { flowAlias? })"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "deleteExecution(id)"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "raiseExecutionPriority(id)"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "lowerExecutionPriority(id)"
        })
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "provider-discovery",
      children: "Provider Discovery"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "These methods expose the underlying provider metadata endpoints:"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "listClientAuthenticatorProviders()"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "listAuthenticatorProviders()"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "listFormActionProviders()"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "listFormProviders()"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "getConfigDescription(providerId)"
        })
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "authenticator-config-helpers",
      children: "Authenticator Config Helpers"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const config = await flow.createConfig({ alias: 'cookie-config', config: { foo: 'bar' } });\nawait flow.updateConfig({ ...config, config: { foo: 'baz' } });\nawait flow.deleteConfig(config.id!);\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Supported methods:"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "createConfig(data)"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "getConfig(id)"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "updateConfig(data)"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "deleteConfig(id)"
        })
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "required-action-helpers",
      children: "Required Action Helpers"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "AuthenticationFlowHandle"
      }), " also wraps required-action administration:"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "listRequiredActions()"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "getRequiredAction(alias)"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "updateRequiredAction(alias, data)"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "deleteRequiredAction(alias)"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "raiseRequiredActionPriority(alias)"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "lowerRequiredActionPriority(alias)"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "getRequiredActionConfigDescription(alias)"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "getRequiredActionConfig(alias)"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "updateRequiredActionConfig(alias, data)"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "removeRequiredActionConfig(alias)"
        })
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Use these when you need to configure flows and required actions from the same provisioning script."
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