"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([["1259"], {
3647(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  metadata: () => (/* reexport */ site_docs_api_workflow_mdx_5fb_namespaceObject),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  contentTitle: () => (/* binding */ contentTitle),
  toc: () => (/* binding */ toc),
  assets: () => (/* binding */ assets)
});

;// CONCATENATED MODULE: ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-api-workflow-mdx-5fb.json
var site_docs_api_workflow_mdx_5fb_namespaceObject = JSON.parse('{"id":"api/workflow","title":"Workflow API","description":"WorkflowHandle manages realm workflows. Workflows are server-side resources","source":"@site/docs/api/workflow.mdx","sourceDirName":"api","slug":"/api/workflow","permalink":"/api/workflow","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":15,"frontMatter":{"sidebar_label":"Workflow","sidebar_position":15},"sidebar":"api","previous":{"title":"Client Policies","permalink":"/api/client-policies"},"next":{"title":"Server Info","permalink":"/api/server-info"}}')
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.7/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(1684);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.17_react@19.2.7/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(506);
;// CONCATENATED MODULE: ./docs/api/workflow.mdx


const frontMatter = {
	sidebar_label: 'Workflow',
	sidebar_position: 15
};
const contentTitle = 'Workflow API';

const assets = {

};



const toc = [{
  "value": "Access",
  "id": "access",
  "level": 2
}, {
  "value": "Core Methods",
  "id": "core-methods",
  "level": 2
}, {
  "value": "Errors",
  "id": "errors",
  "level": 2
}, {
  "value": "Example",
  "id": "example",
  "level": 2
}, {
  "value": "Important Behavior",
  "id": "important-behavior",
  "level": 2
}];
function _createMdxContent(props) {
  const _components = {
    code: "code",
    h1: "h1",
    h2: "h2",
    header: "header",
    li: "li",
    p: "p",
    pre: "pre",
    ul: "ul",
    ...(0,lib/* .useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "workflow-api",
        children: "Workflow API"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "WorkflowHandle"
      }), " manages realm workflows. Workflows are server-side resources\nexposed at ", (0,jsx_runtime.jsx)(_components.code, {
        children: "/admin/realms/{realm}/workflows"
      }), "; this handle forwards server-side\nsearch and pagination parameters instead of loading every workflow into\nmemory."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "access",
      children: "Access"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const workflow = realm.workflow('approval');\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "core-methods",
      children: "Core Methods"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "get()"
        }), " — exact-name lookup via server-side ", (0,jsx_runtime.jsx)(_components.code, {
          children: "search"
        }), "+", (0,jsx_runtime.jsx)(_components.code, {
          children: "exact:true"
        }), ". Returns the\nsingle match, ", (0,jsx_runtime.jsx)(_components.code, {
          children: "null"
        }), " if none, and throws ", (0,jsx_runtime.jsx)(_components.code, {
          children: "DuplicateWorkflowNameError"
        }), " if more\nthan one workflow shares the exact name."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "getById(id)"
        }), " — direct lookup by internal workflow id via\n", (0,jsx_runtime.jsx)(_components.code, {
          children: "/admin/realms/{realm}/workflows/{id}"
        }), ". Returns ", (0,jsx_runtime.jsx)(_components.code, {
          children: "null"
        }), " if the id does not\nexist."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "create(data)"
        }), " / ", (0,jsx_runtime.jsx)(_components.code, {
          children: "update(data)"
        }), " / ", (0,jsx_runtime.jsx)(_components.code, {
          children: "delete()"
        }), " / ", (0,jsx_runtime.jsx)(_components.code, {
          children: "discard()"
        }), " / ", (0,jsx_runtime.jsx)(_components.code, {
          children: "ensure(data)"
        })]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "list({ page?, pageSize?, first?, max? })"
        }), " — a single server-side page\n(", (0,jsx_runtime.jsx)(_components.code, {
          children: "first"
        }), "/", (0,jsx_runtime.jsx)(_components.code, {
          children: "max"
        }), "). Does not slice the result; returns the page the server\nproduced."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "listAll({ pageSize?, first?, maxPages?, signal? })"
        }), " — iterates the full\ncollection via ", (0,jsx_runtime.jsx)(_components.code, {
          children: "fetchAll"
        }), ", advancing by the page length Keycloak returned.\nValidates ", (0,jsx_runtime.jsx)(_components.code, {
          children: "pageSize"
        }), "/", (0,jsx_runtime.jsx)(_components.code, {
          children: "first"
        }), "/", (0,jsx_runtime.jsx)(_components.code, {
          children: "maxPages"
        }), ", bounds the loop with\n", (0,jsx_runtime.jsx)(_components.code, {
          children: "RangeError"
        }), ", and supports an ", (0,jsx_runtime.jsx)(_components.code, {
          children: "AbortSignal"
        }), "."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "listAllStream({ pageSize?, first?, maxPages?, signal? })"
        }), " — async iterator\nyielding one workflow page at a time, with the same bounded-loop guarantees\nas ", (0,jsx_runtime.jsx)(_components.code, {
          children: "listAll"
        }), " plus reference-identity repeated-page protection."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "errors",
      children: "Errors"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "WorkflowNotFoundError"
        }), " — raised by ", (0,jsx_runtime.jsx)(_components.code, {
          children: "update"
        }), "/", (0,jsx_runtime.jsx)(_components.code, {
          children: "delete"
        }), "/", (0,jsx_runtime.jsx)(_components.code, {
          children: "discard"
        }), " (via\n", (0,jsx_runtime.jsx)(_components.code, {
          children: "requireWorkflow"
        }), ") when the named workflow cannot be resolved in the realm.\nCarries ", (0,jsx_runtime.jsx)(_components.code, {
          children: "realmName"
        }), " and ", (0,jsx_runtime.jsx)(_components.code, {
          children: "workflowName"
        }), " so callers can distinguish it from a\ntransient HTTP error without string-matching the message."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "DuplicateWorkflowNameError"
        }), " — raised by ", (0,jsx_runtime.jsx)(_components.code, {
          children: "get"
        }), " (and the static ", (0,jsx_runtime.jsx)(_components.code, {
          children: "getByName"
        }), ")\nwhen more than one workflow matches the exact name. The previous silent\n\"first match wins\" behavior could let a duplicate collision masquerade as a\nsuccessful single-workflow provision; this handle now fails loudly so\n", (0,jsx_runtime.jsx)(_components.code, {
          children: "ensure()"
        }), "/", (0,jsx_runtime.jsx)(_components.code, {
          children: "create()"
        }), " callers can react. Callers that intentionally want all\nmatches should use ", (0,jsx_runtime.jsx)(_components.code, {
          children: "list"
        }), "/", (0,jsx_runtime.jsx)(_components.code, {
          children: "listAll"
        }), "/", (0,jsx_runtime.jsx)(_components.code, {
          children: "listAllStream"
        }), "."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "example",
      children: "Example"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const workflow = await realm.workflow('approval').ensure({\n  enabled: true,\n});\n\nawait workflow.update({\n  enabled: false,\n});\n\n// Request only the second page (server-side pagination):\nconst pageTwo = await realm.workflow('approval').list({ page: 2, pageSize: 10 });\n\n// Iterate every workflow in the realm without buffering everything:\nfor await (const page of realm.workflow('approval').listAllStream({ pageSize: 100 })) {\n  for (const w of page) {\n    console.log(w.id, w.name);\n  }\n}\n\n// Or collect the full collection (validated, bounded, cancellable):\nconst all = await realm\n  .workflow('approval')\n  .listAll({ pageSize: 100, maxPages: 50, signal: controller.signal });\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "important-behavior",
      children: "Important Behavior"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "WorkflowHandle"
      }), " now follows the same lifecycle contract as the other mutable\nresource handles in this library."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "update(...)"
        }), " updates an existing workflow."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "ensure(...)"
        }), " creates the workflow if it does not exist, or updates it if it\nalready exists."]
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "The update path preserves unspecified fields by merging your partial input\ninto the current workflow representation before sending the admin update call."
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "get()"
        }), "/", (0,jsx_runtime.jsx)(_components.code, {
          children: "getById()"
        }), " cache the resolved representation on the handle; a second\ncall returns the cache without re-fetching. Use a fresh handle instance to\nforce a re-read."]
      }), "\n"]
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