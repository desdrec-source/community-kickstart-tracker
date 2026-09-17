export const COMMUNITIES = {
  TCRL: {
    id: "TCRL",
    name: "The Content Revenue Lab",
    short: "TCRL",
    blurb: "Free community — monetise a small YouTube audience.",
    joinUrl: "https://www.skool.com/content-revenue-lab-4761",
    extra: {
      id: "offerReady",
      label: "Do you have a product or offer ready to sell?",
      options: ["No", "Idea only", "Yes, not selling well", "Yes, selling"],
    },
    startHere: [
      { title: "Start here: The 30-Day Content Revenue Plan", url: "https://www.skool.com/content-revenue-lab-4761" },
      { title: "Classroom: One video, one offer, one next step", url: "https://www.skool.com/content-revenue-lab-4761" },
      { title: "Post: How a small channel funds a full-time week", url: "https://www.skool.com/content-revenue-lab-4761" },
    ],
  },
  YFS: {
    id: "YFS",
    name: "YouTube For Skool",
    short: "YFS",
    blurb: "Paid community — turn YouTube viewers into paid Skool members.",
    joinUrl: "https://www.skool.com/youtube-for-skool-6875",
    extra: {
      id: "ytLinksToSkool",
      label: "Do your YouTube videos link to your Skool community?",
      options: ["No", "Sometimes", "Every video"],
    },
    startHere: [
      { title: "Start here: YouTube to paid Skool members", url: "https://www.skool.com/youtube-for-skool-6875" },
      { title: "Classroom: Discovery and Growth Boost without ads", url: "https://www.skool.com/youtube-for-skool-6875" },
      { title: "Post: The video that sends viewers into Skool", url: "https://www.skool.com/youtube-for-skool-6875" },
    ],
  },
};

export const CORE_QUESTIONS = [
  { id: "role", label: "What best describes you?", type: "choice", options: ["Coach/consultant", "Course creator", "Service business", "Hobby expert", "Other"] },
  { id: "niche", label: "What is your niche or area of expertise?", type: "text", placeholder: "e.g. retirement planning for teachers" },
  { id: "youtube", label: "Do you have a YouTube channel?", type: "choice", options: ["No", "Yes, under 1,000 subs", "1,000–10,000", "10,000+"] },
  { id: "publish", label: "How often do you publish?", type: "choice", options: ["Not yet", "Occasionally", "Monthly", "Weekly or more"] },
  { id: "skool", label: "Do you have a Skool community?", type: "choice", options: ["No", "Free", "Paid", "Both"] },
  { id: "members", label: "How many members?", type: "choice", options: ["None", "Under 50", "50–250", "250+"] },
  { id: "revenue", label: "Are you making money from your content or community?", type: "choice", options: ["Not yet", "Under £500 a month", "£500–£2,000", "£2,000+"] },
  { id: "roadblock", label: "Biggest roadblock right now?", type: "choice", options: ["Getting started", "Getting views", "Turning viewers into members", "Getting members engaged", "Selling a paid offer", "Time and consistency"] },
  { id: "hours", label: "Hours per week available?", type: "choice", options: ["Under 3", "3–5", "5–10", "10+"] },
  { id: "goal90", label: "What do you want to achieve in the next 90 days?", type: "textarea", placeholder: "One clear outcome. Keep it plain." },
];

export const CHECKIN_NUMERIC = ["youtube", "publish", "members", "revenue", "hours", "skool"];

export const CHECKIN_EXTRAS = [
  { id: "gotDone", label: "What did you get done since last time?", type: "textarea" },
  { id: "inTheWay", label: "What got in the way?", type: "textarea" },
  { id: "roadblock", label: "Biggest roadblock now?", type: "choice", options: CORE_QUESTIONS.find((q) => q.id === "roadblock").options },
];

export function questionsFor(communityId) {
  const extra = COMMUNITIES[communityId].extra;
  const list = [...CORE_QUESTIONS];
  list.splice(6, 0, extra);
  return list;
}
