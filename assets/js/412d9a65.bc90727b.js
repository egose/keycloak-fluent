"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[8442],{

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

/***/ 7687:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_api_organization_mdx_412_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-api-organization-mdx-412.json
const site_docs_api_organization_mdx_412_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"api/organization","title":"Organization API","description":"OrganizationHandle manages Keycloak organizations, their members, invitations, and linked identity providers.","source":"@site/docs/api/organization.mdx","sourceDirName":"api","slug":"/api/organization","permalink":"/api/organization","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":9,"frontMatter":{"sidebar_label":"Organization","sidebar_position":9},"sidebar":"api","previous":{"title":"Client Role","permalink":"/api/client-role"},"next":{"title":"Component","permalink":"/api/component"}}');
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.5/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(4934);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.14_react@19.2.5/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(1137);
;// ./docs/api/organization.mdx


const frontMatter = {
	sidebar_label: 'Organization',
	sidebar_position: 9
};
const contentTitle = 'Organization API';

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
  "value": "Alias Resolution",
  "id": "alias-resolution",
  "level": 2
}, {
  "value": "Membership",
  "id": "membership",
  "level": 2
}, {
  "value": "Invitations",
  "id": "invitations",
  "level": 2
}, {
  "value": "Linked Identity Providers",
  "id": "linked-identity-providers",
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
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "organization-api",
        children: "Organization API"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "OrganizationHandle"
      }), " manages Keycloak organizations, their members, invitations, and linked identity providers."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "access",
      children: "Access"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const organization = realm.organization('acme');\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "common-lifecycle",
      children: "Common Lifecycle"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const organization = await realm.organization('acme').ensure({\n  name: 'Acme Corp',\n});\n\nawait organization.addMember(realm.user('alice'));\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "core-methods",
      children: "Core Methods"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "get()"
        }), " and ", (0,jsx_runtime.jsx)(_components.code, {
          children: "getById(id)"
        })]
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "create(data)"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "update(data)"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "delete()"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ensure(data)"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "discard()"
        })
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Like the other fluent handles, ", (0,jsx_runtime.jsx)(_components.code, {
        children: "ensure"
      }), " creates or updates and returns the handle."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "alias-resolution",
      children: "Alias Resolution"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Organizations are looked up by alias. If multiple exact alias matches are returned by Keycloak, the handle throws an explicit ambiguity error instead of guessing."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "This matters when older test or seed data has already created duplicate aliases."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "membership",
      children: "Membership"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const members = await organization.listMembers({\n  page: 2,\n  pageSize: 25,\n  membershipType: 'managed',\n});\n\nawait organization.addMember(realm.user('alice'));\nawait organization.removeMember(realm.user('alice'));\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Supported methods:"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "listMembers({ page?, pageSize?, membershipType? })"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "addMember(userHandle)"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "removeMember(userHandle)"
        })
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "invitations",
      children: "Invitations"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["The organization endpoints expect ", (0,jsx_runtime.jsx)(_components.code, {
        children: "FormData"
      }), " payloads, so the fluent handle forwards them directly."]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const invite = new FormData();\ninvite.set('email', 'alice@example.com');\n\nawait organization.invite(invite);\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Supported methods:"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "invite(formData)"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "inviteExistingUser(formData)"
        })
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "linked-identity-providers",
      children: "Linked Identity Providers"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const google = realm.identityProvider('google');\n\nawait organization.linkIdentityProvider(google);\nawait organization.listIdentityProviders();\nawait organization.unlinkIdentityProvider(google);\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Supported methods:"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "listIdentityProviders()"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "linkIdentityProvider(identityProviderHandle)"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "unlinkIdentityProvider(identityProviderHandle)"
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