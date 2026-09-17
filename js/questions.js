export const COMMUNITIES = {
  TCRL: {
    id: "TCRL",
    name: "The Content Revenue Lab",
    short: "TCRL",
    signOff: "The Content Revenue Lab",
    blurb: "Free community — monetise a small YouTube audience.",
    joinUrl: "https://www.skool.com/content-revenue-lab-4761",
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
    signOff: "YouTube For Skool",
    blurb: "Paid community — turn YouTube viewers into paid Skool members.",
    joinUrl: "https://www.skool.com/youtube-for-skool-6875",
    startHere: [
      { title: "Start here: YouTube to paid Skool members", url: "https://www.skool.com/youtube-for-skool-6875" },
      { title: "Classroom: Discovery and Growth Boost without ads", url: "https://www.skool.com/youtube-for-skool-6875" },
      { title: "Post: The video that sends viewers into Skool", url: "https://www.skool.com/youtube-for-skool-6875" },
    ],
  },
};

const ROADBLOCKS = ["Getting started","Getting views","Turning viewers into members","Getting members engaged","Selling a paid offer","Time and consistency"];

function clip(text, n = 72) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  return `${t.slice(0, n - 1).trim()}…`;
}

function roleLine(a) {
  if (a.role && a.niche) return `${a.role.toLowerCase()} in ${a.niche}`;
  if (a.niche) return a.niche;
  if (a.role) return a.role.toLowerCase();
  return "";
}

