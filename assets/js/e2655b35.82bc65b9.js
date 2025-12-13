"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[680],{

/***/ 305:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_fluent_api_philosophy_mdx_e26_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-fluent-api-philosophy-mdx-e26.json
const site_docs_fluent_api_philosophy_mdx_e26_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"fluent-api/philosophy","title":"Philosophy","description":"keycloak-fluent is designed to make Keycloak administration in Node.js more expressive, discoverable, and chainable — without sacrificing the flexibility of the official @keycloak/keycloak-admin-client.","source":"@site/docs/fluent-api/philosophy.mdx","sourceDirName":"fluent-api","slug":"/fluent-api/philosophy","permalink":"/fluent-api/philosophy","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":0,"frontMatter":{"sidebar_label":"Philosophy","sidebar_position":0},"sidebar":"fluentApi","next":{"title":"Quick Start","permalink":"/fluent-api/quick-start"}}');
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.3/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(5656);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.1.8_react@19.2.3/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(4523);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.8.1_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_9eedc41964577f96abca3b41bfd5bda1/node_modules/@docusaurus/theme-classic/lib/theme/Tabs/index.js + 2 modules
var Tabs = __webpack_require__(1869);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.8.1_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_9eedc41964577f96abca3b41bfd5bda1/node_modules/@docusaurus/theme-classic/lib/theme/TabItem/index.js + 1 modules
var TabItem = __webpack_require__(8056);
;// ./docs/fluent-api/philosophy.mdx


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
    ...(0,lib/* useMDXComponents */.R)(),
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
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsxs)(Tabs/* default */.A, {
      children: [(0,jsx_runtime.jsx)(TabItem/* default */.A, {
        value: "before",
        label: "Before (vanilla client)",
        children: (0,jsx_runtime.jsx)(_components.pre, {
          children: (0,jsx_runtime.jsx)(_components.code, {
            className: "language-ts",
            children: "const adminClient = new KeycloakAdminClient();\nawait adminClient.auth({ username, password, grantType: 'password' });\n\nconst realms = await adminClient.realms.find({});\nconst demoRealm = realms.find((realm) => realm.realm === 'demo');\nif (!demoRealm) {\n  await adminClient.realms.create({ realm: 'demo', displayName: 'My Demo Realm', enabled: true });\n} else {\n  await adminClient.realms.update({ realm: 'demo' }, { displayName: 'My Demo Realm', enabled: true });\n}\n\nconst groups = await adminClient.groups.find({ realm: 'demo', search: 'demo-group', exact: true });\nconst demoGroup = groups.find((group) => group.name === 'demo-group');\nif (!demoGroup) {\n  await adminClient.groups.create({ realm: 'demo', name: 'demo-group', description: 'My Demo Group' });\n} else {\n  await adminClient.groups.update({ realm: 'demo', id: demoGroup.id! }, { name: 'demo-group', description: 'My Demo Group' });\n}\n"
          })
        })
      }), (0,jsx_runtime.jsx)(TabItem/* default */.A, {
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

/***/ 1869:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  A: () => (/* binding */ Tabs)
});

// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.3/node_modules/react/index.js
var react = __webpack_require__(7140);
// EXTERNAL MODULE: ./node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
var clsx = __webpack_require__(3526);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-common@3.8.1_@docusaurus+plugin-content-docs@3.8.1_@mdx-js+react@3.1._19147e7e1825160570a1d374704d7507/node_modules/@docusaurus/theme-common/lib/utils/scrollUtils.js
var scrollUtils = __webpack_require__(9054);
// EXTERNAL MODULE: ./node_modules/.pnpm/react-router@5.3.4_react@19.2.3/node_modules/react-router/esm/react-router.js
var react_router = __webpack_require__(559);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+core@3.8.1_@mdx-js+react@3.1.1_@types+react@19.1.8_react@19.2.3__acorn@8.15_285592dfc005165e0b8bec70c0aafa79/node_modules/@docusaurus/core/lib/client/exports/useIsomorphicLayoutEffect.js
var useIsomorphicLayoutEffect = __webpack_require__(335);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-common@3.8.1_@docusaurus+plugin-content-docs@3.8.1_@mdx-js+react@3.1._19147e7e1825160570a1d374704d7507/node_modules/@docusaurus/theme-common/lib/utils/historyUtils.js
var historyUtils = __webpack_require__(2483);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-common@3.8.1_@docusaurus+plugin-content-docs@3.8.1_@mdx-js+react@3.1._19147e7e1825160570a1d374704d7507/node_modules/@docusaurus/theme-common/lib/utils/jsUtils.js
var jsUtils = __webpack_require__(8832);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-common@3.8.1_@docusaurus+plugin-content-docs@3.8.1_@mdx-js+react@3.1._19147e7e1825160570a1d374704d7507/node_modules/@docusaurus/theme-common/lib/utils/storageUtils.js + 1 modules
var storageUtils = __webpack_require__(1626);
;// ./node_modules/.pnpm/@docusaurus+theme-common@3.8.1_@docusaurus+plugin-content-docs@3.8.1_@mdx-js+react@3.1._19147e7e1825160570a1d374704d7507/node_modules/@docusaurus/theme-common/lib/utils/tabsUtils.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */// A very rough duck type, but good enough to guard against mistakes while
// allowing customization
function isTabItem(comp){const{props}=comp;return!!props&&typeof props==='object'&&'value'in props;}function sanitizeTabsChildren(children){return react.Children.toArray(children).filter(child=>child!=='\n').map(child=>{if(!child||/*#__PURE__*/(0,react.isValidElement)(child)&&isTabItem(child)){return child;}// child.type.name will give non-sensical values in prod because of
// minification, but we assume it won't throw in prod.
throw new Error(`Docusaurus error: Bad <Tabs> child <${// @ts-expect-error: guarding against unexpected cases
typeof child.type==='string'?child.type:child.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`);})?.filter(Boolean)??[];}function extractChildrenTabValues(children){return sanitizeTabsChildren(children).map(({props:{value,label,attributes,default:isDefault}})=>({value,label,attributes,default:isDefault}));}function ensureNoDuplicateValue(values){const dup=(0,jsUtils/* duplicates */.XI)(values,(a,b)=>a.value===b.value);if(dup.length>0){throw new Error(`Docusaurus error: Duplicate values "${dup.map(a=>a.value).join(', ')}" found in <Tabs>. Every value needs to be unique.`);}}function useTabValues(props){const{values:valuesProp,children}=props;return (0,react.useMemo)(()=>{const values=valuesProp??extractChildrenTabValues(children);ensureNoDuplicateValue(values);return values;},[valuesProp,children]);}function isValidValue({value,tabValues}){return tabValues.some(a=>a.value===value);}function getInitialStateValue({defaultValue,tabValues}){if(tabValues.length===0){throw new Error('Docusaurus error: the <Tabs> component requires at least one <TabItem> children component');}if(defaultValue){// Warn user about passing incorrect defaultValue as prop.
if(!isValidValue({value:defaultValue,tabValues})){throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${defaultValue}" but none of its children has the corresponding value. Available values are: ${tabValues.map(a=>a.value).join(', ')}. If you intend to show no default tab, use defaultValue={null} instead.`);}return defaultValue;}const defaultTabValue=tabValues.find(tabValue=>tabValue.default)??tabValues[0];if(!defaultTabValue){throw new Error('Unexpected error: 0 tabValues');}return defaultTabValue.value;}function getStorageKey(groupId){if(!groupId){return null;}return`docusaurus.tab.${groupId}`;}function getQueryStringKey({queryString=false,groupId}){if(typeof queryString==='string'){return queryString;}if(queryString===false){return null;}if(queryString===true&&!groupId){throw new Error(`Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".`);}return groupId??null;}function useTabQueryString({queryString=false,groupId}){const history=(0,react_router/* useHistory */.W6)();const key=getQueryStringKey({queryString,groupId});const value=(0,historyUtils/* useQueryStringValue */.aZ)(key);const setValue=(0,react.useCallback)(newValue=>{if(!key){return;// no-op
}const searchParams=new URLSearchParams(history.location.search);searchParams.set(key,newValue);history.replace({...history.location,search:searchParams.toString()});},[key,history]);return[value,setValue];}function useTabStorage({groupId}){const key=getStorageKey(groupId);const[value,storageSlot]=(0,storageUtils/* useStorageSlot */.Dv)(key);const setValue=(0,react.useCallback)(newValue=>{if(!key){return;// no-op
}storageSlot.set(newValue);},[key,storageSlot]);return[value,setValue];}function useTabs(props){const{defaultValue,queryString=false,groupId}=props;const tabValues=useTabValues(props);const[selectedValue,setSelectedValue]=(0,react.useState)(()=>getInitialStateValue({defaultValue,tabValues}));const[queryStringValue,setQueryString]=useTabQueryString({queryString,groupId});const[storageValue,setStorageValue]=useTabStorage({groupId});// We sync valid querystring/storage value to state on change + hydration
const valueToSync=(()=>{const value=queryStringValue??storageValue;if(!isValidValue({value,tabValues})){return null;}return value;})();// Sync in a layout/sync effect is important, for useScrollPositionBlocker
// See https://github.com/facebook/docusaurus/issues/8625
(0,useIsomorphicLayoutEffect/* default */.A)(()=>{if(valueToSync){setSelectedValue(valueToSync);}},[valueToSync]);const selectValue=(0,react.useCallback)(newValue=>{if(!isValidValue({value:newValue,tabValues})){throw new Error(`Can't select invalid tab value=${newValue}`);}setSelectedValue(newValue);setQueryString(newValue);setStorageValue(newValue);},[setQueryString,setStorageValue,tabValues]);return{selectedValue,selectValue,tabValues};}
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+core@3.8.1_@mdx-js+react@3.1.1_@types+react@19.1.8_react@19.2.3__acorn@8.15_285592dfc005165e0b8bec70c0aafa79/node_modules/@docusaurus/core/lib/client/exports/useIsBrowser.js
var useIsBrowser = __webpack_require__(4637);
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.8.1_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_9eedc41964577f96abca3b41bfd5bda1/node_modules/@docusaurus/theme-classic/lib/theme/Tabs/styles.module.css
// extracted by mini-css-extract-plugin
/* harmony default export */ const styles_module = ({"tabList":"tabList_HedG","tabItem":"tabItem_qvuh"});
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.3/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(5656);
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.8.1_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_9eedc41964577f96abca3b41bfd5bda1/node_modules/@docusaurus/theme-classic/lib/theme/Tabs/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function TabList({className,block,selectedValue,selectValue,tabValues}){const tabRefs=[];const{blockElementScrollPositionUntilNextRender}=(0,scrollUtils/* useScrollPositionBlocker */.a_)();const handleTabChange=event=>{const newTab=event.currentTarget;const newTabIndex=tabRefs.indexOf(newTab);const newTabValue=tabValues[newTabIndex].value;if(newTabValue!==selectedValue){blockElementScrollPositionUntilNextRender(newTab);selectValue(newTabValue);}};const handleKeydown=event=>{let focusElement=null;switch(event.key){case'Enter':{handleTabChange(event);break;}case'ArrowRight':{const nextTab=tabRefs.indexOf(event.currentTarget)+1;focusElement=tabRefs[nextTab]??tabRefs[0];break;}case'ArrowLeft':{const prevTab=tabRefs.indexOf(event.currentTarget)-1;focusElement=tabRefs[prevTab]??tabRefs[tabRefs.length-1];break;}default:break;}focusElement?.focus();};return/*#__PURE__*/(0,jsx_runtime.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,clsx/* default */.A)('tabs',{'tabs--block':block},className),children:tabValues.map(({value,label,attributes})=>/*#__PURE__*/(0,jsx_runtime.jsx)("li",{// TODO extract TabListItem
role:"tab",tabIndex:selectedValue===value?0:-1,"aria-selected":selectedValue===value,ref:tabControl=>{tabRefs.push(tabControl);},onKeyDown:handleKeydown,onClick:handleTabChange,...attributes,className:(0,clsx/* default */.A)('tabs__item',styles_module.tabItem,attributes?.className,{'tabs__item--active':selectedValue===value}),children:label??value},value))});}function TabContent({lazy,children,selectedValue}){const childTabs=(Array.isArray(children)?children:[children]).filter(Boolean);if(lazy){const selectedTabItem=childTabs.find(tabItem=>tabItem.props.value===selectedValue);if(!selectedTabItem){// fail-safe or fail-fast? not sure what's best here
return null;}return/*#__PURE__*/(0,react.cloneElement)(selectedTabItem,{className:(0,clsx/* default */.A)('margin-top--md',selectedTabItem.props.className)});}return/*#__PURE__*/(0,jsx_runtime.jsx)("div",{className:"margin-top--md",children:childTabs.map((tabItem,i)=>/*#__PURE__*/(0,react.cloneElement)(tabItem,{key:i,hidden:tabItem.props.value!==selectedValue}))});}function TabsComponent(props){const tabs=useTabs(props);return/*#__PURE__*/(0,jsx_runtime.jsxs)("div",{className:(0,clsx/* default */.A)('tabs-container',styles_module.tabList),children:[/*#__PURE__*/(0,jsx_runtime.jsx)(TabList,{...tabs,...props}),/*#__PURE__*/(0,jsx_runtime.jsx)(TabContent,{...tabs,...props})]});}function Tabs(props){const isBrowser=(0,useIsBrowser/* default */.A)();return/*#__PURE__*/(0,jsx_runtime.jsx)(TabsComponent// Remount tabs after hydration
// Temporary fix for https://github.com/facebook/docusaurus/issues/5653
,{...props,children:sanitizeTabsChildren(props.children)},String(isBrowser));}

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


/***/ }),

/***/ 8056:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  A: () => (/* binding */ TabItem)
});

// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.3/node_modules/react/index.js
var react = __webpack_require__(7140);
// EXTERNAL MODULE: ./node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
var clsx = __webpack_require__(3526);
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.8.1_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_9eedc41964577f96abca3b41bfd5bda1/node_modules/@docusaurus/theme-classic/lib/theme/TabItem/styles.module.css
// extracted by mini-css-extract-plugin
/* harmony default export */ const styles_module = ({"tabItem":"tabItem_jQva"});
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.3/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(5656);
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.8.1_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_9eedc41964577f96abca3b41bfd5bda1/node_modules/@docusaurus/theme-classic/lib/theme/TabItem/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function TabItem({children,hidden,className}){return/*#__PURE__*/(0,jsx_runtime.jsx)("div",{role:"tabpanel",className:(0,clsx/* default */.A)(styles_module.tabItem,className),hidden,children:children});}

/***/ })

}]);