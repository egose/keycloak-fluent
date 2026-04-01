import { useEffect, useState, type ReactNode } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

const highlights = [
  {
    title: 'Provision With Handles, Not Request Plumbing',
    description:
      'Start from a realm and move through users, groups, roles, clients, identity providers, organizations, workflows, and authentication flows with resource-scoped handles.',
  },
  {
    title: 'Idempotent Scripts By Default',
    description:
      'Use ensure and discard to write repeatable setup code for local environments, CI jobs, migrations, and tenant provisioning.',
  },
  {
    title: 'Operational Helpers Included',
    description:
      'The fluent layer also covers cache maintenance, attack detection, user storage provider sync, client policies, server info, and who-am-i lookups.',
  },
];

const resourceGroups = [
  {
    label: 'Core resources',
    items: ['realms', 'users', 'groups', 'roles', 'clients', 'client scopes'],
  },
  {
    label: 'Identity and login',
    items: ['identity providers', 'identity provider mappers', 'protocol mappers', 'service accounts'],
  },
  {
    label: 'Realm operations',
    items: ['authentication flows', 'organizations', 'workflows', 'components', 'events', 'sessions'],
  },
  {
    label: 'System helpers',
    items: ['cache', 'attack detection', 'client policies', 'server info', 'who am i'],
  },
];

const proofPoints = [
  'Built on top of the official Keycloak admin client',
  'Docs now reflect the current src and tests surface area',
  'Readable enough for one-off scripts, structured enough for production automation',
];

const codeSample = `import KeycloakAdminClientFluent from '@egose/keycloak-fluent';

const kc = new KeycloakAdminClientFluent({
  baseUrl: 'http://localhost:8080',
  realmName: 'master',
});

await kc.simpleAuth({
  username: 'admin',
  password: 'admin', // pragma: allowlist secret
});

const realm = await kc.realm('demo').ensure({
  displayName: 'Demo Realm',
});

const user = await realm.user('alice').ensure({
  email: 'alice@example.com',
  enabled: true,
});

await realm.organization('acme').ensure({ name: 'Acme Corp' });
await realm.authenticationFlow('browser-copy').copy('browser-copy-v2');
await realm.cache().clearUserCache();
await kc.whoAmI('master').get();`;

