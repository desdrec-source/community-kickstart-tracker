import { COMMUNITIES, questionsFor, resolveLabel, hasChannelAndSkool, checkinQuestions } from "./questions.js";
import { loadState, saveState, deleteAll, downloadJson, downloadText, emptyState } from "./db.js";
import { generateReport, stageCopy, buildDesPreamble, icsReminder, YT_RANK, MEM_RANK, REV_RANK } from "./report.js";

let state = emptyState();
let draft = { community: null, firstName: "", email: "", answers: {}, step: 0 };
let checkinDraft = { answers: {}, step: 0 };
let pendingReport = null;
let toastTimer = null;
const $ = (id) => document.getElementById(id);
function show(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
}
function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
}
function persist() { return saveState(state); }
function activeProfile() { return state.profiles[state.activeCommunity] || null; }
function daysSince(iso) {
  if (!iso) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
}
function initLanding() {
  const box = $("communityChoices");
  box.innerHTML = Object.values(COMMUNITIES).map((c) => `<button class="community ${draft.community === c.id ? "selected" : ""}" data-id="${c.id}"><strong>${c.name}</strong><span>${c.blurb}</span></button>`).join("");
  box.querySelectorAll("button").forEach((btn) => {
    btn.onclick = () => { draft.community = btn.dataset.id; initLanding(); };
  });
  $("firstName").value = draft.firstName;
  $("email").value = draft.email;
}
function startQuestionnaire() {
  draft.firstName = $("firstName").value.trim();
  draft.email = $("email").value.trim();
  if (!draft.community) return toast("Choose a community first.");
  if (!draft.firstName) return toast("Add your first name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) return toast("Add a working email — the report is sent there, not shown on screen.");
  draft.answers = {};
  draft.step = 0;
  renderQuestion();
  show("screen-q");
}
function currentQuestions() { return questionsFor(draft.community, draft.answers); }
function renderQuestion() {
  const qs = currentQuestions();
  if (draft.step >= qs.length) draft.step = Math.max(0, qs.length - 1);
  const q = qs[draft.step];
  $("qProgressLabel").textContent = `Question ${draft.step + 1} of ${qs.length}`;
  $("qBar").style.width = `${Math.round((draft.step / qs.length) * 100)}%`;
  $("qLabel").textContent = resolveLabel(q, draft.answers);
  const existing = draft.answers[q.id] || "";
  if (q.type === "choice") {
    $("qControl").innerHTML = `<div class="choice-grid">${q.options.map((o) => `<button class="choice ${existing === o ? "selected" : ""}" data-v="${encodeURIComponent(o)}">${o}</button>`).join("")}</div>`;
    $("qControl").querySelectorAll(".choice").forEach((b) => {
      b.onclick = () => { draft.answers[q.id] = decodeURIComponent(b.dataset.v); renderQuestion(); };
    });
  } else if (q.type === "textarea") {
    $("qControl").innerHTML = `<textarea id="qInput" placeholder="${q.placeholder || ""}">${existing}</textarea>`;
  } else {
    $("qControl").innerHTML = `<input id="qInput" type="text" placeholder="${q.placeholder || ""}" value="${String(existing).replaceAll('"', "&quot;")}">`;
  }
  $("qBack").disabled = draft.step === 0;
}
function captureCurrentAnswer() {
  const q = currentQuestions()[draft.step];
  const input = $("qInput");
  if (input) draft.answers[q.id] = input.value.trim();
  return draft.answers[q.id];
}
function nextQuestion() {
  const qs = currentQuestions();
  const currentId = qs[draft.step]?.id;
  const val = captureCurrentAnswer();
  if (!val) return toast("Pick or type an answer to continue.");
  const nextQs = currentQuestions();
  const idx = Math.max(0, nextQs.findIndex((q) => q.id === currentId));
  if (idx < nextQs.length - 1) { draft.step = idx + 1; renderQuestion(); }
  else finishFirstVisit();
}
function backQuestion() {
  captureCurrentAnswer();
  if (draft.step > 0) { draft.step -= 1; renderQuestion(); }
}
function finishFirstVisit() {
  const community = draft.community;
  const answers = { ...draft.answers };
  const existing = state.profiles[community] || {};
  const profile = { community, firstName: draft.firstName, email: draft.email, createdAt: existing.createdAt || new Date().toISOString(), answers, checkins: existing.checkins || [], currentChecklist: [], checklistHistory: existing.checklistHistory || [], reports: existing.reports || [], lastCheckInAt: new Date().toISOString() };
  const report = generateReport({ profile, answers, communityId: community, kind: "first", previous: { firstAnswers: answers, lastAnswers: null, stage: null, doneTitles: [] } });
  profile.stage = report.stage;
  profile.currentChecklist = report.priorities.map((p, i) => ({ id: `c-${Date.now()}-${i}`, title: p.title, win: p.win, done: false }));
  profile.reports.push({ id: report.id, createdAt: report.createdAt, kind: report.kind, stage: report.stage, subjectMember: report.subjectMember, subjectDes: report.subjectDes, text: report.text, html: report.html, hotLead: report.hotLead });
  profile.checkins.push({ at: profile.lastCheckInAt, kind: "first", stage: report.stage, snapshot: { youtube: answers.youtube, members: answers.members, revenue: answers.revenue, publish: answers.publish } });
  state.profiles[community] = profile;
  state.activeCommunity = community;
  pendingReport = report;
  persist();
  renderSend(profile, report);
  show("screen-send");
}
function renderSend(profile, report) {
  $("sendTitle").textContent = "Your report is ready to email";
  $("sendBody").innerHTML = `<div class="sent"><strong>Nothing from the report is shown on this screen.</strong> It goes to ${profile.email}. On this device we keep your answers, stage and checklist only.</div><p class="lede">Stage assigned: <span class="pill">${report.stage}</span></p><label class="field"><input type="checkbox" id="copyDes" checked> Send Des a copy so he can help with these answers</label><p class="muted">Ticked by default. Untick if you only want the report in your own inbox. Des uses what you typed to give personal help.</p>`;
}
function mockSend() {
  const profile = activeProfile();
  if (!profile || !pendingReport) return toast("No report to send.");
  const copyDes = $("copyDes")?.checked;
  const report = pendingReport;
  const last = profile.reports[profile.reports.length - 1];
  if (last) { last.sentTo = profile.email; last.sentToDes = !!copyDes; last.sentAt = new Date().toISOString(); }
  persist();
  $("confirmText").innerHTML = `<div class="sent"><strong>Mock send complete</strong> Would have emailed “${report.subjectMember}” to ${profile.email} via Brevo. ${copyDes ? "A copy would also go to hello@outsourcemycontent.com." : "No copy to Des."}</div><p class="muted">Live Brevo is not wired in this MVP.</p>`;
  show("screen-confirm");
}
function downloadLastEmail() {
  const profile = activeProfile();
  const report = pendingReport || profile?.reports?.at(-1);
  if (!report) return toast("No email on file.");
  downloadText(report.html, `kickstart-report-${profile.firstName}.html`, "text/html");
}
function renderCharts(p) {
  const last = (p.checkins.map((c) => c.snapshot || {}).at(-1)) || {};
  const yt = ((YT_RANK[last.youtube] || 0) / 3) * 100;
  const mem = ((MEM_RANK[last.members] || 0) / 3) * 100;
  const rev = ((REV_RANK[last.revenue] || 0) / 3) * 100;
  return `<div class="charts"><div class="chart-row"><span>YouTube</span><div class="chart-bar"><i style="width:${yt}%"></i></div><span>${last.youtube || "—"}</span></div><div class="chart-row"><span>Members</span><div class="chart-bar"><i style="width:${mem}%"></i></div><span>${last.members || "—"}</span></div><div class="chart-row"><span>Revenue</span><div class="chart-bar"><i style="width:${rev}%"></i></div><span>${last.revenue || "—"}</span></div></div>`;
}
function renderDashboard() {
  const p = activeProfile();
  if (!p) { show("screen-land"); return; }
  $("dashSwitch").innerHTML = Object.values(COMMUNITIES).map((c) => `<button class="btn ${state.activeCommunity === c.id ? "btn-navy" : "btn-ghost"}" data-id="${c.id}">${c.short}${state.profiles[c.id] ? "" : " · start"}</button>`).join("");
  $("dashSwitch").querySelectorAll("button").forEach((b) => {
    b.onclick = () => {
      const id = b.dataset.id;
      if (state.profiles[id]) { state.activeCommunity = id; persist(); renderDashboard(); }
      else {
        draft = { community: id, firstName: p.firstName, email: p.email, answers: {}, step: 0 };
        initLanding();
        show("screen-land");
        toast("Same name and email kept. Answer the questions for this community.");
      }
    };
  });
  const done = p.currentChecklist.filter((i) => i.done).length;
  const total = p.currentChecklist.length || 1;
  const due = daysSince(p.lastCheckInAt) >= 14;
  $("dashMain").innerHTML = `<p class="kicker" style="color:#8a6a55;">${COMMUNITIES[p.community].name}</p><h2>Hello ${p.firstName}</h2><p class="lede">${stageCopy(p.stage)} Days since you started: ${daysSince(p.createdAt)}.</p>${due ? `<div class="confirm-box">It has been ${daysSince(p.lastCheckInAt)} days since your last check-in.</div>` : ""}<div class="card"><span class="pill">${p.stage}</span><p class="muted" style="margin:8px 0 0;">Checklist ${done} of ${p.currentChecklist.length} done (${Math.round((done / total) * 100)}%)</p></div><h3>This week’s actions</h3><div class="card white" id="checklist"></div><h3>Progress bands</h3><div class="card white">${renderCharts(p)}</div><h3>Check-ins</h3><ul class="timeline">${p.checkins.slice().reverse().map((c) => `<li><strong>${new Date(c.at).toLocaleDateString("en-GB")}</strong> · ${c.kind === "first" ? "First report" : "Check-in"} · ${c.stage}</li>`).join("")}</ul>`;
  const list = $("checklist");
  list.innerHTML = p.currentChecklist.map((item) => `<label class="checklist-item ${item.done ? "done" : ""}"><input type="checkbox" data-id="${item.id}" ${item.done ? "checked" : ""}><span><strong>${item.title}</strong><br><span class="muted">${item.win || ""}</span></span></label>`).join("");
  list.querySelectorAll("input").forEach((inp) => {
    inp.onchange = () => {
      const item = p.currentChecklist.find((i) => i.id === inp.dataset.id);
      if (item) item.done = inp.checked;
      persist();
      renderDashboard();
    };
  });
  $("btnBook").classList.toggle("hidden", !hasChannelAndSkool(p.answers));
  show("screen-dash");
}
function startCheckin() {
  checkinDraft = { answers: { ...activeProfile().answers }, step: 0 };
  renderCheckin();
  show("screen-checkin");
}
function checkinFields() { return checkinQuestions(activeProfile().community, checkinDraft.answers); }
function renderCheckin() {
  const fields = checkinFields();
  if (checkinDraft.step >= fields.length) checkinDraft.step = Math.max(0, fields.length - 1);
  const q = fields[checkinDraft.step];
  $("cProgressLabel").textContent = `Check-in ${checkinDraft.step + 1} of ${fields.length}`;
  $("cBar").style.width = `${Math.round((checkinDraft.step / fields.length) * 100)}%`;
  $("cLabel").textContent = resolveLabel(q, checkinDraft.answers);
  const existing = checkinDraft.answers[q.id] || "";
  if (q.type === "choice") {
    $("cControl").innerHTML = `<div class="choice-grid">${q.options.map((o) => `<button class="choice ${existing === o ? "selected" : ""}" data-v="${encodeURIComponent(o)}">${o}</button>`).join("")}</div>`;
    $("cControl").querySelectorAll(".choice").forEach((b) => {
      b.onclick = () => { checkinDraft.answers[q.id] = decodeURIComponent(b.dataset.v); renderCheckin(); };
    });
  } else if (q.type === "textarea") {
    $("cControl").innerHTML = `<textarea id="cInput" placeholder="${q.placeholder || ""}">${existing}</textarea>`;
  } else {
    $("cControl").innerHTML = `<input id="cInput" type="text" placeholder="${q.placeholder || ""}" value="${String(existing).replaceAll('"', "&quot;")}">`;
  }
  $("cBack").disabled = checkinDraft.step === 0;
}
function captureCheckin() {
  const q = checkinFields()[checkinDraft.step];
  const input = $("cInput");
  if (input) checkinDraft.answers[q.id] = input.value.trim();
  return checkinDraft.answers[q.id];
}
function nextCheckin() {
  const fields = checkinFields();
  const currentId = fields[checkinDraft.step]?.id;
  const q = fields[checkinDraft.step];
  const val = captureCheckin();
  if (q.type === "choice" && !val) return toast("Choose an option.");
  const nextFields = checkinFields();
  const idx = Math.max(0, nextFields.findIndex((item) => item.id === currentId));
  if (idx < nextFields.length - 1) { checkinDraft.step = idx + 1; renderCheckin(); }
  else finishCheckin();
}
function backCheckin() {
  captureCheckin();
  if (checkinDraft.step > 0) { checkinDraft.step -= 1; renderCheckin(); }
}
function finishCheckin() {
  const p = activeProfile();
  const lastAnswers = { ...p.answers };
  const doneTitles = (p.currentChecklist || []).filter((i) => i.done).map((i) => i.title);
  p.checklistHistory = [...(p.checklistHistory || []), ...(p.currentChecklist || [])];
  p.answers = { ...p.answers, ...checkinDraft.answers };
  const report = generateReport({ profile: p, answers: p.answers, communityId: p.community, kind: "checkin", previous: { firstAnswers: lastAnswers, lastAnswers, stage: p.stage, doneTitles } });
  p.stage = report.stage;
  p.lastCheckInAt = new Date().toISOString();
  p.currentChecklist = report.priorities.map((pr, i) => ({ id: `c-${Date.now()}-${i}`, title: pr.title, win: pr.win, done: false }));
  p.reports.push({ id: report.id, createdAt: report.createdAt, kind: report.kind, stage: report.stage, subjectMember: report.subjectMember, subjectDes: report.subjectDes, text: report.text, html: report.html, hotLead: report.hotLead });
  p.checkins.push({ at: p.lastCheckInAt, kind: "checkin", stage: report.stage, snapshot: { youtube: p.answers.youtube, members: p.answers.members, revenue: p.answers.revenue, publish: p.answers.publish } });
  pendingReport = report;
  persist();
  renderSend(p, report);
  show("screen-send");
}
function openSettings() {
  const p = activeProfile();
  $("settingsBody").innerHTML = `<p class="lede">Data on this device only.</p>${p ? `<p class="muted">Active profile: ${p.firstName} · ${COMMUNITIES[p.community].short} · ${p.email}</p>` : ""}`;
  show("screen-settings");
}
function restoreFromFile(file) {
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data.profiles) throw new Error("bad");
      state = data;
      await persist();
      toast("Backup restored.");
      if (state.activeCommunity && state.profiles[state.activeCommunity]) renderDashboard();
      else { initLanding(); show("screen-land"); }
    } catch { toast("That file could not be read."); }
  };
  reader.readAsText(file);
}
async function boot() {
  state = await loadState();
  $("goStart").onclick = startQuestionnaire;
  $("qNext").onclick = nextQuestion;
  $("qBack").onclick = backQuestion;
  $("sendNow").onclick = mockSend;
  $("skipSend").onclick = () => { pendingReport = pendingReport || activeProfile()?.reports?.at(-1); renderDashboard(); toast("Report kept on device. Email not sent."); };
  $("dlEmail").onclick = downloadLastEmail;
  $("goDash").onclick = renderDashboard;
  $("btnCheckin").onclick = startCheckin;
  $("cNext").onclick = nextCheckin;
  $("cBack").onclick = backCheckin;
  $("btnSettings").onclick = openSettings;
  $("btnSettingsDash").onclick = openSettings;
  $("btnBackDash").onclick = () => { if (activeProfile()) renderDashboard(); else { initLanding(); show("screen-land"); } };
  $("btnBackup").onclick = () => downloadJson(state, "kickstart-backup.json");
  $("restoreFile").onchange = (e) => { const file = e.target.files?.[0]; if (file) restoreFromFile(file); };
  $("btnDelete").onclick = async () => {
    if (!confirm("Delete all Kickstart data on this device? This cannot be undone.")) return;
    state = emptyState();
    draft = { community: null, firstName: "", email: "", answers: {}, step: 0 };
    await deleteAll();
    initLanding();
    show("screen-land");
    toast("All local data deleted.");
  };
  $("btnIcs").onclick = () => downloadText(icsReminder(), "kickstart-checkin.ics", "text/calendar");
  $("btnBook").onclick = () => window.open("https://calendar.app.google/qnMBUzWyMDwC26XG7", "_blank");
  $("firstName").addEventListener("input", (e) => (draft.firstName = e.target.value));
  $("email").addEventListener("input", (e) => (draft.email = e.target.value));
  if (state.activeCommunity && state.profiles[state.activeCommunity]) renderDashboard();
  else { initLanding(); show("screen-land"); }
}
boot();