export function questionBank(communityId) {
  return [
    { id: "role", label: "What best describes you?", type: "choice", options: ["Coach/consultant", "Course creator", "Service business", "Hobby expert", "Other"] },
    { id: "niche", label: (a) => a.role ? `What is the niche you work in as a ${a.role.toLowerCase()}?` : "What is your niche or area of expertise?", type: "text", placeholder: "e.g. retirement planning for teachers" },
    { id: "youtube", label: (a) => { const who = roleLine(a); return who ? `You said you are a ${who}. Do you already have a YouTube channel?` : "Do you have a YouTube channel?"; }, type: "choice", options: ["No", "Yes, under 1,000 subs", "1,000–10,000", "10,000+"] },
    { id: "channelName", showIf: (a) => a.youtube && a.youtube !== "No", label: "What is the channel called?", type: "text", placeholder: "Channel name as it appears on YouTube" },
    { id: "channelUrl", showIf: (a) => a.youtube && a.youtube !== "No", label: (a) => a.channelName ? `What is the URL for ${a.channelName}?` : "What is the channel URL?", type: "text", placeholder: "youtube.com/@yourchannel" },
    { id: "publish", showIf: (a) => a.youtube && a.youtube !== "No", label: (a) => a.channelName ? `How often do you publish on ${a.channelName}?` : "How often do you publish?", type: "choice", options: ["Not yet", "Occasionally", "Monthly", "Weekly or more"] },
    { id: "skool", label: (a) => a.channelName ? `Alongside ${a.channelName}, do you have a Skool community?` : "Do you have a Skool community?", type: "choice", options: ["No", "Free", "Paid", "Both"] },
    { id: "skoolName", showIf: (a) => a.skool && a.skool !== "No", label: "What is the Skool community called?", type: "text", placeholder: "Community name" },
    { id: "skoolUrl", showIf: (a) => a.skool && a.skool !== "No", label: (a) => a.skoolName ? `What is the URL for ${a.skoolName}?` : "What is the Skool URL?", type: "text", placeholder: "skool.com/your-community" },
    { id: "members", showIf: (a) => a.skool && a.skool !== "No", label: (a) => a.skoolName ? `Roughly how many members are in ${a.skoolName}?` : "How many members?", type: "choice", options: ["None", "Under 50", "50–250", "250+"] },
    { id: "ytLinksToSkool", showIf: (a) => communityId === "YFS" && a.youtube && a.youtube !== "No" && a.skool && a.skool !== "No", label: (a) => `Do videos on ${a.channelName || "your videos"} link through to ${a.skoolName || "your Skool community"}?`, type: "choice", options: ["No", "Sometimes", "Every video"] },
    { id: "offerReady", showIf: () => communityId === "TCRL", label: (a) => a.niche ? `Do you have a product or offer ready to sell in ${a.niche}?` : "Do you have a product or offer ready to sell?", type: "choice", options: ["No", "Idea only", "Yes, not selling well", "Yes, selling"] },
    { id: "revenue", label: (a) => { if (a.channelName && a.skoolName) return `Are ${a.channelName} or ${a.skoolName} making money yet?`; if (a.channelName) return `Is ${a.channelName} making money yet?`; if (a.skoolName) return `Is ${a.skoolName} making money yet?`; return "Are you making money from your content or community?"; }, type: "choice", options: ["Not yet", "Under £500 a month", "£500–£2,000", "£2,000+"] },
    { id: "roadblock", label: (a) => { const who = roleLine(a); if (a.channelName && a.skoolName) return `For ${a.channelName} and ${a.skoolName}, what is the biggest roadblock right now?`; if (a.channelName) return `For ${a.channelName}, what is the biggest roadblock right now?`; if (who) return `As a ${who}, what is the biggest roadblock right now?`; return "Biggest roadblock right now?"; }, type: "choice", options: ROADBLOCKS },
    { id: "goal90", label: (a) => a.roadblock ? `If that roadblock — ${a.roadblock.toLowerCase()} — eased, what do you want done in the next 90 days?` : "What do you want to achieve in the next 90 days?", type: "textarea", placeholder: "One clear outcome. Keep it plain." },
    { id: "hours", label: (a) => a.goal90 ? `To make progress on “${clip(a.goal90, 60)}”, how many hours a week can you actually give this?` : "Hours per week available?", type: "choice", options: ["Under 3", "3–5", "5–10", "10+"] },
    { id: "cohortInterest", label: (a) => { const place = communityId === "YFS" ? "YouTube For Skool" : "The Content Revenue Lab"; const aim = a.goal90 ? ` around “${clip(a.goal90, 48)}”` : ""; return `A small paid working group opens a few times a year inside ${place}. If one fitted you${aim}, would you want first refusal when the next one opens?`; }, type: "choice", options: ["Not for me right now", "Send me the details when it opens", "Yes, put my name on the list"] },
    { id: "cohortFit", showIf: (a) => a.cohortInterest && a.cohortInterest !== "Not for me right now", label: (a) => a.hours ? `You have ${a.hours.toLowerCase()} hours a week. If you did join that cohort, what would it need to help you with first?` : "If you did join that cohort, what would it need to help you with first?", type: "textarea", placeholder: "One sentence is enough." },
  ];
}

export function questionsFor(communityId, answers = {}) {
  return questionBank(communityId).filter((q) => !q.showIf || q.showIf(answers));
}

export function resolveLabel(q, answers = {}) {
  return typeof q.label === "function" ? q.label(answers) : q.label;
}

export function hasChannelAndSkool(answers = {}) {
  return Boolean(answers.youtube && answers.youtube !== "No" && answers.skool && answers.skool !== "No");
}

export const CHECKIN_NUMERIC = ["youtube", "publish", "members", "revenue", "hours", "skool"];

export const CHECKIN_EXTRAS = [
  { id: "gotDone", label: "What did you get done since last time?", type: "textarea" },
  { id: "inTheWay", label: "What got in the way?", type: "textarea" },
  { id: "roadblock", label: "Biggest roadblock now?", type: "choice", options: ROADBLOCKS },
];

export function checkinQuestions(communityId, answers = {}) {
  const ids = new Set([...CHECKIN_NUMERIC, "channelName", "channelUrl", "skoolName", "skoolUrl", "offerReady", "ytLinksToSkool", "cohortInterest"]);
  const fromBank = questionBank(communityId).filter((q) => ids.has(q.id) && (!q.showIf || q.showIf(answers)));
  return [...fromBank, ...CHECKIN_EXTRAS];
}
