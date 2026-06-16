import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync("./serviceAccount.json", "utf8"),
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const terms = [
  // ── CURATION ──────────────────────────────────────────────
  {
    id: "curation",
    clusterId: "auction",
    name: "Curation",
    def: "Practice of wrapping audience data, contextual signals, and supply-chain integrity around inventory on the SSP side and packaging it as ready-to-buy PMP deals. Sits between SSPs and DSPs. Growing fast because it solves addressability without forcing DSPs to integrate every data source.",
    related: [
      "curator",
      "deals-library",
      "pmp",
      "dmp",
      "ssp",
      "dsp",
      "bid-enrichment",
      "sell-side-targeting",
      "contextual-data",
      "spo",
    ],
    article: {
      summary:
        "Curation is the modern answer to the addressability problem. Instead of every DSP integrating every data source, a curator does the work once on the sell side and sells the result as a deal ID anyone can buy.",
      howItWorks:
        'A curator (Audigent, Multilocal, Magnite) sits at the SSP layer with access to bid requests, audience data, and contextual signals. They build packages — "premium auto-intender audience on brand-safe sports inventory" — and give each a deal ID. Any DSP can target it. The curator earns a cut of every winning bid.',
      whyItMatters:
        "Curation moves targeting intelligence from buy side to sell side. The SSP sees every impression in the auction; the DSP only sees a sampled fragment. Sell-side targeting can use signals DSPs literally cannot afford to compute.",
      watchOutFor:
        "Curation fees stack on top of SSP and DSP fees. Audit which curated deals deliver real lift versus which just add cost to inventory you could buy directly.",
    },
  },
  {
    id: "curator",
    clusterId: "players",
    name: "Curator",
    def: "New player type that sits SSP-side and packages audience data plus inventory into ready-to-buy PMP deals for traders. Canonical example: Audigent. Others: Multilocal, Infolinks, IAS Curation, LoopMe.",
    related: [
      "curation",
      "deals-library",
      "pmp",
      "ssp",
      "dsp",
      "audigent",
      "magnite",
      "multilocal",
      "infolinks",
      "pubmatic",
      "loopme",
    ],
  },
  {
    id: "bid-enrichment",
    clusterId: "auction",
    name: "Bid Enrichment",
    def: "Technical mechanism behind curation. As an OpenRTB bid request flows from SSP toward DSPs, the curator intercepts it and injects extra signals — audience IDs, attention scores, contextual labels, supply-quality flags. The enriched bid is more targetable, so it sells for more.",
    related: ["curation", "bid-request", "openrtb", "ssp", "audigent"],
  },
  {
    id: "sell-side-targeting",
    clusterId: "auction",
    name: "Sell-Side Targeting",
    def: "The intellectual frame for what curation actually is. Historically targeting lived on the DSP (buy side); curation shifts that logic to the SSP/curator side. Significant because DSPs only see a fragment of the bidstream while SSPs see all of it.",
    related: ["curation", "curator", "bidstream", "dsp", "ssp"],
  },
  {
    id: "deals-library",
    clusterId: "auction",
    name: "Deals Library",
    def: "Productized curation storefront — a catalog of pre-packaged PMP deals a trader can browse and grab a deal ID from. LoopMe's Premium Deals Library is the canonical example.",
    related: ["curation", "curator", "pmp", "loopme", "always-on-pmp"],
  },
  {
    id: "always-on-pmp",
    clusterId: "auction",
    name: "Always-on PMP",
    def: "A PMP deal that stays continuously available rather than being negotiated per campaign. The default model in curation deals libraries — trader picks an existing deal ID off the shelf instead of setting up a new one each time.",
    related: ["pmp", "deals-library", "curation"],
  },

  // ── CURATOR COMPANIES ─────────────────────────────────────
  {
    id: "audigent",
    clusterId: "players",
    name: "Audigent",
    def: "Canonical pure-play curator. Famous for co-locating in SSP data centers to enrich bids in real time before they reach DSPs. Often cited as the textbook example of what a modern curator does.",
    related: ["curator", "curation", "bid-enrichment", "ssp"],
  },
  {
    id: "multilocal",
    clusterId: "players",
    name: "Multilocal",
    def: "UK-based pure-play curator. One of the early specialists who defined the category before SSPs moved in. Builds curated deal packages targeted at local/regional advertisers.",
    related: ["curator", "curation", "audigent", "infolinks"],
  },
  {
    id: "infolinks",
    clusterId: "players",
    name: "Infolinks",
    def: "Originally a contextual advertising company, repositioned as a curator. Combines contextual signals with audience data to build curated deal packages. Example of how non-curator companies pivoted into the category.",
    related: [
      "curator",
      "curation",
      "contextual-data",
      "audigent",
      "multilocal",
    ],
  },
  {
    id: "magnite",
    clusterId: "players",
    name: "Magnite",
    def: "Largest independent SSP. Now a major curation player — curation revenue grew 100%+ YoY in 2024. Shows the SSP-vs-curator line is blurring as big SSPs build curation businesses on top of their auction infrastructure.",
    related: ["ssp", "curator", "curation", "ad-exchange"],
  },
  {
    id: "pubmatic",
    clusterId: "players",
    name: "PubMatic",
    def: "Major independent SSP. Runs its own curation product (Activate) letting buyers transact directly with publishers via curated deals. Another sign that SSPs are absorbing curation in-house.",
    related: ["ssp", "curation", "magnite"],
  },
  {
    id: "loopme",
    clusterId: "players",
    name: "LoopMe",
    def: "AI-driven brand-performance company. Operates an exchange, owns Chartboost (mobile in-app), runs the Persona ID graph, and sells the Premium Deals Library as its curation product. Full-stack adtech player.",
    related: [
      "chartboost",
      "curator",
      "deals-library",
      "persona-id",
      "ad-exchange",
      "mobile-in-app",
      "purchaseloop",
    ],
  },
  {
    id: "chartboost",
    clusterId: "players",
    name: "Chartboost",
    def: "Mobile in-app and mobile-gaming monetization platform acquired by LoopMe. Gives LoopMe direct, owned-and-operated supply in the gaming channel — important for avoiding open-marketplace quality issues like MFA.",
    related: ["loopme", "mobile-in-app", "mobile-gaming", "ivt", "mfa"],
  },

  // ── DSP COMPETITORS ───────────────────────────────────────
  {
    id: "walled-garden",
    clusterId: "players",
    name: "Walled Garden",
    def: "A platform that owns inventory, audience data, and the buying interface simultaneously — keeping all three inside its own ecosystem. Google, Meta, and Amazon are the canonical examples. Advertisers can buy inside but can't see under the hood.",
    related: [
      "dv360",
      "amazon-dsp",
      "the-trade-desk",
      "openpath",
      "principal-media",
      "first-party-data",
    ],
    article: {
      summary:
        "Walled gardens are platforms where the same company owns the audience data, the ad inventory, and the buying tool. You can buy inside, but you can't compare their data to external data, audit their measurement, or take your data out.",
      howItWorks:
        "When you buy on Meta, Meta decides who sees your ad, how it performed, and what you pay. You never see the raw auction data. When you buy through DV360, Google can see your campaign strategy, your audiences, and your bids — while also operating the SSP and publisher ad server on the other side of the same auction.",
      whyItMatters:
        "Walled gardens control the majority of digital ad spend globally. Google and Meta alone take roughly 50% of digital advertising revenue. Their data advantages are real — but so is the conflict of interest.",
      watchOutFor:
        "Attribution inside walled gardens is always self-reported. Meta tells you how many conversions Meta drove. Google tells you how many Google drove. Both will claim credit for the same purchase if both touchpoints exist. An MMP or independent measurement tool is the only way to get a neutral view.",
      deepDive: [
        {
          heading: "Why TTD's whole brand is built against this",
          body: "The Trade Desk explicitly positions itself as the champion of the 'open internet' against walled gardens. Their argument: they don't own media, so they're not conflicted. When TTD recommends you buy a publisher, they have no financial stake in which publisher wins. When Google's DV360 recommends you buy YouTube, Google profits from both sides of the transaction.",
        },
        {
          heading: "The data asymmetry problem",
          body: "Walled gardens know things about their users that they will never share with advertisers — purchase history, search intent, social graph, location history. They use this data to sell you audiences, but you can never audit whether the audience was what they said it was. You see a CPM and a conversion count. You don't see the underlying signal.",
        },
        {
          heading: "Why advertisers still use them",
          body: "Because the data works. Meta's targeting, for all its opacity, produces measurable results. Google's intent data from Search is genuinely unmatched for certain categories. The tension isn't 'walled gardens are bad' — it's that their opacity makes it impossible to know if you're getting fair value.",
        },
      ],
    },
  },
  {
    id: "dv360",
    clusterId: "players",
    name: "DV360 (Google)",
    def: "Google's enterprise DSP — Display & Video 360. The largest DSP by spend volume. Tightly integrated with Google's own inventory (YouTube, GDN) and Google Ad Manager on the publisher side. The canonical walled garden DSP.",
    related: [
      "walled-garden",
      "the-trade-desk",
      "amazon-dsp",
      "gam",
      "openrtb",
      "dsp",
    ],
    article: {
      summary:
        "DV360 is Google's buy-side product for programmatic advertising. It's the most widely used DSP globally — but buying through it means buying inside Google's ecosystem, where Google operates on both sides of the auction.",
      howItWorks:
        "DV360 connects to the open exchange and to Google's proprietary inventory. Campaigns integrate with Campaign Manager 360, Google Analytics, and Google Audience Center. Bidding happens across Google's exchange and third-party exchanges.",
      whyItMatters:
        "DV360's integration with YouTube is its primary competitive advantage — YouTube is the dominant premium video platform globally, and you can only buy it programmatically through Google. For any advertiser with significant video budgets, DV360 is effectively unavoidable.",
      watchOutFor:
        "The conflict of interest is structural. Google operates DV360 (buy side), Google Ad Manager (publisher ad server and SSP), and YouTube (premium inventory). Google's ad tech stack is under active regulatory scrutiny in multiple jurisdictions.",
    },
  },
  {
    id: "amazon-dsp",
    clusterId: "players",
    name: "Amazon DSP",
    def: "Amazon's programmatic DSP. Primary competitive advantage: access to Amazon's first-party purchase data — the most powerful intent signal in digital advertising. Strongest for retail and ecommerce advertisers. Growing fast in CTV through Prime Video.",
    related: [
      "walled-garden",
      "the-trade-desk",
      "dv360",
      "dsp",
      "first-party-data",
      "ctv",
    ],
    article: {
      summary:
        "Amazon DSP's unique value is purchase data. While Google knows what you search for and Meta knows who you are socially, Amazon knows what you actually buy. For retail advertisers, this intent signal is unmatched.",
      howItWorks:
        "Campaigns can run on Amazon-owned properties (Amazon.com, IMDb, Twitch, Fire TV) and on third-party inventory. Amazon's audience segments — built from purchase history and browsing on Amazon — can be applied to off-Amazon inventory.",
      whyItMatters:
        "Amazon's retail media network is the fastest-growing segment of digital advertising. Advertisers selling on Amazon can close-loop their campaigns — measure whether someone who saw an ad actually purchased on Amazon.",
      watchOutFor:
        "Amazon DSP is most powerful for advertisers with Amazon retail relationships. For non-Amazon sellers, the data advantage is less acute. Reporting tools are less mature than Google's or TTD's.",
    },
  },
  {
    id: "xandr",
    clusterId: "players",
    name: "Xandr (Microsoft)",
    def: "Microsoft's programmatic platform — has both a DSP (Xandr Invest) and an SSP (Xandr Monetize). Originally built by AT&T, acquired by Microsoft in 2022. Access to Microsoft and LinkedIn data. Strong in CTV and premium video.",
    related: ["the-trade-desk", "dsp", "ssp", "walled-garden", "ctv"],
    article: {
      summary:
        "Xandr is Microsoft's play in the open programmatic ecosystem. What makes it distinct from TTD is Microsoft's data layer — particularly LinkedIn's professional audience data, uniquely valuable for B2B advertisers.",
      howItWorks:
        "Xandr Invest (DSP) connects to Xandr Monetize (SSP) and to the broader open exchange. Microsoft/LinkedIn audience segments can be applied to open-web and CTV inventory.",
      whyItMatters:
        "LinkedIn's professional data — job title, company, seniority, industry — is not available anywhere else at scale. For B2B advertisers, Xandr offers reach against LinkedIn audiences on open-web inventory at a much lower CPM than LinkedIn's own platform.",
      watchOutFor:
        "Xandr's market position is in transition post-acquisition. The product roadmap has changed significantly under Microsoft ownership.",
    },
  },

  // ── AGENCY ECOSYSTEM ──────────────────────────────────────
  {
    id: "holding-company",
    clusterId: "players",
    name: "Holding Company (Holdco)",
    def: "A parent corporation owning multiple agency brands under one roof. The four dominant holdcos (WPP, Publicis, Omnicom, IPG) control the majority of global advertising spend. In adtech, their media arms are the largest single source of DSP spend.",
    related: [
      "big-4",
      "publicis",
      "trading-desk",
      "media-agency",
      "groupm",
      "the-trade-desk",
      "principal-media",
    ],
    article: {
      summary:
        "Holdcos matter in adtech because of scale. GroupM alone controls roughly $60B in annual media spend. When a holdco recommends or bans a DSP — as Publicis did with TTD — the financial impact is immediate and severe. TTD's stock dropped 13% within days.",
      howItWorks:
        "The holdco sits above everything. Underneath sit media agency networks (GroupM, Publicis Media), creative networks (Ogilvy, BBDO), and specialist units. Each operates semi-independently but benefits from the holdco's negotiating leverage with publishers, DSPs, and platforms.",
      whyItMatters:
        "Holdcos negotiate volume deals with DSPs and SSPs at rates individual agencies can't access. This leverage is the mechanism that enables principal media — the holdco buys inventory at bulk rates, individual agencies resell at retail to clients.",
      watchOutFor:
        "A holdco trading desk pushing a particular DSP may be doing so because of a volume rebate deal, not because it's the best tool for the client.",
      deepDive: [
        {
          heading: "Why the holdco model exists",
          body: "Consolidation started in the 1980s when agencies realized that owning multiple agencies gave them buying leverage. A TV network would give better rates to an agency controlling 20% of the TV market than one controlling 2%. That leverage logic extended to digital: GroupM's scale forces favorable terms from every platform it deals with.",
        },
        {
          heading: "The IPG-Omnicom merger (2025-2026)",
          body: "Omnicom announced the acquisition of IPG in late 2024. If completed, this creates a combined entity that rivals WPP and Publicis in scale. Further consolidation of buying power, more leverage over platforms, and potentially more opacity in principal media practices as the remaining holdcos become larger and harder to audit.",
        },
        {
          heading: "Epsilon — Publicis's data weapon",
          body: "Publicis's acquisition of Epsilon in 2019 for $4.4B gave Publicis a proprietary DSP, a first-party data graph, and CRM marketing capabilities. Combined with LiveRamp (2026), Publicis now controls identity infrastructure. No other holdco has equivalent owned data infrastructure.",
        },
      ],
    },
  },
  {
    id: "groupm",
    clusterId: "players",
    name: "GroupM",
    def: "WPP's media investment arm — the world's largest media buyer, controlling roughly $60B in annual spend across Mindshare, Wavemaker, EssenceMediacom, and others. When GroupM makes a platform decision, it moves markets.",
    related: [
      "big-4",
      "holding-company",
      "trading-desk",
      "media-agency",
      "the-trade-desk",
      "principal-media",
    ],
  },
  {
    id: "media-agency",
    clusterId: "players",
    name: "Media Agency",
    def: "The agency that plans and buys media on behalf of a brand — deciding where to advertise, negotiating deals, running programmatic campaigns in DSPs, and reporting performance. The actual operational buyer in the adtech ecosystem. Examples: Mindshare, Carat, Initiative, OMD, Starcom.",
    related: [
      "holding-company",
      "trading-desk",
      "groupm",
      "dsp",
      "principal-media",
      "insertion-order",
      "pmp",
    ],
    article: {
      summary:
        "Media agencies are the primary customer of every DSP, SSP, and adtech vendor. Understanding their structure and incentives is essential for anyone working in adtech commercially.",
      howItWorks:
        "A media agency receives a brief from a brand client. The planning team allocates budget across channels. The trading desk executes the programmatic portion in DSPs. The analytics team reports results. The agency earns disclosed fees — and potentially undisclosed margin on the media they buy.",
      whyItMatters:
        "Media agencies decide which DSPs get recommended to clients, which SSP deals get prioritized, and how performance is reported. Cultivating strong agency relationships is a core commercial skill in adtech.",
      watchOutFor:
        "The agency's client is the brand — but the agency's financial interest is their own margin. Understanding when these diverge is what makes a senior adtech operator genuinely valuable.",
      deepDive: [
        {
          heading: "What agencies actually do — the three layers",
          body: "Strategy and planning: decide where a brand should advertise, which audiences to reach, which channels make sense. Buying: execute media purchases — negotiating IO deals, setting up programmatic campaigns in DSPs, managing PMPs. Measurement and reporting: prove to the client that the money worked. Agencies own the reporting layer, which is why they have leverage — they decide what the client sees.",
        },
        {
          heading:
            "Why brands still use agencies even if they can run campaigns themselves",
          body: "Scale and buying leverage: GroupM's $60B in annual spend gives it negotiating power no individual brand can match. Breadth: planning across TV, OOH, print, social, search, programmatic, and retail media simultaneously requires a team of specialists most brands can't afford to hire. Speed: an agency can launch a campaign across 15 markets in two weeks. Building in-house capability takes years.",
        },
        {
          heading: "The in-housing trend",
          body: "Performance marketing (Meta, Google) is increasingly managed in-house. Programmatic buying follows when spend exceeds roughly €20M annually. But full in-housing is rare because breadth of channel expertise is hard to replicate. The realistic model is a hybrid: in-house for performance channels, agency for brand, planning, and specialist channels.",
        },
      ],
    },
  },
  {
    id: "trading-desk",
    clusterId: "players",
    name: "Trading Desk",
    def: "The programmatic buying unit inside a media agency or holdco. Runs campaigns in DSPs, manages deal IDs, optimizes bidding, handles day-to-day campaign operations. The people a DSP account manager speaks to most often. Also exists as an independent entity — e.g. Xaxis, which is GroupM's trading desk.",
    related: [
      "media-agency",
      "holding-company",
      "dsp",
      "pmp",
      "principal-media",
      "groupm",
    ],
    article: {
      summary:
        "Trading desks are your primary operational counterpart in DSP sales. They control the actual spend flow. A good relationship with a trading desk — built on being genuinely useful — is more commercially durable than a relationship with a senior executive who never touches the platform.",
      howItWorks:
        "The trading desk receives a campaign brief and budget from the media planning team. They set up campaigns in one or more DSPs — defining targeting, bidding strategy, deal IDs, creative assignments, and measurement. They optimize daily and report back.",
      whyItMatters:
        "Trading desks are where strategy becomes execution. They're also where principal media decisions get made operationally — which DSP to use, which deal IDs to prioritize, how to route spend.",
      watchOutFor:
        "Some holdco trading desks operate as profit centers — charging clients a managed service fee on top of the media cost. This is disclosed. Principal media is the undisclosed version of the same idea.",
    },
  },
  {
    id: "in-housing",
    clusterId: "players",
    name: "In-Housing",
    def: "The practice of brands building internal teams to run media buying directly — without agency intermediation. Most advanced in performance marketing (Meta, Google). Growing in programmatic for brands with sufficient scale (typically €20M+ in annual programmatic spend).",
    related: [
      "media-agency",
      "trading-desk",
      "dsp",
      "the-trade-desk",
      "principal-media",
      "log-level-data",
    ],
    article: {
      summary:
        "In-housing is the structural response to the principal media and transparency problems. If an agency's incentives don't align with yours, the solution is to remove the agency from the transaction.",
      howItWorks:
        "A brand builds an internal team of programmatic traders, data analysts, and tech specialists. They hold their own DSP seat — meaning they contract directly with the DSP, own their own data, and see their own log-level reporting without an agency layer. The brand pays the DSP directly.",
      whyItMatters:
        "In-housing eliminates the data opacity problem. The brand owns its own log-level data, can audit every impression, and has no intermediary with a conflicting financial interest.",
      watchOutFor:
        "In-housing the entire media function is rarely viable for brands under €50M in annual media spend. The cost of hiring a full specialist team exceeds the margin savings below a certain scale.",
      deepDive: [
        {
          heading: "Three forces driving in-housing in 2026",
          body: "First: transparency pressure — brands discovered principal media margins through audits and demanded control. Second: direct platform relationships — TTD, Meta, and Google all actively cultivate brand-direct accounts, lowering the technical barrier. Third: consultancies moving in — Accenture Song, Deloitte Digital offer managed in-house services (they run campaigns using the brand's own seat and data) as an alternative to traditional agency relationships.",
        },
        {
          heading: "What agencies do in response",
          body: "The holdcos that survive long-term own proprietary technology and data — like Publicis with Epsilon and LiveRamp — rather than those whose value was purely in buying leverage and opacity. The shift is from 'we buy better than you can' to 'we have data you can't access independently.'",
        },
      ],
    },
  },
  {
    id: "atd",
    clusterId: "players",
    name: "Agency Trading Desk (ATD)",
    def: "A centralized programmatic buying unit inside a holding company that runs campaigns across all agencies beneath it. The original model for bringing programmatic expertise in-house at scale. Examples: Xaxis (WPP), Publicis Media Technologies (Publicis), Accuen (Omnicom).",
    related: [
      "trading-desk",
      "holding-company",
      "groupm",
      "dsp",
      "principal-media",
    ],
  },

  // ── TRANSPARENCY & COMMERCIAL ──────────────────────────────
  {
    id: "principal-media",
    clusterId: "commercial",
    name: "Principal Media",
    def: "A trading model where an agency buys ad inventory with its own money, takes ownership of it, then resells it to clients at a marked-up price. The agency acts as a principal (trading on its own account) rather than an agent (spending the client's money transparently). Legal and widespread among holdcos, but the margin is rarely disclosed.",
    related: [
      "holding-company",
      "media-agency",
      "trading-desk",
      "the-trade-desk",
      "publicis",
      "log-level-data",
      "insertion-order",
      "spo",
    ],
    article: {
      summary:
        "Principal media is the most commercially significant transparency debate in agency land right now. The agency buys inventory wholesale and resells it to clients at retail. The difference is profit.",
      howItWorks:
        "The agency negotiates bulk inventory deals directly with publishers or SSPs at discounted rates. They bill the client at a higher CPM, keeping the margin. Unlike a transparent agency fee, the margin is embedded in the media cost itself — invisible unless the client audits the supply chain.",
      whyItMatters:
        "The agency's financial interest (buy cheap, sell high) directly conflicts with the client's interest (buy the best inventory). An agency running principal media has an incentive to push its own inventory over better-performing alternatives. This drove the Publicis vs TTD dispute — TTD's transparency tools made those margins visible.",
      watchOutFor:
        "Contracts that include 'non-disclosed' or 'undisclosed' buying clauses give agencies the legal right to trade as principal. Sophisticated advertisers now explicitly prohibit principal media in their contracts or require full cost disclosure.",
      deepDive: [
        {
          heading: "Why it's called 'principal' media",
          body: "The word 'principal' comes from its legal meaning — a party acting on their own behalf, as opposed to an agent acting on someone else's behalf. Traditionally agencies act as agents: they spend the client's money, on the client's behalf, in the client's interest. Principal media flips this. The agency acts as a principal: it buys inventory with its own money first, takes ownership, then resells. The name describes the legal role the agency is playing.",
        },
        {
          heading: "How it works operationally",
          body: "Principal media doesn't happen in the real-time auction — you can't pre-buy RTB impressions. It operates in guaranteed and reserved deals: Programmatic Guaranteed deals where the agency negotiates a fixed price and guaranteed volume directly with a publisher. Direct IO deals — the agency buys inventory at a wholesale rate (say €5 CPM) and bills the client at retail (€8 CPM). The €3 margin is the principal media profit. The client sees 'premium display' with no visibility into what was actually paid.",
        },
        {
          heading: "Why TTD's tools specifically threaten this model",
          body: "TTD's log-level data gives clients access to impression-level cost data. If a client has direct data access from TTD, they can see exactly what each impression cost. If they compare that against what the agency billed — the margin is visible. This is why Publicis prefers clients buying through Epsilon (Publicis's own DSP) where Publicis controls the data and reporting layer. TTD, as an external platform, always carried the risk that data could leak around Publicis's reporting layer. Eventually it did.",
        },
      ],
    },
  },
  {
    id: "log-level-data",
    clusterId: "measurement",
    name: "Log-Level Data",
    def: "Raw, impression-level data from a programmatic campaign — every single ad impression logged individually with its cost, publisher, placement, audience signal, timestamp, and outcome. The most granular form of campaign data. Gives advertisers the ability to independently audit what they paid and what they got.",
    related: [
      "principal-media",
      "the-trade-desk",
      "media-agency",
      "measurement",
      "click-id",
      "bid-request",
    ],
    article: {
      summary:
        "Log-level data is the audit trail of programmatic advertising. When a client has direct access to it, they can independently verify every impression, every cost, and every outcome — without relying on the agency's aggregated report.",
      howItWorks:
        "Every time an ad impression is served, a log entry is created: impression ID, timestamp, publisher domain, deal ID, CPM paid, creative ID, user/device signals, and outcome events. These logs are generated by the DSP. In TTD, they can be exported to a client's own data warehouse.",
      whyItMatters:
        "Log-level data is the mechanism that makes principal media margins visible. If the DSP shows the client paid €4.20 CPM and the agency billed €7.50 CPM, the discrepancy is provable. Control of log-level data access has become one of the most commercially contested issues in agency-client contracts.",
      watchOutFor:
        "Agencies routinely negotiate contracts where log-level data goes to the agency, not the client. Sophisticated advertisers now explicitly require direct log-level data access in their contracts.",
      deepDive: [
        {
          heading: "Why most clients don't have it",
          body: "When an agency sets up a campaign in TTD, the TTD account belongs to the agency — not the client. The client has no login, no direct platform access, and no way to pull log-level data independently. This is the default state. The client trusts the agency to report accurately. Most never question it.",
        },
        {
          heading: "The two ways clients get access",
          body: "First: contract negotiation. Sophisticated advertisers demand in their agency contracts that they own their data and have direct platform access. Second: TTD's own push. TTD has a commercial incentive to build direct relationships with brands — they actively encourage advertisers to request their own data access and their own TTD seat.",
        },
        {
          heading: "What a discrepancy actually looks like",
          body: "Agency buys 10 million impressions. Log-level data shows average clearing price of €4.20 CPM. Client was billed €7.50 CPM. That's a €33,000 gap on one campaign. Multiply across a large client's annual spend and the principal media margin becomes very large — and very visible. This is exactly what the Publicis audit against TTD was looking for.",
        },
      ],
    },
  },
  {
    id: "insertion-order",
    clusterId: "commercial",
    name: "Insertion Order (IO)",
    def: "A formal contract between an advertiser (or agency) and a publisher specifying what inventory will be delivered, at what price, in what volume, and over what time period. The traditional pre-programmatic buying method — still widely used for premium, guaranteed placements.",
    related: [
      "pg",
      "pmp",
      "gam",
      "line-item",
      "principal-media",
      "trading-desk",
    ],
    article: {
      summary:
        "The IO is the original media buying contract. Before programmatic existed, every ad deal was an IO. Programmatic didn't kill the IO — it just automated the delivery layer underneath it.",
      howItWorks:
        "The agency or advertiser negotiates directly with the publisher's sales team. They agree on placement, format, dates, volume, and CPM. The publisher's ad ops team traffics the campaign in GAM as a direct line item with the highest priority — it serves before any programmatic demand.",
      whyItMatters:
        "IOs are where principal media margins are easiest to hide. The agency signs the IO with the publisher at one price, bills the client at another. No auction, no independent clearing price, no transparency unless the client audits the contract.",
      watchOutFor:
        "IO cancellation terms. Most IOs have a cancellation window (typically 14-30 days) with financial penalties. Agencies sometimes sign IOs speculatively — creating financial exposure if the campaign doesn't run.",
    },
  },
  {
    id: "openpath",
    clusterId: "auction",
    name: "OpenPath (TTD)",
    def: "The Trade Desk's direct supply path product — connects advertisers directly to publishers without SSP intermediaries. Publishers plug into TTD's demand and pay a ~5% fee on spend. Positioned as a transparency and SPO play.",
    related: [
      "spo",
      "the-trade-desk",
      "publishers",
      "header-bidding",
      "pg",
      "principal-media",
      "log-level-data",
    ],
    article: {
      summary:
        "OpenPath is TTD's answer to the SPO movement — cut intermediary hops, reduce fees, give publishers better yield and advertisers more transparency. It also gives TTD more control over the supply chain.",
      howItWorks:
        "Publishers integrate OpenPath directly into their header bidding setup instead of an SSP. Their inventory connects directly to TTD's demand. No SSP fee is taken. Publishers pay TTD ~5% of resulting spend.",
      whyItMatters:
        "When a campaign runs through OpenPath, the full cost is visible — no SSP margin, no reseller markup. This is exactly what makes agencies running principal media uncomfortable.",
      watchOutFor:
        "The Predictive Clearing fee (bid shading) still applies on OpenPath inventory — critics argue this makes no sense since TTD has full pricing visibility on its own pipes.",
    },
  },
  {
    id: "kokai",
    clusterId: "auction",
    name: "Kokai (TTD)",
    def: "The Trade Desk's AI-powered campaign management platform, launched 2024. Replaced the legacy UI. Uses ML to automate optimization across targeting, bidding, and supply selection. Central to the Publicis dispute — the audit found issues with how Kokai's default settings affected fees.",
    related: [
      "the-trade-desk",
      "smart-bidding",
      "dsp",
      "openpath",
      "principal-media",
    ],
    article: {
      summary:
        "Kokai is TTD's attempt to make AI-driven optimization the default for every campaign. Its two modes — Performance and Control — create a fee structure that punishes traders for wanting manual control.",
      howItWorks:
        "In Performance mode, Kokai automatically selects inventory, adjusts bids, applies audience segments, and optimizes toward the campaign goal. In Control mode, traders can override — but often triggering a more expensive fee menu.",
      whyItMatters:
        "The Publicis audit flagged Kokai's default settings as problematic. When features are on by default and charge fees, clients who don't know to turn them off pay for things they didn't consciously choose.",
      watchOutFor:
        "Data marketplace segments that Kokai enables by default can add meaningful cost per impression. Always audit which data packages are active in a campaign — especially on new setups.",
    },
  },

  // ── IDENTITY ADDITIONS ────────────────────────────────────
  {
    id: "persona-id",
    clusterId: "identity",
    name: "Persona ID",
    def: "LoopMe's proprietary identity graph spanning ~2B consented devices. Used to connect mobile, web, and CTV impressions to the same user without relying on third-party cookies or IDFA.",
    related: ["identity-resolution", "loopme", "first-party-data", "dmp"],
  },
  {
    id: "contextual-data",
    clusterId: "identity",
    name: "Contextual Data",
    def: "Signals about the page or app an impression appears on — topic, keywords, sentiment, brand-safety category, attention metrics. Cookie-independent. One of the three pillars of curation alongside audience data and supply-chain integrity.",
    related: [
      "curation",
      "infolinks",
      "third-party-cookies",
      "privacy-by-design",
      "contextual-targeting",
    ],
  },
  {
    id: "audience-segments",
    clusterId: "identity",
    name: "Audience Segments",
    def: "The ID-based way to describe an audience in a bid request. An audience is defined in advance, given a code in a shared taxonomy (like IAB Audience Taxonomy v1.1), and users carry the IDs they belong to. Matching is a yes/no overlap check — sub-microsecond per impression.",
    related: [
      "audience-embeddings",
      "iab-audience-taxonomy",
      "bid-request",
      "dmp",
      "seller-defined-audiences",
    ],
    article: {
      summary:
        "Segments are the established way to answer 'is this user in my target audience?' Someone pre-defines the audience, assigns it a taxonomy code, and the match becomes a simple sub-microsecond ID lookup.",
      howItWorks:
        "An audience gets a code in a shared dictionary like IAB Tech Lab's Audience Taxonomy. The bid request carries the IDs a user has; the campaign lists the IDs it wants. Either there's overlap or there isn't — a yes/no answer per impression. Set logic is clean: 'A AND B', 'A AND NOT C' work directly.",
      whyItMatters:
        "Segments give three things embeddings struggle with: clean set logic, a readable audit trail, and automatic dedup when providers share the taxonomy.",
      watchOutFor:
        "Segments break when the audience was never pre-defined. Names don't line up across providers. Building against one provider's IDs creates lock-in to their taxonomy.",
      deepDive: [
        {
          heading: "Segments vs embeddings — which wins?",
          body: "Neither definitively. Segments win on auditability, clean set logic, and regulatory compliance. Embeddings win on flexibility, nuance, and performance ceiling. The IAB Tech Lab spec now keeps both in the bid request so the choice stays open.",
        },
        {
          heading: "The provider lock-in problem",
          body: "Build a campaign against one provider's taxonomy and you're dependent on their update schedule, their user matching, and their price. When they discontinue a segment ID, your campaign breaks. This is why the push toward shared, open taxonomies matters — standardization reduces lock-in and enables dedup across providers.",
        },
      ],
    },
  },
  {
    id: "audience-embeddings",
    clusterId: "identity",
    name: "Audience Embeddings",
    def: "The vector-based way to describe an audience. The audience is described in plain text, run through a model, and stored as an array of numbers (a vector). Matching is a similarity score between the user's vector and the campaign's frozen audience vector — not a yes/no, but a closeness score.",
    related: [
      "audience-segments",
      "iab-audience-taxonomy",
      "bid-request",
      "identity-resolution",
      "contextual-targeting",
    ],
    article: {
      summary:
        "Embeddings are the ML-native way to match audiences. Instead of pre-defined IDs, an audience is described in a sentence, embedded into a vector, and matched by closeness — so any audience you can describe exists the moment you embed it.",
      howItWorks:
        "The audience description is run through a model once, at campaign setup, and frozen into a vector. At bid time, the user side already carries its own pre-computed vector. The match is one number (cosine similarity) against a cutoff. No model runs at bid time.",
      whyItMatters:
        "Embeddings handle plain-language audiences with no pre-definition, capture nuance a taxonomy can't encode, and have a higher performance ceiling. The personalization stacks behind search and recommendations all run on embeddings.",
      watchOutFor:
        "Both sides must use the same model. Model version upgrades break old vectors — everyone must migrate together. No clean set-logic equivalent. The audit trail is two arrays of numbers — useless for a compliance reviewer.",
      deepDive: [
        {
          heading: "How does the DSP know what sentence to target?",
          body: "It doesn't — not at bid time. The sentence is turned into a vector once at campaign setup and frozen. At bid time, both sides are just numbers. The DSP isn't processing language in real-time auctions; it's doing a fast vector similarity calculation against pre-computed values.",
        },
        {
          heading: "Who computes the user's vector",
          body: "Someone has to have observed the user's behavior and embedded that into a vector ahead of time — a data partner or the platform itself. The user doesn't arrive with a vector from nowhere. And critically: the user's behavior vector and the campaign's audience vector must come from the same embedding model to be comparable. This 'model agreement' requirement is the real blocker to cross-company embedding-based targeting at scale.",
        },
        {
          heading: "Why this matters for adtech's future",
          body: "Embeddings are already the dominant paradigm in consumer internet personalization. The shift from segment-based to embedding-based targeting in programmatic is directionally inevitable — but the operational requirements (model standardization, vector infrastructure, compute cost) mean segments will remain dominant in the near term, especially where auditability is legally required.",
        },
      ],
    },
  },
  {
    id: "iab-audience-taxonomy",
    clusterId: "identity",
    name: "IAB Audience Taxonomy",
    def: "IAB Tech Lab's standardized dictionary of audience definitions (current: v1.1), giving each audience a shared code. The backbone of segment-based targeting — when providers share the taxonomy, the same audience ID means the same thing across the ecosystem, enabling automatic dedup.",
    related: [
      "audience-segments",
      "seller-defined-audiences",
      "bid-request",
      "dmp",
    ],
  },

  // ── DATA ADDITIONS ────────────────────────────────────────
  {
    id: "dmp",
    clusterId: "data",
    name: "DMP",
    def: "Data Management Platform — system that ingests, organizes, and segments audience data, combining first-party, second-party, and third-party signals. Powers targeting and curation. LoopMe runs one of the largest, with ~2B consented devices.",
    related: [
      "first-party-data",
      "activation",
      "onboarding",
      "curation",
      "loopme",
      "audience-segments",
    ],
  },
  {
    id: "purchaseloop",
    clusterId: "data",
    name: "PurchaseLoop",
    def: "LoopMe's outcome-based measurement and optimization product. Connects ad exposure to real-world purchase behavior using device-level matching with retailer data partners.",
    related: ["loopme", "measurement"],
  },

  // ── PRIVACY ADDITIONS ─────────────────────────────────────
  {
    id: "consent-management",
    clusterId: "privacy",
    name: "Consent Management",
    def: "The process of collecting, storing, and respecting user choices about tracking. CMPs are the tools that handle this. The output is the consent string that travels through every bid request.",
    related: ["gdpr", "third-party-cookies", "cmp", "consent-string", "tcf"],
  },

  // ── AD QUALITY ────────────────────────────────────────────
  {
    id: "mfa",
    clusterId: "adquality",
    name: "MFA (Made-for-Advertising)",
    def: "Low-quality websites engineered to attract programmatic ad spend rather than serve real audiences. Heavy ads-to-content ratio, clickbait headlines, high IVT levels. A major waste driver in open exchanges — curation and direct supply paths avoid it.",
    related: [
      "ivt",
      "curation",
      "chartboost",
      "ad-exchange",
      "brand-safety",
      "spo",
    ],
  },
  {
    id: "ipd",
    clusterId: "adquality",
    name: "Inventory Partner Domain",
    def: "A bid request field (app.ext.inventorypartnerdomain) that identifies the actual content owner when content is distributed by a third-party platform. Tells DSPs where to validate ads.txt — with the content owner, not the distributor.",
    related: ["ads-txt", "spo", "schain", "openrtb", "publishers"],
  },

  // ── PERFORMANCE ADDITIONS ─────────────────────────────────
  {
    id: "cpl",
    clusterId: "performance",
    name: "CPL",
    def: "Cost Per Lead — what an advertiser pays per lead form submission. Used in B2B, SaaS, and services where the sales cycle is long and a direct purchase in the first session is unrealistic.",
    related: ["cpa", "cpc", "campaign-objective", "tofu-mofu-bofu"],
  },

  // ── MEASUREMENT ADDITIONS ─────────────────────────────────
  {
    id: "deep-link",
    clusterId: "measurement",
    name: "Deep Link",
    def: "A URI that opens a mobile app directly to a specific screen rather than the home page. In adtech, deep links are passed in bid responses so that clicking an ad takes a user straight to a product page inside an app — not a browser redirect.",
    related: ["mmp", "mobile-in-app", "click-id", "bid-response"],
  },
  {
    id: "attention-metrics",
    clusterId: "measurement",
    name: "Attention Metrics",
    def: "Measurement signals that go beyond viewability to capture actual cognitive engagement with an ad. Where viewability asks 'could this ad have been seen?', attention asks 'was it actually processed?' Signals include time-in-view, eye tracking, scroll velocity, interaction rate, and audio-on rate for video.",
    related: [
      "viewability",
      "om-sdk",
      "measurement",
      "ecpm",
      "brand-safety",
      "impression-pixel",
    ],
    article: {
      summary:
        "Viewability set a low bar — an ad that is 50% visible for 1 second technically passes. A person can scroll past it with zero conscious awareness. Attention metrics try to measure whether the ad actually registered.",
      howItWorks:
        "Attention measurement tools use: time-in-view (how long the ad was on screen beyond the 1-second minimum), scroll velocity (slower = more likely to notice), eye tracking (from panel studies), audio-on rate for video (muted autoplay has near-zero attention value), interaction signals (hover, cursor movement near the ad). These combine into an attention score per placement.",
      whyItMatters:
        "CPMs for high-attention inventory are 2-3x higher than low-attention inventory at comparable viewability scores. A sidebar banner nobody looks at passes viewability but has near-zero attention value. A mid-article placement users pause on has high attention value.",
      watchOutFor:
        "No standardized attention metric exists yet. Adelaide's AU score, Lumen's attention seconds, and Amplified Intelligence's attention time all measure slightly different things. Comparing attention scores across vendors is meaningless without understanding the underlying methodology.",
      deepDive: [
        {
          heading: "Why viewability is a low bar",
          body: "The IAB viewability standard was designed to solve a real problem — ads below the fold that never loaded were being counted as impressions. It fixed that. But it created a new problem: it defined the floor as the ceiling. The industry optimized for viewability compliance rather than actual engagement quality. A page crammed with ads that scroll past at speed passes viewability. A prominent above-the-fold placement with a compelling creative might have a 10x attention score despite identical viewability rates.",
        },
        {
          heading: "The commercial implication",
          body: "Attention metrics are starting to appear in direct deal negotiations — publishers with demonstrably high attention scores are using them to justify higher CPMs against low-quality high-reach alternatives. For programmatic buyers, attention data is being used to build attention-weighted CPM models: instead of paying the same CPM for every viewable impression, you pay a premium for impressions above an attention score threshold.",
        },
        {
          heading: "The connection to AI shopping agents",
          body: "If an AI agent is browsing on behalf of a human, attention metrics become meaningless. The agent doesn't have attention — it processes page content algorithmically. This is one of the ways AI agents break existing measurement frameworks. The industry built attention metrics assuming a human on the other end of every impression. That assumption is quietly eroding.",
        },
      ],
    },
  },
  {
    id: "ai-shopping-agents",
    clusterId: "measurement",
    name: "AI Shopping Agents",
    def: "AI assistants (Gemini, Claude, Perplexity, ChatGPT) that browse, evaluate, and purchase products on behalf of human users. They don't click ads, don't respond to retargeting, and don't follow the traditional click-to-purchase funnel. Their emergence breaks fundamental assumptions that programmatic advertising was built on.",
    related: [
      "bot-to-cart",
      "adcp",
      "measurement",
      "contextual-targeting",
      "attention-metrics",
      "last-click-attribution",
    ],
    article: {
      summary:
        "The entire programmatic advertising system was built assuming a human at the end of every impression. AI shopping agents break this assumption. They research and purchase on the human's behalf, bypassing the ad-click funnel entirely.",
      howItWorks:
        "A user tells their AI assistant: 'find me running shoes under €150 with good reviews and order the best option.' The agent browses product pages, reads reviews, compares prices, and executes the purchase — without ever clicking an ad, visiting a retargeting pixel, or following a sponsored link.",
      whyItMatters:
        "If a significant share of purchases are made by AI agents rather than humans directly, the entire ad-to-purchase attribution chain breaks. The click ID that connects an ad impression to a conversion doesn't exist. The retargeting pixel that re-engages an interested user never fires.",
      watchOutFor:
        "This is not a future problem — it's an early-stage present problem. AI-assisted shopping is already happening at small but growing scale. The industry's response is still being defined.",
      deepDive: [
        {
          heading: "How this breaks the traditional funnel",
          body: "The TOFU/MOFU/BOFU funnel assumes a human moving through stages of awareness and consideration before converting. An AI agent collapses this. It can evaluate awareness, consideration, and conversion in a single session with no human attention required at each stage. Brand awareness — which programmatic has always struggled to measure — becomes existential. If the AI agent has never 'seen' your brand or finds no credible information about it when crawling, you don't exist in the consideration set.",
        },
        {
          heading: "What brands need to do differently",
          body: "Content that AI agents can read and evaluate becomes more important than content designed to attract human attention. Structured product data (price, availability, specifications, reviews) in machine-readable formats matters more than creative visual advertising. Being cited and discussed by credible sources that AI agents use as references becomes a form of brand marketing. This is the shift from SEO to AEO — AI Engine Optimization.",
        },
        {
          heading: "The agent-to-agent buying example",
          body: "PubMatic's campaign with Abovo MaxLead is an early example of AI agents on the buy side — an AI agent buying programmatic inventory through an API rather than a human trader logging into a DSP UI. If both the buyer and the eventual consumer are AI agents, the human role in the transaction becomes purely goal-setting and review.",
        },
      ],
    },
  },
  {
    id: "bot-to-cart",
    clusterId: "measurement",
    name: "Bot-to-Cart",
    def: "An emerging measurement concept tracking whether an AI agent acting on a human's behalf completed a purchase. Distinct from click-to-cart because no human click is involved — the bot evaluated the product independently and executed the transaction. No industry-wide standard exists yet.",
    related: [
      "ai-shopping-agents",
      "adcp",
      "measurement",
      "last-click-attribution",
      "mmp",
      "conversion-pixel",
    ],
    article: {
      summary:
        "Bot-to-cart is the measurement problem created by AI shopping agents. If a bot buys something on your behalf, which ad or brand interaction influenced that decision? The bot didn't click an ad. The bot didn't respond to retargeting. Current attribution tools have no signal to work with.",
      howItWorks:
        "Current attribution works by matching a click ID to a conversion event. Bot-to-cart has no click ID. The potential measurement signals instead: which brands appeared in the AI's response when asked to evaluate options, which structured data sources the AI accessed during evaluation, and whether advertising content influenced the AI's retrieval behavior.",
      whyItMatters:
        "If bot-to-cart purchases grow as a share of total ecommerce, brands that rely on last-click or data-driven attribution will systematically undercount real influence. A brand that invests in content quality and structured data will see sales without measurable ad attribution.",
      watchOutFor:
        "No standard measurement methodology exists for bot-to-cart yet. Any vendor claiming to solve it in 2026 is likely selling an incomplete solution. This is a space to watch, not yet a space to invest heavily in.",
    },
  },
  {
    id: "adcp",
    clusterId: "identity",
    name: "AdCP / AI Crawlability",
    def: "The emerging infrastructure layer defining how AI agents interact with advertising systems and brand content. Parallel to how SEO optimizes content for search crawlers, AI crawlability (AEO — AI Engine Optimization) optimizes content so AI shopping agents can accurately understand and recommend a brand.",
    related: [
      "ai-shopping-agents",
      "bot-to-cart",
      "contextual-targeting",
      "contextual-data",
    ],
    article: {
      summary:
        "When Google became dominant, SEO became essential. As AI agents become a primary discovery mechanism, a parallel shift is underway. Brands need to structure content so AI agents can understand, trust, and recommend them.",
      howItWorks:
        "AI crawlability involves: structured data markup (Schema.org product data, pricing, reviews) so AI agents can read product information reliably; content that AI language models can accurately summarize; citation presence in sources that AI systems trust; and potentially new protocols like AdCP that define how AI agents interact with advertising systems.",
      whyItMatters:
        "Brand discovery is moving from 'does this brand rank in search results?' to 'does this brand appear when an AI agent evaluates options in my category?' These are different questions with different answers.",
      watchOutFor:
        "AEO/AdCP is genuinely early-stage in 2026. Standards are not settled, measurement tools don't exist yet, and the scale of AI-agent-mediated purchases is still small.",
      deepDive: [
        {
          heading: "The SEO parallel — and where it breaks down",
          body: "SEO worked because Google's ranking algorithm had known inputs: links, content quality, page speed, structured data. AI agent recommendations are harder to optimize for because the AI's decision process is less transparent. An AI agent recommending a product draws on training data, real-time retrieval, and reasoning that's harder to reverse-engineer than a PageRank score. This makes AEO more about genuine quality signals and less about technical tricks.",
        },
        {
          heading: "What this means for advertising specifically",
          body: "If AI agents mediate discovery, the value of impression-based awareness advertising shifts. Seeing an ad 10 times doesn't help if the AI agent evaluating your category never processed those impressions. What helps: being mentioned positively in content the AI retrieves as reference material, having structured product data the AI can accurately read, and having reviews and ratings the AI uses as quality signals.",
        },
      ],
    },
  },

  // ── AUCTION ADDITIONS ─────────────────────────────────────
  {
    id: "price-macro",
    clusterId: "auction",
    name: "Price Macro (${AUCTION_PRICE})",
    def: "A standard OpenRTB placeholder that the exchange replaces with the actual clearing price after the auction. Appears in the DSP's bid response inside the nurl or adm. The DSP bids a price but uses the macro to record what it actually paid — which in second-price auctions differs from the bid.",
    related: [
      "openrtb",
      "bid-response",
      "nurl",
      "win-rate",
      "ecpm",
      "first-price-auction",
      "adm-field",
    ],
    article: {
      summary:
        "The price macro is how DSPs find out what they actually paid for an impression. They include it as a placeholder in their bid response — the exchange fills it in with the real clearing price before firing the win notification or serving the creative.",
      howItWorks:
        "The DSP includes ${AUCTION_PRICE} in its bid response inside the nurl or adm. After the auction, the exchange replaces the macro with an encrypted version of the clearing price, then fires the nurl or serves the adm. The DSP receives the encrypted price, decrypts it using the shared key, and gets the actual clearing price.",
      whyItMatters:
        "Without the price macro, DSPs would know what they bid but not what they paid. In second-price auctions those numbers differ. The macro is the mechanism that closes the billing loop.",
      watchOutFor:
        "If the shared encryption key between your exchange and a DSP is wrong or expired, the DSP receives an encrypted price they can't decrypt. Their billing reconciliation breaks entirely. Always the first thing to check when a DSP reports billing discrepancies.",
      deepDive: [
        {
          heading: "Why the price is encrypted — not plain text",
          body: "The adm gets served through the user's browser. If the clearing price was in plain text inside the impression tracking URL, anyone could see what the DSP paid — competitors, browser extensions, anyone inspecting network traffic. So the exchange doesn't replace ${AUCTION_PRICE} with '3.20'. It replaces it with an encrypted version: YWJjZGVmZ2hpamts...",
        },
        {
          heading: "The encryption format",
          body: "The encryption uses a shared secret key exchanged between the DSP and SSP during integration setup, and AES-128 encryption with this format: base64(IV + encrypted_price + HMAC_signature). IV is a random 16-byte initialization vector unique per impression. encrypted_price is the actual clearing price encrypted with the shared key. HMAC_signature is an integrity check so the DSP knows the price hasn't been tampered with.",
        },
        {
          heading: "First-price vs second-price — what the macro returns",
          body: "In a first-price auction (current standard): clearing price = bid price. So ${AUCTION_PRICE} becomes 5.00 if you bid 5.00. In a second-price auction (largely legacy): clearing price = second highest bid + $0.01. If the second bid was €3.19, ${AUCTION_PRICE} becomes 3.20 even though the DSP bid €5.00.",
        },
        {
          heading: "The operational failure mode",
          body: "During DSP integration setup, the exchange and DSP exchange encryption keys. If those keys expire or were never shared properly, the DSP receives encrypted prices they can't decrypt. Symptom: the DSP reports clearing price data is missing or shows garbage values. Fix: rotate and re-share the encryption keys between the exchange and the DSP's technical team.",
        },
      ],
    },
  },
  {
    id: "adm-field",
    clusterId: "auction",
    name: "adm (Ad Markup)",
    def: "The field in a DSP's bid response containing the actual ad creative — HTML, JavaScript, or a VAST XML URL for video. When the DSP wins an auction, the exchange passes the adm to the publisher's ad slot for rendering. Contains impression tracking URLs with the ${AUCTION_PRICE} macro.",
    related: [
      "price-macro",
      "nurl",
      "bid-response",
      "openrtb",
      "vast",
      "impression-pixel",
    ],
    article: {
      summary:
        "The adm is the creative payload of a bid response. It's what actually gets rendered in the ad slot when a DSP wins. It's also where impression tracking happens — the adm typically contains pixel URLs that fire when the creative loads.",
      howItWorks:
        "The DSP includes the adm in its bid response alongside the bid price. If the bid wins, the exchange takes the adm, replaces any macros, and passes it to the publisher's ad server or SDK. The publisher's environment renders the HTML/JavaScript. Any tracking pixels embedded in the adm fire as the creative loads.",
      whyItMatters:
        "The adm is the direct line between the DSP's creative and the publisher's ad slot. Everything the DSP wants to track — impressions, viewability, brand safety, clearing price — is embedded in the adm as pixel calls or JavaScript.",
      watchOutFor:
        "VAST wrappers in video adm fields add network requests and latency. More than 3-4 wrappers in a chain frequently causes video load failures on mobile. Also: adm size limits vary by publisher — oversized adm fields get truncated or rejected.",
    },
  },
  {
    id: "nurl",
    clusterId: "auction",
    name: "nurl (Win Notification)",
    def: "A URL in the DSP's bid response that the exchange calls server-to-server when that bid wins an auction. The exchange replaces ${AUCTION_PRICE} with the actual clearing price before firing it. Tells the DSP they won and what they paid — the primary mechanism for win rate tracking and billing reconciliation.",
    related: [
      "price-macro",
      "adm-field",
      "bid-response",
      "openrtb",
      "win-rate",
      "ecpm",
    ],
    article: {
      summary:
        "The nurl is the exchange's handshake back to the DSP after an auction win. It fires server-to-server — not through the user's browser — so it's more reliable than impression pixels in the adm.",
      howItWorks:
        "The DSP includes a nurl in its bid response. If the bid wins, the exchange immediately fires an HTTP GET request to that URL with ${AUCTION_PRICE} replaced by the encrypted clearing price. The DSP's server receives this, logs the win, decrypts the price, and updates its billing records.",
      whyItMatters:
        "Win rate data comes from nurl fires. If a DSP's nurl isn't firing correctly, the DSP has no reliable win data. They're bidding blind.",
      watchOutFor:
        "Nurls can fail silently. If the DSP's nurl endpoint returns a non-200 HTTP response, the exchange typically doesn't retry — the win notification is just lost. Monitor nurl hit rates against bid response logs. A gap between bids sent and nurls received signals either auction losses or nurl delivery failures.",
    },
  },
  {
    id: "first-price-auction",
    clusterId: "auction",
    name: "First-Price Auction",
    def: "An auction model where the winner pays exactly what they bid — no discount. The standard model in programmatic since 2019. Replaced second-price auctions across most major exchanges. Incentivizes bid shading: DSPs deliberately bid below their true valuation to avoid overpaying.",
    related: [
      "price-macro",
      "bid-response",
      "floor-price",
      "win-rate",
      "ecpm",
      "waterfall",
    ],
    article: {
      summary:
        "In a first-price auction, you pay what you bid. This sounds simple but fundamentally changed how DSPs bid — because in second-price auctions you could bid your true maximum and pay less. In first-price, bidding your true maximum means potentially overpaying every time you win.",
      howItWorks:
        "The exchange collects all bids, selects the highest one above the floor price, and charges that DSP exactly their submitted bid. The ${AUCTION_PRICE} macro returns the bid price itself. There's no second-price discount.",
      whyItMatters:
        "First-price auctions created the bid shading industry. DSPs now run algorithms that predict the likely clearing price and shade bids down — bidding €3.20 instead of €5.00 when they predict they can win at €3.20. This is why TTD's Predictive Clearing fee exists.",
      watchOutFor:
        "First-price + bid shading creates a game-theory problem. If all DSPs shade bids, floor prices start to matter more — publishers set floors to prevent DSPs from shading too aggressively. The equilibrium between bid shading and floor prices is constantly shifting.",
    },
  },
  {
    id: "post-auction-sequence",
    clusterId: "auction",
    name: "Post-Auction Sequence",
    def: "The four-step chain that happens after a DSP wins an auction: nurl fires (win notification server-to-server), adm is returned to publisher, adm renders in user's environment, impression pixel fires. Each step can succeed or fail independently — which is why billing discrepancies exist.",
    related: [
      "nurl",
      "adm-field",
      "price-macro",
      "impression-pixel",
      "click-id",
      "bid-response",
      "openrtb",
      "win-rate",
    ],
    article: {
      summary:
        "Winning an auction and showing an ad are not the same event. They are four separate steps happening within milliseconds of each other, each of which can succeed or fail independently.",
      howItWorks:
        "Step 1: Exchange fires the nurl to the DSP server-to-server. DSP logs the win and decrypts clearing price. The user's browser is not involved. Step 2: Exchange returns the winning adm to publisher's ad server or SDK. Step 3: Publisher's environment renders the adm — creative appears to the user, impression pixel fires. Step 4: If the user clicks, they hit the DSP's click redirect, which logs the click, assigns a click ID, and redirects to the landing page with the click ID appended.",
      whyItMatters:
        "Each step can fail independently. A nurl can fire without the impression pixel firing (won the auction, creative failed to render). An impression pixel can fire without a nurl (creative showed, win notification was lost). Billing reconciliation compares nurl count against impression pixel count — large discrepancies signal a problem.",
      watchOutFor:
        "The nurl-to-impression discrepancy is the most important ratio to monitor. Consistently high discrepancy (nurl fires >> impression pixels) means creative render failures. Low discrepancy but missing wins means nurl endpoint reliability issues.",
      deepDive: [
        {
          heading: "The full timing sequence",
          body: "T+0ms: Auction starts. T+80ms: DSP submits bid response (price + nurl + adm). T+100ms: Auction closes, winner determined. T+101ms: Exchange fires nurl to DSP server (server-to-server, user not involved). T+102ms: Exchange returns adm to publisher. T+300ms: adm renders in browser, impression pixel fires. T+∞: User may or may not click.",
        },
        {
          heading: "Why nurl and impression pixel can disagree",
          body: "The nurl fires from the exchange's server to the DSP's server — before anything reaches the user's browser. The impression pixel fires from inside the adm, inside the user's browser, after the creative has loaded. Between the nurl firing and the impression pixel firing, many things can go wrong: adm timeout, JavaScript error, ad blocker, user navigating away. Each of these produces a nurl fire with no corresponding impression pixel.",
        },
        {
          heading: "The three discrepancy scenarios",
          body: "Scenario 1 — nurl fires, impression pixel doesn't: Won the auction but creative failed to render. You committed to the auction price but showed nothing. Scenario 2 — Impression pixel fires, nurl didn't: Rare. Creative showed but no win notification in records. Usually a DSP-side server issue. Scenario 3 — Both fire and counts roughly match: Normal. Some small discrepancy (~5-10%) is always expected.",
        },
        {
          heading: "Click tracking in detail",
          body: "If the user clicks the ad, they don't go directly to the advertiser's landing page. The click URL routes through the DSP's click tracking endpoint first. In that millisecond redirect, the DSP logs the click, assigns a unique click ID (K39F82A7), and appends it to the destination URL: advertiser.com/landing?click_id=K39F82A7. GTM on the landing page captures it and stores it in a cookie. When the user converts, the conversion pixel fires with that stored click ID, closing the attribution loop.",
        },
        {
          heading: "The operational diagnostic workflow",
          body: "When a campaign shows delivery problems, the post-auction sequence is the diagnostic framework. Are nurls firing? (Check DSP win logs.) Are impression pixels firing? (Check delivery reports.) What's the nurl-to-impression ratio? Are clicks firing? Are conversion pixels receiving click IDs? Each gap in this chain points to a specific failure: auction configuration, creative rendering, or tracking failure.",
        },
      ],
    },
  },
];

async function pushToFirestore() {
  console.log(`Pushing ${terms.length} terms to Firestore...`);

  const batchSize = 400;
  for (let i = 0; i < terms.length; i += batchSize) {
    const batch = db.batch();
    const chunk = terms.slice(i, i + batchSize);
    chunk.forEach((term) => {
      const ref = db.collection("terms").doc(term.id);
      batch.set(ref, term);
    });
    await batch.commit();
    console.log(
      `Pushed ${Math.min(i + batchSize, terms.length)}/${terms.length} terms`,
    );
  }

  console.log("Done! All terms pushed to Firestore.");
  process.exit(0);
}

pushToFirestore().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
