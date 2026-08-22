"use strict";
(self["webpackChunkwebsite"] = self["webpackChunkwebsite"] || []).push([["8068"], {
9868(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  metadata: () => (/* reexport */ site_docs_api_user_mdx_ff6_namespaceObject),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  contentTitle: () => (/* binding */ contentTitle),
  toc: () => (/* binding */ toc),
  assets: () => (/* binding */ assets)
});

;// CONCATENATED MODULE: ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-api-user-mdx-ff6.json
var site_docs_api_user_mdx_ff6_namespaceObject = JSON.parse('{"id":"api/user","title":"User API","description":"The UserHandle class provides a fluent API for managing Keycloak users. It allows you to create, update, delete, and manage user roles, groups, and other attributes within a specific realm.","source":"@site/docs/api/user.mdx","sourceDirName":"api","slug":"/api/user","permalink":"/api/user","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":3,"frontMatter":{"sidebar_label":"User","sidebar_position":3},"sidebar":"api","previous":{"title":"Realm","permalink":"/api/realm"},"next":{"title":"Role","permalink":"/api/role"}}')
// EXTERNAL MODULE: ./node_modules/.pnpm/react@19.2.7/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(1684);
// EXTERNAL MODULE: ./node_modules/.pnpm/@mdx-js+react@3.1.1_@types+react@19.2.17_react@19.2.7/node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(506);
;// CONCATENATED MODULE: ./docs/api/user.mdx


const frontMatter = {
	sidebar_label: 'User',
	sidebar_position: 3
};
const contentTitle = 'User API';

const assets = {

};



const toc = [{
  "value": "Class: <code>UserHandle</code>",
  "id": "class-userhandle",
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
  "value": "<code>get()</code>",
  "id": "get",
  "level": 4
}, {
  "value": "<code>create(data: UserInputData)</code>",
  "id": "createdata-userinputdata",
  "level": 4
}, {
  "value": "Password provisioning failure semantics",
  "id": "password-provisioning-failure-semantics",
  "level": 5
}, {
  "value": "<code>update(data: UserInputData)</code>",
  "id": "updatedata-userinputdata",
  "level": 4
}, {
  "value": "Partial-success semantics",
  "id": "partial-success-semantics",
  "level": 5
}, {
  "value": "<code>delete()</code>",
  "id": "delete",
  "level": 4
}, {
  "value": "<code>ensure(data: UserInputData)</code>",
  "id": "ensuredata-userinputdata",
  "level": 4
}, {
  "value": "<code>discard()</code>",
  "id": "discard",
  "level": 4
}, {
  "value": "<code>assignRole(roleHandle: RoleHandle)</code>",
  "id": "assignrolerolehandle-rolehandle",
  "level": 4
}, {
  "value": "<code>unassignRole(roleHandle: RoleHandle)</code>",
  "id": "unassignrolerolehandle-rolehandle",
  "level": 4
}, {
  "value": "<code>assignClientRole(clientRoleHandle: ClientRoleHandle)</code>",
  "id": "assignclientroleclientrolehandle-clientrolehandle",
  "level": 4
}, {
  "value": "<code>unassignClientRole(clientRoleHandle: ClientRoleHandle)</code>",
  "id": "unassignclientroleclientrolehandle-clientrolehandle",
  "level": 4
}, {
  "value": "<code>listAssignedClientRoles(clientHandle: ClientHandle)</code>",
  "id": "listassignedclientrolesclienthandle-clienthandle",
  "level": 4
}, {
  "value": "<code>assignGroup(groupHandle: AbstractGroupHandle)</code>",
  "id": "assigngroupgrouphandle-abstractgrouphandle",
  "level": 4
}, {
  "value": "<code>unassignGroup(groupHandle: AbstractGroupHandle)</code>",
  "id": "unassigngroupgrouphandle-abstractgrouphandle",
  "level": 4
}, {
  "value": "<code>listAssignedGroups()</code>",
  "id": "listassignedgroups",
  "level": 4
}, {
  "value": "Constants",
  "id": "constants",
  "level": 3
}, {
  "value": "<code>defaultUserData</code>",
  "id": "defaultuserdata",
  "level": 4
}, {
  "value": "Types",
  "id": "types",
  "level": 3
}, {
  "value": "<code>UserInputData</code>",
  "id": "userinputdata",
  "level": 4
}, {
  "value": "<code>UserPasswordProvisioningError</code>",
  "id": "userpasswordprovisioningerror",
  "level": 4
}];
function _createMdxContent(props) {
  const _components = {
    code: "code",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    h5: "h5",
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
        id: "user-api",
        children: "User API"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["The ", (0,jsx_runtime.jsx)(_components.code, {
        children: "UserHandle"
      }), " class provides a fluent API for managing Keycloak users. It allows you to create, update, delete, and manage user roles, groups, and other attributes within a specific realm."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.h2, {
      id: "class-userhandle",
      children: ["Class: ", (0,jsx_runtime.jsx)(_components.code, {
        children: "UserHandle"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "constructor",
      children: "Constructor"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, username: string)\n"
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
              children: "realmHandle"
            }), ": A handle to the realm where the user resides."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "username"
            }), ": The username of the user to manage."]
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "instance-methods",
      children: "Instance Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "get",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "get()"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Fetches the user by their username."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async get(): Promise<UserRepresentation | null>\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Returns"
        }), ": The user representation or ", (0,jsx_runtime.jsx)(_components.code, {
          children: "null"
        }), " if the user does not exist."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "createdata-userinputdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "create(data: UserInputData)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Creates a new user."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async create(data: UserInputData)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "data"
            }), ": The data for the new user, including optional password."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Throws"
        }), ": An error if the user already exists."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "password-provisioning-failure-semantics",
      children: "Password provisioning failure semantics"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["When ", (0,jsx_runtime.jsx)(_components.code, {
        children: "data.password"
      }), " is provided, the user is created with ", (0,jsx_runtime.jsx)(_components.code, {
        children: "enabled: false"
      }), "\nfirst, the password is reset against the disabled account, and only then is\nthe user enabled (unless ", (0,jsx_runtime.jsx)(_components.code, {
        children: "data.enabled"
      }), " is explicitly ", (0,jsx_runtime.jsx)(_components.code, {
        children: "false"
      }), ", in which case\nthe account stays disabled after a successful password setup). This means a\npassword-reset failure can never leave an enabled, usable account."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["On a password failure during creation, the just-created disabled user is\ndeleted best-effort so retrying starts clean. If the deletion also fails, the\ndisabled account is left behind (it is unusable) and the original password\nerror is rethrown as a ", (0,jsx_runtime.jsx)(_components.code, {
        children: "UserPasswordProvisioningError"
      }), " with the cleanup\nfailure annotated on ", (0,jsx_runtime.jsx)(_components.code, {
        children: "cause"
      }), ". The plaintext password is never included in the\nerror, its ", (0,jsx_runtime.jsx)(_components.code, {
        children: "cause"
      }), ", or any serialized form."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "updatedata-userinputdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "update(data: UserInputData)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Updates the user's details."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async update(data: UserInputData)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "data"
            }), ": The updated data for the user, including optional password."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Throws"
        }), ": An error if the user does not exist."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "partial-success-semantics",
      children: "Partial-success semantics"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["If a ", (0,jsx_runtime.jsx)(_components.code, {
        children: "password"
      }), " is supplied, the profile update is applied first and the\npassword reset runs second. A password-reset failure does ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "not"
      }), " roll back\nthe preceding profile update (it has already been committed in Keycloak).\nInstead a ", (0,jsx_runtime.jsx)(_components.code, {
        children: "UserPasswordProvisioningError"
      }), " is thrown with ", (0,jsx_runtime.jsx)(_components.code, {
        children: "profileApplied: true"
      }), "\nand ", (0,jsx_runtime.jsx)(_components.code, {
        children: "initialProvisioning: false"
      }), "; the caller can retry the password step\nexplicitly or otherwise remediate. The plaintext password is never included in\nthe error or its ", (0,jsx_runtime.jsx)(_components.code, {
        children: "cause"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "delete",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "delete()"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Deletes the user."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async delete()\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Throws"
        }), ": An error if the user does not exist."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "ensuredata-userinputdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "ensure(data: UserInputData)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Ensures the user exists. If they do, updates them; otherwise, creates them."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async ensure(data: UserInputData)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "data"
            }), ": The data for the user, including optional password."]
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["On the create branch, ", (0,jsx_runtime.jsx)(_components.code, {
        children: "ensure"
      }), " uses the same disabled-until-password-success\nsemantics as ", (0,jsx_runtime.jsx)(_components.code, {
        children: "create"
      }), ". On the update branch, it uses the same partial-success\nsemantics as ", (0,jsx_runtime.jsx)(_components.code, {
        children: "update"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "discard",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "discard()"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Deletes the user if they exist."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async discard()\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Returns"
        }), ": The username of the deleted user."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "assignrolerolehandle-rolehandle",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "assignRole(roleHandle: RoleHandle)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Assigns a realm role to the user."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async assignRole(roleHandle: RoleHandle)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "roleHandle"
            }), ": A handle to the realm role to assign."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Throws"
        }), ": An error if the role does not exist."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "unassignrolerolehandle-rolehandle",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "unassignRole(roleHandle: RoleHandle)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Unassigns a realm role from the user."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async unassignRole(roleHandle: RoleHandle)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "roleHandle"
            }), ": A handle to the realm role to unassign."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Throws"
        }), ": An error if the role does not exist."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "assignclientroleclientrolehandle-clientrolehandle",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "assignClientRole(clientRoleHandle: ClientRoleHandle)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Assigns a client role to the user."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async assignClientRole(clientRoleHandle: ClientRoleHandle)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "clientRoleHandle"
            }), ": A handle to the client role to assign."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Throws"
        }), ": An error if the client or role does not exist."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "unassignclientroleclientrolehandle-clientrolehandle",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "unassignClientRole(clientRoleHandle: ClientRoleHandle)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Unassigns a client role from the user."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async unassignClientRole(clientRoleHandle: ClientRoleHandle)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "clientRoleHandle"
            }), ": A handle to the client role to unassign."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Throws"
        }), ": An error if the client or role does not exist."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "listassignedclientrolesclienthandle-clienthandle",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "listAssignedClientRoles(clientHandle: ClientHandle)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Lists all client roles assigned to the user for a specific client."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async listAssignedClientRoles(clientHandle: ClientHandle)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "clientHandle"
            }), ": A handle to the client."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Returns"
        }), ": A list of assigned client roles."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "assigngroupgrouphandle-abstractgrouphandle",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "assignGroup(groupHandle: AbstractGroupHandle)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Assigns the user to a group."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async assignGroup(groupHandle: AbstractGroupHandle)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "groupHandle"
            }), ": A handle to the group to assign."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Throws"
        }), ": An error if the group does not exist."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "unassigngroupgrouphandle-abstractgrouphandle",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "unassignGroup(groupHandle: AbstractGroupHandle)"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Removes the user from a group."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async unassignGroup(groupHandle: AbstractGroupHandle)\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Parameters"
        }), ":", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "groupHandle"
            }), ": A handle to the group to unassign."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Throws"
        }), ": An error if the group does not exist."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "listassignedgroups",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "listAssignedGroups()"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Lists all groups the user is assigned to."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "public async listAssignedGroups()\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Returns"
        }), ": A list of assigned groups."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "constants",
      children: "Constants"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "defaultuserdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "defaultUserData"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Default data for creating a user."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "export const defaultUserData = Object.freeze({\n  firstName: '',\n  lastName: '',\n  email: '',\n  emailVerified: false,\n  enabled: true,\n  totp: false,\n  disableableCredentialTypes: [],\n  requiredActions: [],\n  notBefore: 0,\n  access: {\n    manageGroupMembership: true,\n    resetPassword: true,\n    view: true,\n    mapRoles: true,\n    impersonate: true,\n    manage: true,\n  },\n  attributes: {},\n});\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "types",
      children: "Types"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "userinputdata",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "UserInputData"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The input data type for creating or updating a user."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "export type UserInputData = Omit<UserRepresentation, 'username' | 'id'> & {\n  password?: string;\n};\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "userpasswordprovisioningerror",
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "UserPasswordProvisioningError"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Error thrown when password setup fails after user profile data has been\napplied. The plaintext password is never present in any field of this error\nor its ", (0,jsx_runtime.jsx)(_components.code, {
        children: "cause"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "export class UserPasswordProvisioningError extends Error {\n  readonly username: string;\n  readonly realmName: string;\n  /** true when the preceding profile update/disabled user persists in Keycloak. */\n  readonly profileApplied: boolean;\n  /** true for the create/ensure-create path; false for updates of an existing user. */\n  readonly initialProvisioning: boolean;\n}\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["On the ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "create / ensure-create"
        }), " path, a password failure triggers a\nbest-effort deletion of the just-created disabled user. When that deletion\nsucceeds, ", (0,jsx_runtime.jsx)(_components.code, {
          children: "profileApplied"
        }), " is ", (0,jsx_runtime.jsx)(_components.code, {
          children: "false"
        }), " (no account left behind). When the\ndeletion also fails, ", (0,jsx_runtime.jsx)(_components.code, {
          children: "profileApplied"
        }), " stays ", (0,jsx_runtime.jsx)(_components.code, {
          children: "false"
        }), " and the disabled,\nunusable account is left in Keycloak; the cleanup failure is annotated on\nthe password error's ", (0,jsx_runtime.jsx)(_components.code, {
          children: "cause"
        }), "."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["On the ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "update"
        }), " path, the profile update has already committed and is not\nrolled back. ", (0,jsx_runtime.jsx)(_components.code, {
          children: "profileApplied"
        }), " is ", (0,jsx_runtime.jsx)(_components.code, {
          children: "true"
        }), " and ", (0,jsx_runtime.jsx)(_components.code, {
          children: "initialProvisioning"
        }), " is ", (0,jsx_runtime.jsx)(_components.code, {
          children: "false"
        }), "."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "This API provides a comprehensive interface for managing Keycloak users and their associated roles, groups, and attributes."
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