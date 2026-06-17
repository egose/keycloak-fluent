"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([["6063"], {
4071(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  metadata: () => (/* reexport */ site_docs_about_quick_start_mdx_f1d_namespaceObject),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  contentTitle: () => (/* binding */ contentTitle),
  toc: () => (/* binding */ toc),
  assets: () => (/* binding */ assets)
});

;// CONCATENATED MODULE: ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-about-quick-start-mdx-f1d.json
var site_docs_about_quick_start_mdx_f1d_namespaceObject = JSON.parse('{"id":"about/quick-start","title":"Quick Start","description":"You can install the package using the npm package manager.","source":"@site/docs/about/quick-start.mdx","sourceDirName":"about","slug":"/about/quick-start","permalink":"/about/quick-start","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":1,"frontMatter":{"sidebar_label":"Quick Start","sidebar_position":1},"sidebar":"about","previous":{"title":"Philosophy","permalink":"/about/philosophy"}}')
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.7/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(1684);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.17_react@19.2.7/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(506);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.10.0_@docusaurus+faster@3.10.0_@docusaurus+types@3.10.0_@sw_6e61f7c9ea0438c3f9879c5b260e6fb1/node_modules/@docusaurus/theme-classic/lib/theme/Tabs/index.js + 1 modules
var Tabs = __webpack_require__(5075);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.10.0_@docusaurus+faster@3.10.0_@docusaurus+types@3.10.0_@sw_6e61f7c9ea0438c3f9879c5b260e6fb1/node_modules/@docusaurus/theme-classic/lib/theme/TabItem/index.js + 1 modules
var TabItem = __webpack_require__(5132);
;// CONCATENATED MODULE: ./docs/about/quick-start.mdx


const frontMatter = {
	sidebar_label: 'Quick Start',
	sidebar_position: 1
};
const contentTitle = 'Quick Start';

const assets = {

};





const toc = [{
  "value": "Installation",
  "id": "installation",
  "level": 2
}, {
  "value": "Usage",
  "id": "usage",
  "level": 2
}, {
  "value": "Configure Keycloak Connection",
  "id": "configure-keycloak-connection",
  "level": 3
}, {
  "value": "Resource Handlers",
  "id": "resource-handlers",
  "level": 3
}, {
  "value": "Beyond CRUD",
  "id": "beyond-crud",
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
    strong: "strong",
    ul: "ul",
    ...(0,lib/* .useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "quick-start",
        children: "Quick Start"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "You can install the package using the npm package manager."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "installation",
      children: "Installation"
    }), "\n", (0,jsx_runtime.jsxs)(Tabs/* ["default"] */.A, {
      groupId: "npm2yarn",
      children: [(0,jsx_runtime.jsx)(TabItem/* ["default"] */.A, {
        value: "npm",
        children: (0,jsx_runtime.jsx)(_components.pre, {
          children: (0,jsx_runtime.jsx)(_components.code, {
            className: "language-bash",
            children: "npm install @egose/keycloak-fluent --save\n"
          })
        })
      }), (0,jsx_runtime.jsx)(TabItem/* ["default"] */.A, {
        value: "yarn",
        label: "Yarn",
        children: (0,jsx_runtime.jsx)(_components.pre, {
          children: (0,jsx_runtime.jsx)(_components.code, {
            className: "language-bash",
            children: "yarn add @egose/keycloak-fluent\n"
          })
        })
      }), (0,jsx_runtime.jsx)(TabItem/* ["default"] */.A, {
        value: "pnpm",
        label: "pnpm",
        children: (0,jsx_runtime.jsx)(_components.pre, {
          children: (0,jsx_runtime.jsx)(_components.code, {
            className: "language-bash",
            children: "pnpm add @egose/keycloak-fluent\n"
          })
        })
      }), (0,jsx_runtime.jsx)(TabItem/* ["default"] */.A, {
        value: "bun",
        label: "Bun",
        children: (0,jsx_runtime.jsx)(_components.pre, {
          children: (0,jsx_runtime.jsx)(_components.code, {
            className: "language-bash",
            children: "bun add @egose/keycloak-fluent\n"
          })
        })
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "usage",
      children: "Usage"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "import KeycloakAdminClientFluent from '@egose/keycloak-fluent';\n\nconst kc = new KeycloakAdminClientFluent({\n  baseUrl: 'http://localhost:8080',\n  realmName: 'master',\n});\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "configure-keycloak-connection",
      children: "Configure Keycloak Connection"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["You can configure the Keycloak connection using either a ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "user account"
      }), " or a ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "service account"
      }), "."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Authenticate with a username and password"
        }), ":"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "await kc.simpleAuth({\n  username: 'admin',\n  password: 'admin', // pragma: allowlist secret\n  clientId: 'admin-cli',\n});\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Authenticate with a service account"
        }), ":"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "await kc.simpleAuth({\n  clientId: 'my-service-account',\n  clientSecret: 'my-secret', // pragma: allowlist secret\n});\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Authenticate with a refresh token"
        }), ":"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "await kc.simpleAuth({\n  clientId: 'admin-cli',\n  refreshToken: process.env.KEYCLOAK_REFRESH_TOKEN,\n});\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["If you need full control over the underlying Keycloak grant configuration, you can still call ", (0,jsx_runtime.jsx)(_components.code, {
        children: "kc.auth(...)"
      }), " directly."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "resource-handlers",
      children: "Resource Handlers"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["You can create resource handlers for Keycloak resources such as ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "realms"
      }), ", ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "users"
      }), ", ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "groups"
      }), ", ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "roles"
      }), ", ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "clients"
      }), ", ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "authentication flows"
      }), ", ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "organizations"
      }), ", and more."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["For resource-style handles, ", (0,jsx_runtime.jsx)(_components.code, {
        children: "ensure(...)"
      }), " will create the resource if it does not exist, or update the existing resource by merging the supplied fields into the current representation. It then returns the resource handle."]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const realm = await kc.realm('my-realm').ensure({\n  displayName: 'My Realm',\n});\n\nconst user = await realm.user('john.doe').ensure({\n  firstName: 'John',\n  lastName: 'Doe',\n  email: 'john.doe@example.com',\n});\n\nconst group = await realm.group('my-group').ensure({\n  description: 'My Group',\n});\n\nawait user.assignGroup(group);\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "beyond-crud",
      children: "Beyond CRUD"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The fluent API also exposes realm-scoped operational helpers that are covered by the current test suite:"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const flow = realm.authenticationFlow('browser-copy');\nawait flow.copy('browser-copy-v2');\n\nconst organization = await realm.organization('acme').ensure({ name: 'Acme Corp' });\nawait organization.addMember(user);\n\nawait realm.cache().clearUserCache();\nawait realm.attackDetection(user.user!.id!).clear();\n\nconst serverInfo = await kc.serverInfo().get();\nconst currentAdmin = await kc.whoAmI('master').get();\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["For the full surface area, start with the API reference pages for ", (0,jsx_runtime.jsx)(_components.code, {
        children: "KeycloakAdminClientFluent"
      }), ", ", (0,jsx_runtime.jsx)(_components.code, {
        children: "RealmHandle"
      }), ", ", (0,jsx_runtime.jsx)(_components.code, {
        children: "AuthenticationFlowHandle"
      }), ", ", (0,jsx_runtime.jsx)(_components.code, {
        children: "OrganizationHandle"
      }), ", and the realm system helpers."]
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