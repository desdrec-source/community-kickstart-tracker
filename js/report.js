import { COMMUNITIES, hasChannelAndSkool } from "./questions.js";

const YT_RANK = { No: 0, "Yes, under 1,000 subs": 1, "1,000–10,000": 2, "10,000+": 3 };
const MEM_RANK = { None: 0, "Under 50": 1, "50–250": 2, "250+": 3 };
const REV_RANK = { "Not yet": 0, "Under £500 a month": 1, "£500–£2,000": 2, "£2,000+": 3 };

export function computeStage(answers) {
  const yt = answers.youtube || "No";
  const skool = answers.skool || "No";
  const rev = answers.revenue || "Not yet";
  const members = answers.members || "None";
  if (yt === "No" && skool === "No") return "Foundation";
  if (REV_RANK[rev] >= 2) return "Scale";
  const audience = YT_RANK[yt] >= 2 || MEM_RANK[members] >= 2;
  if (audience && REV_RANK[rev] <= 1) return "Conversion";
  if (REV_RANK[rev] === 0) return "Traction";
  return "Conversion";
}

export function stageCopy(stage) {
  return {
    Foundation: "No channel and no community yet. Pick one lane and publish the first useful video.",
    Traction: "You have started. The job now is a rhythm people can find.",
    Conversion: "People can find you. The job now is a clear next step from video to member or buyer.",
    Scale: "Money is moving. The job now is a system you can keep.",
  }[stage];
}

function hoursPlan(hours) {
  if (hours === "Under 3") return { cadence: "one short video this week, nothing else" };
  if (hours === "3–5") return { cadence: "one useful video a week" };
  if (hours === "5–10") return { cadence: "one long-form video a week" };
  return { cadence: "one long-form video a week and a fixed community hour" };
}

function mistakeFor(roadblock) {
  return {
    "Getting started": "Do not build the channel, the community and the course in the same week.",
    "Getting views": "Do not chase a viral idea. Make the video for one search a real person types.",
    "Turning viewers into members": "Do not hide the community link. One next step, said twice.",
    "Getting members engaged": "Do not post a long announcement. Ask one question and reply to every answer.",
    "Selling a paid offer": "Do not add a third offer. Tighten the one you have.",
    "Time and consistency": "Do not plan a 10-hour week you do not have.",
  }[roadblock] || "Do not add a new platform this week.";
}

function suggestedTitle(answers) {
  const niche = answers.niche || "your field";
  return {
    "Getting started": `The first thing to know about ${niche} if you are starting from scratch`,
    "Getting views": `The ${niche} mistake that keeps good videos invisible`,
    "Turning viewers into members": `What to do after a ${niche} video if you want people to join`,
    "Getting members engaged": `The one question that gets a ${niche} community talking`,
    "Selling a paid offer": `How ${niche} clients actually decide to pay`,
    "Time and consistency": `A ${niche} filming slot you can keep in under three hours`,
  }[answers.roadblock] || `One useful ${niche} video for this week`;
}

