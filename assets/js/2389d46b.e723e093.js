"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[931],{

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

/***/ 8771:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_api_user_storage_provider_mdx_238_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-api-user-storage-provider-mdx-238.json
const site_docs_api_user_storage_provider_mdx_238_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"api/user-storage-provider","title":"User Storage Provider API","description":"UserStorageProviderHandle wraps the operational endpoints for an existing user storage provider such as LDAP.","source":"@site/docs/api/user-storage-provider.mdx","sourceDirName":"api","slug":"/api/user-storage-provider","permalink":"/api/user-storage-provider","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":11,"frontMatter":{"sidebar_label":"User Storage Provider","sidebar_position":11},"sidebar":"api","previous":{"title":"Audience Protocol Mapper","permalink":"/api/protocol-mappers/audience-protocol-mapper"},"next":{"title":"Cache","permalink":"/api/cache"}}');
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.4/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(2615);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.14_react@19.2.4/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(416);
;// ./docs/api/user-storage-provider.mdx


const frontMatter = {
	sidebar_label: 'User Storage Provider',
	sidebar_position: 11
};
const contentTitle = 'User Storage Provider API';

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
  "value": "<code>getName()</code>",
  "id": "getname",
  "level": 3
}, {
  "value": "<code>removeImportedUsers()</code>",
  "id": "removeimportedusers",
  "level": 3
}, {
  "value": "<code>sync(action?)</code>",
  "id": "syncaction",
  "level": 3
}, {
  "value": "<code>unlinkUsers()</code>",
  "id": "unlinkusers",
  "level": 3
}, {
  "value": "<code>syncMappers(parentId, direction?)</code>",
  "id": "syncmappersparentid-direction",
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
        id: "user-storage-provider-api",
        children: "User Storage Provider API"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "UserStorageProviderHandle"
      }), " wraps the operational endpoints for an existing user storage provider such as LDAP."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "access",
      children: "Access"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const provider = realm.userStorageProvider('provider-id');\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "methods",
      children: "Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "getname",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "getName()"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Fetches the provider id/name pair and caches the name on the handle."
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "removeimportedusers",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "removeImportedUsers()"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Removes imported users for the provider."
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "syncaction",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "sync(action?)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Triggers a provider sync."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "await provider.sync('triggerFullSync');\nawait provider.sync('triggerChangedUsersSync');\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Supported actions:"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "triggerFullSync"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "triggerChangedUsersSync"
        })
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "unlinkusers",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "unlinkUsers()"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Unlinks imported users from the provider."
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "syncmappersparentid-direction",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "syncMappers(parentId, direction?)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Triggers mapper sync operations."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "await provider.syncMappers('mapper-parent-id', 'fedToKeycloak');\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Supported directions:"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "fedToKeycloak"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "keycloakToFed"
        })
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