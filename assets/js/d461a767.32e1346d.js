"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[65],{

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

/***/ 6340:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_fluent_api_protocol_mappers_audience_protocol_mapper_mdx_d46_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-fluent-api-protocol-mappers-audience-protocol-mapper-mdx-d46.json
const site_docs_fluent_api_protocol_mappers_audience_protocol_mapper_mdx_d46_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"fluent-api/protocol-mappers/audience-protocol-mapper","title":"Audience Protocol Mapper API","description":"The AudienceProtocolMapperHandle class extends the ProtocolMapperHandle class and provides a specialized API for managing audience protocol mappers in Keycloak. These mappers add audience claims to tokens issued by Keycloak.","source":"@site/docs/fluent-api/protocol-mappers/audience-protocol-mapper.mdx","sourceDirName":"fluent-api/protocol-mappers","slug":"/fluent-api/protocol-mappers/audience-protocol-mapper","permalink":"/fluent-api/protocol-mappers/audience-protocol-mapper","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":3,"frontMatter":{"sidebar_label":"Audience Protocol Mapper","sidebar_position":3},"sidebar":"fluentApi","previous":{"title":"Hardcoded Claim Protocol Mapper","permalink":"/fluent-api/protocol-mappers/hardcoded-claim-protocol-mapper"}}');
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.3/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(5656);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.1.8_react@19.2.3/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(4523);
;// ./docs/fluent-api/protocol-mappers/audience-protocol-mapper.mdx


const frontMatter = {
	sidebar_label: 'Audience Protocol Mapper',
	sidebar_position: 3
};
const contentTitle = 'Audience Protocol Mapper API';

const assets = {

};



const toc = [{
  "value": "Class: <code>AudienceProtocolMapperHandle</code>",
  "id": "class-audienceprotocolmapperhandle",
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
  "value": "<code>create(data: AudienceProtocolMapperInputData)</code>",
  "id": "createdata-audienceprotocolmapperinputdata",
  "level": 4
}, {
  "value": "<code>update(data: AudienceProtocolMapperInputData)</code>",
  "id": "updatedata-audienceprotocolmapperinputdata",
  "level": 4
}, {
  "value": "<code>ensure(data: AudienceProtocolMapperInputData)</code>",
  "id": "ensuredata-audienceprotocolmapperinputdata",
  "level": 4
}, {
  "value": "Types",
  "id": "types",
  "level": 3
}, {
  "value": "<code>AudienceProtocolMapperInputData</code>",
  "id": "audienceprotocolmapperinputdata",
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
        id: "audience-protocol-mapper-api",
        children: "Audience Protocol Mapper API"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["The ", (0,jsx_runtime.jsx)(_components.code, {
        children: "AudienceProtocolMapperHandle"
      }), " class extends the ", (0,jsx_runtime.jsx)(_components.code, {
        children: "ProtocolMapperHandle"
      }), " class and provides a specialized API for managing audience protocol mappers in Keycloak. These mappers add audience claims to tokens issued by Keycloak."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.h2, {
      id: "class-audienceprotocolmapperhandle",
      children: ["Class: ", (0,jsx_runtime.jsx)(_components.code, {
        children: "AudienceProtocolMapperHandle"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "constructor",
      children: "Constructor"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "constructor(core: KeycloakAdminClient, clientHandle: ClientHandle, mapperName: string)\n"
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
              children: "clientHandle"
            }), ": A handle to the client where the protocol mapper resides."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "mapperName"
            }), ": The name of the audience protocol mapper to manage."]
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "instance-methods",
      children: "Instance Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "createdata-audienceprotocolmapperinputdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "create(data: AudienceProtocolMapperInputData)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Creates a new audience protocol mapper."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async create(data: AudienceProtocolMapperInputData)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "data"
            }), ": The data for the new audience protocol mapper."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Throws"
        }), ": An error if the protocol mapper already exists."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "updatedata-audienceprotocolmapperinputdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "update(data: AudienceProtocolMapperInputData)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Updates the audience protocol mapper's details."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async update(data: AudienceProtocolMapperInputData)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "data"
            }), ": The updated data for the audience protocol mapper."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Throws"
        }), ": An error if the protocol mapper does not exist."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "ensuredata-audienceprotocolmapperinputdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "ensure(data: AudienceProtocolMapperInputData)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Ensures the audience protocol mapper exists. If it does, updates it; otherwise, creates it."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async ensure(data: AudienceProtocolMapperInputData)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "data"
            }), ": The data for the audience protocol mapper."]
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "types",
      children: "Types"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "audienceprotocolmapperinputdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "AudienceProtocolMapperInputData"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The input data type for creating or updating an audience protocol mapper."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "export interface AudienceProtocolMapperInputData extends ProtocolMapperInputData {\n  audience: string;\n}\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "This API provides a specialized interface for managing audience protocol mappers in Keycloak, ensuring they are configured with the appropriate defaults for adding audience claims to tokens."
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