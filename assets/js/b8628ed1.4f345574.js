"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([[161],{

/***/ 3118:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  A: () => (/* binding */ Tabs)
});

// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.3/node_modules/react/index.js
var react = __webpack_require__(7140);
// EXTERNAL MODULE: ./node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
var clsx = __webpack_require__(3526);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-common@3.9.2_@docusaurus+plugin-content-docs@3.9.2_@mdx-js+react@3.1._bf2353ac6f36851c10218cc0f54a2a94/node_modules/@docusaurus/theme-common/lib/utils/ThemeClassNames.js
var ThemeClassNames = __webpack_require__(406);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-common@3.9.2_@docusaurus+plugin-content-docs@3.9.2_@mdx-js+react@3.1._bf2353ac6f36851c10218cc0f54a2a94/node_modules/@docusaurus/theme-common/lib/utils/scrollUtils.js
var scrollUtils = __webpack_require__(8533);
// EXTERNAL MODULE: ./node_modules/.pnpm/react-router@5.3.4_react@19.2.3/node_modules/react-router/esm/react-router.js
var react_router = __webpack_require__(559);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+core@3.9.2_@mdx-js+react@3.1.1_@types+react@19.1.8_react@19.2.3__acorn@8.15_073d965244b4caa0aca1c65fb239aefe/node_modules/@docusaurus/core/lib/client/exports/useIsomorphicLayoutEffect.js
var useIsomorphicLayoutEffect = __webpack_require__(6182);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-common@3.9.2_@docusaurus+plugin-content-docs@3.9.2_@mdx-js+react@3.1._bf2353ac6f36851c10218cc0f54a2a94/node_modules/@docusaurus/theme-common/lib/utils/historyUtils.js
var historyUtils = __webpack_require__(2382);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-common@3.9.2_@docusaurus+plugin-content-docs@3.9.2_@mdx-js+react@3.1._bf2353ac6f36851c10218cc0f54a2a94/node_modules/@docusaurus/theme-common/lib/utils/jsUtils.js
var jsUtils = __webpack_require__(7103);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-common@3.9.2_@docusaurus+plugin-content-docs@3.9.2_@mdx-js+react@3.1._bf2353ac6f36851c10218cc0f54a2a94/node_modules/@docusaurus/theme-common/lib/utils/storageUtils.js + 1 modules
var storageUtils = __webpack_require__(4549);
;// ./node_modules/.pnpm/@docusaurus+theme-common@3.9.2_@docusaurus+plugin-content-docs@3.9.2_@mdx-js+react@3.1._bf2353ac6f36851c10218cc0f54a2a94/node_modules/@docusaurus/theme-common/lib/utils/tabsUtils.js
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
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+core@3.9.2_@mdx-js+react@3.1.1_@types+react@19.1.8_react@19.2.3__acorn@8.15_073d965244b4caa0aca1c65fb239aefe/node_modules/@docusaurus/core/lib/client/exports/useIsBrowser.js
var useIsBrowser = __webpack_require__(9406);
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/Tabs/styles.module.css
// extracted by mini-css-extract-plugin
/* harmony default export */ const styles_module = ({"tabList":"tabList_qiua","tabItem":"tabItem_KTkF"});
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.3/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(5656);
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/Tabs/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function TabList({className,block,selectedValue,selectValue,tabValues}){const tabRefs=[];const{blockElementScrollPositionUntilNextRender}=(0,scrollUtils/* useScrollPositionBlocker */.a_)();const handleTabChange=event=>{const newTab=event.currentTarget;const newTabIndex=tabRefs.indexOf(newTab);const newTabValue=tabValues[newTabIndex].value;if(newTabValue!==selectedValue){blockElementScrollPositionUntilNextRender(newTab);selectValue(newTabValue);}};const handleKeydown=event=>{let focusElement=null;switch(event.key){case'Enter':{handleTabChange(event);break;}case'ArrowRight':{const nextTab=tabRefs.indexOf(event.currentTarget)+1;focusElement=tabRefs[nextTab]??tabRefs[0];break;}case'ArrowLeft':{const prevTab=tabRefs.indexOf(event.currentTarget)-1;focusElement=tabRefs[prevTab]??tabRefs[tabRefs.length-1];break;}default:break;}focusElement?.focus();};return/*#__PURE__*/(0,jsx_runtime.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,clsx/* default */.A)('tabs',{'tabs--block':block},className),children:tabValues.map(({value,label,attributes})=>/*#__PURE__*/(0,jsx_runtime.jsx)("li",{// TODO extract TabListItem
role:"tab",tabIndex:selectedValue===value?0:-1,"aria-selected":selectedValue===value,ref:tabControl=>{tabRefs.push(tabControl);},onKeyDown:handleKeydown,onClick:handleTabChange,...attributes,className:(0,clsx/* default */.A)('tabs__item',styles_module.tabItem,attributes?.className,{'tabs__item--active':selectedValue===value}),children:label??value},value))});}function TabContent({lazy,children,selectedValue}){const childTabs=(Array.isArray(children)?children:[children]).filter(Boolean);if(lazy){const selectedTabItem=childTabs.find(tabItem=>tabItem.props.value===selectedValue);if(!selectedTabItem){// fail-safe or fail-fast? not sure what's best here
return null;}return/*#__PURE__*/(0,react.cloneElement)(selectedTabItem,{className:(0,clsx/* default */.A)('margin-top--md',selectedTabItem.props.className)});}return/*#__PURE__*/(0,jsx_runtime.jsx)("div",{className:"margin-top--md",children:childTabs.map((tabItem,i)=>/*#__PURE__*/(0,react.cloneElement)(tabItem,{key:i,hidden:tabItem.props.value!==selectedValue}))});}function TabsComponent(props){const tabs=useTabs(props);return/*#__PURE__*/(0,jsx_runtime.jsxs)("div",{className:(0,clsx/* default */.A)(ThemeClassNames/* ThemeClassNames */.G.tabs.container,// former name kept for backward compatibility
// see https://github.com/facebook/docusaurus/pull/4086
'tabs-container',styles_module.tabList),children:[/*#__PURE__*/(0,jsx_runtime.jsx)(TabList,{...tabs,...props}),/*#__PURE__*/(0,jsx_runtime.jsx)(TabContent,{...tabs,...props})]});}function Tabs(props){const isBrowser=(0,useIsBrowser/* default */.A)();return/*#__PURE__*/(0,jsx_runtime.jsx)(TabsComponent// Remount tabs after hydration
// Temporary fix for https://github.com/facebook/docusaurus/issues/5653
,{...props,children:sanitizeTabsChildren(props.children)},String(isBrowser));}