export function buildPriorities(answers, communityId, previousDone = []) {
  const hours = hoursPlan(answers.hours || "3–5");
  const niche = answers.niche || "your niche";
  const roadblock = answers.roadblock;
  const noYt = answers.youtube === "No";
  const hasSkool = answers.skool && answers.skool !== "No";
  const ch = answers.channelName || "the channel";
  const items = [];
  if (noYt) {
    items.push({ title: "Open the channel and name it for the work you already do", why: `People searching for ${niche} need a name that sounds like the help they want.`, win: "Create the channel, write a 120-character description, film one talking-head video on a phone.", avoid: "Do not spend the week on banners." });
    items.push({ title: `Film: “${suggestedTitle(answers)}”`, why: "A first video that tries to cover everything teaches nobody.", win: "Write that title. Film it. Upload it.", avoid: "Do not wait for new lights." });
    items.push({ title: "Protect one weekly slot", why: "The channel dies when publishing is optional.", win: `Book ${hours.cadence}.`, avoid: mistakeFor("Time and consistency") });
    return items.slice(0, 3);
  }
  items.push({ title: `Film: “${suggestedTitle(answers)}”`, why: `This title is built from ${niche} and the roadblock you named.`, win: `Script it, film it, upload it on ${ch} this week.`, avoid: mistakeFor(roadblock) });
  if (hasSkool && (communityId === "YFS" || roadblock === "Turning viewers into members")) {
    items.push({ title: "Make the video point at one Skool door", why: "A viewer who has to hunt for you will not join.", win: `Put the ${answers.skoolName || "Skool"} link as line one of the description and say it at the end.`, avoid: mistakeFor("Turning viewers into members") });
  }
  if (communityId === "TCRL" || roadblock === "Selling a paid offer") {
    items.push({ title: answers.offerReady === "Yes, selling" ? "Tighten the path from video to the offer that already sells" : "Name one offer and put it on the last slide", why: `Your 90-day goal depends on ${niche} turning into a paid next step.`, win: answers.offerReady === "No" || answers.offerReady === "Idea only" ? "Write a one-page offer. Do not build the course yet." : "Record a 60-second close and add it to this week's video.", avoid: mistakeFor("Selling a paid offer") });
  }
  if (hasSkool && roadblock === "Getting members engaged") {
    items.push({ title: "Run one conversation, not five announcements", why: "A community goes quiet when it is over-posted and under-replied.", win: "Post one question tied to this week's video. Reply to every comment in 24 hours.", avoid: mistakeFor("Getting members engaged") });
  }
  const seen = new Set();
  const unique = [];
  for (const item of items) {
    if (seen.has(item.title) || previousDone.includes(item.title)) continue;
    seen.add(item.title);
    unique.push(item);
    if (unique.length === 3) break;
  }
  while (unique.length < 3) {
    unique.push({ title: "Keep the next video narrower than you think", why: `A tight video on ${niche} is easier to finish.`, win: "Write the title first. If it needs a comma, it is two videos.", avoid: "Do not batch 12 videos before you have published two." });
  }
  return unique.slice(0, 3);
}

function compareLanguage(now, first) {
  if (!first) return "";
  const bits = [];
  if (now.youtube !== first.youtube) bits.push(`YouTube moved from “${first.youtube}” to “${now.youtube}”.`);
  if (now.members !== first.members) bits.push(`Members moved from “${first.members}” to “${now.members}”.`);
  if (now.revenue !== first.revenue) bits.push(`Revenue band moved from “${first.revenue}” to “${now.revenue}”.`);
  return bits.join(" ") || "The numbers have not jumped a band yet. Look at whether the weekly slot happened.";
}

