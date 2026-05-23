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

// New terms to ADD (not in original seed)
const newTerms = [
  {
    id: 'deep-link',
    clusterId: 'measurement',
    name: 'Deep Link',
    def: 'A URI that opens a mobile app directly to a specific screen rather than the home page. In adtech, deep links are passed in bid responses so that clicking an ad takes a user straight to a product page inside an app — not a browser redirect.',
    related: ['mmp', 'mobile-in-app', 'click-id', 'bid-response', 'fallback-url'],
    article: {
      summary: 'A deep link is a URI scheme (e.g. myshop://product?id=123) that bypasses an app\'s home screen and drops the user exactly where the ad promised. If the app isn\'t installed, a fallback URL sends them to the App Store or a web page instead.',
      howItWorks: 'The DSP includes two URLs in the bid response: a deeplink (myshop://product?id=123) and a fallback (https://play.google.com/store/...). When the user clicks, the publisher SDK tries the deeplink first. If the app is installed, it opens directly on the product. If not, the SDK fires the fallback. The MMP logs the click from whichever path fired and attributes the conversion.',
      whyItMatters: 'Deep links dramatically reduce friction between ad click and intended action. A user clicking a sneaker ad who lands on the product page converts far better than one dumped on the app home screen. Publishers who support deep links in their bid requests command higher CPMs because they demonstrably drive better outcomes.',
      watchOutFor: 'If the fallback URL is missing or broken, users on devices without the app see a dead end. This kills conversion rates and inflates apparent bounce rates. Always test both the deep link and fallback path before launching.',
    }
  },
  {
    id: 'ipd',
    clusterId: 'adquality',
    name: 'Inventory Partner Domain',
    def: 'A bid request field (app.ext.inventorypartnerdomain or site.ext.inventorypartnerdomain) that identifies the actual content owner when the content is distributed by a third-party platform. Tells DSPs where to validate ads.txt — with the content owner, not the distributor.',
    related: ['ads-txt', 'spo', 'schain', 'openrtb', 'publishers'],
    article: {
      summary: 'When a CTV app like Pluto TV carries content owned by Crackle, the ad slot technically appears on Pluto but the monetization rights belong to Crackle. Without IPD, a DSP would validate ads.txt against Pluto — finding no authorized seller — and reject the bid. IPD fixes this by telling the DSP: "go validate against crackle.com instead."',
      howItWorks: 'The SSP or app operator includes the inventorypartnerdomain field in the bid request pointing to the content owner\'s domain. The DSP then fetches the ads.txt or app-ads.txt file from that domain and checks whether the SSP running the auction is listed as an authorized seller. This shifts the trust anchor from the distributor to the rights holder.',
      whyItMatters: 'Without IPD, legitimate content deals between distributors and content owners look identical to ad fraud to a DSP\'s fraud filters. Publishers and content networks lose revenue on valid inventory that gets blocked. IPD is the technical handshake that proves the supply chain is legitimate.',
      watchOutFor: 'The content owner must list the SSP in their ads.txt/app-ads.txt file for IPD validation to pass. A missing or mismatched entry still results in blocked bids, even if the deal is completely legitimate.',
    }
  },
  {
    id: 'cpl',
    clusterId: 'performance',
    name: 'CPL',
    def: 'Cost Per Lead — what an advertiser pays per lead form submission. Used in B2B, SaaS, and services where the sales cycle is long and a direct purchase in the first session is unrealistic.',
    related: ['cpa', 'cpc', 'campaign-objective', 'tofu-mofu-bofu'],
    article: {
      summary: 'CPL sits between CPC (too early) and CPA (too late) for businesses that need to qualify prospects before converting them. You pay when someone submits genuine contact information, not when they buy — because buying happens weeks later through a sales team.',
      howItWorks: 'A lead form (on Meta, LinkedIn, or a landing page) captures name, email, company, and qualifying fields. When submitted, the conversion pixel fires with a lead event. The platform attributes the lead to the originating click and charges accordingly. CPL = Total Spend ÷ Leads Generated.',
      whyItMatters: 'Not all leads are equal. A low CPL with poor lead quality is worse than a high CPL with qualified buyers. The real metric to optimize is Cost Per Qualified Lead or ultimately Cost Per Closed Deal — CPL is just the top of that funnel.',
      watchOutFor: 'Lead forms with too few fields generate high volume but low quality. Forms with too many fields scare away real prospects. The sweet spot is 3-5 fields that qualify intent without creating friction.',
    }
  },
];