/***/ }),

/***/ 4195:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_example_general_mdx_b86_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-example-general-mdx-b86.json
const site_docs_example_general_mdx_b86_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"example/general","title":"General Example","description":"This example demonstrates a full end-to-end setup using keycloak-fluent. It shows how to authenticate against the master realm, create and configure a custom realm, and then provision common Keycloak resources such as users, roles, groups, clients, service accounts, and protocol mappers using a fluent, chainable API.","source":"@site/docs/example/general.mdx","sourceDirName":"example","slug":"/example/general","permalink":"/example/general","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":0,"frontMatter":{"sidebar_label":"General","sidebar_position":0},"sidebar":"example"}');
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.3/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(5656);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.1.8_react@19.2.3/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(4523);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/Tabs/index.js + 2 modules
var Tabs = __webpack_require__(3118);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/TabItem/index.js + 1 modules
var TabItem = __webpack_require__(8514);
// EXTERNAL MODULE: ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/CodeBlock/index.js + 27 modules
var CodeBlock = __webpack_require__(734);
;// ./node_modules/.pnpm/raw-loader@4.0.2_webpack@5.99.9/node_modules/raw-loader/dist/cjs.js!./.samples/general.ts
/* harmony default export */ const general = ("import KeycloakAdminClientFluent from '@egose/keycloak-fluent';\n\nconst kcMaster = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName: 'master' });\nawait kcMaster.simpleAuth({\n  username: 'admin',\n  password: 'password', // pragma: allowlist secret\n});\n\nconst realmName = 'my-custom-realm';\nconst realmDisplayName = 'My custom realm';\nconst realmAdminClientId = 'my-custom-realm-admin-sa';\nconst realmAdminClientSecret = 'my-custom-realm-admin-sa-password'; // pragma: allowlist secret\nconst realmAdminClientDescription = 'My realm admin service account';\nconst realmUserUsername = 'myuser';\nconst realmUserPassword = 'myuser-password'; // pragma: allowlist secret\nconst realmUserFirstName = 'Jone';\nconst realmUserLastName = 'Doe';\nconst realmRoleName = 'my-role';\nconst realmRoleDescription = 'My role';\nconst realmGroupName = 'my-group';\nconst realmGroupDescription = 'My group';\nconst realmChildGroupName = 'my-child-group';\nconst realmChildGroupDescription = 'My child group';\nconst clientId = 'my-client';\nconst clientDescription = 'My client';\nconst clientRoleName = 'my-client-role';\nconst clientRoleDescription = 'My client role';\nconst serviceAccountId = 'my-service-account';\nconst serviceAccountSecret = 'my-service-account-password'; // pragma: allowlist secret\nconst publicBrowserLoginClientId = 'my-public-browser-login-client';\nconst confidentialBrowserLoginClientId = 'my-confidential-browser-login-client';\nconst confidentialBrowserLoginClientSecret = 'my-confidential-browser-login-client-password'; // pragma: allowlist secret\nconst clientProtocolMapperName = 'my-client-mapper';\nconst clientAudienceMapperName = 'my-audience-mapper';\nconst clientHardcodedClaimMapperName = 'my-hardcoded-claim-mapper';\nconst clientUserAttributeMapperName = 'my-user-attribute-mapper';\n\nconst customRealm = await kcMaster.realm(realmName).ensure({ displayName: realmDisplayName });\nawait customRealm\n  .realmAdminServiceAccount(realmAdminClientId)\n  .ensure({ description: realmAdminClientDescription, secret: realmAdminClientSecret });\n\nconst kcCustom = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName });\nawait kcCustom.simpleAuth({\n  clientId: realmAdminClientId,\n  clientSecret: realmAdminClientSecret,\n});\n\nconst realmUser = await customRealm\n  .user(realmUserUsername)\n  .ensure({ firstName: realmUserFirstName, lastName: realmUserLastName, password: realmUserPassword });\n\nconst realmRole = await customRealm.role(realmRoleName).ensure({ description: realmRoleDescription });\nconst realmGroup = await customRealm.group(realmGroupName).ensure({ description: realmGroupDescription });\nconst realmChildGroup = await realmGroup\n  .childGroup(realmChildGroupName)\n  .ensure({ description: realmChildGroupDescription });\n\nawait realmUser.assignRole(realmRole);\nawait realmUser.assignGroup(realmGroup);\nawait realmUser.assignGroup(realmChildGroup);\n\nconst client = await customRealm.client(clientId).ensure({ description: clientDescription });\nconst clientRole = await client.role(clientRoleName).ensure({ description: clientRoleDescription });\nawait realmUser.assignClientRole(clientRole);\n\nconst serviceAccount = await customRealm.serviceAccount(serviceAccountId).ensure({ secret: serviceAccountSecret });\nconst publicBrowserLoginClient = await customRealm.publicBrowserLoginClient(publicBrowserLoginClientId).ensure({});\nconst confidentialBrowserLoginClient = await customRealm\n  .serviceAccount(confidentialBrowserLoginClientId)\n  .ensure({ secret: confidentialBrowserLoginClientSecret });\n\nawait serviceAccount.protocolMapper(clientProtocolMapperName).ensure({});\nawait publicBrowserLoginClient.audienceProtocolMapper(clientAudienceMapperName).ensure({ audience: 'myname' });\n\nawait confidentialBrowserLoginClient\n  .hardcodedClaimProtocolMapper(clientHardcodedClaimMapperName)\n  .ensure({ claimName: 'fruite', claimValue: 'apple' });\nawait confidentialBrowserLoginClient\n  .userAttributeProtocolMapper(clientUserAttributeMapperName)\n  .ensure({ claimName: 'myemail', userAttribute: 'email' });\n");
;// ./docs/example/general.mdx