function esc(s) {
  return String(s || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function emailHtml({ name, community, stage, body, heading, answers }) {
  const paras = body.split("\n").map((line) => {
    if (!line) return "";
    if (line.startsWith("Your stage:") || line === "Your top 3 priorities" || line.startsWith("Open ") || line === "Next step" || line.startsWith("Film this next")) return `<h2 style="color:#1B2A4A;font-size:18px;margin:22px 0 8px;">${esc(line)}</h2>`;
    if (/^\d+\. /.test(line)) return `<h3 style="color:#1B2A4A;font-size:16px;margin:18px 0 6px;">${esc(line)}</h3>`;
    if (line.startsWith("Why it matters:") || line.startsWith("7-day quick win:") || line.startsWith("Mistake to avoid:")) return `<p style="margin:4px 0;font-size:15px;">${esc(line)}</p>`;
    return `<p style="margin:10px 0;font-size:16px;line-height:1.5;">${esc(line)}</p>`;
  }).join("");
  const callBtn = hasChannelAndSkool(answers) ? `<p style="margin-top:28px;"><a href="https://calendar.app.google/qnMBUzWyMDwC26XG7" style="background:#C45C26;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block;">Book a Roadblock Call</a></p>` : "";
  return `<!doctype html><html><body style="margin:0;background:#F4F1EC;font-family:Calibri,Segoe UI,Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1EC;padding:24px 12px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;"><tr><td style="background:#1B2A4A;color:#fff;padding:20px 24px;"><div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#d7c4b2;">Community Kickstart Tracker</div><div style="font-size:20px;margin-top:6px;">${esc(heading)}</div><div style="font-size:13px;color:#c9d0dc;margin-top:6px;">${esc(community.name)}</div></td></tr><tr><td style="padding:24px;">${paras}${callBtn}</td></tr></table></td></tr></table></body></html>`;
}

export function generateReport({ profile, answers, communityId, kind, previous }) {
  const community = COMMUNITIES[communityId];
  const name = profile.firstName || "there";
  const stage = computeStage(answers);
  const niche = answers.niche || "your field";
  const goal = answers.goal90 || "your 90-day goal";
  const noYt = answers.youtube === "No";
  const priorities = buildPriorities(answers, communityId, previous?.doneTitles || []);
  const offerCall = hasChannelAndSkool(answers);
  const videoTitle = suggestedTitle(answers);
  const channelBit = answers.channelName ? `Your channel is ${answers.channelName}${answers.channelUrl ? ` (${answers.channelUrl})` : ""}.` : "";
  const skoolBit = answers.skoolName ? `Your Skool community is ${answers.skoolName}${answers.skoolUrl ? ` (${answers.skoolUrl})` : ""}.` : "";
  const summary = noYt
    ? `You do not have a YouTube channel yet. You want progress on ${goal}. Open a simple channel and film one useful video in ${niche}.`
    : `You are a ${answers.role || "professional"} in ${niche}. ${channelBit} ${skoolBit} Over the next 90 days you want this: ${goal}.`;
  const priText = priorities.map((p, i) => `${i + 1}. ${p.title}\nWhy it matters: ${p.why}\n7-day quick win: ${p.win}\nMistake to avoid: ${p.avoid}`).join("\n\n");
  const heading = kind === "checkin" ? `${name}, your progress update` : `${name}, your Kickstart Report is ready`;
  const body = [
    `Hi ${name},`,
    summary,
    noYt ? "This is a basic start report. No funnel talk until the channel exists." : "",
    `Film this next: “${videoTitle}”`,
    "Your top 3 priorities",
    priText,
    `Open ${community.name}`,
    community.joinUrl,
    offerCall ? "Next step" : "",
    offerCall ? "Want help removing the biggest roadblock? Book a free 30-minute Roadblock Call." : "",
    offerCall ? "https://calendar.app.google/qnMBUzWyMDwC26XG7" : "",
    answers.cohortInterest && answers.cohortInterest !== "Not for me right now" ? `You asked to hear about the next paid cohort (${answers.cohortInterest}).` : "",
    "This plan lives on this phone unless you download a backup.",
    "Des Dreckett",
    community.signOff || community.name,
  ].filter(Boolean).join("\n");
  return {
    id: `r-${Date.now()}`,
    createdAt: new Date().toISOString(),
    kind,
    stage,
    subjectMember: heading,
    subjectDes: `[${community.short}] Kickstart report: ${name} – ${stage}`,
    text: body,
    html: emailHtml({ name, community, stage, body, heading, answers }),
    priorities,
    offerCall,
    hotLead: stage === "Conversion" || stage === "Scale" || answers.roadblock === "Selling a paid offer" || answers.cohortInterest === "Yes, put my name on the list",
  };
}

export function buildDesPreamble(profile, answers, communityId, report) {
  return [`HOT LEAD flag: ${report.hotLead ? "HOT LEAD" : "standard"}`, `Name: ${profile.firstName}`, `Email: ${profile.email}`, `Community: ${communityId}`, `Stage: ${report.stage}`, `Biggest roadblock: ${answers.roadblock}`, `Channel: ${answers.channelName || "none"} ${answers.channelUrl || ""}`.trim(), `Skool: ${answers.skoolName || "none"} ${answers.skoolUrl || ""}`.trim(), `Cohort interest: ${answers.cohortInterest || "not asked"}`, "", "Answers", ...Object.entries(answers).map(([k, v]) => `${k}: ${v}`), "", "Report", report.text].join("\n");
}

export function icsReminder(title = "Kickstart check-in") {
  const start = new Date();
  start.setDate(start.getDate() + 14);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start.getTime() + 20 * 60 * 1000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${fmt(start)}\nDTEND:${fmt(end)}\nSUMMARY:${title}\nEND:VEVENT\nEND:VCALENDAR`;
}

export { YT_RANK, MEM_RANK, REV_RANK };
