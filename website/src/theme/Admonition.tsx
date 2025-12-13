import React from 'react';
import Admonition from '@theme-original/Admonition';

export default function AdmonitionWrapper(props) {
  return (
    <>
      <div className="text-right -mb-10 mr-2">
        <button
          className="cursor-pointer"
          onClick={(event) => {
            const btn = event.currentTarget;
            const siblingDiv = btn.parentElement.nextElementSibling;
            const contentElm = siblingDiv.querySelector('p > strong');
            if (contentElm) {
              const text = contentElm.textContent;
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.lang = 'en-US'; // or "ko-KR", "fr-FR", etc.
              speechSynthesis.speak(utterance);
            }
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="icon icon-tabler icons-tabler-outline icon-tabler-volume"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M15 8a5 5 0 0 1 0 8" />
            <path d="M17.7 5a9 9 0 0 1 0 14" />
            <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
          </svg>
        </button>
      </div>
      <Admonition {...props} />
    </>
  );
}
