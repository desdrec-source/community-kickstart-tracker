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
    Foundation: "No channel and no community yet. The job this month is to pick one lane and publish the first useful video.",
    Traction: "You have started. The job now is a rhythm people can find — not a perfect brand.",
    Conversion: "People can find you. The job now is a clear next step from video to member or buyer.",
    Scale: "Money is moving. The job now is a system you can keep, not a bigger to-do list.",
  }[stage];
}

function hoursPlan(hours) {
  if (hours === "Under 3") return { cadence: "one short video or one community block, not both" };
  if (hours === "3–5") return { cadence: "one useful video a week and a 20-minute community pass" };
  if (hours === "5–10") return { cadence: "one long-form video a week plus a small Shorts batch if energy remains" };
  return { cadence: "one long-form video and one Shorts batch each week, with a fixed community hour" };
}

function mistakeFor(roadblock) {
  return {
    "Getting started": "Do not build the channel, the community and the course in the same week.",
    "Getting views": "Do not chase a viral idea. Make the video for one search a real person already types.",
    "Turning viewers into members": "Do not hide the community link in a wall of links. One next step, said twice.",
    "Getting members engaged": "Do not post a long announcement and hope. Ask one specific question and reply to every answer.",
    "Selling a paid offer": "Do not add a third offer. Tighten the one you have and put it at the end of the video.",
    "Time and consistency": "Do not plan a 10-hour week you do not have. Book the publishing slot first.",
  }[roadblock] || "Do not add a new platform this week.";
}

