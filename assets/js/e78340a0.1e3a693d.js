"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[3523],{

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

/***/ 4805:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_api_who_am_i_mdx_e78_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-api-who-am-i-mdx-e78.json
const site_docs_api_who_am_i_mdx_e78_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"api/who-am-i","title":"Who Am I API","description":"WhoAmIHandle exposes Keycloak\'s admin who-am-i endpoint.","source":"@site/docs/api/who-am-i.mdx","sourceDirName":"api","slug":"/api/who-am-i","permalink":"/api/who-am-i","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":17,"frontMatter":{"sidebar_label":"Who Am I","sidebar_position":17},"sidebar":"api","previous":{"title":"Server Info","permalink":"/api/server-info"},"next":{"title":"Identity Provider Mapper","permalink":"/api/identity-provider-mapper"}}');
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.5/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(4934);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.14_react@19.2.5/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(1137);
;// ./docs/api/who-am-i.mdx


const frontMatter = {
	sidebar_label: 'Who Am I',
	sidebar_position: 17
};
const contentTitle = 'Who Am I API';

const assets = {

};



const toc = [{
  "value": "Access",
  "id": "access",
  "level": 2
}, {
  "value": "Usage",
  "id": "usage",
  "level": 2
}, {
  "value": "Constructor Semantics",
  "id": "constructor-semantics",
  "level": 2
}, {
  "value": "Methods",
  "id": "methods",
  "level": 2
}, {
  "value": "<code>get()</code>",
  "id": "get",
  "level": 3
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
        id: "who-am-i-api",
        children: "Who Am I API"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "WhoAmIHandle"
      }), " exposes Keycloak's admin ", (0,jsx_runtime.jsx)(_components.code, {
        children: "who-am-i"
      }), " endpoint."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "access",
      children: "Access"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const whoAmI = kc.whoAmI('master');\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "usage",
      children: "Usage"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const me = await kc.whoAmI('master').get();\nconst meInDemoRealm = await kc.whoAmI('master', 'demo').get();\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "constructor-semantics",
      children: "Constructor Semantics"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "kc.whoAmI(currentRealm, realmName?)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "currentRealm"
        }), ": the realm the admin API request is executed against"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "realmName"
        }), ": optional target realm for the lookup"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "methods",
      children: "Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "get",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "get()"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Returns the ", (0,jsx_runtime.jsx)(_components.code, {
        children: "WhoAmIRepresentation"
      }), " produced by Keycloak."]
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