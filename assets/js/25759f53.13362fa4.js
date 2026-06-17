"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([["1358"], {
950(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  metadata: () => (/* reexport */ site_docs_about_philosophy_mdx_257_namespaceObject),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  contentTitle: () => (/* binding */ contentTitle),
  toc: () => (/* binding */ toc),
  assets: () => (/* binding */ assets)
});

;// CONCATENATED MODULE: ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-about-philosophy-mdx-257.json
var site_docs_about_philosophy_mdx_257_namespaceObject = JSON.parse('{"id":"about/philosophy","title":"Philosophy","description":"keycloak-fluent is designed to make Keycloak administration in Node.js more expressive, discoverable, and chainable — without sacrificing the flexibility of the official @keycloak/keycloak-admin-client.","source":"@site/docs/about/philosophy.mdx","sourceDirName":"about","slug":"/about/philosophy","permalink":"/about/philosophy","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":0,"frontMatter":{"sidebar_label":"Philosophy","sidebar_position":0},"sidebar":"about","next":{"title":"Quick Start","permalink":"/about/quick-start"}}')
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.7/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(1684);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.17_react@19.2.7/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(506);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.10.0_@docusaurus+faster@3.10.0_@docusaurus+types@3.10.0_@sw_6e61f7c9ea0438c3f9879c5b260e6fb1/node_modules/@docusaurus/theme-classic/lib/theme/Tabs/index.js + 1 modules
var Tabs = __webpack_require__(5075);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.10.0_@docusaurus+faster@3.10.0_@docusaurus+types@3.10.0_@sw_6e61f7c9ea0438c3f9879c5b260e6fb1/node_modules/@docusaurus/theme-classic/lib/theme/TabItem/index.js + 1 modules
var TabItem = __webpack_require__(5132);
;// CONCATENATED MODULE: ./docs/about/philosophy.mdx


const frontMatter = {
	sidebar_label: 'Philosophy',
	sidebar_position: 0
};
const contentTitle = 'Philosophy';

const assets = {

};





