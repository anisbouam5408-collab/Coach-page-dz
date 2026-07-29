/**
 * Niche-specific playbooks used ONLY as the vocabulary/pattern library for
 * generating strategic content — never as a source of fact about the
 * creator being analyzed. Every section built from a playbook is labeled
 * "category pattern" in the UI and is kept separate from verified
 * Knowledge Base facts, so a fitness creator gets fitness-shaped
 * recommendations and a finance creator gets finance-shaped ones,
 * without either being asserted as a verified fact about the individual.
 */
export interface NichePlaybook {
  key: string;
  label: string;
  audienceHint: string;
  painPoints: string[];
  contentPillars: string[];
  productFormats: { format: string; example: string; priceRange: string }[];
  channels: string[];
  competitorArchetypes: string[];
}

export const NICHE_PLAYBOOKS: Record<string, NichePlaybook> = {
  fitness: {
    key: "fitness",
    label: "Fitness & Training",
    audienceHint: "people trying to build strength, lose fat, or follow a structured training plan",
    painPoints: ["Inconsistent training programming", "No accountability between sessions", "Confusion about form and progression"],
    contentPillars: ["Workout breakdowns", "Form/technique tutorials", "Transformation & progress stories", "Program structure explainers"],
    productFormats: [
      { format: "Structured training program (PDF/app)", example: "8-12 week progressive program", priceRange: "$29 - $149" },
      { format: "1:1 coaching", example: "Monthly remote coaching with check-ins", priceRange: "$150 - $500/mo" },
      { format: "Group challenge", example: "4-week cohort-based challenge", priceRange: "$49 - $199" },
      { format: "App / membership", example: "Ongoing workout library + community", priceRange: "$15 - $49/mo" },
    ],
    channels: ["Instagram Reels", "YouTube long-form", "TikTok"],
    competitorArchetypes: ["Established online fitness coaches with app-based programs", "Gym-affiliated trainers building a personal brand"],
  },
  nutrition: {
    key: "nutrition",
    label: "Nutrition & Food",
    audienceHint: "people wanting to improve their diet, meal-prep more easily, or follow specific recipes",
    painPoints: ["Time-consuming meal planning", "Conflicting nutrition advice", "Difficulty sticking to a plan"],
    contentPillars: ["Recipes", "Meal-prep systems", "Nutrition myth-busting", "Grocery/budget guides"],
    productFormats: [
      { format: "Recipe ebook", example: "30-recipe seasonal collection", priceRange: "$15 - $39" },
      { format: "Meal plan subscription", example: "Weekly plan + shopping list", priceRange: "$9 - $29/mo" },
      { format: "Cooking course", example: "Video course on a cooking method", priceRange: "$49 - $199" },
      { format: "1:1 nutrition coaching", example: "Personalized macro coaching", priceRange: "$100 - $400/mo" },
    ],
    channels: ["Instagram", "YouTube Shorts", "Pinterest"],
    competitorArchetypes: ["Recipe-focused content creators with cookbook deals", "Registered dietitians with coaching programs"],
  },
  wellness: {
    key: "wellness",
    label: "Wellness & Mindfulness",
    audienceHint: "people seeking stress relief, better sleep, or a more mindful daily routine",
    painPoints: ["Chronic stress/burnout", "Difficulty building consistent habits", "Overwhelm from generic advice"],
    contentPillars: ["Guided practices", "Habit-building frameworks", "Personal story / vulnerability", "Myth-busting on wellness trends"],
    productFormats: [
      { format: "Guided audio/video series", example: "21-day mindfulness series", priceRange: "$19 - $59" },
      { format: "Membership community", example: "Monthly live sessions + resources", priceRange: "$19 - $39/mo" },
      { format: "Workshop / retreat", example: "Live or virtual workshop", priceRange: "$99 - $999" },
      { format: "1:1 coaching", example: "Habit/accountability coaching", priceRange: "$150 - $400/mo" },
    ],
    channels: ["Instagram", "Podcast", "YouTube"],
    competitorArchetypes: ["Meditation app-affiliated creators", "Independent wellness coaches with membership communities"],
  },
  business: {
    key: "business",
    label: "Business & Entrepreneurship",
    audienceHint: "aspiring or early-stage founders/consultants looking to grow a business or personal brand",
    painPoints: ["Unclear positioning/offer", "Inconsistent lead generation", "Difficulty pricing services"],
    contentPillars: ["Case studies / behind-the-scenes", "Frameworks & templates", "Q&A / myth-busting", "Client results breakdowns"],
    productFormats: [
      { format: "Template/toolkit", example: "Offer or pricing template pack", priceRange: "$29 - $99" },
      { format: "Cohort-based course", example: "6-week business-building course", priceRange: "$299 - $1,500" },
      { format: "Group coaching / mastermind", example: "Monthly mastermind", priceRange: "$200 - $1,000/mo" },
      { format: "1:1 consulting", example: "Strategy consulting retainer", priceRange: "$500 - $5,000/mo" },
    ],
    channels: ["LinkedIn", "YouTube", "Newsletter"],
    competitorArchetypes: ["Business coaches with signature frameworks", "Agency owners turned educators"],
  },
  finance: {
    key: "finance",
    label: "Personal Finance & Investing",
    audienceHint: "people trying to budget better, pay off debt, or start investing",
    painPoints: ["Lack of a clear financial plan", "Confusion about where to start investing", "Debt/budgeting anxiety"],
    contentPillars: ["Budgeting frameworks", "Investing explainers", "Debt payoff stories", "Tool/app reviews"],
    productFormats: [
      { format: "Budgeting template/spreadsheet", example: "Zero-based budget template", priceRange: "$9 - $39" },
      { format: "Course", example: "Investing fundamentals course", priceRange: "$99 - $499" },
      { format: "Community / membership", example: "Monthly Q&A + resources", priceRange: "$19 - $49/mo" },
      { format: "1:1 financial coaching", example: "Personal finance coaching (non-advisory)", priceRange: "$150 - $500/mo" },
    ],
    channels: ["YouTube", "Instagram", "Newsletter"],
    competitorArchetypes: ["FIRE-movement creators", "Certified financial coaches/educators"],
  },
  beauty: {
    key: "beauty",
    label: "Beauty & Skincare",
    audienceHint: "people looking for product recommendations, routines, or technique tutorials",
    painPoints: ["Overwhelm from too many products", "Uncertainty about what suits their skin/features", "Trend fatigue"],
    contentPillars: ["Routine breakdowns", "Product reviews", "Tutorials", "Trend commentary"],
    productFormats: [
      { format: "Routine guide", example: "Personalized routine-building guide", priceRange: "$15 - $39" },
      { format: "Digital masterclass", example: "Technique masterclass (video)", priceRange: "$39 - $129" },
      { format: "Brand partnerships / affiliate", example: "Curated product kits", priceRange: "Varies" },
      { format: "Membership", example: "Early access + routine updates", priceRange: "$9 - $19/mo" },
    ],
    channels: ["Instagram", "TikTok", "YouTube"],
    competitorArchetypes: ["Beauty influencers with product lines", "Licensed estheticians building an education brand"],
  },
  fashion: {
    key: "fashion",
    label: "Fashion & Style",
    audienceHint: "people wanting styling help, outfit inspiration, or shopping guidance",
    painPoints: ["Not knowing what suits their body/style", "Decision fatigue when shopping", "Wanting a distinct personal style"],
    contentPillars: ["Outfit breakdowns", "Styling tips", "Seasonal lookbooks", "Shopping guides"],
    productFormats: [
      { format: "Styling guide / capsule wardrobe plan", example: "Seasonal capsule wardrobe guide", priceRange: "$19 - $49" },
      { format: "1:1 styling session", example: "Virtual personal styling", priceRange: "$75 - $300" },
      { format: "Membership", example: "Monthly lookbook + shopping links", priceRange: "$9 - $25/mo" },
      { format: "Affiliate shop", example: "Curated shoppable storefront", priceRange: "Varies" },
    ],
    channels: ["Instagram", "TikTok", "Pinterest"],
    competitorArchetypes: ["Personal stylists with digital guides", "Fashion influencers with affiliate storefronts"],
  },
  tech: {
    key: "tech",
    label: "Tech & Software",
    audienceHint: "developers, builders, or tech-curious professionals wanting to learn a skill or tool",
    painPoints: ["Steep learning curve for new tools", "Outdated or scattered tutorials", "Wanting practical, project-based learning"],
    contentPillars: ["Tutorials / walkthroughs", "Tool reviews", "Project build-alongs", "Career/industry commentary"],
    productFormats: [
      { format: "Cohort course", example: "Project-based technical course", priceRange: "$199 - $999" },
      { format: "Template/boilerplate", example: "Starter kit or code template", priceRange: "$29 - $149" },
      { format: "Community", example: "Discord + office hours", priceRange: "$15 - $49/mo" },
      { format: "1:1 mentoring", example: "Career or technical mentoring", priceRange: "$100 - $300/session" },
    ],
    channels: ["YouTube", "X (Twitter)", "Newsletter"],
    competitorArchetypes: ["Independent technical educators", "Bootcamp-affiliated instructors"],
  },
  travel: {
    key: "travel",
    label: "Travel",
    audienceHint: "people planning trips, seeking itineraries, or dreaming of travel content",
    painPoints: ["Time-consuming itinerary planning", "Uncertainty about budget/logistics", "Wanting authentic, non-touristy recommendations"],
    contentPillars: ["Destination guides", "Itinerary breakdowns", "Budget/logistics tips", "Storytelling / vlogs"],
    productFormats: [
      { format: "Digital itinerary/guide", example: "City or region travel guide", priceRange: "$9 - $29" },
      { format: "Trip-planning template", example: "Budget & logistics planner", priceRange: "$15 - $39" },
      { format: "Group trip", example: "Hosted small-group trip", priceRange: "$500 - $3,000" },
      { format: "Membership", example: "Ongoing guide library + updates", priceRange: "$5 - $15/mo" },
    ],
    channels: ["Instagram", "YouTube", "TikTok"],
    competitorArchetypes: ["Travel bloggers selling destination guides", "Creators hosting paid group trips"],
  },
  education: {
    key: "education",
    label: "Education & Coaching",
    audienceHint: "learners seeking structured teaching, tutoring, or mentorship in a specific subject",
    painPoints: ["Lack of structured curriculum", "Difficulty finding personalized feedback", "Motivation/accountability gaps"],
    contentPillars: ["Lesson breakdowns", "Study frameworks", "Student success stories", "Q&A sessions"],
    productFormats: [
      { format: "Self-paced course", example: "Structured curriculum with modules", priceRange: "$49 - $299" },
      { format: "1:1 tutoring/mentoring", example: "Recurring sessions", priceRange: "$40 - $150/session" },
      { format: "Cohort program", example: "Live cohort with feedback", priceRange: "$199 - $999" },
      { format: "Membership", example: "Resource library + community", priceRange: "$9 - $29/mo" },
    ],
    channels: ["YouTube", "Instagram", "Newsletter"],
    competitorArchetypes: ["Subject-matter tutors with signature courses", "Academy-style education brands"],
  },
  parenting: {
    key: "parenting",
    label: "Parenting & Family",
    audienceHint: "parents seeking practical advice, routines, or community around raising kids",
    painPoints: ["Conflicting parenting advice", "Time scarcity", "Wanting relatable, non-judgmental support"],
    contentPillars: ["Day-in-the-life content", "Practical tips/routines", "Milestone guides", "Relatable storytelling"],
    productFormats: [
      { format: "Digital guide", example: "Routine or milestone guide", priceRange: "$9 - $29" },
      { format: "Membership community", example: "Peer support + resources", priceRange: "$9 - $25/mo" },
      { format: "Workshop", example: "Live parenting workshop", priceRange: "$29 - $99" },
      { format: "1:1 coaching", example: "Parent coaching sessions", priceRange: "$75 - $200/session" },
    ],
    channels: ["Instagram", "TikTok", "Facebook Groups"],
    competitorArchetypes: ["Parenting educators with digital guides", "Family-focused community builders"],
  },
  gaming: {
    key: "gaming",
    label: "Gaming & Esports",
    audienceHint: "gamers wanting to improve skills, follow content, or join a community",
    painPoints: ["Plateauing skill progression", "Wanting structured coaching vs. random tips", "Finding an active community"],
    contentPillars: ["Gameplay breakdowns", "Coaching/tips", "Highlights & streams", "Meta/patch commentary"],
    productFormats: [
      { format: "Coaching session (VOD review)", example: "1:1 gameplay review", priceRange: "$25 - $100/session" },
      { format: "Course", example: "Skill-specific training course", priceRange: "$49 - $199" },
      { format: "Discord membership", example: "Coaching community + resources", priceRange: "$5 - $20/mo" },
      { format: "Sponsorship/brand deals", example: "Stream sponsorship", priceRange: "Varies" },
    ],
    channels: ["Twitch", "YouTube", "Discord"],
    competitorArchetypes: ["Pro-player-run coaching platforms", "Streamer-led Discord communities"],
  },
};

export function getPlaybook(nicheKey: string | null): NichePlaybook | null {
  if (!nicheKey) return null;
  return NICHE_PLAYBOOKS[nicheKey] ?? null;
}
