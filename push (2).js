import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccount.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const terms = [
  // ── METRICS FAMILY ────────────────────────────────────────
  {
    id: 'cpm', clusterId: 'performance', name: 'CPM',
    def: "Cost Per Mille (mille = thousand) — the price paid per 1000 delivered impressions. The base unit of programmatic pricing. CPM = (Spend / Impressions) × 1000.",
    related: ['ecpm','rpm','traffic-shaping','floor-price','win-rate'],
    article: {
      summary: "CPM is the simplest metric in the family — it's just the price. How much was spent, divided by how many impressions were actually delivered, scaled to a per-thousand basis.",
      howItWorks: "CPM = (Spend / Impressions) × 1000. If an advertiser spent €500 and got 100,000 impressions, CPM = (500/100,000) × 1000 = €5.00.",
      whyItMatters: "CPM is the universal pricing language of display and video advertising — floor prices, bid prices, and reported costs are almost always expressed in CPM terms, even when the underlying deal is structured differently.",
      watchOutFor: "CPM only reflects delivered impressions — it says nothing about how many requests were needed to deliver them, or whether the buyer was actually billed per impression at all. That's where eCPM and RPM come in."
    }
  },
  {
    id: 'ecpm', clusterId: 'performance', name: 'eCPM',
    def: "Effective CPM — normalizes any pricing model (CPM, CPC, CPA) into a CPM-equivalent so different deals can be compared on the same scale. eCPM = (Revenue / Impressions) × 1000.",
    related: ['cpm','rpm','traffic-shaping'],
    article: {
      summary: "Not every deal is priced as CPM — some are CPC (cost per click) or CPA (cost per action). eCPM converts whatever revenue was actually earned back into a CPM-equivalent number, so a CPC campaign and a CPM campaign can be compared side by side.",
      howItWorks: "eCPM = (Revenue / Impressions) × 1000. The numerator is always revenue actually earned — regardless of how the buyer was billed. A CPC campaign that earned €200 from 50,000 impressions has an eCPM of €4.00, even though no single impression was priced at €4.",
      whyItMatters: "From the sell side, eCPM tells you what you actually earned per 1000 impressions you successfully sold — the true monetization rate of your sold inventory, independent of deal structure.",
      watchOutFor: "eCPM only covers sold impressions. A high eCPM with a low fill rate can still mean poor overall monetization — which is exactly the blind spot RPM is designed to catch."
    }
  },
  {
    id: 'rpm', clusterId: 'performance', name: 'RPM / rCPM (Revenue Per Mille)',
    def: "Revenue per 1000 REQUESTS (not impressions) — the metric that captures true end-to-end monetization including unfilled traffic. RPM = (Revenue / Requests) × 1000.",
    related: ['cpm','ecpm','fill-rate','traffic-shaping','win-rate'],
    article: {
      summary: "RPM (also called rCPM) changes the denominator from impressions to requests. This single change makes it the metric that reflects fill rate and price simultaneously — the true monetization efficiency of your inventory pool, not just the part that sold.",
      howItWorks: "rCPM = (Total Spend / Requests) × 1000 — using ALL requests sent to that channel, sold or not. If you have a great eCPM on the impressions that sell but only fill 20% of requests, your eCPM looks good but your RPM will be low — because 80% of your requests earned nothing.",
      whyItMatters: "RPM is the metric publishers and exchanges actually care about most, because it answers the real business question: 'out of everything I offered, how much did I actually make?' eCPM alone can mask poor fill rate.",
      watchOutFor: "RPM/rCPM is NOT standardized industry-wide — definitions vary between SSPs and exchanges in terms of what counts as a 'request' (raw ad calls vs. valid/filterable requests) and what's included in the revenue numerator (gross vs net of fees). Always confirm the exact formula when comparing RPM figures across partners.",
      deepDive: [
        { heading: "Why the denominator shift matters so much", body: "CPM and eCPM divide by impressions — meaning only the traffic that actually sold. RPM divides by requests — meaning all traffic offered, sold or not. A metric can look excellent on a 'per sold impression' basis while being mediocre on a 'per opportunity' basis, if fill rate is low. RPM is the only metric in this family that can't be gamed by cherry-picking which impressions to report on." },
        { heading: "Where the term gets genuinely murky", body: "Different companies define RPM/rCPM with different denominators — some use raw bid requests, others use only 'valid' requests after basic filtering. Internal documentation across teams within the same company can even drift out of sync over time. When comparing RPM numbers with a partner, the professional move is always to confirm the exact formula being used before drawing conclusions — this isn't a sign of confusion, it's the correct level of rigor for a metric this loosely standardized." }
      ]
    }
  },

  // ── TRAFFIC SHAPING ───────────────────────────────────────
  {
    id: 'traffic-shaping', clusterId: 'auction', name: 'Traffic Shaping',
    def: "The active, often algorithmic, control of which ad requests get routed to which demand channel (PG, PMP, or open exchange) before the auction happens, in order to maximize total yield across all deal types — not just the open exchange.",
    related: ['rpm','pg','pmp','waterfall','fill-rate','spo'],
    article: {
      summary: "Traffic shaping is a pre-auction routing decision, not a bidding decision. It's about deciding which channel each individual ad request should be exposed to, based on real-time signals about where it's likely to earn the most.",
      howItWorks: "Without shaping, requests flow in simple priority order — PG first, then PMP, then open exchange (the standard waterfall). Traffic shaping dynamically adjusts that allocation: sending fewer requests to a fixed-price channel and more to open exchange when open exchange demand is unusually strong, and reversing that when guaranteed-deal demand is stronger.",
      whyItMatters: "Rigid routing leaves money on the table. If open exchange demand spikes above a PMP floor price during a high-demand window, a publisher locked into routing requests toward PMP regardless of real-time conditions misses that upside. Shaping captures it.",
      watchOutFor: "Publishers sometimes worry that an exchange's shaping algorithm is tuned to favor the exchange's own take rate rather than pure publisher yield. Transparency about why a routing change happened — backed by blended yield data — is essential for maintaining trust with supply partners.",
      deepDive: [
        { heading: "A concrete example", body: "A publisher has 10M requests/day: 2M to PG (guaranteed), 3M to PMP (curated, $4 CPM floor), 5M to open exchange. If real open exchange clearing prices rise above $4 during a high-demand period (e.g. a major sporting event), rigidly routing 3M requests to PMP regardless of real-time demand leaves money on the table. Traffic shaping dynamically shifts allocation toward open exchange during those windows, and back toward PMP/PG when open exchange demand softens." },
        { heading: "Why exchanges run this, not just publishers", body: "The exchange has visibility the publisher doesn't — real-time bid density and win rates across many publishers simultaneously. Publishers set high-level rules (e.g. 'always prioritize PG, but flex PMP vs open exchange based on real-time yield') and the exchange's algorithm executes it at scale. This is also a genuine point of competitive differentiation between exchanges — one whose shaping logic consistently produces higher blended yield is more attractive to work with." },
        { heading: "The spillover effect", body: "Increasing open exchange exposure doesn't necessarily reduce PMP revenue. In many SSP architectures, deal ID matching can happen inside the same auction call — a 'deal' isn't always a fully separate request path, it can be a tag inside the open auction's bid request that DSPs match against. So a request routed toward 'open exchange' can still be won via a PMP deal ID within that same auction. This is why total blended monetization (across all deal types) is the metric that actually matters when testing shaping changes — not open exchange revenue in isolation." },
        { heading: "How publishers test it", body: "Typically an A/B or holdout test: route a percentage of requests under new shaping logic, keep the rest under baseline routing, then compare total monetization (blended across all deal types) between the two groups over a defined period. The question being answered: 'did changing how many requests we expose to open exchange increase or decrease our total take, including any spillover into PMP/PG?'" }
      ]
    }
  },

  // ── IFRAME / TOPFRAME ─────────────────────────────────────
  {
    id: 'iframe', clusterId: 'auction', name: 'iframe (Inline Frame)',
    def: "An HTML element that embeds an isolated web page inside the publisher's page — its own DOM, its own JavaScript context, separated from the parent. Ad creatives almost always render inside an iframe, sandboxing them from the publisher's page and vice versa. OpenRTB exposes whether an impression sits in an iframe via the topframe field in the bid request.",
    related: ['safeframe','om-sdk','viewability','header-bidding','brand-safety','bid-request','openrtb','adm-field'],
    article: {
      summary: "Ad creatives almost never run directly on a publisher's page. They load inside an iframe — sandboxing the ad from the page (security) and the page from the ad (isolation). This sandboxing is also exactly what makes viewability and brand safety measurement technically hard.",
      howItWorks: "When an ad wins an auction, the exchange returns the adm to the publisher's ad slot. That adm typically renders inside an iframe rather than directly in the page DOM. SafeFrame is a standardized iframe with a defined API allowing limited, controlled communication (size requests, viewability events) without giving the ad full page access.",
      whyItMatters: "Cross-origin restrictions mean a script inside a nested iframe often can't tell where it sits on the page — this is the core technical obstacle behind viewability and brand safety measurement, and the reason OM SDK exists as a standardized way to measure across these boundaries.",
      watchOutFor: "Deeply nested iframes (common when SSP, exchange, and creative are all stacked) compound measurement problems — each layer adds another cross-origin boundary that verification vendors have to navigate.",
      deepDive: [
        { heading: "Why adtech relies on iframes constantly", body: "Two reasons. Security — the publisher doesn't know what code is in the ad creative, which could come from any advertiser through any DSP through any exchange. If that creative ran directly on the page, it could read cookies, access page data, or inject malicious code. The iframe sandboxes it. Isolation — the advertiser doesn't want the publisher's page interfering with how their creative renders or tracks. The iframe guarantees the creative's tracking logic runs in a clean, predictable environment regardless of what else is on the page." },
        { heading: "The topframe field in OpenRTB", body: "The bid request's imp.banner.topframe field tells the DSP whether the ad slot sits in the page's top-level browsing context or inside an iframe. It returns 1 if the slot is in the top frame (not inside any iframe — direct page placement), or 0 if the slot itself is inside an iframe (common in nested setups like cross-domain iframe-served content, some mobile web wrappers, or syndicated content widgets)." },
        { heading: "Why topframe matters for bidding", body: "Inventory in the top frame is generally considered higher quality and more measurable — viewability tools have full access to position and visibility data without cross-origin restrictions. Inventory where topframe = 0 is harder to measure reliably, and is sometimes associated with lower-quality syndicated placements or arbitrage setups. Many DSPs apply bid adjustments or exclude topframe = 0 inventory entirely from certain campaign types, particularly brand-safety-sensitive campaigns." },
        { heading: "The practical diagnostic use", body: "If you're troubleshooting why a campaign's viewability rate looks worse than expected, checking the topframe value distribution in the bid request logs is one of the first diagnostic steps — a high proportion of topframe = 0 impressions often explains otherwise-confusing measurement gaps." }
      ]
    }
  },

  // ── BILLING EVENTS ─────────────────────────────────────────
  {
    id: 'burl', clusterId: 'auction', name: 'burl (Billing URL)',
    def: "A third URL field in the OpenRTB bid response, distinct from nurl and the impression pixel inside adm. Fired by the exchange/SSP itself, server-side, at the moment they consider the impression confirmed as delivered — independent of whether the creative's own pixel succeeded.",
    related: ['nurl','adm-field','price-macro','post-auction-sequence','impression-pixel','openrtb','bid-response'],
    article: {
      summary: "burl exists because in many environments — server-side header bidding, CTV apps, some in-app SDK contexts — the adm never reliably executes JavaScript. A pixel buried inside the creative markup can't be trusted as the billing signal there, so the exchange fires burl itself as a more reliable, infrastructure-level confirmation of delivery.",
      howItWorks: "The DSP includes a burl in its bid response alongside nurl and adm, all carrying the ${AUCTION_PRICE} macro. The exchange fires burl server-side at the point it considers the impression delivered — this can happen independently of whether the creative's own embedded pixel fired successfully.",
      whyItMatters: "Whichever event a DSP chooses to bill off — adm's impression pixel vs burl — becomes the de facto definition of 'what counts as a real impression' between trading partners. This single choice is one of the most common root causes of billing discrepancy disputes between DSPs and publishers.",
      watchOutFor: "Billing off burl means trusting the exchange's own internal definition of 'delivered,' which may differ from 'actually rendered to a real user.' Billing off the adm pixel means trusting JavaScript execution that can silently fail in CTV, in-app, or server-side contexts. Neither is universally correct — the right choice depends on the inventory environment."
    }
  },
  {
    id: 'render-view-billable', clusterId: 'measurement', name: 'Render vs. View vs. Billable Event',
    def: "Three distinct signals often confused as one: render (creative markup loaded and executed), view (met the IAB viewability standard — 50% visible for 1+ second), and billable event (whichever specific signal the commercial contract designates as the payment trigger). A CPM deal usually bills off render/burl; a vCPM deal bills off viewability specifically.",
    related: ['burl','adm-field','viewability','om-sdk','iframe','post-auction-sequence'],
    article: {
      summary: "These three events are frequently treated as synonyms in everyday conversation, but they are not the same thing, and the gap between them is exactly where billing discrepancies and 'why doesn't my reporting match yours' disputes come from.",
      howItWorks: "Render: the creative's markup loaded and executed in the ad slot — technical success, but doesn't mean a human saw it (could be below the fold, background tab, hidden iframe). View: the creative met the IAB viewability standard, a stricter condition than render, measured via OM SDK across iframe boundaries. Billable event: whichever signal the commercial contract specifies as the payment trigger — a business decision, not a technical inevitability.",
      whyItMatters: "Two impressions that both 'rendered' identically can have completely different billing outcomes depending on whether the deal is standard CPM (bills off render/burl) or vCPM — viewable CPM (bills off the stricter viewability bar). Understanding which event a given deal bills off is essential to explaining discrepancies to a trading partner.",
      watchOutFor: "A discrepancy between a DSP's reported impressions and a publisher's reported impressions isn't necessarily an error — it's often the predictable result of two parties measuring different events (render vs. burl vs. third-party-verified view) and calling the result the same word, 'impression.' Always confirm which event each side is counting before assuming something is broken.",
      deepDive: [
        { heading: "Where macros fit in", body: "${AUCTION_PRICE} is the connective tissue across nurl, burl, and adm, letting all three carry the same encrypted clearing price regardless of which one ends up being the official billing trigger. There is no standardized universal macro for render or view in the same family as the price macro — render and view are typically reported as separate events, often through OM SDK callbacks or vendor-specific tracking pixels, rather than substituted into a single URL the way price is. Price has one standardized mechanism across the OpenRTB spec; render and viewability tracking is comparatively fragmented and vendor-specific." },
        { heading: "Why this is a senior-level diagnostic instinct", body: "When a publisher or DSP partner reports an impression count mismatch, the reflex of a junior operator is to assume something is broken. The more accurate first question is: are we both counting the same event? Checking whether one side counts render/burl and the other counts third-party-verified viewability resolves a large share of 'discrepancy' conversations without anything actually being wrong on either side." }
      ]
    }
  },

  // ── COMMERCIAL TERMS ──────────────────────────────────────
  {
    id: 'take-rate', clusterId: 'commercial', name: 'Take Rate',
    def: "The percentage of gross transaction value an exchange or SSP keeps as its own revenue before paying the publisher. Take Rate = (Gross Revenue − Publisher Payout) / Gross Revenue. A 30% take rate means for every $1 a buyer spends, $0.30 stays with the exchange and $0.70 goes to the publisher.",
    related: ['revenue-share','gross-vs-net','principal-media','spo','rpm'],
    article: {
      summary: "Take rate is the single number that determines how much of an advertiser's dollar actually reaches the publisher. It's also the primary commercial lever in supply chain transparency debates — SPO exists largely because stacked take rates across multiple intermediaries were quietly absorbing large portions of advertiser spend.",
      howItWorks: "Take Rate = (Gross Revenue − Publisher Payout) / Gross Revenue. If a DSP pays the exchange $0.00227 per thousand requests (gross rCPM), and the exchange pays the publisher $0.00159 (publisher cost rCPM), the exchange keeps $0.00068 — which is 30% of $0.00227. All three numbers are the same target, expressed from different perspectives: gross (buyer-facing), publisher cost (supply-facing), and net (internal margin).",
      whyItMatters: "Take rate is one of the most scrutinized numbers in programmatic. A widely-cited study (ISBA/PwC, 2020) found that for every £1 spent by an advertiser in programmatic, only ~51p reached the publisher — the other 49p was stacked take rates across DSPs, exchanges, SSPs, data providers, and agency trading desks. SPO is the industry's structural response to this problem.",
      watchOutFor: "Take rates are often not publicly disclosed and can vary significantly by deal type — open exchange vs PMP vs curated deals — and by partner relationship. A named partner relationship often carries a more favorable take rate than anonymous open exchange. Always confirm whether a reported RPM figure is gross or net before drawing conclusions.",
      deepDive: [
        { heading: "Take rate vs principal media", body: "These are related but not the same. Take rate is a disclosed, structural fee — the exchange states upfront 'we keep 20%.' Principal media is when an agency takes an undisclosed margin by trading as a principal rather than charging a transparent fee. Take rate is the legitimate, transparent version of 'someone in the chain keeps a cut.' Principal media is what happens when that cut becomes hidden rather than disclosed." },
        { heading: "Why take rates vary by deal type", body: "Open exchange take rates tend to be standardized and disclosed (typically 15-25% for major SSPs). PMP and curated deals often carry additional take rates stacked on top — the curator's cut, the SSP's deal fee, the DSP's platform fee — since more intermediaries are involved in assembling the deal. This is part of why SPO exists as a discipline: advertisers trying to find the shortest, lowest-take-rate path to the same inventory." }
      ]
    }
  },
  {
    id: 'revenue-share', clusterId: 'commercial', name: 'Revenue Share',
    def: "The contractual agreement defining what percentage of gross revenue goes to the publisher versus what the exchange keeps. The publisher-facing framing of take rate. 'We offer a 70/30 revenue share' means 70% to the publisher, 30% to the exchange.",
    related: ['take-rate','gross-vs-net','publishers','rpm'],
    article: {
      summary: "Revenue share is take rate from the publisher's perspective. When you're talking to a DSP or buyer, you use take rate or margin. When you're talking to a publisher about what they'll earn, you use revenue share. Same math, different framing.",
      howItWorks: "A 70/30 revenue share means: for every $1 the exchange collects from buyers, $0.70 goes to the publisher, $0.30 stays with the exchange. The publisher's rCPM (the publisher cost rCPM from the example in this atlas) directly reflects their side of the revenue share.",
      whyItMatters: "Revenue share is one of the primary commercial levers publishers use when evaluating which exchanges and SSPs to work with. A higher revenue share (e.g., 80/20 vs 70/30) is a direct increase in publisher yield — all else being equal, publishers should route more traffic to partners offering a better revenue share. In practice 'all else equal' rarely holds — an exchange with a 70/30 share but higher demand density may yield more absolute revenue than one offering 80/20 with weaker demand.",
      watchOutFor: "Revenue share agreements can be gross or net of fees — confirm which before comparing offers. An 80% share of net revenue (after technology fees are deducted) can be worth less than a 70% share of gross revenue depending on what's included in the 'net' deduction."
    }
  },
  {
    id: 'rebate-avb', clusterId: 'commercial', name: 'Rebate / AVB (Agency Volume Bonus)',
    def: "A payment made by a media owner (publisher, exchange, SSP, or platform) back to an agency or holdco in exchange for committed spend volume. The official industry term is Agency Volume Bonus. Disclosed and legal when the agency tells the client. Controversial and widespread when undisclosed. A structural mechanism for agency opacity alongside principal media.",
    related: ['principal-media','take-rate','spend-commitment','holding-company','log-level-data'],
    article: {
      summary: "A rebate is a retroactive payment — the media owner says 'if you spend X with us this year, we'll pay you back Y% at year end.' The agency receives this payment. The client often doesn't know it exists. This is AVB — Agency Volume Bonus — and it's one of the most commercially contested practices in agency-media relationships.",
      howItWorks: "An exchange might offer an agency trading desk: 'commit $50M in spend through us this year and we'll rebate 5% of the total back to you at year end.' The agency agrees, routes spend toward that exchange to hit the threshold, and receives $2.5M at year end. If disclosed to clients, this is legal. If undisclosed — and the agency is routing client spend partly to hit a rebate threshold rather than purely for campaign performance — the conflict of interest is identical to principal media in nature if not in structure.",
      whyItMatters: "AVBs create a structural incentive for agencies to route spend toward partners who offer the best rebate, not necessarily the best performance. At scale — GroupM negotiating AVBs across $60B in annual spend — these payments are commercially very significant. The ANA (Association of National Advertisers) published a landmark 2016 study explicitly calling out undisclosed AVBs as widespread in US media buying.",
      watchOutFor: "AVBs are more prevalent and more openly discussed in some markets than others — they're relatively normalized in some European markets and more controversial in the US. When evaluating whether an agency's DSP or exchange recommendations are truly performance-driven, it's worth understanding whether AVB arrangements exist. This isn't paranoia — it's commercial literacy.",
      deepDive: [
        { heading: "Rebate vs principal media — the distinction", body: "Both create agency incentives misaligned with client performance. The structural difference: in principal media, the agency makes margin by buying and reselling inventory (a trading profit). In a rebate/AVB, the media owner pays the agency a bonus for directing volume (a commission-style payment). In principal media, the margin is invisible in the media price. In a rebate, the payment happens separately, after the fact, and may never touch the media invoice at all." },
        { heading: "Why 'volume bonus' is the gentler framing", body: "The term 'Agency Volume Bonus' was coined partly to normalize the practice — 'bonus for volume' sounds like standard commercial incentive structure. Critics argue the more accurate frame is 'rebate for routing client spend toward preferred partners regardless of performance.' The naming debate is itself a signal of how commercially contested this territory is." }
      ]
    }
  },
  {
    id: 'gross-vs-net', clusterId: 'commercial', name: 'Gross vs Net Revenue',
    def: "Gross revenue: the total amount a buyer pays into a transaction. Net revenue: what remains after paying the publisher (or other cost). The exchange's take rate is exactly the gap between the two. Critical distinction: 'net rCPM' and 'gross rCPM' are very different numbers — always confirm which one a report or contract refers to.",
    related: ['take-rate','revenue-share','rpm','principal-media'],
    article: {
      summary: "Gross is what comes in. Net is what stays after costs. In exchange/SSP context: gross revenue = what DSPs pay, net revenue = what the exchange keeps after paying publishers. In agency context: gross = what the client pays, net = what the agency keeps after paying for the media.",
      howItWorks: "Using real numbers from this atlas: Gross rCPM $0.00227 (what buyers pay per thousand requests) minus Publisher cost rCPM $0.00159 (what publishers receive) equals Net rCPM $0.00068 (what the exchange keeps). The take rate is net/gross = 30%. Three ways of expressing the same transaction, each relevant to a different audience.",
      whyItMatters: "Confusing gross and net creates significant errors in financial analysis. A publisher hearing 'your eCPM is $5.00' needs to know whether that's before or after the exchange takes its cut. An advertiser hearing 'your campaign spent $100,000' needs to know whether that includes tech fees or not. These distinctions sound basic but are routinely unclear in contracts and reporting.",
      watchOutFor: "Watch out for 'net of fees' clauses in revenue share agreements that define fees broadly — technology fees, data fees, auction fees can all be deducted before the revenue share percentage is applied, significantly reducing the publisher's effective share. Always read what's included in 'net' before accepting a revenue share offer."
    }
  },
  {
    id: 'spend-commitment', clusterId: 'commercial', name: 'Spend Commitment',
    def: "A contractual agreement where a DSP or agency commits to spending a minimum volume through a specific exchange or SSP over a set period (quarterly or annual) in exchange for improved rates, data access, or preferred treatment. The exchange gets revenue predictability; the buyer gets a discount or benefit.",
    related: ['take-rate','rebate-avb','pmp','revenue-share','holding-company'],
    article: {
      summary: "Spend commitments are how large buyers get preferred terms from exchanges and SSPs. Instead of buying at standard open-auction prices, the buyer agrees to route a minimum spend volume through the platform — in return for a reduced take rate, access to premium data, or priority deal access.",
      howItWorks: "An agency trading desk might commit to $20M in annual spend through an exchange in return for a reduced platform fee (e.g. 15% instead of 20%), preferred PMP inventory access, or an AVB payment at year end. The commitment is contractual — if the buyer doesn't hit the threshold, penalties or clawbacks may apply. Both sides bet on the relationship delivering mutual commercial value.",
      whyItMatters: "Spend commitments create structural routing incentives. Once an agency has committed $20M to a specific exchange, they have an internal incentive to route spend toward that exchange to hit the threshold — regardless of whether it's always the best-performing channel for every campaign. This is how take rates, AVBs, and spend commitments together create a web of commercial incentives that can diverge from pure performance optimization.",
      watchOutFor: "Spend commitments are sometimes agreed at the holdco level (e.g. GroupM commits $X across all its agencies) and then allocated down to individual agencies and clients without those clients necessarily knowing the commitment exists or influencing whether their spend is counted toward it. This is one of the opacity mechanisms that SPO and log-level data access are specifically designed to surface."
    }
  },

  // ── TRACKERS ──────────────────────────────────────────────
  {
    id: 'tracker', clusterId: 'measurement', name: 'Tracker (Ad Tracking Pixel)',
    def: "A URL — usually a 1x1 transparent pixel image request or JavaScript snippet — embedded inside the adm. When a specific event occurs during the ad's lifecycle (render, view, click, error), the tracker URL fires, and whoever owns it logs that the event happened. The adm is the creative plus a whole set of these embedded tracking calls.",
    related: ['adm-field','burl','render-view-billable','vast-tracking-events','viewability','click-id','om-sdk'],
    article: {
      summary: "A tracker is the actual mechanism by which render, view, click, and error signals get reported back to whoever needs them — the DSP, a verification vendor, or the agency. The adm isn't just the creative; it's the creative plus this set of embedded tracking calls.",
      howItWorks: "Each tracker type reports a different moment: an impression tracker fires once the creative renders. A viewability tracker fires only when the IAB viewability threshold is met, usually via OM SDK callbacks rather than a simple pixel, since it requires ongoing position checks. A click tracker fires when the user clicks, before redirecting to the landing page. An error tracker fires if the creative fails to load or render correctly.",
      whyItMatters: "Trackers are literally how the render vs. view vs. billable distinction gets implemented technically. The 'render' signal typically comes from the basic impression tracker; the 'view' signal comes from the viewability tracker. Which tracker a deal's billing is tied to is a commercial decision with real money attached.",
      watchOutFor: "A single adm often contains trackers from multiple parties simultaneously — the DSP's own trackers, a third-party verification vendor's trackers (DoubleVerify, IAS), and sometimes the agency's own trackers. Each is a separate network call, and a creative with many stacked trackers from multiple parties adds real latency and load risk.",
      deepDive: [
        { heading: "Error trackers — the diagnostic goldmine", body: "Error trackers fire if the creative fails to load or render correctly — a malformed VAST response, a missing media file, a JavaScript error. Error tracker fire rates are one of the clearest signals when something's broken in a creative or its delivery chain, and are often the first place to look when a campaign's delivered impression count is lower than expected." },
        { heading: "Why discrepancies between parties are structurally built in", body: "If a DSP reports 10,000 impressions using their own impression tracker, a verification vendor reports 9,200 viewable impressions using their viewability tracker, and an agency reports 9,400 verified impressions using a third tracker — none of these numbers are necessarily wrong. They are three different trackers, firing on three different conditions, all legitimately measuring something real but not the same thing." }
      ]
    }
  },
  {
    id: 'vast-tracking-events', clusterId: 'measurement', name: 'VAST Tracking Events',
    def: "A richer tracker set specific to video ads, defined inside the VAST XML wrapper, reporting points along the video's playback timeline: start, firstQuartile (25%), midpoint (50%), thirdQuartile (75%), complete (100%), plus mute/unmute, pause/resume, skip, and fullscreen.",
    related: ['tracker','vast','adm-field','first-price-auction','om-sdk'],
    article: {
      summary: "Video has a timeline, so video trackers are far richer than display trackers — instead of one impression tracker, video creatives carry a whole sequence of trackers firing at specific playback milestones.",
      howItWorks: "Each milestone — start, firstQuartile, midpoint, thirdQuartile, complete — is a separate tracker URL defined in the VAST XML, fired by the video player at that exact point in playback. Mute/unmute, pause/resume, skip, and fullscreen are fired on user interaction rather than playback progress.",
      whyItMatters: "Quartile trackers let an advertiser distinguish 'the video loaded' from 'someone actually watched a meaningful chunk of it' — a much more honest signal of real ad exposure for video than a single impression tracker. Some video deals tie billing specifically to firstQuartile rather than just video start, so the advertiser only pays once a meaningful portion has actually played.",
      watchOutFor: "Every quartile tracker, plus any verification vendor's own video trackers stacked on top, is another network call. A video adm with 15+ tracking events plus third-party verification tags can mean dozens of requests firing around a single impression — part of why deep VAST wrapper chains are a real operational load-failure risk, since each layer typically adds its own tracker set on top of the previous one."
    }
  },
];

async function pushToFirestore() {
  console.log(`Pushing ${terms.length} terms to Firestore...`);

  const batch = db.batch();
  terms.forEach(term => {
    const ref = db.collection('terms').doc(term.id);
    batch.set(ref, term);
  });
  await batch.commit();

  console.log('Done! All terms pushed to Firestore.');
  process.exit(0);
}

pushToFirestore().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
