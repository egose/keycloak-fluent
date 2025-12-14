"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[553],{

/***/ 4119:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_api_groups_child_group_mdx_037_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-api-groups-child-group-mdx-037.json
const site_docs_api_groups_child_group_mdx_037_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"api/groups/child-group","title":"Child Group API","description":"The ChildGroupHandle class provides a fluent API for managing child groups in Keycloak. It allows you to create, update, delete, and retrieve child groups within a specific parent group.","source":"@site/docs/api/groups/child-group.mdx","sourceDirName":"api/groups","slug":"/api/groups/child-group","permalink":"/api/groups/child-group","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":1,"frontMatter":{"sidebar_label":"Child Group","sidebar_position":1},"sidebar":"api","previous":{"title":"Group","permalink":"/api/groups/group"},"next":{"title":"Nested Child Group","permalink":"/api/groups/nested-child-group"}}');
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.3/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(5656);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.1.8_react@19.2.3/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(4523);
;// ./docs/api/groups/child-group.mdx


const frontMatter = {
	sidebar_label: 'Child Group',
	sidebar_position: 1
};
const contentTitle = 'Child Group API';

const assets = {

};



const toc = [{
  "value": "Class: <code>ChildGroupHandle</code>",
  "id": "class-childgrouphandle",
  "level": 2
}, {
  "value": "Constructor",
  "id": "constructor",
  "level": 3
}, {
  "value": "Static Methods",
  "id": "static-methods",
  "level": 3
}, {
  "value": "<code>getByName(core: KeycloakAdminClient, realm: string, parentGroupName: string, groupName: string)</code>",
  "id": "getbynamecore-keycloakadminclient-realm-string-parentgroupname-string-groupname-string",
  "level": 4
}, {
  "value": "Instance Methods",
  "id": "instance-methods",
  "level": 3
}, {
  "value": "<code>get()</code>",
  "id": "get",
  "level": 4
}, {
  "value": "<code>create(data: ChildGroupInputData)</code>",
  "id": "createdata-childgroupinputdata",
  "level": 4
}, {
  "value": "<code>update(data: ChildGroupInputData)</code>",
  "id": "updatedata-childgroupinputdata",
  "level": 4
}, {
  "value": "<code>delete()</code>",
  "id": "delete",
  "level": 4
}, {
  "value": "<code>ensure(data: ChildGroupInputData)</code>",
  "id": "ensuredata-childgroupinputdata",
  "level": 4
}, {
  "value": "<code>discard()</code>",
  "id": "discard",
  "level": 4
}, {
  "value": "<code>childGroup(groupName: string)</code>",
  "id": "childgroupgroupname-string",
  "level": 4
}, {
  "value": "Types",
  "id": "types",
  "level": 3
}, {
  "value": "<code>ChildGroupInputData</code>",
  "id": "childgroupinputdata",
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
        id: "child-group-api",
        children: "Child Group API"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["The ", (0,jsx_runtime.jsx)(_components.code, {
        children: "ChildGroupHandle"
      }), " class provides a fluent API for managing child groups in Keycloak. It allows you to create, update, delete, and retrieve child groups within a specific parent group."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.h2, {
      id: "class-childgrouphandle",
      children: ["Class: ", (0,jsx_runtime.jsx)(_components.code, {
        children: "ChildGroupHandle"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "constructor",
      children: "Constructor"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "constructor(core: KeycloakAdminClient, parentGroupHandle: GroupHandle, groupName: string)\n"
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
              children: "parentGroupHandle"
            }), ": A handle to the parent group where the child group resides."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "groupName"
            }), ": The name of the child group to manage."]
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "static-methods",
      children: "Static Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "getbynamecore-keycloakadminclient-realm-string-parentgroupname-string-groupname-string",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "getByName(core: KeycloakAdminClient, realm: string, parentGroupName: string, groupName: string)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Fetches a child group by its name under a specific parent group."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "static async getByName(core: KeycloakAdminClient, realm: string, parentGroupName: string, groupName: string)\n"
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
              children: "realm"
            }), ": The name of the realm."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "parentGroupName"
            }), ": The name of the parent group."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "groupName"
            }), ": The name of the child group."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Returns"
        }), ": The child group representation or ", (0,jsx_runtime.jsx)(_components.code, {
          children: "null"
        }), " if the child group does not exist."]
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
      children: ["Fetches the child group by its name and updates the instance's ", (0,jsx_runtime.jsx)(_components.code, {
        children: "group"
      }), " property."]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async get(): Promise<GroupRepresentation | null>\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Returns"
        }), ": The child group representation or ", (0,jsx_runtime.jsx)(_components.code, {
          children: "null"
        }), " if the child group does not exist."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "createdata-childgroupinputdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "create(data: ChildGroupInputData)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Creates a new child group under the parent group."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async create(data: ChildGroupInputData)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "data"
            }), ": The data for the new child group."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Throws"
        }), ": An error if the child group already exists or the parent group does not exist."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "updatedata-childgroupinputdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "update(data: ChildGroupInputData)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Updates the child group's details."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async update(data: ChildGroupInputData)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "data"
            }), ": The updated data for the child group."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Throws"
        }), ": An error if the child group or parent group does not exist."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "delete",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "delete()"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Deletes the child group."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async delete()\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Throws"
        }), ": An error if the child group does not exist."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "ensuredata-childgroupinputdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "ensure(data: ChildGroupInputData)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Ensures the child group exists. If it does, updates it; otherwise, creates it."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async ensure(data: ChildGroupInputData)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "data"
            }), ": The data for the child group."]
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "discard",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "discard()"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Deletes the child group if it exists."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async discard()\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Returns"
        }), ": The name of the deleted child group."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "childgroupgroupname-string",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "childGroup(groupName: string)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Returns a handle for managing a nested child group."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public childGroup(groupName: string)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "groupName"
            }), ": The name of the nested child group."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Returns"
        }), ": An instance of ", (0,jsx_runtime.jsx)(_components.code, {
          children: "NestedChildGroupHandle"
        }), "."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "types",
      children: "Types"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "childgroupinputdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "ChildGroupInputData"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The input data type for creating or updating a child group."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "export type ChildGroupInputData = Omit<GroupRepresentation, 'name | id'>;\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "This API provides a comprehensive interface for managing child groups within a specific parent group in Keycloak."
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