const toc = [{
  "value": "Why?",
  "id": "why",
  "level": 2
}, {
  "value": "Core Ideas",
  "id": "core-ideas",
  "level": 2
}, {
  "value": "1. Fluent Interface",
  "id": "1-fluent-interface",
  "level": 3
}, {
  "value": "2. Resource-Centric Design",
  "id": "2-resource-centric-design",
  "level": 3
}, {
  "value": "3. Safe &amp; Declarative",
  "id": "3-safe--declarative",
  "level": 3
}, {
  "value": "4. Discoverability",
  "id": "4-discoverability",
  "level": 3
}, {
  "value": "5. Opinionated Defaults",
  "id": "5-opinionated-defaults",
  "level": 3
}, {
  "value": "Summary",
  "id": "summary",
  "level": 2
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    code: "code",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    header: "header",
    hr: "hr",
    li: "li",
    p: "p",
    pre: "pre",
    strong: "strong",
    ul: "ul",
    ...(0,lib/* .useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "philosophy",
        children: "Philosophy"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "keycloak-fluent"
      }), " is designed to make ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "Keycloak administration"
      }), " in Node.js more ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "expressive"
      }), ", ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "discoverable"
      }), ", and ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "chainable"
      }), " — without sacrificing the flexibility of the official ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://www.npmjs.com/package/@keycloak/keycloak-admin-client",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "@keycloak/keycloak-admin-client"
        })
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "why",
      children: "Why?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["The official Keycloak Admin Client is powerful, but it can feel ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "low-level"
      }), ":"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "You need to know exact method names and parameters."
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "There's minimal guidance on resource relationships."
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Repetitive boilerplate for realm, client, and user operations."
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "We wanted a wrapper that:"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Removes repetitive setup."
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["Encourages ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "fluent chaining"
        }), " of operations."]
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Feels natural to read and write — like sentences."
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Is easy to explore in an IDE with autocomplete."
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "core-ideas",
      children: "Core Ideas"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "1-fluent-interface",
      children: "1. Fluent Interface"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Instead of:"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "await adminClient.realms.create({ realm: 'demo', displayName: 'My Demo Realm', enabled: true });\nconst clients = await adminClient.clients.find({ realm: 'demo', clientId: 'frontend', search: true });\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "You can write:"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const realm = await kc.realm('demo').ensure({ displayName: 'My Demo Realm' });\nconst clients = await realm.searchClients('frontend');\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Each method returns a ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "handle"
      }), " for a specific resource (Realm, Client, User, etc.), so operations are naturally grouped."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "2-resource-centric-design",
      children: "2. Resource-Centric Design"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Keycloak's model revolves around ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "resources"
      }), ":"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Realm"
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Client"
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "User"
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Role"
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Group"
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Identity Provider"
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Service Account"
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "keycloak-fluent"
      }), " mirrors this model:"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "kc.realm('myrealm')"
        }), " → ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "RealmHandle"
        })]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: ".client('app-client')"
        }), " → ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "ClientHandle"
        })]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: ".user('alice')"
        }), " → ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "UserHandle"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["This makes it easy to navigate ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "from the root down to the exact entity"
      }), " you want to work with."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "3-safe--declarative",
      children: "3. Safe & Declarative"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Many operations have ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "ensure"
      }), " and ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "discard"
      }), " helpers:"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "ensure"
        }), " → Create or update as needed."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "discard"
        }), " → Delete if exists."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["This helps when writing ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "idempotent scripts"
      }), " for provisioning Keycloak environments."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "4-discoverability",
      children: "4. Discoverability"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Because each handle exposes only ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "relevant methods"
      }), ", you don't need to remember every API endpoint — just follow the chain:"]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "kc.realm('demo').user('bob').ensure({...});\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Your IDE will guide you via autocomplete."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "5-opinionated-defaults",
      children: "5. Opinionated Defaults"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "We provide sensible defaults:"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "enabled: true"
        }), " when creating realms."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["Pagination defaults (", (0,jsx_runtime.jsx)(_components.code, {
          children: "page = 1"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "pageSize = 100"
        }), ")."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "briefRepresentation: false"
        }), " for richer data."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "These can be overridden if needed."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "summary",
      children: "Summary"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "keycloak-fluent"
      }), " exists to make ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "Keycloak Admin APIs"
      }), ":"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Easier to use"
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "More readable"
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Less error-prone"
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "More fun to write"
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["It's a ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "developer experience layer"
      }), " on top of the official client — perfect for automation scripts, provisioning pipelines, and admin tooling."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsxs)(Tabs/* ["default"] */.A, {
      children: [(0,jsx_runtime.jsx)(TabItem/* ["default"] */.A, {
        value: "before",
        label: "Before (vanilla client)",
        children: (0,jsx_runtime.jsx)(_components.pre, {
          children: (0,jsx_runtime.jsx)(_components.code, {
            className: "language-ts",
            children: "const adminClient = new KeycloakAdminClient();\nawait adminClient.auth({ username, password, grantType: 'password' });\n\nconst realms = await adminClient.realms.find({});\nconst demoRealm = realms.find((realm) => realm.realm === 'demo');\nif (!demoRealm) {\n  await adminClient.realms.create({ realm: 'demo', displayName: 'My Demo Realm', enabled: true });\n} else {\n  await adminClient.realms.update({ realm: 'demo' }, { displayName: 'My Demo Realm', enabled: true });\n}\n\nconst groups = await adminClient.groups.find({ realm: 'demo', search: 'demo-group', exact: true });\nconst demoGroup = groups.find((group) => group.name === 'demo-group');\nif (!demoGroup) {\n  await adminClient.groups.create({ realm: 'demo', name: 'demo-group', description: 'My Demo Group' });\n} else {\n  await adminClient.groups.update({ realm: 'demo', id: demoGroup.id! }, { name: 'demo-group', description: 'My Demo Group' });\n}\n"
          })
        })
      }), (0,jsx_runtime.jsx)(TabItem/* ["default"] */.A, {
        value: "after",
        label: "After (fluent)",
        children: (0,jsx_runtime.jsx)(_components.pre, {
          children: (0,jsx_runtime.jsx)(_components.code, {
            className: "language-ts",
            children: "const fluentClient = new KeycloakAdminClientFluent();\nawait fluentClient.simpleAuth({ username, password });\n\nconst realm = await fluentClient.realm('demo').ensure({ displayName: 'My Demo Realm' });\nawait realm.group('demo-group').ensure({ description: 'My Demo Group' });\n"
          })
        })
      })]
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
5132(__unused_rspack_module, __webpack_exports__, __webpack_require__) {

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  A: () => (/* binding */ TabItem)
});

// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.7/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(1684);
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.7/node_modules/react/index.js
var react = __webpack_require__(2888);
// EXTERNAL MODULE: ./node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
var clsx = __webpack_require__(3526);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-common@3.10.0_@docusaurus+plugin-content-docs@3.10.0_@docusaurus+fast_b6b1e8fccc35a3b3c32cb915669b410a/node_modules/@docusaurus/theme-common/lib/utils/tabsUtils.js
var tabsUtils = __webpack_require__(3890);
;// CONCATENATED MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.10.0_@docusaurus+faster@3.10.0_@docusaurus+types@3.10.0_@sw_6e61f7c9ea0438c3f9879c5b260e6fb1/node_modules/@docusaurus/theme-classic/lib/theme/TabItem/styles.module.css
// extracted by css-extract-rspack-plugin
/* export default */ const styles_module = ({"tabItem":"tabItem_ieBj"});
;// CONCATENATED MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.10.0_@docusaurus+faster@3.10.0_@docusaurus+types@3.10.0_@sw_6e61f7c9ea0438c3f9879c5b260e6fb1/node_modules/@docusaurus/theme-classic/lib/theme/TabItem/index.js

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ 



function TabItemPanel({ children, className, hidden }) {
    return /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
        role: "tabpanel",
        className: (0,clsx/* ["default"] */.A)(styles_module.tabItem, className),
        hidden,
        children: children
    });
}
function TabItem({ children, className, value }) {
    const { selectedValue, lazy } = (0,tabsUtils/* .useTabs */.uc)();
    const isSelected = value === selectedValue;
    // TODO Docusaurus v4: use <Activity> ?
    if (!isSelected && lazy) {
        return null;
    }
    return /*#__PURE__*/ (0,jsx_runtime.jsx)(TabItemPanel, {
        className: className,
        hidden: !isSelected,
        children: children
    });
}


},
5075(__unused_rspack_module, __webpack_exports__, __webpack_require__) {

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  A: () => (/* binding */ Tabs)
});

// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.7/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(1684);
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.7/node_modules/react/index.js
var react = __webpack_require__(2888);
// EXTERNAL MODULE: ./node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
var clsx = __webpack_require__(3526);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-common@3.10.0_@docusaurus+plugin-content-docs@3.10.0_@docusaurus+fast_b6b1e8fccc35a3b3c32cb915669b410a/node_modules/@docusaurus/theme-common/lib/utils/ThemeClassNames.js
var ThemeClassNames = __webpack_require__(3750);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-common@3.10.0_@docusaurus+plugin-content-docs@3.10.0_@docusaurus+fast_b6b1e8fccc35a3b3c32cb915669b410a/node_modules/@docusaurus/theme-common/lib/utils/tabsUtils.js
var tabsUtils = __webpack_require__(3890);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-common@3.10.0_@docusaurus+plugin-content-docs@3.10.0_@docusaurus+fast_b6b1e8fccc35a3b3c32cb915669b410a/node_modules/@docusaurus/theme-common/lib/utils/scrollUtils.js
var scrollUtils = __webpack_require__(3253);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+core@3.10.0_@docusaurus+faster@3.10.0_@docusaurus+types@3.10.0_@swc+core@1._ee1b85a3074f92430e1779a05c296e16/node_modules/@docusaurus/core/lib/client/exports/useIsBrowser.js
var useIsBrowser = __webpack_require__(9729);
;// CONCATENATED MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.10.0_@docusaurus+faster@3.10.0_@docusaurus+types@3.10.0_@sw_6e61f7c9ea0438c3f9879c5b260e6fb1/node_modules/@docusaurus/theme-classic/lib/theme/Tabs/styles.module.css
// extracted by css-extract-rspack-plugin
/* export default */ const styles_module = ({"tabList":"tabList_nzkl","tabItem":"tabItem_tIeo"});
;// CONCATENATED MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.10.0_@docusaurus+faster@3.10.0_@docusaurus+types@3.10.0_@sw_6e61f7c9ea0438c3f9879c5b260e6fb1/node_modules/@docusaurus/theme-classic/lib/theme/Tabs/index.js

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ 





