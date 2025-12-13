import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className="bg-gradient-to-b from-orange-100 via-orange-200 to-orange-300 py-20 text-center">
      <div className="container mx-auto px-4">
        <h1 className="!text-5xl !text-gray-900 font-extrabold mb-4">{siteConfig.title}</h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">{siteConfig.tagline}</p>
        <div>
          <Link
            className="inline-block px-6 py-3 bg-orange-800 !text-white text-base font-medium rounded-lg shadow hover:bg-orange-900 transition"
            to="/fluent-api/philosophy/"
          >
            Documentation
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`Hello from ${siteConfig.title}`} description="">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
