import { initializeApp } from 'firebase/app';
import { getFirestore, writeBatch, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const newTerms = [
  // --- Curation concept terms (added to auction cluster) ---
  {
    id: 'curation', clusterId: 'auction', name: 'Curation',
    def: 'Practice of wrapping audience data, contextual signals, and supply-chain integrity around inventory on the SSP side and packaging it as ready-to-buy PMP deals. Sits between SSPs and DSPs. Growing fast because it solves addressability without forcing DSPs to integrate every data source.',
    related: ['curator','deals-library','pmp','dmp','ssp','dsp','bid-enrichment','sell-side-targeting','contextual-data','spo'],
    article: {
      summary: 'Curation is the modern answer to the addressability problem. Instead of every DSP integrating every data source, a curator does the work once on the sell side and sells the result as a deal ID anyone can buy.',
      howItWorks: 'A curator (Audigent, Multilocal, Magnite Curation) sits at the SSP layer with access to bid requests, audience data (their own or partner DMPs), and contextual signals. They build packages: "premium auto-intender audience on brand-safe sports inventory." Each package gets a deal ID. Any DSP can target it. The curator earns a cut of every winning bid.',
      whyItMatters: 'Curation moves targeting intelligence from buy side to sell side — which has fundamentally better data. The SSP sees every impression in the auction; the DSP only sees a sampled fragment. Sell-side targeting can use signals DSPs literally cannot afford to compute.',
      watchOutFor: 'Curation fees stack on top of SSP fees and DSP fees, so it can compress margins quickly. Audit which curated deals actually deliver lift vs which are just adding cost to inventory you could have bought directly.'
    }
  },
  {
    id: 'curator', clusterId: 'players', name: 'Curator',
    def: 'New player type that sits SSP-side and packages audience data plus inventory into ready-to-buy PMP deals for traders. Canonical example: Audigent. Others: Multilocal, Infolinks, IAS Curation, LoopMe.',
    related: ['curation','deals-library','pmp','ssp','dsp','audigent','magnite','multilocal','infolinks','pubmatic','loopme']
  },
  {
    id: 'bid-enrichment', clusterId: 'auction', name: 'Bid Enrichment',
    def: 'Technical mechanism behind curation. As an OpenRTB bid request flows from SSP toward DSPs, the curator (often co-located in the same data center as the SSP) intercepts it and injects extra signals — audience IDs, attention scores, contextual labels, supply-quality flags. The enriched bid is more targetable, so it sells for more.',
    related: ['curation','bid-request','openrtb','ssp','audigent']
  },
  {
    id: 'sell-side-targeting', clusterId: 'auction', name: 'Sell-Side Targeting',
    def: 'The intellectual frame for what curation actually is. Historically, targeting lived on the DSP (buy side); curation shifts that logic to the SSP/curator side. Significant because DSPs only see a fragment of the bidstream while SSPs see all of it.',
    related: ['curation','curator','bidstream','dsp','ssp']
  },
  {
    id: 'deals-library', clusterId: 'auction', name: 'Deals Library',
    def: 'Productized curation storefront — a catalog of pre-packaged PMP deals a trader can browse and grab a deal ID from. LoopMe\'s Premium Deals Library is the canonical example.',
    related: ['curation','curator','pmp','loopme','always-on-pmp']
  },
  {
    id: 'always-on-pmp', clusterId: 'auction', name: 'Always-on PMP',
    def: 'A PMP deal that stays continuously available rather than being negotiated per campaign. The default model in curation deals libraries — trader picks an existing deal ID off the shelf instead of setting up a new one each time.',
    related: ['pmp','deals-library','curation']
  },

  // --- Curator companies (added to players cluster) ---
  {
    id: 'audigent', clusterId: 'players', name: 'Audigent',
    def: 'Canonical pure-play curator. CEO Drew Stein. Famous for co-locating in the same data centers as SSP partners to enrich bids in real time before they reach DSPs. Often cited as the textbook example of what a modern curator does.',
    related: ['curator','curation','bid-enrichment','ssp']
  },
  {
    id: 'multilocal', clusterId: 'players', name: 'Multilocal',
    def: 'UK-based pure-play curator. Named alongside Audigent and Infolinks as one of the early specialists who defined the category before SSPs and Google moved in. Builds curated deal packages targeted at local/regional advertisers.',
    related: ['curator','curation','audigent','infolinks']
  },
  {
    id: 'infolinks', clusterId: 'players', name: 'Infolinks',
    def: 'Originally a contextual advertising company, repositioned as a curator. Combines contextual signals with audience data to build curated deal packages sold via SSPs. Example of how non-curator companies pivoted into the category.',
    related: ['curator','curation','contextual-data','audigent','multilocal']
  },
  {
    id: 'magnite', clusterId: 'players', name: 'Magnite',
    def: 'Largest independent SSP. Now a major curation player too — CEO Michael Barrett reported curation revenue grew 100%+ year-over-year in 2024. Shows that the SSP-vs-curator line is blurring as big SSPs build curation businesses on top of their auction infrastructure.',
    related: ['ssp','curator','curation','ad-exchange']
  },
  {
    id: 'pubmatic', clusterId: 'players', name: 'PubMatic',
    def: 'Major independent SSP. Runs its own curation product (Activate) that lets buyers transact directly with publishers via curated deals. Competes with Magnite on the sell side. Another sign that SSPs are absorbing curation in-house.',
    related: ['ssp','curation','magnite']
  },
  {
    id: 'loopme', clusterId: 'players', name: 'LoopMe',
    def: 'AI-driven brand-performance company. Operates an exchange, owns Chartboost (mobile in-app), runs the Persona ID graph, and sells the Premium Deals Library as its curation product. Positions itself as a full-stack adtech player rather than a single category.',
    related: ['chartboost','curator','deals-library','persona-id','ad-exchange','mobile-in-app','purchaseloop']
  },
  {
    id: 'chartboost', clusterId: 'players', name: 'Chartboost',
    def: 'Mobile in-app and mobile-gaming monetization platform acquired by LoopMe. Gives LoopMe direct, owned-and-operated supply in the gaming channel — important for avoiding open-marketplace quality issues.',
    related: ['loopme','mobile-in-app','mobile-gaming','ivt','mfa']
  },

  // --- Data layer (added to data cluster) ---
  {
    id: 'dmp', clusterId: 'data', name: 'DMP',
    def: 'Data Management Platform — system that ingests, organizes, and segments audience data, often combining first-party, second-party, and third-party signals. Powers targeting and curation. LoopMe runs one of the largest, with ~2B consented devices.',
    related: ['first-party-data','activation','onboarding','curation','loopme']
  },
  {
    id: 'persona-id', clusterId: 'identity', name: 'Persona ID',
    def: 'LoopMe\'s proprietary identity graph spanning ~2B consented devices. Used to connect mobile, web, and CTV impressions to the same user without relying on third-party cookies or IDFA.',
    related: ['identity-resolution','loopme','first-party-data','dmp']
  },
  {
    id: 'purchaseloop', clusterId: 'data', name: 'PurchaseLoop',
    def: 'LoopMe\'s outcome-based measurement and optimization product. Connects ad exposure to real-world purchase behavior using device-level matching with retailer data partners.',
    related: ['loopme','measurement']
  },

  // --- Contextual / Privacy ---
  {
    id: 'contextual-data', clusterId: 'identity', name: 'Contextual Data',
    def: 'Signals about the page or app an impression appears on — topic, keywords, sentiment, brand-safety category, attention metrics. Cookie-independent. One of the three pillars of curation alongside audience data and supply-chain integrity.',
    related: ['curation','infolinks','third-party-cookies','privacy-by-design','contextual-targeting']
  },
  {
    id: 'consent-management', clusterId: 'privacy', name: 'Consent Management',
    def: 'The process of collecting, storing, and respecting user choices about tracking. CMPs (Consent Management Platforms) are the tools that handle this. The output is the consent string that travels through every bid request.',
    related: ['gdpr','third-party-cookies','cmp','consent-string','tcf']
  },

  // --- Ad quality ---
  {
    id: 'mfa', clusterId: 'adquality', name: 'MFA (Made-for-Advertising)',
    def: 'Low-quality websites engineered to attract programmatic ad spend rather than serve real audiences. Heavy ads-to-content ratio, clickbait headlines, high IVT levels. A major waste driver in open exchanges — curation and direct supply (e.g., Chartboost) avoid it.',
    related: ['ivt','curation','chartboost','ad-exchange','brand-safety','spo']
  },
];

export async function addCurationTerms() {
  const batch = writeBatch(db);
  newTerms.forEach(term => {
    const ref = doc(db, 'terms', term.id);
    batch.set(ref, term);
  });
  await batch.commit();
  console.log(`Added ${newTerms.length} curation/players terms.`);
}