const frontMatter = {
	sidebar_label: 'General',
	sidebar_position: 0
};
const contentTitle = 'General Example';

const assets = {

};







const toc = [];
function _createMdxContent(props) {
  const _components = {
    code: "code",
    h1: "h1",
    header: "header",
    hr: "hr",
    p: "p",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "general-example",
        children: "General Example"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["This example demonstrates a full end-to-end setup using ", (0,jsx_runtime.jsx)(_components.code, {
        children: "keycloak-fluent"
      }), ". It shows how to authenticate against the master realm, create and configure a custom realm, and then provision common Keycloak resources such as users, roles, groups, clients, service accounts, and protocol mappers using a fluent, chainable API."]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The snippet is intentionally comprehensive to illustrate how different building blocks fit together in a real-world scenario. In practice, you would typically split this logic across smaller scripts or services depending on your provisioning needs."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", "\n", (0,jsx_runtime.jsx)(CodeBlock/* default */.A, {
      language: "ts",
      children: general
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

/***/ 8514:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  A: () => (/* binding */ TabItem)
});

// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.3/node_modules/react/index.js
var react = __webpack_require__(7140);
// EXTERNAL MODULE: ./node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
var clsx = __webpack_require__(3526);
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/TabItem/styles.module.css
// extracted by mini-css-extract-plugin
/* harmony default export */ const styles_module = ({"tabItem":"tabItem_ew0P"});
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.3/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(5656);
;// ./node_modules/.pnpm/@docusaurus+theme-classic@3.9.2_@types+react@19.1.8_acorn@8.15.0_react-dom@19.2.3_react_0582eccb30d5b6cf32a5373fc031b748/node_modules/@docusaurus/theme-classic/lib/theme/TabItem/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function TabItem({children,hidden,className}){return/*#__PURE__*/(0,jsx_runtime.jsx)("div",{role:"tabpanel",className:(0,clsx/* default */.A)(styles_module.tabItem,className),hidden,children:children});}

/***/ })

}]);