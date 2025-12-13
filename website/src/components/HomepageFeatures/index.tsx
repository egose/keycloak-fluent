import type { ReactNode } from 'react';

type FeatureItem = {
  id: string;
  title: string;
  Svg: () => JSX.Element;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    id: 'fluent-interface',
    title: 'Fluent & Expressive APIs',
    Svg: () => (
      <svg
        className="w-24 h-24 text-blue-500 mx-auto"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 7h6l2 3h6M5 12h4l2 3h8M5 17h10" />
        <circle cx="5" cy="7" r="1.2" />
        <circle cx="5" cy="12" r="1.2" />
        <circle cx="5" cy="17" r="1.2" />
      </svg>
    ),
    description: (
      <>
        Write Keycloak administration code that reads like sentences. Chain operations naturally and focus on{' '}
        <strong>what</strong> you want to manage—not how to wire low-level API calls together.
      </>
    ),
  },
  {
    id: 'resource-centric',
    title: 'Resource-Centric Design',
    Svg: () => (
      <svg
        className="w-24 h-24 text-green-500 mx-auto"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="6" r="2" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="12" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4M12 12L6 16M12 12l6 4" />
      </svg>
    ),
    description: (
      <>
        Navigate Keycloak the way it is modeled. Start from a realm, move to clients, users, roles, or groups, and
        operate through dedicated <strong>handles</strong> for each resource.
      </>
    ),
  },
  {
    id: 'safe-declarative',
    title: 'Safe & Declarative Operations',
    Svg: () => (
      <svg
        className="w-24 h-24 text-purple-500 mx-auto"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V7l7-4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
      </svg>
    ),

    description: (
      <>
        Use <code>ensure</code> and <code>discard</code> helpers to write idempotent scripts with confidence. Ideal for
        provisioning, automation, and CI/CD pipelines.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className="w-full md:w-1/2 lg:w-1/3 px-4 mb-12">
      <div className="text-center">
        <Svg />
        <h3 className="text-xl font-bold !text-gray-900 mt-4 mb-2">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold !text-gray-900 mb-4">Keycloak Admin, Reimagined</h1>
          <p className="text-lg text-gray-700 mx-auto">
            <strong>keycloak-fluent</strong> turns low-level admin APIs into a readable, discoverable, and chainable
            developer experience— without hiding the power of the official client.
          </p>
        </div>
        <div className="flex flex-wrap -mx-4">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
