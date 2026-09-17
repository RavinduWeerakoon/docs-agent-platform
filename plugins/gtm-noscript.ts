import type {LoadContext, Plugin} from '@docusaurus/types';

// GTM's <noscript> fallback iframe must sit immediately after the opening
// <body> tag so it still fires for visitors with JS disabled.
export default function gtmNoscriptPlugin(_context: LoadContext): Plugin {
  return {
    name: 'gtm-noscript-plugin',
    injectHtmlTags() {
      return {
        preBodyTags: [
          {
            tagName: 'noscript',
            attributes: {},
            innerHTML:
              '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PSTXMT" ' +
              'height="0" width="0" style="display:none;visibility:hidden"></iframe>',
          },
        ],
      };
    },
  };
}