function TabList({ className }) {
    const { selectedValue, selectValue, tabValues, block } = (0,tabsUtils/* .useTabs */.uc)();
    const tabRefs = [];
    const { blockElementScrollPositionUntilNextRender } = (0,scrollUtils/* .useScrollPositionBlocker */.a_)();
    const handleTabChange = (event)=>{
        const newTab = event.currentTarget;
        const newTabIndex = tabRefs.indexOf(newTab);
        const newTabValue = tabValues[newTabIndex].value;
        if (newTabValue !== selectedValue) {
            blockElementScrollPositionUntilNextRender(newTab);
            selectValue(newTabValue);
        }
    };
    const handleKeydown = (event)=>{
        let focusElement = null;
        switch(event.key){
            case 'Enter':
                {
                    handleTabChange(event);
                    break;
                }
            case 'ArrowRight':
                {
                    const nextTab = tabRefs.indexOf(event.currentTarget) + 1;
                    focusElement = tabRefs[nextTab] ?? tabRefs[0];
                    break;
                }
            case 'ArrowLeft':
                {
                    const prevTab = tabRefs.indexOf(event.currentTarget) - 1;
                    focusElement = tabRefs[prevTab] ?? tabRefs[tabRefs.length - 1];
                    break;
                }
            default:
                break;
        }
        focusElement?.focus();
    };
    return /*#__PURE__*/ (0,jsx_runtime.jsx)("ul", {
        role: "tablist",
        "aria-orientation": "horizontal",
        className: (0,clsx/* ["default"] */.A)('tabs', {
            'tabs--block': block
        }, className),
        children: tabValues.map(({ value, label, attributes })=>/*#__PURE__*/ (0,jsx_runtime.jsx)("li", {
                // TODO extract TabListItem
                role: "tab",
                tabIndex: selectedValue === value ? 0 : -1,
                "aria-selected": selectedValue === value,
                ref: (ref)=>{
                    tabRefs.push(ref);
                },
                onKeyDown: handleKeydown,
                onClick: handleTabChange,
                ...attributes,
                className: (0,clsx/* ["default"] */.A)('tabs__item', styles_module.tabItem, attributes?.className, {
                    'tabs__item--active': selectedValue === value
                }),
                children: label ?? value
            }, value))
    });
}
function TabContent({ children }) {
    return /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
        className: "margin-top--md",
        children: children
    });
}
function TabsContainer({ className, children }) {
    return /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
        className: (0,clsx/* ["default"] */.A)(ThemeClassNames/* .ThemeClassNames.tabs.container */.G.tabs.container, // former name kept for backward compatibility
        // see https://github.com/facebook/docusaurus/pull/4086
        'tabs-container', styles_module.tabList),
        children: [
            /*#__PURE__*/ (0,jsx_runtime.jsx)(TabList, {
                // Surprising but historical
                // className is applied on TabList, not on TabsContainer
                className: className
            }),
            /*#__PURE__*/ (0,jsx_runtime.jsx)(TabContent, {
                children: children
            })
        ]
    });
}
function Tabs(props) {
    const isBrowser = (0,useIsBrowser/* ["default"] */.A)();
    const value = (0,tabsUtils/* .useTabsContextValue */.OC)(props);
    return /*#__PURE__*/ (0,jsx_runtime.jsx)(tabsUtils/* .TabsProvider */.O_, {
        value: value,
        children: /*#__PURE__*/ (0,jsx_runtime.jsx)(TabsContainer, {
            className: props.className,
            children: (0,tabsUtils/* .sanitizeTabsChildren */.vT)(props.children)
        })
    }, String(isBrowser));
}


},
3890(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.d(__webpack_exports__, {
  OC: () => (useTabsContextValue),
  O_: () => (TabsProvider),
  uc: () => (useTabs),
  vT: () => (sanitizeTabsChildren)
});
/* import */ var react_jsx_runtime__rspack_import_0 = __webpack_require__(1684);
/* import */ var react__rspack_import_1 = __webpack_require__(2888);
/* import */ var _docusaurus_router__rspack_import_4 = __webpack_require__(7387);
/* import */ var _docusaurus_useIsomorphicLayoutEffect__rspack_import_2 = __webpack_require__(1107);
/* import */ var _docusaurus_theme_common_internal__rspack_import_5 = __webpack_require__(3134);
/* import */ var _index__rspack_import_3 = __webpack_require__(2511);
/* import */ var _index__rspack_import_6 = __webpack_require__(2608);

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ 




function sanitizeTabsChildren(children) {
    return react__rspack_import_1.Children.toArray(children).filter((child)=>child !== '\n');
}
function extractChildrenTabValues(children) {
    // ✅ <TabItem value="red"/> => true
    // ✅ <CustomTabItem value="red"/> => true
    // ❌ <RedTabItem value="tab-value"/> => requires <Tabs values> prop
    function isTabItemWithValueProp(comp) {
        const { props } = comp;
        return !!props && typeof props === 'object' && 'value' in props;
    }
    const elements = react__rspack_import_1.Children.toArray(children).flatMap((child)=>{
        // Historical case, not sure when it happens, do we really need this?
        if (!child) {
            return [];
        }
        if (/*#__PURE__*/ (0,react__rspack_import_1.isValidElement)(child) && isTabItemWithValueProp(child)) {
            return [
                child
            ];
        }
        // child.type.name will give non-sensical values in prod because of
        // minification, but we assume it won't throw in prod.
        const badChildTypeName = // @ts-expect-error: guarding against unexpected cases
        typeof child.type === 'string' ? child.type : child.type.name;
        throw new Error(`Docusaurus error: Bad <Tabs> child <${badChildTypeName}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.
If you do not want to pass on a "value" prop to the direct children of <Tabs>, you can also pass an explicit <Tabs values={...}> prop.`);
    });
    return elements.map(({ props: { value, label, attributes, default: isDefault } })=>({
            value,
            label,
            attributes,
            default: isDefault
        }));
}
function ensureNoDuplicateValue(values) {
    const dup = (0,_index__rspack_import_3/* .duplicates */.XI)(values, (a, b)=>a.value === b.value);
    if (dup.length > 0) {
        throw new Error(`Docusaurus error: Duplicate values "${dup.map((a)=>`'${a.value}'`).join(', ')}" found in <Tabs>. Every value needs to be unique.`);
    }
}
function useTabValues(props) {
    const { values: valuesProp, children } = props;
    return (0,react__rspack_import_1.useMemo)(()=>{
        const values = valuesProp ?? extractChildrenTabValues(children);
        ensureNoDuplicateValue(values);
        return values;
    }, [
        valuesProp,
        children
    ]);
}
function isValidValue({ value, tabValues }) {
    return tabValues.some((a)=>a.value === value);
}
function getInitialStateValue({ defaultValue, tabValues }) {
    if (tabValues.length === 0) {
        throw new Error('Docusaurus error: the <Tabs> component requires at least one <TabItem> children component');
    }
    if (defaultValue) {
        // Warn user about passing incorrect defaultValue as prop.
        if (!isValidValue({
            value: defaultValue,
            tabValues
        })) {
            throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${defaultValue}" but none of its children has the corresponding value. Available values are: ${tabValues.map((a)=>a.value).join(', ')}. If you intend to show no default tab, use defaultValue={null} instead.`);
        }
        return defaultValue;
    }
    const defaultTabValue = tabValues.find((tabValue)=>tabValue.default) ?? tabValues[0];
    if (!defaultTabValue) {
        throw new Error('Unexpected error: 0 tabValues');
    }
    return defaultTabValue.value;
}
function getStorageKey(groupId) {
    if (!groupId) {
        return null;
    }
    return `docusaurus.tab.${groupId}`;
}
function getQueryStringKey({ queryString = false, groupId }) {
    if (typeof queryString === 'string') {
        return queryString;
    }
    if (queryString === false) {
        return null;
    }
    if (queryString === true && !groupId) {
        throw new Error(`Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".`);
    }
    return groupId ?? null;
}
function useTabQueryString({ queryString = false, groupId }) {
    const history = (0,_docusaurus_router__rspack_import_4/* .useHistory */.W6)();
    const key = getQueryStringKey({
        queryString,
        groupId
    });
    const value = (0,_docusaurus_theme_common_internal__rspack_import_5/* .useQueryStringValue */.aZ)(key);
    const setValue = (0,react__rspack_import_1.useCallback)((newValue)=>{
        if (!key) {
            return; // no-op
        }
        const searchParams = new URLSearchParams(history.location.search);
        searchParams.set(key, newValue);
        history.replace({
            ...history.location,
            search: searchParams.toString()
        });
    }, [
        key,
        history
    ]);
    return [
        value,
        setValue
    ];
}
function useTabStorage({ groupId }) {
    const key = getStorageKey(groupId);
    const [value, storageSlot] = (0,_index__rspack_import_6/* .useStorageSlot */.Dv)(key);
    const setValue = (0,react__rspack_import_1.useCallback)((newValue)=>{
        if (!key) {
            return; // no-op
        }
        storageSlot.set(newValue);
    }, [
        key,
        storageSlot
    ]);
    return [
        value,
        setValue
    ];
}
function useTabsContextValue(props) {
    const { defaultValue, queryString = false, groupId } = props;
    const tabValues = useTabValues(props);
    const [selectedValue, setSelectedValue] = (0,react__rspack_import_1.useState)(()=>getInitialStateValue({
            defaultValue,
            tabValues
        }));
    const [queryStringValue, setQueryString] = useTabQueryString({
        queryString,
        groupId
    });
    const [storageValue, setStorageValue] = useTabStorage({
        groupId
    });
    // We sync valid querystring/storage value to state on change + hydration
    const valueToSync = (()=>{
        const value = queryStringValue ?? storageValue;
        if (!isValidValue({
            value,
            tabValues
        })) {
            return null;
        }
        return value;
    })();
    // Sync in a layout/sync effect is important, for useScrollPositionBlocker
    // See https://github.com/facebook/docusaurus/issues/8625
    (0,_docusaurus_useIsomorphicLayoutEffect__rspack_import_2/* ["default"] */.A)(()=>{
        if (valueToSync) {
            setSelectedValue(valueToSync);
        }
    }, [
        valueToSync
    ]);
    const selectValue = (0,react__rspack_import_1.useCallback)((newValue)=>{
        if (!isValidValue({
            value: newValue,
            tabValues
        })) {
            throw new Error(`Can't select invalid tab value=${newValue}`);
        }
        setSelectedValue(newValue);
        setQueryString(newValue);
        setStorageValue(newValue);
    }, [
        setQueryString,
        setStorageValue,
        tabValues
    ]);
    return {
        selectedValue,
        selectValue,
        tabValues,
        lazy: props.lazy ?? false,
        block: props.block ?? false
    };
}
const TabsContext = /*#__PURE__*/ (0,react__rspack_import_1.createContext)(null);
function useTabs() {
    const contextValue = react__rspack_import_1.useContext(TabsContext);
    if (!contextValue) {
        throw new Error('useTabsContext() must be used within a Tabs component');
    }
    return contextValue;
}
function TabsProvider(props) {
    return /*#__PURE__*/ (0,react_jsx_runtime__rspack_import_0.jsx)(TabsContext.Provider, {
        value: props.value,
        children: props.children
    });
} //# sourceMappingURL=tabsUtils.js.map


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