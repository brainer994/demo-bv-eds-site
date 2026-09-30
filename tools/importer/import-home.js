/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroVideoParser from './parsers/hero-video.js';
import cardsLogosParser from './parsers/cards-logos.js';
import cardsServicesParser from './parsers/cards-services.js';
import cardsPartnersParser from './parsers/cards-partners.js';
import cardsIntelligenceParser from './parsers/cards-intelligence.js';
import cardsAcceleratorParser from './parsers/cards-accelerator.js';
import cardsCaseStudyParser from './parsers/cards-case-study.js';
import cardsTestimonialParser from './parsers/cards-testimonial.js';
import tabsIndustriesParser from './parsers/tabs-industries.js';
import cardsAwardsParser from './parsers/cards-awards.js';
import cardsArticleParser from './parsers/cards-article.js';
import cardsFaqParser from './parsers/cards-faq.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/brainvire-cleanup.js';
import sectionsTransformer from './transformers/brainvire-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-video': heroVideoParser,
  'cards-logos': cardsLogosParser,
  'cards-services': cardsServicesParser,
  'cards-partners': cardsPartnersParser,
  'cards-intelligence': cardsIntelligenceParser,
  'cards-accelerator': cardsAcceleratorParser,
  'cards-case-study': cardsCaseStudyParser,
  'cards-testimonial': cardsTestimonialParser,
  'tabs-industries': tabsIndustriesParser,
  'cards-awards': cardsAwardsParser,
  'cards-article': cardsArticleParser,
  'cards-faq': cardsFaqParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "home",
  "description": "Brainvire homepage: video hero, client logos, capabilities, partners, operating model, accelerators, case studies, testimonials, industries tabs, recognition, insights, FAQ and contact CTA",
  "urls": [
    "https://www.brainvire.com/"
  ],
  "blocks": [
    {
      "name": "hero-video",
      "instances": [
        ".fh > header.hero"
      ]
    },
    {
      "name": "cards-logos",
      "instances": [
        ".clients .client-row"
      ]
    },
    {
      "name": "cards-services",
      "instances": [
        "#services .svc-grid"
      ]
    },
    {
      "name": "cards-partners",
      "instances": [
        "section.partners .p-row"
      ]
    },
    {
      "name": "cards-intelligence",
      "instances": [
        "#bvai .frame"
      ]
    },
    {
      "name": "cards-accelerator",
      "instances": [
        "#accelerators .accel-grid"
      ]
    },
    {
      "name": "cards-case-study",
      "instances": [
        "#work .wstack"
      ]
    },
    {
      "name": "cards-testimonial",
      "instances": [
        "section.testi .testi-layout"
      ]
    },
    {
      "name": "tabs-industries",
      "instances": [
        "#industries .ind-split"
      ]
    },
    {
      "name": "cards-awards",
      "instances": [
        "section.rec .rec-grid"
      ]
    },
    {
      "name": "cards-article",
      "instances": [
        "#insights .ins3-grid"
      ]
    },
    {
      "name": "cards-faq",
      "instances": [
        ".faq-grid"
      ]
    }
  ],
  "sections": [
    {
      "id": "1",
      "name": "Hero",
      "selector": [
        ".fh > header.hero",
        "header.hero"
      ],
      "style": null,
      "blocks": [
        "hero-video"
      ],
      "defaultContent": []
    },
    {
      "id": "2",
      "name": "Clients (label + logo wall)",
      "selector": [
        ".fh > div.clients",
        "div.clients"
      ],
      "style": "dark",
      "blocks": [
        "cards-logos"
      ],
      "defaultContent": [
        ".clients .wrap > div:first-child"
      ]
    },
    {
      "id": "4",
      "name": "Capabilities",
      "selector": [
        "#services"
      ],
      "style": null,
      "blocks": [
        "cards-services"
      ],
      "defaultContent": [
        "#services .wrap > div:first-child"
      ]
    },
    {
      "id": "5",
      "name": "Certified partnerships",
      "selector": [
        "section.partners"
      ],
      "style": null,
      "blocks": [
        "cards-partners"
      ],
      "defaultContent": [
        "section.partners .head"
      ]
    },
    {
      "id": "6",
      "name": "Operating model",
      "selector": [
        "#bvai",
        "section.bvai"
      ],
      "style": "dark",
      "blocks": [
        "cards-intelligence"
      ],
      "defaultContent": [
        "#bvai .wrap > div:first-child"
      ]
    },
    {
      "id": "7",
      "name": "Accelerators",
      "selector": [
        "#accelerators",
        "section.accel"
      ],
      "style": "grey",
      "blocks": [
        "cards-accelerator"
      ],
      "defaultContent": [
        "#accelerators .wrap > div:first-child"
      ]
    },
    {
      "id": "8",
      "name": "Selected work",
      "selector": [
        "#work"
      ],
      "style": null,
      "blocks": [
        "cards-case-study"
      ],
      "defaultContent": [
        "#work .wrap > div:first-child",
        "#work .wrap > p"
      ]
    },
    {
      "id": "9",
      "name": "Testimonials",
      "selector": [
        "section.testi"
      ],
      "style": null,
      "blocks": [
        "cards-testimonial"
      ],
      "defaultContent": [
        "section.testi .wrap > div:first-child"
      ]
    },
    {
      "id": "10",
      "name": "Industries",
      "selector": [
        "#industries",
        "section.ind-dark"
      ],
      "style": "dark",
      "blocks": [
        "tabs-industries"
      ],
      "defaultContent": [
        "#industries .wrap > div:first-child"
      ]
    },
    {
      "id": "11",
      "name": "Recognition",
      "selector": [
        "section.rec"
      ],
      "style": "grey",
      "blocks": [
        "cards-awards"
      ],
      "defaultContent": [
        "section.rec .wrap > div:first-child",
        "section.rec .analyst"
      ]
    },
    {
      "id": "12",
      "name": "Insights",
      "selector": [
        "#insights"
      ],
      "style": null,
      "blocks": [
        "cards-article"
      ],
      "defaultContent": [
        "#insights .wrap > div:first-child",
        "#insights .wrap > p"
      ]
    },
    {
      "id": "13",
      "name": "FAQ",
      "selector": [
        ".fh > section:has(.faq-grid)",
        ".fh > section:nth-of-type(10)"
      ],
      "style": null,
      "blocks": [
        "cards-faq"
      ],
      "defaultContent": [
        "section:has(.faq-grid) .wrap > div:first-child"
      ]
    },
    {
      "id": "14",
      "name": "Contact CTA",
      "selector": [
        "#contact",
        "section.cta"
      ],
      "style": "dark",
      "blocks": [],
      "defaultContent": [
        "#contact .wrap"
      ]
    }
  ]
};

// TRANSFORMER REGISTRY - cleanup first, then sections
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Initial cleanup + section breaks
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Final cleanup + section metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path (root URL maps to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
