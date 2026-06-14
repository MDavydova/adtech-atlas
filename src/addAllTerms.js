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

const allNewTerms = [

  // ── CURATION ──────────────────────────────────────────────
  {
    id: 'curation', clusterId: 'auction', name: 'Curation',
    def: 'Practice of wrapping audience data, contextual signals, and supply-chain integrity around inventory on the SSP side and packaging it as ready-to-buy PMP deals. Sits between SSPs and DSPs. Growing fast because it solves addressability without forcing DSPs to integrate every data source.',
    related: ['curator','deals-library','pmp','dmp','ssp','dsp','bid-enrichment','sell-side-targeting','contextual-data','spo'],
    article: {
      summary: 'Curation is the modern answer to the addressability problem. Instead of every DSP integrating every data source, a curator does the work once on the sell side and sells the result as a deal ID anyone can buy.',
      howItWorks: 'A curator (Audigent, Multilocal, Magnite) sits at the SSP layer with access to bid requests, audience data, and contextual signals. They build packages — "premium auto-intender audience on brand-safe sports inventory" — and give each a deal ID. Any DSP can target it. The curator earns a cut of every winning bid.',
      whyItMatters: 'Curation moves targeting intelligence from buy side to sell side. The SSP sees every impression in the auction; the DSP only sees a sampled fragment. Sell-side targeting can use signals DSPs literally cannot afford to compute.',
      watchOutFor: 'Curation fees stack on top of SSP and DSP fees. Audit which curated deals deliver real lift versus which just add cost to inventory you could buy directly.',
    }
  },
  { id: 'curator', clusterId: 'players', name: 'Curator', def: "New player type that sits SSP-side and packages audience data plus inventory into ready-to-buy PMP deals for traders. Canonical example: Audigent. Others: Multilocal, Infolinks, IAS Curation, LoopMe.", related: ['curation','deals-library','pmp','ssp','dsp','audigent','magnite','multilocal','infolinks','pubmatic','loopme'] },
  { id: 'bid-enrichment', clusterId: 'auction', name: 'Bid Enrichment', def: 'Technical mechanism behind curation. As an OpenRTB bid request flows from SSP toward DSPs, the curator intercepts it and injects extra signals — audience IDs, attention scores, contextual labels, supply-quality flags. The enriched bid is more targetable, so it sells for more.', related: ['curation','bid-request','openrtb','ssp','audigent'] },
  { id: 'sell-side-targeting', clusterId: 'auction', name: 'Sell-Side Targeting', def: 'The intellectual frame for what curation actually is. Historically targeting lived on the DSP (buy side); curation shifts that logic to the SSP/curator side. Significant because DSPs only see a fragment of the bidstream while SSPs see all of it.', related: ['curation','curator','bidstream','dsp','ssp'] },
  { id: 'deals-library', clusterId: 'auction', name: 'Deals Library', def: "Productized curation storefront — a catalog of pre-packaged PMP deals a trader can browse and grab a deal ID from. LoopMe's Premium Deals Library is the canonical example.", related: ['curation','curator','pmp','loopme','always-on-pmp'] },
  { id: 'always-on-pmp', clusterId: 'auction', name: 'Always-on PMP', def: 'A PMP deal that stays continuously available rather than being negotiated per campaign. The default model in curation deals libraries — trader picks an existing deal ID off the shelf instead of setting up a new one each time.', related: ['pmp','deals-library','curation'] },

  // ── CURATOR COMPANIES ─────────────────────────────────────
  { id: 'audigent', clusterId: 'players', name: 'Audigent', def: 'Canonical pure-play curator. Famous for co-locating in SSP data centers to enrich bids in real time before they reach DSPs. Often cited as the textbook example of what a modern curator does.', related: ['curator','curation','bid-enrichment','ssp'] },
  { id: 'multilocal', clusterId: 'players', name: 'Multilocal', def: 'UK-based pure-play curator. One of the early specialists who defined the category before SSPs moved in. Builds curated deal packages targeted at local/regional advertisers.', related: ['curator','curation','audigent','infolinks'] },
  { id: 'infolinks', clusterId: 'players', name: 'Infolinks', def: 'Originally a contextual advertising company, repositioned as a curator. Combines contextual signals with audience data to build curated deal packages. Example of how non-curator companies pivoted into the category.', related: ['curator','curation','contextual-data','audigent','multilocal'] },
  { id: 'magnite', clusterId: 'players', name: 'Magnite', def: 'Largest independent SSP. Now a major curation player — curation revenue grew 100%+ YoY in 2024. Shows the SSP-vs-curator line is blurring as big SSPs build curation businesses on top of their auction infrastructure.', related: ['ssp','curator','curation','ad-exchange'] },
  { id: 'pubmatic', clusterId: 'players', name: 'PubMatic', def: 'Major independent SSP. Runs its own curation product (Activate) letting buyers transact directly with publishers via curated deals. Another sign that SSPs are absorbing curation in-house.', related: ['ssp','curation','magnite'] },
  { id: 'loopme', clusterId: 'players', name: 'LoopMe', def: 'AI-driven brand-performance company. Operates an exchange, owns Chartboost (mobile in-app), runs the Persona ID graph, and sells the Premium Deals Library as its curation product. Full-stack adtech player.', related: ['chartboost','curator','deals-library','persona-id','ad-exchange','mobile-in-app','purchaseloop'] },
  { id: 'chartboost', clusterId: 'players', name: 'Chartboost', def: 'Mobile in-app and mobile-gaming monetization platform acquired by LoopMe. Gives LoopMe direct, owned-and-operated supply in the gaming channel — important for avoiding open-marketplace quality issues like MFA.', related: ['loopme','mobile-in-app','mobile-gaming','ivt','mfa'] },

  // ── DSP COMPETITORS ───────────────────────────────────────
  {
    id: 'walled-garden', clusterId: 'players', name: 'Walled Garden',
    def: "A platform that owns inventory, audience data, and the buying interface simultaneously — keeping all three inside its own ecosystem. Google, Meta, and Amazon are the canonical examples. Advertisers can buy inside but can't see under the hood.",
    related: ['dv360','amazon-dsp','the-trade-desk','openpath','principal-media','first-party-data'],
    article: {
      summary: "Walled gardens are platforms where the same company owns the audience data, the ad inventory, and the buying tool. You can buy inside, but you can't compare their data to external data, audit their measurement, or take your data out.",
      howItWorks: "When you buy on Meta, Meta decides who sees your ad, how it performed, and what you pay. You never see the raw auction data. When you buy through DV360, Google can see your campaign strategy, your audiences, and your bids — while also operating the SSP and publisher ad server on the other side of the same auction.",
      whyItMatters: "Walled gardens control the majority of digital ad spend globally. Google and Meta alone take roughly 50% of digital advertising revenue. Their data advantages are real — but so is the conflict of interest. An advertiser can't independently verify performance, attribution, or pricing inside a walled garden.",
      watchOutFor: "Attribution inside walled gardens is always self-reported. Meta tells you how many conversions Meta drove. Google tells you how many conversions Google drove. Both will claim credit for the same purchase if both touchpoints exist. An MMP or independent measurement tool is the only way to get a neutral view.",
      deepDive: [
        { heading: "Why TTD's whole brand is built against this", body: "The Trade Desk explicitly positions itself as the champion of the 'open internet' against walled gardens. Their argument: they don't own media, so they're not conflicted. When TTD recommends you buy a publisher, they have no financial stake in which publisher wins. When Google's DV360 recommends you buy YouTube, Google profits from both sides of the transaction." },
        { heading: "The data asymmetry problem", body: "Walled gardens know things about their users that they will never share with advertisers — purchase history, search intent, social graph, location history. They use this data to sell you audiences, but you can never audit whether the audience was what they said it was. You see a CPM and a conversion count. You don't see the underlying signal." },
        { heading: "Why advertisers still use them", body: "Because the data works. Meta's targeting, for all its opacity, produces measurable results. Google's intent data from Search is genuinely unmatched for certain categories. The tension isn't 'walled gardens are bad' — it's that their opacity makes it impossible to know if you're getting fair value." }
      ]
    }
  },
  {
    id: 'dv360', clusterId: 'players', name: 'DV360 (Google)',
    def: "Google's enterprise DSP — Display & Video 360. Part of Google Marketing Platform. The largest DSP by spend volume. Tightly integrated with Google's own inventory (YouTube, GDN) and Google Ad Manager on the publisher side. The canonical walled garden DSP.",
    related: ['walled-garden','the-trade-desk','amazon-dsp','gam','openrtb','dsp'],
    article: {
      summary: "DV360 is Google's buy-side product for programmatic advertising. It's the most widely used DSP globally — but buying through it means buying inside Google's ecosystem, where Google operates on both sides of the auction.",
      howItWorks: "DV360 connects to the open exchange and to Google's proprietary inventory. Campaigns are set up in the DV360 interface, which integrates with Campaign Manager 360 (the advertiser ad server), Google Analytics, and Google Audience Center. Bidding happens across Google's exchange and third-party exchanges.",
      whyItMatters: "DV360's integration with YouTube is its primary competitive advantage — YouTube is the dominant premium video platform globally, and you can only buy it programmatically through Google. For any advertiser with significant video budgets, DV360 is effectively unavoidable.",
      watchOutFor: "The conflict of interest is structural. Google operates DV360 (buy side), Google Ad Manager (publisher ad server and SSP), and YouTube (premium inventory). When you buy through DV360, Google has information from all three sides. Independent advertisers and regulators have raised this as an antitrust concern — Google's ad tech stack is under active regulatory scrutiny in multiple jurisdictions."
    }
  },
  {
    id: 'amazon-dsp', clusterId: 'players', name: 'Amazon DSP',
    def: "Amazon's programmatic DSP. Primary competitive advantage: access to Amazon's first-party purchase data — the most powerful intent signal in digital advertising. Strongest for retail and ecommerce advertisers. Growing fast in CTV through Prime Video.",
    related: ['walled-garden','the-trade-desk','dv360','dsp','first-party-data','ctv'],
    article: {
      summary: "Amazon DSP's unique value is purchase data. While Google knows what you search for and Meta knows who you are socially, Amazon knows what you actually buy. For retail advertisers, this intent signal is unmatched.",
      howItWorks: "Advertisers access Amazon DSP either directly or through Amazon Ads managed service. Campaigns can run on Amazon-owned properties (Amazon.com, IMDb, Twitch, Fire TV) and on third-party inventory across the open web. Amazon's audience segments — built from purchase history, search behavior, and browsing on Amazon — can be applied to off-Amazon inventory.",
      whyItMatters: "Amazon's retail media network is the fastest-growing segment of digital advertising. Advertisers selling on Amazon can close-loop their campaigns — measure whether someone who saw an ad actually purchased the product on Amazon. This kind of closed-loop measurement is genuinely rare and valuable.",
      watchOutFor: "Amazon DSP is most powerful for advertisers with Amazon retail relationships. For non-Amazon sellers, the data advantage is less acute. Also: Amazon's reporting tools are less mature than Google's or TTD's — the interface and analytics capabilities lag behind the data quality."
    }
  },
  {
    id: 'xandr', clusterId: 'players', name: 'Xandr (Microsoft)',
    def: "Microsoft's programmatic platform — has both a DSP (Xandr Invest) and an SSP (Xandr Monetize). Originally built by AT&T, acquired by Microsoft in 2022. Access to Microsoft and LinkedIn data. Strong in CTV and premium video. The most credible independent alternative to TTD in enterprise.",
    related: ['the-trade-desk','dsp','ssp','walled-garden','ctv','linkedin'],
    article: {
      summary: "Xandr is Microsoft's play in the open programmatic ecosystem. What makes it distinct from TTD is Microsoft's data layer — particularly LinkedIn's professional audience data, which is uniquely valuable for B2B advertisers.",
      howItWorks: "Xandr Invest (DSP) connects to Xandr Monetize (SSP) and to the broader open exchange. Microsoft/LinkedIn audience segments can be applied to open-web and CTV inventory. The integration with Microsoft Advertising (search) allows for cross-channel planning within one ecosystem.",
      whyItMatters: "LinkedIn's professional data — job title, company, seniority, industry — is not available anywhere else at scale. For B2B advertisers, Xandr offers reach against LinkedIn audiences on open-web inventory at a much lower CPM than LinkedIn's own platform.",
      watchOutFor: "Xandr's market position is in transition post-acquisition. The product roadmap has changed significantly under Microsoft ownership. Adoption is growing but it remains smaller than TTD or DV360 in most markets."
    }
  },

  // ── AGENCY ECOSYSTEM ──────────────────────────────────────
  {
    id: 'holding-company', clusterId: 'players', name: 'Holding Company (Holdco)',
    def: 'A parent corporation owning multiple agency brands — creative, media, data, consulting — under one roof. The four dominant holdcos (WPP, Publicis, Omnicom, IPG) control the majority of global advertising spend. In adtech, their media arms are the largest single source of DSP spend.',
    related: ['big-4','publicis','trading-desk','media-agency','groupm','the-trade-desk','principal-media'],
    article: {
      summary: "Holdcos matter in adtech because of scale. GroupM alone (WPP's media arm) controls roughly $60B in annual media spend. When a holdco recommends or bans a DSP — as Publicis did with TTD — the financial impact is immediate and severe.",
      howItWorks: "The holdco sits above everything. Underneath sit media agency networks (GroupM, Publicis Media), creative networks (Ogilvy, BBDO), and specialist units (data, PR, consulting). Each operates semi-independently but benefits from the holdco's negotiating leverage with publishers, DSPs, and platforms.",
      whyItMatters: "Holdcos negotiate volume deals with DSPs and SSPs at rates individual agencies can't access. This leverage is commercially significant — and is the mechanism that enables principal media. The holdco buys inventory at bulk rates using aggregated spend, then individual agencies resell at retail to their clients.",
      watchOutFor: "Holdcos and their constituent agencies sometimes have conflicting incentives. A holdco trading desk pushing a particular DSP may be doing so because of a volume rebate deal, not because it's the best tool for the client.",
      deepDive: [
        { heading: "Why the holdco model exists", body: "Before holdcos, agencies were independent. The consolidation started in the 1980s when agencies realized that owning multiple agencies gave them buying leverage with media owners — a TV network would give better rates to an agency that controlled 20% of the TV market than to one that controlled 2%. That leverage logic extended to digital: GroupM's scale forces favorable terms from every platform it deals with." },
        { heading: "The IPG-Omnicom merger (2025-2026)", body: "Omnicom announced the acquisition of IPG in late 2024. If completed, this creates a combined entity that rivals WPP and Publicis in scale. The industry implication: further consolidation of buying power, more leverage over platforms, and potentially more opacity in principal media practices as the remaining holdcos become larger and harder to audit." },
        { heading: "Epsilon — Publicis's data weapon", body: "Publicis's acquisition of Epsilon (a data and technology company) in 2019 for $4.4B was transformational. Epsilon gave Publicis a proprietary DSP, a first-party data graph, and CRM marketing capabilities. Combined with LiveRamp (2026), Publicis now controls identity infrastructure — which means it controls the data layer that underpins targeting across its clients' campaigns. No other holdco has equivalent owned data infrastructure." }
      ]
    }
  },
  {
    id: 'groupm', clusterId: 'players', name: 'GroupM',
    def: "WPP's media investment arm — the world's largest media buyer, controlling roughly $60B in annual spend across Mindshare, Wavemaker, EssenceMediacom, and others. When GroupM makes a platform decision, it moves markets.",
    related: ['big-4','holding-company','trading-desk','media-agency','the-trade-desk','principal-media','wpp']
  },
  {
    id: 'media-agency', clusterId: 'players', name: 'Media Agency',
    def: 'The agency that plans and buys media on behalf of a brand — deciding where to advertise, negotiating deals, running programmatic campaigns in DSPs, and reporting performance. The actual operational buyer in the adtech ecosystem. Examples: Mindshare, Carat, Initiative, OMD, Starcom.',
    related: ['holding-company','trading-desk','groupm','dsp','principal-media','io','pmp'],
    article: {
      summary: "Media agencies are the primary customer of every DSP, SSP, and adtech vendor. Understanding their structure and incentives is essential for anyone working in adtech commercially.",
      howItWorks: "A media agency receives a brief from a brand client ('reach 25-44 year old car buyers in Germany, €2M budget, Q3'). The planning team allocates budget across channels. The trading desk executes the programmatic portion in DSPs. The analytics team reports results. The agency earns disclosed fees — and potentially undisclosed margin on the media they buy.",
      whyItMatters: "Media agencies decide which DSPs get recommended to clients, which SSP deals get prioritized, and how performance is reported. Cultivating strong agency relationships is a core commercial skill in adtech.",
      watchOutFor: "The agency's client is the brand — but the agency's financial interest is their own margin. These sometimes align and sometimes don't. Understanding when they diverge is what makes a senior adtech operator genuinely valuable.",
      deepDive: [
        { heading: "What agencies actually do — the three layers", body: "Strategy and planning: decide where a brand should advertise, which audiences to reach, which channels make sense. Buying: execute the actual media purchases — negotiating IO deals, setting up programmatic campaigns in DSPs, managing PMPs. Measurement and reporting: prove to the client that the money worked. Agencies own the reporting layer, which is why they have leverage — they decide what the client sees." },
        { heading: "Why brands still use agencies even if they can run campaigns themselves", body: "Scale and buying leverage: GroupM's $60B in annual spend gives it negotiating power no individual brand can match. Breadth: running programmatic is one skill — planning across TV, OOH, print, social, search, programmatic, and retail media simultaneously requires a team of specialists most brands can't afford to hire. Speed: an agency can launch a campaign across 15 markets in two weeks. Building in-house capability to do that takes years." },
        { heading: "The in-housing trend", body: "Performance marketing (Meta, Google) is increasingly managed in-house — brands with enough sophistication move faster and cheaper without an agency layer. Programmatic buying follows when spend exceeds roughly €20M. But full in-housing is rare because breadth of channel expertise is genuinely hard to replicate. The realistic model is a hybrid: in-house for performance channels, agency for brand, planning, and specialist channels." }
      ]
    }
  },
  {
    id: 'trading-desk', clusterId: 'players', name: 'Trading Desk',
    def: "The programmatic buying unit inside a media agency or holdco. Runs campaigns in DSPs, manages deal IDs, optimizes bidding, handles day-to-day campaign operations. The people a DSP account manager speaks to most often. Also exists as an independent entity — e.g. Xaxis, which is GroupM's trading desk.",
    related: ['media-agency','holding-company','dsp','pmp','principal-media','groupm'],
    article: {
      summary: "Trading desks are your primary operational counterpart in DSP sales. They control the actual spend flow. A good relationship with a trading desk — built on being genuinely useful — is more commercially durable than a relationship with a senior executive who never touches the platform.",
      howItWorks: "The trading desk receives a campaign brief and budget from the media planning team. They set up campaigns in one or more DSPs — defining targeting, bidding strategy, deal IDs, creative assignments, and measurement. They optimize daily and report back.",
      whyItMatters: "Trading desks are where strategy becomes execution. They're also where principal media decisions get made operationally — which DSP to use, which deal IDs to prioritize, how to route spend.",
      watchOutFor: "Some holdco trading desks operate as profit centers — they charge clients a managed service fee on top of the media cost. This is disclosed. Principal media is the undisclosed version of the same idea."
    }
  },
  {
    id: 'in-housing', clusterId: 'players', name: 'In-Housing',
    def: "The practice of brands building internal teams to run media buying directly — without agency intermediation. Most advanced in performance marketing (Meta, Google). Growing in programmatic for brands with sufficient scale (typically €20M+ in annual programmatic spend).",
    related: ['media-agency','trading-desk','dsp','the-trade-desk','principal-media','log-level-data'],
    article: {
      summary: "In-housing is the structural response to the principal media and transparency problems. If an agency's incentives don't align with yours, the solution is to remove the agency from the transaction.",
      howItWorks: "A brand builds an internal team of programmatic traders, data analysts, and tech specialists. They hold their own DSP seat (often TTD) — meaning they contract directly with the DSP, own their own data, and see their own log-level reporting without an agency layer in between. The brand pays the DSP directly.",
      whyItMatters: "In-housing eliminates the data opacity problem entirely. The brand owns its own log-level data, can audit every impression, and has no intermediary with a conflicting financial interest. Performance marketing in-housing also tends to outperform agency management because internal teams know the product, iterate faster, and have no incentive to obscure performance.",
      watchOutFor: "In-housing the entire media function is rarely viable for brands under €50M in annual media spend. The cost of hiring a full team of specialists (programmatic traders, data scientists, analytics engineers, brand planners) exceeds the margin savings below a certain scale. The realistic model is selective in-housing of channels where conflicts are highest and complexity is manageable.",
      deepDive: [
        { heading: "Three forces driving in-housing in 2026", body: "First: transparency pressure — brands discovered principal media margins through audits and demanded control. Second: direct platform relationships — TTD, Meta, and Google all actively cultivate brand-direct accounts, making the technical barrier to in-housing lower. Third: consultancies moving in — Accenture Song, Deloitte Digital, and similar firms offer managed in-house services (they run the campaigns using the brand's own seat and data) as an alternative to traditional agency relationships." },
        { heading: "What agencies do in response", body: "The holdcos that survive long-term are those that own proprietary technology and data — like Publicis with Epsilon and LiveRamp — rather than those whose value was purely in buying leverage and opacity. The shift is from 'we buy better than you can' to 'we have data you can't access independently.'" }
      ]
    }
  },
  {
    id: 'atd', clusterId: 'players', name: 'Agency Trading Desk (ATD)',
    def: "A centralized programmatic buying unit inside a holding company that runs campaigns across all agencies beneath it. The original model for bringing programmatic expertise in-house at scale. Examples: Xaxis (WPP), Publicis Media Technologies (Publicis), Accuen (Omnicom).",
    related: ['trading-desk','holding-company','groupm','dsp','principal-media']
  },

  // ── TRANSPARENCY & COMMERCIAL ──────────────────────────────
  {
    id: 'principal-media', clusterId: 'commercial', name: 'Principal Media',
    def: "A trading model where an agency buys ad inventory with its own money, takes ownership of it, then resells it to clients at a marked-up price. The agency acts as a principal (trading on its own account) rather than an agent (spending the client's money transparently). Legal and widespread among holdcos, but the margin is rarely disclosed.",
    related: ['holding-company','media-agency','trading-desk','the-trade-desk','publicis','log-level-data','io','spo'],
    article: {
      summary: "Principal media is the most commercially significant transparency debate in agency land right now. The agency buys inventory wholesale — often via their own trading desk or DSP — and resells it to clients at retail. The difference is profit.",
      howItWorks: "The agency negotiates bulk inventory deals directly with publishers or SSPs at discounted rates. They bill the client at a higher CPM, keeping the margin. Unlike a transparent agency fee (e.g. 10% of spend), the margin is embedded in the media cost itself — invisible unless the client audits the supply chain.",
      whyItMatters: "The agency's financial interest (buy cheap, sell high) directly conflicts with the client's interest (buy the best inventory). An agency running principal media has an incentive to push its own inventory over better-performing alternatives. This is what drove the Publicis vs TTD dispute — TTD's transparency tools made those margins visible.",
      watchOutFor: "Contracts that include 'non-disclosed' or 'undisclosed' buying clauses give agencies the legal right to trade as principal. Sophisticated advertisers now explicitly prohibit principal media in their agency contracts or require full cost disclosure.",
      deepDive: [
        { heading: "Why it's called 'principal' media", body: "The word 'principal' comes from its legal meaning, not 'most important.' In contract law, a principal is a party acting on their own behalf — as opposed to an agent acting on someone else's behalf. Traditionally, agencies act as agents: they spend the client's money, on the client's behalf, in the client's interest. Principal media flips this. The agency acts as a principal: it buys inventory with its own money first, takes ownership, then resells. The name describes the legal role the agency is playing." },
        { heading: "How it works operationally (vs programmatic RTB)", body: "Principal media doesn't happen in the real-time auction — you can't pre-buy RTB impressions because they don't exist until a user loads a page. It operates in guaranteed and reserved deals: Programmatic Guaranteed (PG) deals where the agency negotiates a fixed price and guaranteed volume directly with a publisher. Direct IO deals — old-school insertion orders where the agency buys inventory at a wholesale rate (say €5 CPM) and bills the client at retail (€8 CPM). The €3 margin is the principal media profit. The client sees a line item called 'premium display' with no visibility into what was actually paid." },
        { heading: "Why TTD's tools specifically threaten this model", body: "TTD's log-level data gives clients access to impression-level cost data from their campaigns. If a client has direct data access from TTD, they can see exactly what each impression cost at the auction level. If they compare that against what the agency billed — the margin is visible. This is why Publicis prefers clients to buy through Epsilon (Publicis's own DSP) where Publicis controls the data and reporting layer. TTD, as an external platform, always carried the risk that data could leak around Publicis's reporting layer. Eventually it did." }
      ]
    }
  },
  {
    id: 'log-level-data', clusterId: 'measurement', name: 'Log-Level Data',
    def: "Raw, impression-level data from a programmatic campaign — every single ad impression logged individually with its cost, publisher, placement, audience signal, timestamp, and outcome. The most granular form of campaign data. Gives advertisers the ability to independently audit what they paid and what they got.",
    related: ['principal-media','the-trade-desk','media-agency','measurement','click-id','bid-request'],
    article: {
      summary: "Log-level data is the audit trail of programmatic advertising. When a client has direct access to it, they can independently verify every impression, every cost, and every outcome — without relying on the agency's aggregated report.",
      howItWorks: "Every time an ad impression is served, a log entry is created: impression ID, timestamp, publisher domain, deal ID, CPM paid, creative ID, user/device signals, and outcome events (click, conversion). These logs are generated by the DSP. In TTD, they can be exported to a client's own data warehouse. This is 'log-level data access.'",
      whyItMatters: "Log-level data is the mechanism that makes principal media margins visible. If the DSP shows the client paid €4.20 CPM and the agency billed €7.50 CPM, the discrepancy is provable. This is why control of log-level data access has become one of the most commercially contested issues in agency-client contracts.",
      watchOutFor: "Agencies routinely negotiate contracts where log-level data goes to the agency, not the client. The client sees an aggregated report the agency produces — which can be curated to show performance metrics without revealing cost details. Sophisticated advertisers now explicitly require direct log-level data access in their contracts.",
      deepDive: [
        { heading: "Why most clients don't have it", body: "When an agency sets up a campaign in TTD, the TTD account belongs to the agency — not the client. The client has no login, no direct platform access, and no way to pull log-level data independently. This is the default state. The client trusts the agency to report accurately. Most never think to question it." },
        { heading: "The two ways clients get access", body: "First: contract negotiation. Sophisticated advertisers, particularly large ones with in-house programmatic teams, increasingly demand in their agency contracts that they own their data and have direct platform access. Second: TTD's own push. TTD has a commercial incentive to build direct relationships with brands. They actively encourage advertisers to request their own data access and even their own TTD seat. A brand with a direct TTD relationship is harder for an agency to move off the platform — and the brand can see raw data independently." },
        { heading: "What a discrepancy actually looks like", body: "Agency buys 10 million impressions. Log-level data shows average clearing price of €4.20 CPM. Client was billed €7.50 CPM. That's a €33,000 gap on one campaign. Multiply across a large client's annual spend and the principal media margin becomes very large — and very visible. This is exactly what the Publicis audit against TTD was looking for." }
      ]
    }
  },
  {
    id: 'insertion-order', clusterId: 'commercial', name: 'Insertion Order (IO)',
    def: "A formal contract between an advertiser (or agency) and a publisher specifying what inventory will be delivered, at what price, in what volume, and over what time period. The traditional pre-programmatic buying method — still widely used for premium, guaranteed placements.",
    related: ['pg','pmp','gam','line-item','principal-media','trading-desk'],
    article: {
      summary: "The IO is the original media buying contract. Before programmatic existed, every ad deal was an IO. Programmatic didn't kill the IO — it just automated the delivery layer underneath it.",
      howItWorks: "The agency or advertiser negotiates directly with the publisher's sales team. They agree on placement, format, dates, volume, and CPM. The publisher's ad ops team traffics the campaign in GAM as a direct line item with the highest priority — meaning it serves before any programmatic demand.",
      whyItMatters: "IOs are where principal media margins are easiest to hide. The agency signs the IO with the publisher at one price, bills the client at another. No auction, no independent clearing price, no transparency unless the client audits the contract.",
      watchOutFor: "IO cancellation terms. Most IOs have a cancellation window (typically 14-30 days) with financial penalties. Agencies sometimes sign IOs speculatively — buying inventory before the client has approved the campaign — creating financial exposure if the campaign doesn't run."
    }
  },
  {
    id: 'openpath', clusterId: 'auction', name: 'OpenPath (TTD)',
    def: "The Trade Desk's direct supply path product — connects advertisers directly to publishers without SSP intermediaries. Publishers plug into TTD's demand and pay a ~5% fee on spend. Positioned as a transparency and SPO play. Became controversial when WPP and Dentsu exited citing hidden fees.",
    related: ['spo','the-trade-desk','publishers','header-bidding','pg','principal-media','log-level-data'],
    article: {
      summary: "OpenPath is TTD's answer to the SPO movement — cut the intermediary hops, reduce fees, give publishers better yield and advertisers more transparency. It also gives TTD more control over the supply chain, which is where the tension with agencies comes in.",
      howItWorks: "Publishers integrate OpenPath directly into their header bidding setup instead of (or alongside) an SSP. Their inventory connects directly to TTD's demand. TTD pays the publisher directly; no SSP fee is taken. Publishers pay TTD ~5% of resulting spend.",
      whyItMatters: "When a campaign runs through OpenPath, the full cost is visible — no SSP margin, no reseller markup. This is exactly what makes agencies running principal media uncomfortable. The transparency that OpenPath creates for advertisers is the same transparency that exposes agency margins.",
      watchOutFor: "The Predictive Clearing fee (bid shading) still applies on OpenPath inventory — which critics argue makes no sense since TTD has full pricing visibility on its own pipes. The 'open' branding created expectations TTD's fee structure didn't fully meet."
    }
  },
  {
    id: 'kokai', clusterId: 'auction', name: 'Kokai (TTD)',
    def: "The Trade Desk's AI-powered campaign management platform, launched 2024. Replaced the legacy UI. Uses ML to automate optimization across targeting, bidding, and supply selection. Central to the Publicis dispute — the audit found issues with how Kokai's default settings affected fees and campaign controls.",
    related: ['the-trade-desk','smart-bidding','dsp','openpath','principal-media'],
    article: {
      summary: "Kokai is TTD's attempt to make AI-driven optimization the default for every campaign. Nearly all TTD clients now use it. But its two modes — Performance (algorithm controls everything) and Control (trader controls everything) — create a fee structure that punishes traders for wanting manual control.",
      howItWorks: "In Performance mode, Kokai automatically selects inventory, adjusts bids, applies audience segments from the data marketplace, and optimizes toward the campaign goal. In Control mode, traders can override decisions — but often triggering a different, more expensive fee menu.",
      whyItMatters: "The Publicis audit specifically flagged Kokai's default settings as problematic. When features are on by default and charge fees, clients who don't know to turn them off pay for things they didn't consciously choose.",
      watchOutFor: "Data marketplace segments that Kokai enables by default can add meaningful cost per impression. Always audit which data packages are active in a campaign — especially on new setups where defaults haven't been reviewed."
    }
  },

  // ── IDENTITY ADDITIONS ────────────────────────────────────
  { id: 'persona-id', clusterId: 'identity', name: 'Persona ID', def: "LoopMe's proprietary identity graph spanning ~2B consented devices. Used to connect mobile, web, and CTV impressions to the same user without relying on third-party cookies or IDFA.", related: ['identity-resolution','loopme','first-party-data','dmp'] },
  { id: 'contextual-data', clusterId: 'identity', name: 'Contextual Data', def: 'Signals about the page or app an impression appears on — topic, keywords, sentiment, brand-safety category, attention metrics. Cookie-independent. One of the three pillars of curation alongside audience data and supply-chain integrity.', related: ['curation','infolinks','third-party-cookies','privacy-by-design','contextual-targeting'] },
  {
    id: 'audience-segments', clusterId: 'identity', name: 'Audience Segments',
    def: 'The ID-based way to describe an audience in a bid request. An audience is defined in advance, given a code in a shared taxonomy (like IAB Audience Taxonomy v1.1), and users carry the IDs they belong to. Matching is a yes/no overlap check — sub-microsecond per impression.',
    related: ['audience-embeddings','iab-audience-taxonomy','bid-request','dmp','seller-defined-audiences'],
    article: {
      summary: "Segments are the established way to answer 'is this user in my target audience?' Someone pre-defines the audience, assigns it a taxonomy code, and the match becomes a simple sub-microsecond ID lookup.",
      howItWorks: "An audience gets a code in a shared dictionary like IAB Tech Lab's Audience Taxonomy. The bid request carries the IDs a user has; the campaign lists the IDs it wants. Either there's overlap or there isn't — a yes/no answer per impression. Set logic is clean: 'A AND B', 'A AND NOT C' work directly.",
      whyItMatters: "Segments give three things embeddings struggle with: clean set logic, a readable audit trail (the answer to 'why did this ad serve?' is a human-readable segment name), and automatic dedup when providers share the taxonomy.",
      watchOutFor: "Segments break when the audience was never pre-defined — no ID exists to ask for. Names don't line up across providers (one vendor's 'luxury auto intender' isn't another's 'auto premium shopper'). Building against one provider's IDs creates lock-in to their taxonomy.",
      deepDive: [
        { heading: "Segments vs embeddings — which wins?", body: "Neither definitively. Segments win on auditability, clean set logic, and regulatory compliance — a compliance reviewer can read 'IAB-1032: Auto Intenders' and understand it. Embeddings win on flexibility, nuance, and performance ceiling — any audience you can describe in a sentence exists the moment you embed it, and the personalization stacks behind search and recommendations all run on embeddings. The IAB Tech Lab spec now keeps both in the bid request so the choice stays open." },
        { heading: "The provider lock-in problem", body: "Build a campaign against Segment Provider A's taxonomy and you're dependent on their update schedule, their user matching, and their price. When they discontinue a segment ID, your campaign breaks. This is why the push toward shared, open taxonomies (like IAB's) matters — standardization reduces lock-in and enables dedup across providers." }
      ]
    }
  },
  {
    id: 'audience-embeddings', clusterId: 'identity', name: 'Audience Embeddings',
    def: 'The vector-based way to describe an audience. The audience is described in plain text, run through a model, and stored as an array of numbers (a vector). Matching is a similarity score between the user\'s vector and the campaign\'s frozen audience vector — not a yes/no, but a closeness score.',
    related: ['audience-segments','iab-audience-taxonomy','bid-request','identity-resolution','contextual-targeting'],
    article: {
      summary: "Embeddings are the ML-native way to match audiences. Instead of pre-defined IDs, an audience is described in a sentence, embedded into a vector, and matched by closeness — so any audience you can describe exists the moment you embed it.",
      howItWorks: "The audience description is run through a model once, at campaign setup, and frozen into a vector. At bid time, the user side already carries its own pre-computed vector — built from their behavior, not from a sentence typed in real time. The match is one number (cosine similarity) against a cutoff. No model runs at bid time.",
      whyItMatters: "Embeddings handle plain-language audiences with no pre-definition, capture nuance a taxonomy can't encode, and have a higher performance ceiling. The personalization stacks behind search, recommendations, and feed ranking all run on embeddings.",
      watchOutFor: "Both sides must use the same model or vectors can't be compared. Model version upgrades break old vectors — everyone must migrate together. No clean set-logic equivalent. The audit trail is two arrays of numbers — fine for an engineer, useless for a compliance reviewer.",
      deepDive: [
        { heading: "The question you should ask: how does the DSP know what sentence to target?", body: "It doesn't — not at bid time. The sentence is turned into a vector once, at campaign setup, and frozen. At bid time, both sides are just numbers. The DSP isn't processing language in real-time auctions; it's doing a fast vector similarity calculation against pre-computed values." },
        { heading: "Who computes the user's vector — and this is where it gets hard", body: "Someone has to have observed the user's behavior and embedded that into a vector ahead of time. That's a data partner or the platform itself. The user doesn't arrive with a vector from nowhere. And critically: the user's behavior vector and the campaign's audience vector must come from the same embedding model to be comparable. This 'model agreement' requirement is the real blocker to cross-company embedding-based targeting at scale." },
        { heading: "Why this matters for adtech's future", body: "Embeddings are already the dominant paradigm in consumer internet personalization. The shift from segment-based to embedding-based targeting in programmatic advertising is directionally inevitable — but the operational requirements (model standardization, vector infrastructure, compute cost) mean segments will remain dominant in the near term, especially for privacy-sensitive applications where auditability is legally required." }
      ]
    }
  },
  { id: 'iab-audience-taxonomy', clusterId: 'identity', name: 'IAB Audience Taxonomy', def: "IAB Tech Lab's standardized dictionary of audience definitions (current: v1.1), giving each audience a shared code. The backbone of segment-based targeting — when providers share the taxonomy, the same audience ID means the same thing across the ecosystem, enabling automatic dedup.", related: ['audience-segments','seller-defined-audiences','bid-request','dmp'] },

  // ── DATA ADDITIONS ────────────────────────────────────────
  { id: 'dmp', clusterId: 'data', name: 'DMP', def: 'Data Management Platform — system that ingests, organizes, and segments audience data, combining first-party, second-party, and third-party signals. Powers targeting and curation. LoopMe runs one of the largest, with ~2B consented devices.', related: ['first-party-data','activation','onboarding','curation','loopme','audience-segments'] },
  { id: 'purchaseloop', clusterId: 'data', name: 'PurchaseLoop', def: "LoopMe's outcome-based measurement and optimization product. Connects ad exposure to real-world purchase behavior using device-level matching with retailer data partners.", related: ['loopme','measurement'] },

  // ── PRIVACY ADDITIONS ─────────────────────────────────────
  { id: 'consent-management', clusterId: 'privacy', name: 'Consent Management', def: 'The process of collecting, storing, and respecting user choices about tracking. CMPs are the tools that handle this. The output is the consent string that travels through every bid request.', related: ['gdpr','third-party-cookies','cmp','consent-string','tcf'] },

  // ── AD QUALITY ADDITIONS ──────────────────────────────────
  { id: 'mfa', clusterId: 'adquality', name: 'MFA (Made-for-Advertising)', def: 'Low-quality websites engineered to attract programmatic ad spend rather than serve real audiences. Heavy ads-to-content ratio, clickbait headlines, high IVT levels. A major waste driver in open exchanges — curation and direct supply paths avoid it.', related: ['ivt','curation','chartboost','ad-exchange','brand-safety','spo'] },

  // ── DEEP-LINK & IPD ───────────────────────────────────────
  {
    id: 'deep-link', clusterId: 'measurement', name: 'Deep Link',
    def: 'A URI that opens a mobile app directly to a specific screen rather than the home page. In adtech, deep links are passed in bid responses so that clicking an ad takes a user straight to a product page inside an app — not a browser redirect.',
    related: ['mmp','mobile-in-app','click-id','bid-response'],
    article: {
      summary: "A deep link is a URI scheme (e.g. myshop://product?id=123) that bypasses an app's home screen and drops the user exactly where the ad promised. If the app isn't installed, a fallback URL sends them to the App Store or a web page instead.",
      howItWorks: "The DSP includes two URLs in the bid response: a deeplink (myshop://product?id=123) and a fallback (https://play.google.com/store/...). When the user clicks, the publisher SDK tries the deeplink first. If the app is installed, it opens directly on the product. If not, the SDK fires the fallback. The MMP logs the click from whichever path fired and attributes the conversion.",
      whyItMatters: "Deep links dramatically reduce friction between ad click and intended action. A user clicking a sneaker ad who lands on the product page converts far better than one dumped on the app home screen.",
      watchOutFor: "If the fallback URL is missing or broken, users on devices without the app see a dead end. Always test both the deep link and fallback path before launching."
    }
  },
  {
    id: 'ipd', clusterId: 'adquality', name: 'Inventory Partner Domain',
    def: 'A bid request field (app.ext.inventorypartnerdomain) that identifies the actual content owner when content is distributed by a third-party platform. Tells DSPs where to validate ads.txt — with the content owner, not the distributor.',
    related: ['ads-txt','spo','schain','openrtb','publishers'],
    article: {
      summary: "When a CTV app like Pluto TV carries content owned by Crackle, the ad slot appears on Pluto but monetization rights belong to Crackle. Without IPD, a DSP would validate ads.txt against Pluto — finding no authorized seller — and reject the bid. IPD tells the DSP to validate against crackle.com instead.",
      howItWorks: "The SSP or app operator includes the inventorypartnerdomain field in the bid request pointing to the content owner's domain. The DSP fetches the ads.txt or app-ads.txt file from that domain and checks whether the SSP running the auction is listed as an authorized seller.",
      whyItMatters: "Without IPD, legitimate content deals between distributors and content owners look identical to ad fraud to a DSP's fraud filters. Publishers lose revenue on valid inventory that gets blocked.",
      watchOutFor: "The content owner must list the SSP in their ads.txt/app-ads.txt file for IPD validation to pass. A missing or mismatched entry still results in blocked bids, even if the deal is completely legitimate."
    }
  },

  // ── PERFORMANCE ADDITIONS ─────────────────────────────────
  { id: 'cpl', clusterId: 'performance', name: 'CPL', def: 'Cost Per Lead — what an advertiser pays per lead form submission. Used in B2B, SaaS, and services where the sales cycle is long and a direct purchase in the first session is unrealistic.', related: ['cpa','cpc','campaign-objective','tofu-mofu-bofu'] },
];

export async function addAllTerms() {
  let batch = writeBatch(db);
  let count = 0;

  for (const term of allNewTerms) {
    const ref = doc(db, 'terms', term.id);
    batch.set(ref, term);
    count++;
    if (count % 400 === 0) {
      await batch.commit();
      batch = writeBatch(db);
    }
  }

  await batch.commit();
  console.log(`Done. Added ${allNewTerms.length} terms.`);
}
