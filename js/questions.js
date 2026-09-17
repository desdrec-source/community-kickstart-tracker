export const COMMUNITIES = {
  TCRL: {
    id: "TCRL",
    name: "The Content Revenue Lab",
    short: "TCRL",
    signOff: "The Content Revenue Lab",
    blurb: "Free community — monetise a small YouTube audience.",
    joinUrl: "https://www.skool.com/content-revenue-lab-4761",
  },
  YFS: {
    id: "YFS",
    name: "YouTube For Skool",
    short: "YFS",
    signOff: "YouTube For Skool",
    blurb: "Paid community — turn YouTube viewers into paid Skool members.",
    joinUrl: "https://www.skool.com/youtube-for-skool-6875",
  },
};

const ROADBLOCKS = [
  "Getting started",
  "Getting views",
  "Turning viewers into members",
  "Getting members engaged",
  "Selling a paid offer",
  "Time and consistency",
];

export function questionBank(communityId) {
  return [
    { id: "role", label: "What best describes you?", type: "choice", options: ["Coach/consultant", "Course creator", "Service business", "Hobby expert", "Other"] },
    { id: "niche", label: (a) => a.role ? `What niche do you work in as a ${a.role.toLowerCase()}?` : "What is your niche?", type: "text", placeholder: "e.g. retirement planning for teachers" },
    { id: "youtube", label: (a) => a.niche ? `Do you have a YouTube channel for ${a.niche}?` : "Do you have a YouTube channel?", type: "choice", options: ["No", "Yes, under 1,000 subs", "1,000–10,000", "10,000+"] },
    { id: "channelName", showIf: (a) => a.youtube && a.youtube !== "No", label: "What is the channel called?", type: "text", placeholder: "Channel name as it appears on YouTube" },
    { id: "channelUrl", showIf: (a) => a.youtube && a.youtube !== "No", label: "Channel URL?", type: "text", placeholder: "youtube.com/@yourchannel" },
    { id: "publish", showIf: (a) => a.youtube && a.youtube !== "No", label: "How often do you publish?", type: "choice", options: ["Not yet", "Occasionally", "Monthly", "Weekly or more"] },
    { id: "skool", label: "Do you have a Skool community?", type: "choice", options: ["No", "Free", "Paid", "Both"] },
    { id: "skoolName", showIf: (a) => a.skool && a.skool !== "No", label: "What is the Skool community called?", type: "text", placeholder: "Community name" },
    { id: "skoolUrl", showIf: (a) => a.skool && a.skool !== "No", label: "Skool URL?", type: "text", placeholder: "skool.com/your-community" },
    { id: "members", showIf: (a) => a.skool && a.skool !== "No", label: "How many members?", type: "choice", options: ["None", "Under 50", "50–250", "250+"] },
    { id: "ytLinksToSkool", showIf: (a) => communityId === "YFS" && a.youtube && a.youtube !== "No" && a.skool && a.skool !== "No", label: "Do your videos link through to Skool?", type: "choice", options: ["No", "Sometimes", "Every video"] },
    { id: "offerReady", showIf: () => communityId === "TCRL", label: "Do you have a product or offer ready to sell?", type: "choice", options: ["No", "Idea only", "Yes, not selling well", "Yes, selling"] },
    { id: "revenue", label: "Making money from the content or community yet?", type: "choice", options: ["Not yet", "Under £500 a month", "£500–£2,000", "£2,000+"] },
    { id: "roadblock", label: (a) => a.channelName ? `Biggest roadblock for ${a.channelName}?` : "Biggest roadblock right now?", type: "choice", options: ROADBLOCKS },
    { id: "goal90", label: "What do you want done in the next 90 days?", type: "textarea", placeholder: "One clear outcome. Keep it plain." },
    { id: "hours", showIf: (a) => a.roadblock === "Time and consistency", label: "Hours per week you can actually give this?", type: "choice", options: ["Under 3", "3–5", "5–10", "10+"] },
    { id: "cohortInterest", label: "A small paid working group opens a few times a year. Want first refusal when the next one opens?", type: "choice", options: ["Not for me right now", "Send me the details when it opens", "Yes, put my name on the list"] },
    { id: "cohortFit", showIf: (a) => a.cohortInterest && a.cohortInterest !== "Not for me right now", label: "If you joined, what should it help with first?", type: "textarea", placeholder: "One sentence is enough." },
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

export const CHECKIN_EXTRAS = [
  { id: "gotDone", label: "What did you get done since last time?", type: "textarea" },
  { id: "inTheWay", label: "What got in the way?", type: "textarea" },
  { id: "roadblock", label: "Biggest roadblock now?", type: "choice", options: ROADBLOCKS },
];

export function checkinQuestions(communityId, answers = {}) {
  const ids = new Set(["publish", "members", "revenue"]);
  const fromBank = questionBank(communityId).filter((q) => ids.has(q.id) && (!q.showIf || q.showIf(answers)));
  return [...fromBank, ...CHECKIN_EXTRAS];
}
