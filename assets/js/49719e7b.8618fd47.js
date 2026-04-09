"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[8639],{

/***/ 1137:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   R: () => (/* binding */ useMDXComponents),
/* harmony export */   x: () => (/* binding */ MDXProvider)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2086);
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

/***/ 3859:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_api_attack_detection_mdx_497_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-api-attack-detection-mdx-497.json
const site_docs_api_attack_detection_mdx_497_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"api/attack-detection","title":"Attack Detection API","description":"AttackDetectionHandle wraps the realm-scoped brute-force and attack-detection endpoints.","source":"@site/docs/api/attack-detection.mdx","sourceDirName":"api","slug":"/api/attack-detection","permalink":"/api/attack-detection","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":13,"frontMatter":{"sidebar_label":"Attack Detection","sidebar_position":13},"sidebar":"api","previous":{"title":"Cache","permalink":"/api/cache"},"next":{"title":"Client Policies","permalink":"/api/client-policies"}}');
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.5/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(4934);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.14_react@19.2.5/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(1137);
;// ./docs/api/attack-detection.mdx


const frontMatter = {
	sidebar_label: 'Attack Detection',
	sidebar_position: 13
};
const contentTitle = 'Attack Detection API';

const assets = {

};



const toc = [{
  "value": "Access",
  "id": "access",
  "level": 2
}, {
  "value": "Methods",
  "id": "methods",
  "level": 2
}, {
  "value": "<code>forUser(userId)</code>",
  "id": "foruseruserid",
  "level": 3
}, {
  "value": "<code>get(userId?)</code>",
  "id": "getuserid",
  "level": 3
}, {
  "value": "<code>clear(userId?)</code>",
  "id": "clearuserid",
  "level": 3
}, {
  "value": "<code>clearAll()</code>",
  "id": "clearall",
  "level": 3
}, {
  "value": "Notes",
  "id": "notes",
  "level": 2
}];
function _createMdxContent(props) {
  const _components = {
    code: "code",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    header: "header",
    p: "p",
    pre: "pre",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "attack-detection-api",
        children: "Attack Detection API"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "AttackDetectionHandle"
      }), " wraps the realm-scoped brute-force and attack-detection endpoints."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "access",
      children: "Access"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const attackDetection = realm.attackDetection();\nconst userAttackDetection = realm.attackDetection('user-id');\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "methods",
      children: "Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "foruseruserid",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "forUser(userId)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Returns a new handle bound to a specific user id."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const userAttackDetection = realm.attackDetection().forUser('user-id');\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "getuserid",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "get(userId?)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Fetches attack-detection data for a user."
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "clearuserid",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "clear(userId?)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Clears attack-detection data for a user."
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "clearall",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "clearAll()"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Clears attack-detection data for the entire realm."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "notes",
      children: "Notes"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "get"
      }), " and ", (0,jsx_runtime.jsx)(_components.code, {
        children: "clear"
      }), " require a user id either when constructing the handle, through ", (0,jsx_runtime.jsx)(_components.code, {
        children: "forUser(...)"
      }), ", or as a direct method argument. If no user id is available, the handle throws an explicit error instead of issuing a bad request."]
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