function Hero(): ReactNode {
  const { siteConfig } = useDocusaurusContext();

  return (
    <section className="relative overflow-hidden border-b border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.28),_transparent_28%),radial-gradient(circle_at_85%_15%,_rgba(249,115,22,0.16),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#0f172a_52%,_#111827_100%)]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(2,6,23,0.78)_0%,_rgba(2,6,23,0.52)_38%,_rgba(2,6,23,0.16)_72%,_rgba(2,6,23,0.2)_100%)]" />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
        <div className="relative max-w-3xl">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/42 p-8 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-md lg:p-10">
            <div className="inline-flex items-center rounded-full border border-blue-400/30 bg-blue-500/15 px-3 py-1 text-sm font-medium !text-blue-50 shadow-[0_0_0_1px_rgba(15,23,42,0.25)]">
              TypeScript wrapper for the Keycloak Admin API
            </div>
            <h1 className="mt-6 text-5xl font-black tracking-tight !text-white drop-shadow-[0_2px_18px_rgba(2,6,23,0.85)] sm:text-6xl">
              Provision Keycloak with code that reads like intent.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 !text-slate-100 drop-shadow-[0_1px_10px_rgba(2,6,23,0.7)]">
              {siteConfig.title} turns the official admin client into a fluent DSL for realms, users, clients,
              authentication flows, organizations, and operational endpoints. The docs now track the real API surface
              exercised in `src` and `tests`.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold !text-white no-underline shadow-[0_12px_30px_rgba(37,99,235,0.35)] transition hover:bg-blue-700"
                to="/about/quick-start/"
              >
                Open Quick Start
              </Link>
              <Link
                className="inline-flex items-center rounded-lg border border-slate-500 bg-slate-900/75 px-5 py-3 text-sm font-semibold !text-slate-100 no-underline transition hover:border-slate-400 hover:bg-slate-800"
                to="/api/keycloak-admin-client-fluent/"
              >
                Browse API Reference
              </Link>
              <Link
                className="inline-flex items-center rounded-lg border border-orange-400/40 bg-orange-500/12 px-5 py-3 text-sm font-semibold !text-orange-100 no-underline transition hover:bg-orange-500/20"
                to="/example/general/"
              >
                Browse Examples
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm !text-slate-300">
              <span>Realms, users, clients, and mappers</span>
              <span>Authentication flows and organizations</span>
              <span>Operational helpers for admin automation</span>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {proofPoints.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 text-sm !text-slate-100 shadow-sm backdrop-blur"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-500/20 via-transparent to-orange-400/20 blur-2xl" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-700/80 bg-slate-950 shadow-2xl shadow-blue-950/40">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <span>provision.ts</span>
            </div>
            <pre className="m-0 overflow-x-auto p-5 text-[13px] leading-7 text-slate-100">
              <code>{codeSample}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function Highlights({ isDarkTheme }: { isDarkTheme: boolean }): ReactNode {
  return (
    <section className="mx-auto max-w-7xl px-6 py-18 lg:px-8">
      <div className="max-w-2xl">
        <p
          className={`text-sm font-semibold uppercase tracking-[0.24em] ${isDarkTheme ? 'text-blue-300' : 'text-blue-700'}`}
        >
          Why teams use it
        </p>
        <h2
          className={`mt-3 text-3xl font-bold tracking-tight sm:text-4xl ${isDarkTheme ? 'text-slate-50' : 'text-slate-950'}`}
        >
          The official client, with a better working surface for automation.
        </h2>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {highlights.map((item, index) => (
          <article
            key={item.title}
            className={`rounded-3xl border p-7 shadow-sm ${
              isDarkTheme ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
            }`}
          >
            <div className={`text-sm font-semibold ${isDarkTheme ? 'text-orange-300' : 'text-orange-600'}`}>
              0{index + 1}
            </div>
            <h3 className={`mt-3 text-xl font-semibold ${isDarkTheme ? 'text-slate-50' : 'text-slate-950'}`}>
              {item.title}
            </h3>
            <p className={`mt-3 text-base leading-7 ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Coverage({ isDarkTheme }: { isDarkTheme: boolean }): ReactNode {
  return (
    <section
      className={`border-y ${isDarkTheme ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50/80'}`}
    >
      <div className="mx-auto max-w-7xl px-6 py-18 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p
              className={`text-sm font-semibold uppercase tracking-[0.24em] ${isDarkTheme ? 'text-blue-300' : 'text-blue-700'}`}
            >
              Current coverage
            </p>
            <h2
              className={`mt-3 text-3xl font-bold tracking-tight ${isDarkTheme ? 'text-slate-50' : 'text-slate-950'}`}
            >
              More than CRUD wrappers.
            </h2>
            <p className={`mt-4 max-w-xl text-base leading-7 ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
              The landing page and docs now line up with the actual codebase. That includes the resource handles people
              expect, plus the operational endpoints that usually force teams back into raw admin client calls.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {resourceGroups.map((group) => (
              <div
                key={group.label}
                className={`rounded-3xl border p-6 shadow-sm ${
                  isDarkTheme ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
                }`}
              >
                <h3
                  className={`text-sm font-semibold uppercase tracking-[0.2em] ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}
                >
                  {group.label}
                </h3>
                <ul className={`mt-4 space-y-2 text-sm leading-6 ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Pathways({ isDarkTheme }: { isDarkTheme: boolean }): ReactNode {
  return (
    <section className="mx-auto max-w-7xl px-6 py-18 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <Link
          className={`group rounded-3xl border p-7 no-underline shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
            isDarkTheme
              ? 'border-slate-800 bg-slate-900 hover:border-blue-700'
              : 'border-slate-200 bg-white hover:border-blue-300'
          }`}
          to="/about/quick-start/"
        >
          <div
            className={`text-sm font-semibold uppercase tracking-[0.2em] ${isDarkTheme ? 'text-blue-300' : 'text-blue-700'}`}
          >
            Start here
          </div>
          <h3 className={`mt-3 text-2xl font-semibold ${isDarkTheme ? 'text-slate-50' : 'text-slate-950'}`}>
            Quick Start
          </h3>
          <p className={`mt-3 text-base leading-7 ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
            Install the package, authenticate with `simpleAuth`, and create your first realm-scoped handles.
          </p>
        </Link>

        <Link
          className={`group rounded-3xl border p-7 no-underline shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
            isDarkTheme
              ? 'border-slate-800 bg-slate-900 hover:border-orange-700'
              : 'border-slate-200 bg-white hover:border-orange-300'
          }`}
          to="/api/keycloak-admin-client-fluent/"
        >
          <div
            className={`text-sm font-semibold uppercase tracking-[0.2em] ${isDarkTheme ? 'text-orange-300' : 'text-orange-700'}`}
          >
            Explore surface area
          </div>
          <h3 className={`mt-3 text-2xl font-semibold ${isDarkTheme ? 'text-slate-50' : 'text-slate-950'}`}>
            API Reference
          </h3>
          <p className={`mt-3 text-base leading-7 ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
            Jump straight into root helpers, realm handles, identity provider mappers, workflows, and system endpoints.
          </p>
        </Link>

        <Link
          className={`group rounded-3xl border p-7 no-underline shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
            isDarkTheme
              ? 'border-slate-800 bg-slate-900 hover:border-emerald-700'
              : 'border-slate-200 bg-white hover:border-emerald-300'
          }`}
          to="/example/general/"
        >
          <div
            className={`text-sm font-semibold uppercase tracking-[0.2em] ${isDarkTheme ? 'text-emerald-300' : 'text-emerald-700'}`}
          >
            See the flow
          </div>
          <h3 className={`mt-3 text-2xl font-semibold ${isDarkTheme ? 'text-slate-50' : 'text-slate-950'}`}>
            Example Guides
          </h3>
          <p className={`mt-3 text-base leading-7 ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
            Start from an overview, then jump into focused walkthroughs for realm bootstrap, identity setup, clients,
            and mappers.
          </p>
        </Link>
      </div>
    </section>
  );
}

function ClosingCta(): ReactNode {
  return (
    <section className="px-6 pb-20 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-8 py-12 text-white shadow-2xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">Readable automation</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Keep the power of Keycloak admin APIs without carrying the ceremony everywhere.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Use the fluent handles for day-to-day provisioning, and drop down to the underlying client whenever you
              need something lower level. The library stays close to Keycloak instead of inventing a parallel model.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 no-underline transition hover:bg-slate-100"
              to="/about/philosophy/"
            >
              Read Philosophy
            </Link>
            <Link
              className="inline-flex items-center rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white no-underline transition hover:bg-white/10"
              to="https://github.com/egose/keycloak-fluent"
            >
              GitHub Repository
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => setIsDarkTheme(root.getAttribute('data-theme') === 'dark');

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  return (
    <Layout
      title={siteConfig.title}
      description="A fluent TypeScript wrapper around the Keycloak Admin API for readable provisioning, operational automation, and resource-scoped administration."
    >
      <main className={isDarkTheme ? 'bg-slate-950' : 'bg-white'}>
        <Hero />
        <Highlights isDarkTheme={isDarkTheme} />
        <Coverage isDarkTheme={isDarkTheme} />
        <Pathways isDarkTheme={isDarkTheme} />
        <ClosingCta />
      </main>
    </Layout>
  );
}