export function buildPriorities(answers, communityId, previousDone = []) {
  const hours = hoursPlan(answers.hours);
  const niche = answers.niche || "your niche";
  const roadblock = answers.roadblock;
  const noYt = answers.youtube === "No";
  const ch = answers.channelName || "the channel";
  const sk = answers.skoolName || "Skool";
  const items = [];
  if (noYt) {
    items.push({ title: "Open the channel and name it for the work you already do", why: `People searching for ${niche} need to land on a name that sounds like the help they want.`, win: "In the next 7 days: create the channel, write a 120-character description that names who you help, and film one talking-head video with a phone.", avoid: "Do not spend the week on banners or a calendar of 50 titles." });
    items.push({ title: "Publish one video that answers one real question", why: "A first video that tries to cover everything teaches nobody.", win: `Write one title a ${answers.role || "professional"} would search. Film it. Upload it.`, avoid: "Do not wait for new lights." });
    items.push({ title: `Protect a ${answers.hours || "small"} weekly slot`, why: `You said you have ${answers.hours || "limited hours"}.`, win: `Put one repeating calendar block in for ${hours.cadence}.`, avoid: mistakeFor("Time and consistency") });
    return items.slice(0, 3);
  }
  if (roadblock === "Getting views" || answers.publish === "Not yet" || answers.publish === "Occasionally") {
    items.push({ title: "Publish on a schedule you can keep", why: `Views follow a pattern. With ${answers.hours} a week, ${hours.cadence}.`, win: `Pick the next 7-day slot for ${ch}. Script one title, film it, upload it.`, avoid: mistakeFor("Getting views") });
  }
  if (communityId === "YFS" || roadblock === "Turning viewers into members") {
    items.push({ title: "Make every video point at one Skool door", why: "A viewer who likes the video and then has to hunt for you will not join.", win: answers.ytLinksToSkool === "Every video" ? `Check the last three descriptions on ${ch}. Move the ${sk} link to line one.` : `Add the ${sk} link as the first line of the description on ${ch} and say it at the end.`, avoid: mistakeFor("Turning viewers into members") });
  }
  if (communityId === "TCRL" || roadblock === "Selling a paid offer") {
    items.push({ title: answers.offerReady === "Yes, selling" ? "Tighten the path from video to the offer that already sells" : "Name one offer and put it on the last slide", why: `Your 90-day goal depends on ${niche} turning into a paid next step.`, win: answers.offerReady === "No" || answers.offerReady === "Idea only" ? "Write a one-page offer. Do not build the course yet." : `Record a 60-second close and add it to this week's video on ${ch}.`, avoid: mistakeFor("Selling a paid offer") });
  }
  if (roadblock === "Getting members engaged" || (answers.skool !== "No" && answers.members !== "None")) {
    items.push({ title: "Run one conversation, not five announcements", why: `${sk} goes quiet when it is over-posted and under-replied.`, win: "Post one question tied to this week's video. Reply to every comment within 24 hours.", avoid: mistakeFor("Getting members engaged") });
  }
  if (roadblock === "Getting started") {
    items.unshift({ title: "Finish the first public asset this week", why: "Starting is a URL someone else can open.", win: noYt ? "Create the channel and upload video one." : `Publish the next video on ${ch}.`, avoid: mistakeFor("Getting started") });
  }
  if (roadblock === "Time and consistency") {
    items.unshift({ title: "Cut the plan to fit the hours you actually have", why: `You marked ${answers.hours}.`, win: `Block ${hours.cadence} for the next four weeks.`, avoid: mistakeFor("Time and consistency") });
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

function compareLanguage(now, first, last) {
  if (!first) return "";
  const bits = [];
  if (now.youtube !== first.youtube) bits.push(`YouTube moved from “${first.youtube}” on day one to “${now.youtube}”.`);
  if (last && now.youtube !== last.youtube) bits.push(`Since last check-in, subscribers band changed from “${last.youtube}” to “${now.youtube}”.`);
  if (now.members !== first.members) bits.push(`Members moved from “${first.members}” to “${now.members}”.`);
  if (now.revenue !== first.revenue) bits.push(`Revenue band moved from “${first.revenue}” to “${now.revenue}”.`);
  if (!bits.length) return "The numbers have not jumped a band yet. Look at whether the weekly slot actually happened.";
  return bits.join(" ");
}

function esc(s) {
  return String(s || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function emailHtml({ name, community, stage, body, heading, answers, kind }) {
  const paras = body.split("\n").map((line) => {
    if (!line) return "";
    if (/^\d+\. /.test(line) && line.includes("http")) return `<p style="margin:8px 0;font-size:15px;">${esc(line)}</p>`;
    if (/^\d+\. /.test(line)) return `<h3 style="color:#1B2A4A;font-size:16px;margin:18px 0 6px;">${esc(line)}</h3>`;
    if (line.startsWith("Your stage:") || line === "Your top 3 priorities" || line.startsWith("Where to start") || line === "Next step") return `<h2 style="color:#1B2A4A;font-size:18px;margin:22px 0 8px;">${esc(line)}</h2>`;
    if (line.startsWith("Why it matters:") || line.startsWith("7-day quick win:") || line.startsWith("Mistake to avoid:")) return `<p style="margin:4px 0;font-size:15px;">${esc(line)}</p>`;
    return `<p style="margin:10px 0;font-size:16px;line-height:1.5;">${esc(line)}</p>`;
  }).join("");
  const callBtn = hasChannelAndSkool(answers) ? `<p style="margin-top:28px;"><a href="https://calendar.app.google/qnMBUzWyMDwC26XG7" style="background:#C45C26;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block;">Book a Roadblock Call</a></p>` : "";
  return `<!doctype html><html><body style="margin:0;background:#F4F1EC;font-family:Calibri,Segoe UI,Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1EC;padding:24px 12px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;"><tr><td style="background:#1B2A4A;color:#fff;padding:20px 24px;"><div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#d7c4b2;">Community Kickstart Tracker</div><div style="font-size:20px;margin-top:6px;">${esc(heading)}</div><div style="font-size:13px;color:#c9d0dc;margin-top:6px;">${esc(community.name)} · ${esc(stage)}</div></td></tr><tr><td style="padding:24px;">${paras}${callBtn}</td></tr></table></td></tr></table></body></html>`;
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
  const channelBit = answers.channelName ? `Your channel is ${answers.channelName}${answers.channelUrl ? ` (${answers.channelUrl})` : ""}.` : "";
  const skoolBit = answers.skoolName ? `Your Skool community is ${answers.skoolName}${answers.skoolUrl ? ` (${answers.skoolUrl})` : ""}.` : "";
  const summary = noYt
    ? `You do not have a YouTube channel yet, and you want progress on ${goal}. The first job is a simple channel and one useful video in ${niche}.`
    : `You are a ${answers.role || "professional"} in ${niche}, at ${stage}. ${channelBit} ${skoolBit} Over the next 90 days you want this: ${goal}.`;
  const start = community.startHere.map((s, i) => `${i + 1}. ${s.title} — ${s.url}`).join("\n");
  const priText = priorities.map((p, i) => `${i + 1}. ${p.title}\nWhy it matters: ${p.why}\n7-day quick win: ${p.win}\nMistake to avoid: ${p.avoid}`).join("\n\n");
  const heading = kind === "checkin" ? `${name}, your progress update` : `${name}, your Kickstart Report is ready`;
  const changed = kind === "checkin" ? compareLanguage(answers, previous?.firstAnswers, previous?.lastAnswers) : "";
  const stageMove = previous?.stage && previous.stage !== stage ? `You have moved from ${previous.stage} to ${stage}.` : "";
  const body = [`Hi ${name},`, summary, noYt ? "This is a basic start report: how to open a channel without turning it into a second job." : "", `Your stage: ${stage}`, stageCopy(stage), stageMove, kind === "checkin" ? `What has changed: ${changed}` : "", "Your top 3 priorities", priText, `Where to start in ${community.name}`, start, offerCall ? "Next step" : "", offerCall ? "Want help removing your biggest roadblock? Book a free 30-minute Roadblock Call with Des." : "", offerCall ? "https://calendar.app.google/qnMBUzWyMDwC26XG7" : "", answers.cohortInterest && answers.cohortInterest !== "Not for me right now" ? `You asked to hear about the next paid cohort (${answers.cohortInterest}).${answers.cohortFit ? ` First thing you want help with: ${answers.cohortFit}` : ""}` : "", "Des Dreckett", community.signOff || community.name].filter((line) => line !== "").join("\n");
  return {
    id: `r-${Date.now()}`,
    createdAt: new Date().toISOString(),
    kind,
    stage,
    subjectMember: heading,
    subjectDes: `[${community.short}] Kickstart report: ${name} – ${stage}`,
    text: body,
    html: emailHtml({ name, community, stage, body, heading, answers, kind }),
    priorities,
    offerCall,
    hotLead: stage === "Conversion" || stage === "Scale" || answers.roadblock === "Selling a paid offer" || answers.cohortInterest === "Yes, put my name on the list",
  };
}

export function buildDesPreamble(profile, answers, communityId, report) {
  return [`HOT LEAD flag: ${report.hotLead ? "HOT LEAD" : "standard"}`, `Name: ${profile.firstName}`, `Email: ${profile.email}`, `Community: ${communityId}`, `Stage: ${report.stage}`, `Biggest roadblock: ${answers.roadblock}`, `Channel: ${answers.channelName || "none"} ${answers.channelUrl || ""}`.trim(), `Skool: ${answers.skoolName || "none"} ${answers.skoolUrl || ""}`.trim(), `Cohort interest: ${answers.cohortInterest || "not asked"}`, answers.cohortFit ? `Cohort want first: ${answers.cohortFit}` : "", "", "Answers", ...Object.entries(answers).map(([k, v]) => `${k}: ${v}`), "", "Report", report.text].join("\n");
}

export function icsReminder(title = "Kickstart check-in") {
  const start = new Date();
  start.setDate(start.getDate() + 14);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start.getTime() + 20 * 60 * 1000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Community Kickstart Tracker//EN\nBEGIN:VEVENT\nDTSTAMP:${fmt(new Date())}\nDTSTART:${fmt(start)}\nDTEND:${fmt(end)}\nSUMMARY:${title}\nDESCRIPTION:Open the Community Kickstart Tracker and update your progress.\nEND:VEVENT\nEND:VCALENDAR`;
}

export { YT_RANK, MEM_RANK, REV_RANK };