// Article updates for existing terms
const articleUpdates = {
  'ivt': {
    summary: 'Invalid Traffic is any ad click, impression, or conversion not generated by a real, engaged human. It splits into GIVT (detectable) and SIVT (sophisticated). It drains ad budgets and corrupts the performance data your algorithm learns from.',
    howItWorks: 'GIVT is filtered pre-bid — DSPs and SSPs maintain blocklists of known bot signatures, data center IP ranges, and fake user agents. Bid requests from these sources are rejected before the auction runs. SIVT is different: it mimics human behavior — realistic mouse movement, plausible device signatures, human-like timing — making it invisible to standard filters. Detection requires behavioral analysis tools like HUMAN or Pixalate.',
    whyItMatters: 'Beyond wasted spend, IVT corrupts your signals. If click farms generate fake conversions, your smart bidding algorithm learns from fraudulent data and optimizes toward fraud sources. The damage compounds silently.',
    watchOutFor: 'High CTR with zero conversions. Sudden traffic spikes from obscure mobile apps you\'ve never heard of. Impressions refreshing every few seconds. Sub-1-second dwell times on landing pages. These are SIVT fingerprints.',
  },
  'givt': {
    summary: 'General Invalid Traffic is the detectable half of the IVT problem — known bots, data center IPs, fake user agents, automated pre-fetching. It\'s loud and easy to catch. DSPs filter most of it before you ever bid on it.',
    howItWorks: 'DSPs and SSPs maintain blocklists of known bot signatures sourced from the IAB/ABC Invalid Traffic List. Any bid request arriving from a data center IP range, a known crawler, or a non-browser environment (headless browser, email client) is matched against the list and dropped pre-bid. Publishers never know the bid was rejected.',
    whyItMatters: 'Pre-bid GIVT filtering is largely invisible to advertisers because it works. The problem is that it gives a false sense of security — SIVT, the harder threat, passes through the same filters undetected.',
    watchOutFor: 'GIVT rates above 5% in a campaign report are a signal that traffic quality controls upstream have gaps. It\'s worth auditing which SSP paths are delivering the GIVT and applying SPO accordingly.',
  },
  'sivt': {
    summary: 'Sophisticated Invalid Traffic is the hard-to-catch half — click farms, ad stacking, pixel stuffing, domain spoofing, SDK simulation. Designed from the ground up to look human. Requires specialized detection, not just blocklists.',
    howItWorks: 'SIVT operators run click farms with real devices or sophisticated bots that simulate human behavior: they move cursors, vary timing, rotate device fingerprints, and operate within normal session patterns. Ad stacking places multiple invisible ads in one slot — only the top is visible, but all fire impression pixels. Pixel stuffing hides ads in 1x1 pixels that fire tracking events without any real exposure.',
    whyItMatters: 'SIVT is the financially significant threat. Because it mimics human behavior, it passes pre-bid filters and generates "legitimate-looking" metrics. Publishers running SIVT operations can sustain them for months before detection tools catch up.',
    watchOutFor: 'Viewability scores below 30% on inventory that shouldn\'t have placement issues. Extremely high impression volume from a single SSP path with zero engagement. These are signals worth escalating to a verification vendor.',
  },
  'cookie-sync': {
    summary: 'Cookie syncing is how SSPs and DSPs recognize the same user across their separate systems. Because browsers prevent cross-domain cookie reading (same-origin policy), platforms use redirects and pixel calls to exchange their internal user IDs. The result: a match table that lets both sides know they\'re looking at the same person.',
    howItWorks: 'When a user loads a page with an SSP tag, the SSP recognizes them as ID=abc123. To sync with a DSP, the SSP fires a redirect to the DSP\'s sync endpoint: dsp.com/usersync?ssp_id=abc123. The DSP receives this, checks if it knows the user, and stores the mapping: "SSP ID abc123 = our ID xyz987." The next time a bid request arrives with abc123, the DSP knows exactly who it\'s bidding on.',
    whyItMatters: 'Without cookie syncing, DSPs bidding on SSP inventory are effectively bidding on strangers. With it, they can apply frequency caps, retargeting lists, and audience segments across every publisher in the SSP\'s network. Sync rate (what % of users are matched) directly affects targeting accuracy and CPMs.',
    watchOutFor: 'Each redirect in the sync process adds latency to page load. Publishers hosting many SSPs accumulate sync overhead. Third-party cookie restrictions in Safari and Firefox have broken sync for a significant share of traffic — ID solutions like UID2 exist partly to solve this.',
  },
  'uid': {
    summary: 'The UID is the actual value inside a cookie — an alphanumeric string like abc123xyz789. Not a name, not an email. Just a token that lets platforms recognize you across sessions. Without a UID, a DSP is bidding on an anonymous ghost.',
    howItWorks: 'When your browser pings an SSP or DSP server for the first time, the server checks whether it has seen your browser before. If not, it generates a new UID and stores it in a cookie: Set-Cookie: ssp_userid=abc123. On your next visit, the browser sends that cookie back, and the server instantly recognizes you. This UID is then used to apply frequency caps, lookup your audience segments, and decide bid prices.',
    whyItMatters: 'The UID is the atom of programmatic targeting. Frequency capping, retargeting, attribution, and audience segmentation all depend on the platform being able to read the same UID across multiple sessions. When the UID breaks (cookie deleted, different browser, cookie blocked), all of these capabilities degrade simultaneously.',
    watchOutFor: 'One person has many UIDs — a different one for each platform, each browser, each device. This fragmentation is the core identity problem in adtech. Cookie syncing and identity resolution exist specifically to stitch these UIDs together.',
  },
  'third-party-cookies': {
    summary: 'Third-party cookies are cookies set by a domain other than the site you\'re visiting. They\'re what allowed adtech to track users across the web for 20 years. Safari and Firefox have already blocked them. Chrome moved to a user-choice model in 2024 — most users leave tracking enabled, but the writing is on the wall.',
    howItWorks: 'You visit news.com. The page loads an SSP tag from ssp.com. The SSP sets a cookie — but it\'s a third-party cookie because it comes from ssp.com, not news.com. When you later visit sports.com, which also has an ssp.com tag, the SSP reads the same cookie and recognizes you. That cross-site recognition is the mechanism that powers retargeting, frequency capping, and attribution across the open web.',
    whyItMatters: 'Everything in programmatic that requires recognizing a user across different websites depends on third-party cookies. Their erosion forces the industry to replace them with logged-in identity (UID2), contextual signals, and probabilistic modeling — none of which fully replicate what third-party cookies did cheaply and at scale.',
    watchOutFor: 'Safari traffic is already effectively cookieless. If your campaign reporting shows dramatically better performance on Chrome vs Safari, you\'re seeing the cookie gap in real time — Safari users look like new users on every visit.',
  },
  'header-bidding': {
    summary: 'Header bidding is the publisher-side revolution that replaced the sequential waterfall with a simultaneous auction. Instead of calling demand partners one by one, the publisher pings all SSPs at the same time — before calling the ad server — and takes the highest bid. Publishers typically see 20-50% revenue uplift versus waterfall.',
    howItWorks: 'Prebid.js sits in the website\'s header and runs before the page fully loads. When a user visits, Prebid fires bid requests to all connected SSPs simultaneously. Each SSP has a defined timeout (typically 800-1200ms) to respond. All responses come back, Prebid identifies the highest bid, and passes it to GAM as a key-value pair. GAM compares it against direct deals and serves whichever wins.',
    whyItMatters: 'The waterfall meant the first SSP to fill always won, regardless of price. A DSP willing to pay $5 sitting in position 3 would lose to a DSP paying $1 in position 1. Header bidding surfaces the true market price for every impression — which is why publishers love it and why many SSPs initially resisted it.',
    watchOutFor: 'Too many SSP partners in header bidding increases latency and can hurt Core Web Vitals. The rule of thumb: 5-8 high-quality SSP partners with a hard timeout of 1000ms is better than 15 partners with a 2000ms timeout.',
  },
  'waterfall': {
    summary: 'The waterfall was the original auction model: the publisher\'s ad server calls demand partners sequentially, in priority order. The first partner to fill wins, regardless of what the next partner might have paid. It was simple, predictable, and left enormous revenue on the table.',
    howItWorks: 'In GAM, line items are ranked by priority and expected CPM. When an impression opportunity arrives, GAM first checks direct deals (highest priority). If none match, it moves down to network partners — calling Partner A first. If Partner A doesn\'t fill within its timeout, GAM calls Partner B. This continues until someone fills or the request falls through to house ads.',
    whyItMatters: 'The waterfall\'s fundamental flaw: a buyer willing to pay $10 who sits at position 3 loses every time to a buyer paying $2 at position 1. Publishers were systematically undermonetizing their inventory. Header bidding fixed this by making all partners compete simultaneously.',
    watchOutFor: 'Some publishers still use a hybrid model: header bidding for the open market, with a waterfall fallback for guaranteed deals and house ads. Understanding both is important — direct deal line items in GAM still follow waterfall priority logic even when header bidding is active.',
  },
  'vast': {
    summary: 'VAST (Video Ad Serving Template) is the IAB\'s XML standard that makes video ads work across any player and any publisher. It defines what video to play, how long, whether it\'s skippable, and which URLs to fire for tracking. Without VAST, every video player would need its own ad format.',
    howItWorks: 'When a video player needs an ad, it sends a request to an ad server. The ad server responds with a VAST XML file containing: the media file URL (the actual video), tracking event URLs (impression, quartile views, completion, click), skip parameters, and duration. The player reads the XML, loads the video, and fires each tracking URL at the right moment — 25% played, 50% played, etc.',
    whyItMatters: 'VAST is why a single video creative can run on YouTube-like environments, news sites, CTV apps, and mobile apps without modification. The publisher\'s player just needs to be VAST-compliant. The advertiser\'s creative just needs to be in a standard format. It\'s the universal adapter for video advertising.',
    watchOutFor: 'VAST wrappers — where a VAST response points to another VAST URL — are commonly used for third-party measurement. Each additional wrapper adds a network request and latency. Chains longer than 3-4 wrappers frequently cause video load failures, especially on mobile.',
  },
  'vpaid': {
    summary: 'VPAID (Video Player Ad Interface Definition) is an extension of VAST that allows a video ad to communicate with the video player — enabling interactivity, custom overlays, and richer engagement tracking. Being phased out in favor of SIMID due to security concerns.',
    howItWorks: 'A VPAID creative includes executable JavaScript or Flash code that runs inside the video player. This code can: show overlay buttons, report custom events (hover, expand, interaction), pause and resume playback, and collect engagement data. The player and the ad creative communicate through a defined API — the "interface definition" in the name.',
    whyItMatters: 'VPAID enabled rich interactive video experiences beyond what VAST alone could do. But its model — running arbitrary ad code inside the player — created significant security risks. Malicious VPAID creatives could execute unauthorized code in the publisher\'s environment.',
    watchOutFor: 'Many major players have deprecated VPAID support (YouTube killed it years ago). If you\'re buying video inventory and your creative is VPAID-only, expect significant delivery issues. VAST 4.x with SIMID is the current direction for interactive video.',
  },
  'om-sdk': {
    summary: 'The IAB\'s Open Measurement SDK is the industry\'s solution to SDK fragmentation in mobile measurement. Before it, a publisher\'s app might carry 5-7 separate SDKs from different verification vendors just to prove viewability. OM SDK replaces them all with one.',
    howItWorks: 'The publisher integrates the OM SDK once into their app. When an ad is served, it includes an OMID JavaScript file from the verification vendor (IAS, DoubleVerify, MOAT). The OM SDK executes this script in a secure sandbox. The script measures whether the ad was viewable, how long it was on screen, and whether it was obscured. Results are reported back to the verification vendor without their code needing to live directly in the app.',
    whyItMatters: 'The pre-OM SDK world meant publishers had to choose between carrying bloated apps (multiple SDKs) or not being able to prove viewability to advertisers who required it. OM SDK made mobile viewability measurement scalable — which is why viewability guarantees on mobile inventory became commercially viable.',
    watchOutFor: 'OM SDK only works if the ad creative includes the correct OMID JS script. If the creative is served without it, the SDK has nothing to execute and viewability goes unmeasured. Always confirm with your DSP that OMID is included in the creative trafficking.',
  },
  'spo': {
    summary: 'Supply Path Optimization is the buyer-side practice of auditing and pruning the routes from your DSP to publishers — eliminating resellers, reducing fees, and ensuring you\'re buying legitimate direct inventory. In an ecosystem where the same impression can be sold by 5 different SSPs, SPO is how you stop paying the adtech tax.',
    howItWorks: 'A DSP examines its bid request data and identifies: which SSPs are delivering each publisher\'s inventory, whether those SSPs are listed as Direct or Reseller in the publisher\'s ads.txt, how many hops exist in the SupplyChain Object, and what fees each path charges. Paths with resellers, missing schain data, or high fees get reduced or blocked. Direct paths to publishers with clean ads.txt files get prioritized.',
    whyItMatters: 'A $10 CPM bid in a DSP can arrive at the publisher as $4-6 after SSP fees, reseller margins, and data costs. The publisher sees low yields, the advertiser pays high CPMs, and the middle takes the rest. SPO compresses this — benefiting both sides while cutting out unnecessary intermediaries.',
    watchOutFor: 'Over-aggressive SPO can reduce bid density and actually hurt win rates. The goal is not the fewest paths — it\'s the highest-quality paths. Completely cutting an SSP that has even partial direct relationships with publishers you want can backfire.',
  },
  'gam': {
    summary: 'Google Ad Manager is the dominant publisher ad server — the system that decides what actually appears in every ad slot. It manages direct deals, programmatic auctions, house ads, and yield optimization simultaneously. Understanding GAM is understanding how publisher monetization actually works.',
    howItWorks: 'Publishers define Ad Units (slots) and implement GPT tags on their pages. When a user visits, the tag calls GAM. GAM evaluates all eligible line items based on priority, targeting, and price. Direct deal line items (Sponsorship, Standard) take priority over programmatic. For remaining inventory, GAM accepts the winning header bidding bid and compares it against open auction demand. The winning creative is served.',
    whyItMatters: 'GAM is the authority that determines what runs. Even if a DSP wins a header bidding auction, GAM can override it with a higher-priority direct deal. Ad ops teams live in GAM — it\'s where campaigns are trafficked, delivery is monitored, and discrepancies are investigated.',
    watchOutFor: 'GAM line item priority settings are the most common source of delivery issues. A Standard line item set to Priority 8 will underdeliver against a Sponsorship at Priority 4, even if the CPM is higher. Always verify priority settings before a campaign goes live.',
  },
  'ad-refresh': {
    summary: 'Ad refresh automatically replaces an ad in a slot and triggers a new auction while the user stays on the same page. Done correctly, it increases publisher revenue by monetizing extended sessions. Done badly, it destroys viewability scores and gets your inventory blacklisted.',
    howItWorks: 'Two refresh trigger types: Time-based refreshes the slot every 30-90 seconds regardless of user activity. Action-based only refreshes when the user does something — scrolls, clicks, or interacts with the page. Action-based is the current standard because it proves the user is active, making the new impression genuinely valuable to buyers.',
    whyItMatters: 'An engaged user spending 10 minutes on an article is a monetization opportunity. Without refresh, you serve one impression per slot per visit. With action-based refresh, that same user generates 5-10 impression opportunities. The revenue upside is significant for content-heavy sites.',
    watchOutFor: 'The golden rule: only refresh ads that are 100% in view. Refreshing a footer ad while the user is reading the top of the page means selling invisible impressions — DSPs detect this and add your domain to low-quality bid filters. Viewability-gated refresh is non-negotiable.',
  },
  'click-id': {
    summary: 'A click ID is a unique alphanumeric string assigned to each individual ad click by the advertising platform. It\'s created at the redirect checkpoint — the split second between click and landing. It\'s how the platform proves that a specific conversion was caused by a specific click.',
    howItWorks: 'When a user clicks an ad, instead of going directly to the advertiser\'s site, they briefly hit the platform\'s redirect endpoint (adplatform.com/click?campaign=123). In that fraction of a second, the platform generates a unique click ID (e.g. K39F82A7), logs the click, and appends the ID to the landing page URL: site.com/?click_id=K39F82A7. The site must capture and store this ID — usually in a cookie. When the user converts, the conversion pixel includes the stored click ID, allowing the platform to match the conversion back to the original click.',
    whyItMatters: 'Without click IDs, attribution is group-level at best — you know the campaign drove conversions, but not which specific creative, audience, or placement. Click IDs enable person-level attribution: this exact user saw this exact ad and then bought.',
    watchOutFor: 'The most fragile moment is the landing page. If the page redirects (e.g. to a localized version) and strips URL parameters, the click ID disappears. If a cookie consent banner blocks storage scripts before they run, the ID is never saved. Test your full click path before going live.',
  },
  'gtm': {
    summary: 'Google Tag Manager is the container that manages all measurement tags on an advertiser\'s site. It\'s the operational layer between your website and every ad platform that needs to know something happened. Without GTM (or equivalent), every conversion pixel, click ID storage script, and analytics tag would require a developer to hardcode.',
    howItWorks: 'GTM sits on the page as a single container tag. Inside the container are individual tags (each one a tracking script), triggers (conditions that fire the tag — e.g. "page URL contains /confirmation"), and variables (data to include — e.g. purchase value, click ID from URL). When a user lands, GTM reads the URL, extracts the click ID, stores it in a cookie. When the user reaches the confirmation page, GTM fires the conversion tags with the stored click ID and purchase value.',
    whyItMatters: 'GTM decouples tracking from development. Marketing teams can add, edit, or remove tracking tags without waiting for engineering. In practice, most conversion tracking failures trace back to GTM misconfiguration — triggers firing on wrong pages, variables not capturing correctly, or tags blocked by consent management.',
    watchOutFor: 'GTM preview mode is your first debugging tool. Always test in preview before publishing. Common failure: a trigger set to "Page URL equals /confirmation" that fails because the actual URL is "/order-confirmation" or has query parameters.',
  },
  'conversion-pixel': {
    summary: 'A conversion pixel is the signal that closes the attribution loop. It fires from the confirmation page — purchase, signup, install — and tells the advertising platform that the outcome it was optimizing for actually happened. It\'s not a visible image; it\'s an HTTP request carrying data.',
    howItWorks: 'When a user reaches the confirmation page, GTM fires a tag that makes a network request to the ad platform: tracker.platform.com/conversion?click_id=K39F82A7&value=120. The platform receives this, finds the click ID in its database, and connects: "the click at 14:32 on Tuesday led to a €120 purchase." This data feeds back into the bidding algorithm — future bids for similar users increase.',
    whyItMatters: 'Without conversion pixels, smart bidding has no signal to optimize toward. The algorithm is flying blind. With clean conversion data, it learns which users, placements, and times drive real outcomes — and adjusts bids accordingly. Conversion data quality directly determines campaign performance.',
    watchOutFor: 'Duplicate conversion tracking is a common problem — the pixel fires multiple times for one purchase (page reloads, back-button navigation). This inflates reported conversions and distorts the algorithm\'s learning. Use order IDs or transaction IDs to deduplicate.',
  },
  'smart-bidding': {
    summary: 'Smart bidding is the platform\'s algorithm bidding on your behalf toward a defined conversion goal. You set the target (CPA, ROAS, Max Conversions) and the system adjusts every auction in real time based on signals. It\'s not magic — it\'s pattern recognition on historical data.',
    howItWorks: 'For every auction, the algorithm evaluates hundreds of signals: device type, time of day, location, browser, audience membership, recent behavior, and more. It compares these signals against historical patterns of who converted and at what value. If the signal profile looks like a likely converter, it bids high. If not, it bids low or doesn\'t bid at all. The more conversion data it has, the more confident and efficient its predictions.',
    whyItMatters: 'Manual bidding at scale is impossible — you can\'t set different bids for every device/time/location combination across millions of auctions. Smart bidding does this automatically and continuously. The catch: it only works when it has sufficient data. Starved of conversions, it reverts to broad exploration.',
    watchOutFor: 'The learning phase is sacred — don\'t touch the campaign. Every significant edit (budget change >30%, audience change, objective change) resets learning. A campaign that never exits learning never performs efficiently. The most common mistake: making changes before the algorithm has enough data to stabilize.',
  },
  'mmp': {
    summary: 'A Mobile Measurement Partner is the independent attribution referee for mobile ad campaigns. When Meta, your DSP, and an ad network all claim credit for the same app install, the MMP holds the authoritative answer — because it sits on the device and sees every touchpoint.',
    howItWorks: 'The MMP SDK is integrated into your app. When a user clicks an ad, the click ID and source data are stored server-side by the MMP. When the user installs the app and opens it for the first time, the SDK fires — sending device identifiers (IDFA, GAID, or probabilistic signals) to the MMP. The MMP matches these against recorded clicks using a priority rule: last click wins within the attribution window. One source gets credit. Everyone else doesn\'t.',
    whyItMatters: 'Without an MMP, every ad network self-reports — and every network reports more conversions than actually happened (view-through overcounting, extended windows, double-counting). MMPs impose a single source of truth. Major advertisers require MMP integration before running with any network.',
    watchOutFor: 'Post-ATT, probabilistic matching (when IDFA is unavailable) is less precise than deterministic. MMPs have adapted but attribution accuracy on iOS has genuinely declined. Campaigns that look equally strong on iOS and Android pre-ATT will often show iOS performance degradation post-ATT — this is attribution loss, not necessarily real performance loss.',
  },
  'last-click-attribution': {
    summary: 'Last-click attribution gives 100% of conversion credit to the final ad touchpoint before a purchase. It\'s the default model in most platforms. It\'s simple, measurable, and systematically wrong about how marketing actually works.',
    howItWorks: 'Platform records every ad interaction for a user. When a conversion fires, the attribution logic looks back through the interaction history and assigns all credit to the most recent click within the attribution window. All earlier touchpoints — the YouTube ad that introduced the brand, the display ad that drove the site visit — get zero credit.',
    whyItMatters: 'In a last-click world, retargeting and brand search always look like heroes because they intercept users who were already going to buy. Top-funnel channels that genuinely drive discovery and intent look useless because they\'re credited with nothing. Advertisers who optimize on last-click end up cutting awareness spend and wondering why their retargeting audiences shrink.',
    watchOutFor: 'If your brand search campaigns show extremely high ROAS and your prospecting campaigns show near-zero ROAS, you\'re almost certainly seeing last-click distortion. Switching to data-driven attribution often reveals that prospecting was doing real work.',
  },
  'data-driven-attribution': {
    summary: 'Data-driven attribution uses machine learning to distribute conversion credit across all touchpoints based on their actual contribution to the outcome. It\'s the current standard in Google Ads and Meta Ads — the most accurate model available at scale.',
    howItWorks: 'The algorithm analyzes thousands of customer journeys and identifies patterns. It compares paths that converted versus paths that didn\'t. If users who saw a TikTok ad before the Google ad convert 3x more than those who saw only the Google ad, the model assigns TikTok proportional credit. Credit is distributed across all touchpoints weighted by incremental impact, not position.',
    whyItMatters: 'DDA reveals the true value of each channel in the funnel. Upper-funnel channels that look worthless in last-click often show significant contribution in DDA. This changes budget allocation decisions — often moving money back into awareness and prospecting.',
    watchOutFor: 'DDA requires sufficient conversion volume to work — Google recommends 50+ conversions per month per campaign. Below this threshold, it defaults to last-click. DDA is also a black box: you can\'t audit its specific credit assignments, only trust the model.',
  },
  'product-feed': {
    summary: 'A product feed is the structured data file — XML, CSV, or JSON — that contains your entire inventory: every product\'s ID, title, price, image URL, and availability. It\'s the source of truth that dynamic retargeting reads from. A broken feed means broken campaigns.',
    howItWorks: 'You maintain the feed on your server. DSPs and ad platforms fetch it on a schedule (often every 24 hours). When the DSP wins an auction for a user who viewed product ID 48291, it queries the feed for that product\'s current data — image, price, title — and assembles the creative on the fly. If the product is out of stock, a healthy feed flags it and the system doesn\'t show ads for unavailable products.',
    whyItMatters: 'DCO campaigns showing the exact product a user viewed, at the current price, in their currency are dramatically more effective than generic retargeting. The feed is what makes that personalization possible at scale — no human manually creates 10,000 product ad variations.',
    watchOutFor: 'Stale feeds cause ads for out-of-stock or discontinued products — damaging user experience and wasting budget. Price discrepancies between the feed and the website create trust issues. Feed freshness (how often it updates) is a technical requirement, not a nice-to-have.',
  },
  'campaign-objective': {
    summary: 'The campaign objective is the single most important setting in a performance campaign — it tells the algorithm what outcome to optimize for. Choose wrong and the machine delivers exactly what you asked for, which may be nothing like what you needed.',
    howItWorks: 'Meta, Google, and DSPs structure objectives into three categories: Awareness (maximize reach and impressions), Consideration (maximize clicks, engagement, video views), and Conversion (maximize purchases, leads, installs). Selecting an objective sets the optimization signal — the platform shows your ads to users most likely to complete that specific action based on historical behavior.',
    whyItMatters: 'A Traffic objective gets you clicks. Not buyers — clicks. The algorithm finds people who click ads, not people who buy things. If you want purchases, you need a Conversion objective — even if it takes longer to ramp up and costs more early. Wrong objective = optimizing toward the wrong population.',
    watchOutFor: 'A common mistake: using a Traffic or Engagement objective because Conversion campaigns "are too expensive at first." The higher early CPA in a Conversion campaign is the algorithm learning. It will come down. A Traffic campaign\'s CPA never comes down because it was never optimizing toward purchases.',
  },
  'tofu-mofu-bofu': {
    summary: 'Top/Middle/Bottom of Funnel is the framework for understanding where a user is in their journey from unaware to converted. Different funnel stages require fundamentally different creatives, objectives, targeting, and measurement approaches.',
    howItWorks: 'TOFU (awareness): the user doesn\'t know you exist. Goal: reach. Metrics: impressions, reach, video views. MOFU (consideration): the user knows you exist and is evaluating. Goal: intent signals. Metrics: add to cart, product page views, time on site, email signups. BOFU (conversion): the user is ready to act. Goal: purchase, install, signup. Metrics: CPA, ROAS, conversion rate.',
    whyItMatters: 'Showing a BOFU discount ad to a TOFU user who has never heard of your brand wastes money and confuses them. Showing an awareness brand video to a BOFU retargeting audience that added to cart yesterday loses the sale. Matching creative to funnel stage is one of the highest-leverage optimizations in performance marketing.',
    watchOutFor: 'Most campaigns fail at MOFU — they have TOFU spend and BOFU retargeting but no strategy for the consideration stage. Users who visit once and don\'t convert leak out of the funnel because there\'s nothing to bring them back. Email sequences, content retargeting, and engagement campaigns exist specifically to fill this gap.',
  },
  'retargeting-segments': {
    summary: 'Retargeting segments are distinct audience pools organized by purchase intent level. Treating all site visitors as one retargeting audience is the single most common performance marketing mistake — it mixes cold browsers with near-buyers and dilutes both.',
    howItWorks: 'The core segments, ordered by intent: View Content (visited a product page — curious), Add to Cart (high intent, nearly decided), Checkout Initiated (entered payment flow — maximum intent), and Purchasers (exclude or cross-sell). Each segment needs a different message, different bid level, and different creative. A checkout abandoner needs urgency and friction removal. A product page viewer needs social proof and education.',
    whyItMatters: 'Add to Cart audiences convert at 3-5x the rate of general site visitors. If you merge them with all visitors in one retargeting ad set, you dilute your highest-value audience with lower-intent users, your CPAs rise, and your algorithm can\'t distinguish between them.',
    watchOutFor: 'Window length matters. A 1-day Add to Cart audience is hot intent — bid aggressively. A 30-day Add to Cart audience is cold — bid like prospecting. Running a single window for all retargeting misses this dynamic entirely.',
  },
  'horizontal-scaling': {
    summary: 'Horizontal scaling grows a campaign by adding new surfaces — new audiences, creatives, geos, or placements — rather than simply pushing more budget through what\'s already running. It\'s the safer, more sustainable scaling method.',
    howItWorks: 'Instead of doubling the budget in one winning ad set (vertical), you duplicate success across new opportunities: launch a new lookalike from a different seed, test the same creative in a new geography, try the campaign on a new placement type, or create a new ad set targeting a different interest cluster. Each new surface is an independent bet — if one fails, it doesn\'t destabilize the others.',
    whyItMatters: 'Vertical scaling (just increasing budget) increases frequency in existing audiences — users see your ad more times, creative fatigue sets in faster, and CPA rises. Horizontal scaling expands reach without burnout. It also reduces the risk of the entire campaign depending on a single ad set.',
    watchOutFor: 'Horizontal scaling requires more creative. You can\'t run the same ad across 8 new ad sets and expect 8x performance — creative needs to be matched to each new audience. Under-investing in creative variety is what limits most horizontal scaling strategies.',
  },
  'creative-hook': {
    summary: 'The creative hook is the first 3 seconds of an ad — the pattern interrupt that stops a user\'s scroll before they consciously decide to watch. It\'s the single highest-leverage element in a video or social ad. If the hook fails, nothing else matters.',
    howItWorks: 'Users scroll on autopilot. The hook works by disrupting that autopilot — making the brain pay attention before the person decides to. Effective hooks: bold opening claims ("This fixed my skin in 7 days"), physical pattern breaks (sudden movement, unexpected action), direct pain point address ("Stop wasting money on ads that don\'t convert"), social proof moments ("Everyone in comments asked for this"). Ineffective hooks: slow product shots, logos first, "Hi guys so today I wanted to share...", generic stock footage.',
    whyItMatters: 'On Meta and TikTok, thumb-stop rate (what % of users watch past 3 seconds) directly feeds into the delivery algorithm. High thumb-stop = algorithm shows your ad to more people more cheaply. Low thumb-stop = your ad gets suppressed. The hook determines the price you pay for distribution.',
    watchOutFor: 'A hook that generates curiosity but has nothing to do with the product is a trap. It gets clicks from people with no intent to buy. Watch your hook-to-purchase funnel: high hook rate + low conversion rate = misleading hook. The hook must attract the right people, not just anyone.',
  },
  'bid-request': {
    summary: 'The bid request is the JSON message an SSP sends to DSPs when an impression opportunity becomes available. It\'s the complete data packet describing who is available, where, on what device, and at what minimum price. DSPs have approximately 100ms to read it and respond.',
    howItWorks: 'When a user loads a page, the SSP assembles a bid request containing: site or app identifier, ad slot size and format, user signals (device type, OS, general location, user IDs if available), floor price, consent string, and any contextual data. This gets fired to every DSP the SSP is connected to simultaneously. Each DSP evaluates the request against its targeting criteria and budget rules, and either responds with a bid or returns a no-bid.',
    whyItMatters: 'The bid request is where all targeting decisions are made. Everything in the request — user IDs, contextual signals, device data, consent flags — determines which advertisers are eligible to bid and at what price. Reading and understanding bid requests is fundamental to adtech — it\'s the raw material of the entire ecosystem.',
    watchOutFor: 'Bid request bloat is a real problem — SSPs have been known to duplicate requests or add synthetic signals to inflate apparent inventory quality. QPS filtering (only sending bid requests to DSPs likely to bid) is now standard practice on both sides to reduce waste.',
  },
  'native': {
    summary: 'Native ads are ads that match the form and function of their surrounding content — an article in a news feed, a recommended product in a shopping app, a "you might also like" widget at the bottom of a page. They\'re not a single image file; they\'re modular asset bundles assembled by the publisher\'s renderer.',
    howItWorks: 'In OpenRTB, the native object travels inside the impression field of a bid request, listing required assets: a title (max 90 chars), a main image (min 1200x627), a description, a CTA, a brand name, and an advertiser logo. The DSP responds with actual content for each asset. The publisher\'s page then assembles the ad using its own design templates — so the same native creative looks different on CNN versus a recipe app, because each renders it in their own style.',
    whyItMatters: 'Native ads outperform standard banners on engagement because they don\'t look like ads. Users interact with them as content. This makes them effective for awareness campaigns and content amplification. The downside: they\'re harder to brand consistently because the publisher controls the visual output.',
    watchOutFor: 'Native can be abused — misleading headlines that look like editorial content without clear "sponsored" labeling. IAB standards require visible disclosure. Platforms like Taboola and Outbrain enforce this, but not always rigidly. Advertisers are responsible for ensuring their native creative is clearly identified as advertising.',
  },
  'consent-string': {
    summary: 'A consent string is the encoded (base64) signal that carries a user\'s privacy choices through the entire programmatic chain. Generated by the CMP when a user clicks "Accept" or "Reject," it travels inside every bid request and tells every SSP, DSP, and vendor exactly what they\'re allowed to do with that user\'s data.',
    howItWorks: 'The TCF 2.2 consent string encodes: which purposes the user consented to (e.g. Purpose 1: store data, Purpose 3: personalize ads), which vendors are permitted to process data, whether vendors are operating on consent or legitimate interest, and the CMP ID and timestamp. This string is included in the bid request as user.consent. Any vendor not listed as consented must not process data for that user — even if they\'re technically capable of it.',
    whyItMatters: 'A missing or malformed consent string causes major DSPs to either reject the bid request outright or strip targeting data before bidding. Publishers without properly configured CMPs see dramatically lower CPMs from GDPR-compliant buyers — not because demand doesn\'t exist, but because the buyers aren\'t allowed to use their targeting data.',
    watchOutFor: 'Consent strings expire. A string generated 13 months ago from an old CMP version may no longer be accepted by updated DSP validators. Publishers need to ensure their CMPs generate fresh strings on re-consent and that old consent records are refreshed periodically.',
  },
  'contextual-targeting': {
    summary: 'Contextual targeting serves ads based on what a page is about, not who is reading it. It was the dominant targeting method before cookies, became obsolete during the behavioral targeting era, and is now the fastest-growing approach in adtech as cookies disappear.',
    howItWorks: 'Modern contextual targeting goes far beyond keyword matching. AI systems read the full page text, analyze sentiment (is this article positive or negative about the topic?), classify the IAB content category, identify brand safety signals, and infer reader intent. A running shoe ad on a positive article about marathon training is more valuable than the same ad on a generic news page — contextual vendors quantify and sell this signal.',
    whyItMatters: 'Contextual is the only targeting method that\'s fully privacy-compliant by default — no user data is collected or processed. It works on Safari and Firefox where cookies are blocked. It works in cookieless Chrome sessions. It works in CTV where there\'s no browsing history. It scales to every environment where there\'s content to analyze.',
    watchOutFor: 'Contextual requires quality content signals to work. On low-content pages (checkout pages, login screens, blank app environments) there\'s nothing to analyze. Scale of contextual campaigns is also limited by the availability of relevant content — you can only buy impressions on pages about your topic.',
  },
  'gdpr': {
    summary: 'GDPR is the EU regulation that transformed digital advertising from "track everyone by default" to "ask first." It requires explicit consent for virtually all data processing in adtech. Non-compliance risks fines of up to 4% of global annual revenue.',
    howItWorks: 'Under GDPR, any processing of EU user personal data (which includes IP addresses, cookie values, device IDs) requires a legal basis — most commonly consent. Consent must be: freely given (no dark patterns), specific (per purpose), informed (user understands what they\'re agreeing to), and unambiguous (an opt-in action, not a pre-ticked box). The CMP collects this consent and encodes it in the consent string that travels through every bid request.',
    whyItMatters: 'GDPR fundamentally changed the cost structure of programmatic. Addressable inventory in the EU is a fraction of what it was pre-2018 because many users decline tracking. Publishers who built audience businesses on third-party data lost significant CPM premiums. First-party data — which users have directly given to the publisher — became the only reliable signal.',
    watchOutFor: 'GDPR applies based on where the user is located, not where the company is based. A US publisher serving EU users must comply. Many US companies underestimated this and faced enforcement actions from EU data protection authorities.',
  },
  'uid2': {
    summary: 'Unified ID 2.0 is the open-source alternative to third-party cookies built on hashed, encrypted email addresses. Developed by The Trade Desk, now managed by Prebid.org. It\'s the leading post-cookie identity solution for the open web.',
    howItWorks: 'When a user logs into a participating publisher with their email, the publisher hashes it (converts it to a one-way encoded string) and passes it to the UID2 Operator. The Operator generates a UID2 token — an encrypted version of the hash that changes regularly. This token is included in bid requests instead of a cookie-based user ID. DSPs decrypt the token, recognize the user, and apply targeting. The actual email is never exposed.',
    whyItMatters: 'UID2 replicates what third-party cookies did — cross-site user recognition for targeting and measurement — but in a privacy-preserving, consent-based way. Publishers retain the relationship with the user. Advertisers get addressable inventory. The ecosystem gets a shared standard that doesn\'t depend on browser behavior.',
    watchOutFor: 'UID2 only works on inventory where users are logged in. A significant portion of open web traffic is anonymous — those users have no UID2 token, and the same targeting gaps that exist in cookieless environments persist.',
  },
  'clean-rooms': {
    summary: 'Data clean rooms are secure computing environments where two parties can match their data sets and run analyses without either side ever seeing the other\'s raw records. They\'re the primary tool for privacy-safe audience building and cross-publisher measurement in 2026.',
    howItWorks: 'Both parties load their data into a clean room (Snowflake, Amazon Marketing Cloud, InfoSum). The clean room runs queries against both datasets — finding overlap, computing metrics, building audience segments — and returns only aggregated results. No raw PII is ever accessible to either party. A brand can learn "we have 45,000 customers who also read The Financial Times" without The FT ever seeing the customer list, and without the brand seeing FT\'s subscriber database.',
    whyItMatters: 'Clean rooms enable measurement that was impossible in a privacy-safe way before. Cross-publisher frequency capping without cookie matching. Attribution across walled gardens. Audience extension from first-party data without data leakage. This is why every major platform (Amazon, Google, Meta, The Trade Desk) now operates a clean room.',
    watchOutFor: 'Clean rooms require technical integration and data engineering work. They\'re not plug-and-play for most advertisers. The sophistication required to use them well is significant — most brands need a data partner or agency to operationalize clean room insights.',
  },
};

export async function updateArticles() {
  const db_instance = db;
  let batch = writeBatch(db_instance);
  let opCount = 0;

  // Add new terms
  for (const term of newTerms) {
    const ref = doc(db_instance, 'terms', term.id);
    batch.set(ref, term);
    opCount++;
  }

  // Update existing terms with article content
  for (const [termId, article] of Object.entries(articleUpdates)) {
    const ref = doc(db_instance, 'terms', termId);
    batch.update(ref, { article });
    opCount++;
    // Firestore batch limit is 500 ops
    if (opCount >= 490) {
      await batch.commit();
      batch = writeBatch(db_instance);
      opCount = 0;
    }
  }

  await batch.commit();
  console.log(`Updated ${Object.keys(articleUpdates).length} terms with article content. Added ${newTerms.length} new terms.`);
}
