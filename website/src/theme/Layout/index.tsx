import { useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import OriginalLayout from '@theme-original/Layout';

function useOnRouteChange(callback: () => void) {
  const location = useLocation();

  useEffect(() => {
    callback(); // Runs every time the route changes
  }, [location.pathname]);
}

export default function Layout(props) {
  useOnRouteChange(() => {
    console.log('Page changed to:', window.location.pathname);

    const adElement = document.querySelector('ins.adsbygoogle');

    if (adElement && adElement.getAttribute('data-ad-status') !== 'filled') {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense push error:', e);
      }
    }
  });

  return <OriginalLayout {...props} />;
}
