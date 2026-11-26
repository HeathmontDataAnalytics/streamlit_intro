// Streamlit beginnings: the shared exercise engine.
//
// An exercise page holds only content (see AGENTS.md):
//   <script type="application/json" id="exercise">  config
//   <section id="intro">                            the story before step 1
//   <article class="step"> ... </article>            one per step
//   <section id="finish">                           shown after the last step
// This module turns that content into the three-pane workspace, runs the
// student's code with stlite and handles hints, downloads and saved progress.

import { CONCEPTS, CONCEPT_ORDER, EXERCISE_NAMES } from "./concepts.js";

const STLITE_VERSION = "1.12.2";
const STLITE_BASE = `https://cdn.jsdelivr.net/npm/@stlite/browser@${STLITE_VERSION}/build/`;
const REQUIREMENTS = ["pandas", "plotly", "openpyxl"];
const PIP_LINE = "pip install streamlit pandas plotly openpyxl";
const STORAGE_PREFIX = "streamlit-beginnings:";
const SETTINGS_KEY = STORAGE_PREFIX + "settings"; // shared by all exercises

// The first app stlite runs. It is never shown to students as code: it says
// Python is ready and imports the heavy packages so the first real run is quick.
const WELCOME_APP = `import streamlit as st
import pandas
import plotly.express

st.info("Python is ready. Press **Run** to see your app.")
`;

// Known loading stages from stlite, mapped to a rough share of the wait.
const LOAD_STAGES = [
  ["Loading Pyodide", 5],
  ["Mounting files", 35],
  ["Unpacking archives", 38],
  ["Installing packages", 45],
  ["Loading streamlit package", 80],
  ["Setting up the loggers", 88],
  ["Mocking some Streamlit functions", 90],
  ["Booting up the Streamlit server", 94],
];

// ------------------------------------------------------------------ utils ---

const $ = (sel, root = document) => root.querySelector(sel);

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

/** Code stored in <script type="text/x-python"> blocks: trim the blank edges. */
function readCode(node) {
  if (!node) return null;
  return node.textContent.replace(/^\s*\n/, "").replace(/\s+$/, "") + "\n";
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function editDistance(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

function closest(word, options) {
  let best = null;
  let bestD = Infinity;
  for (const o of options) {
    const d = editDistance(word, o);
    if (d < bestD) { best = o; bestD = d; }
  }
  return bestD <= Math.max(2, Math.floor(word.length / 3)) ? best : null;
}

// ---------------------------------------------------------------- storage ---

function makeStore(id) {
  const key = STORAGE_PREFIX + id;
  return {
    load() {
      try {
        const raw = window.localStorage.getItem(key);
        const data = raw ? JSON.parse(raw) : null;
        return data && typeof data === "object" ? data : {};
      } catch {
        return {};
      }
    },
    save(data) {
      try {
        window.localStorage.setItem(key, JSON.stringify(data));
      } catch {
        /* storage blocked or full: progress just isn't saved */
      }
    },
    clear() {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* nothing to clear */
      }
    },
  };
}

// Page-wide settings (such as suggestions on/off), shared by every exercise.
function loadSettings() {
  try {
    const data = JSON.parse(window.localStorage.getItem(SETTINGS_KEY));
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

function saveSetting(name, value) {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...loadSettings(), [name]: value }));
  } catch {
    /* storage blocked: the setting just isn't remembered */
  }
}

// --------------------------------------------------------------- content ---

/**
 * A step's "New in this step" list: <div class="new-in-step" data-items="a b"
 * data-review="c">, with optional <div class="why" data-item="a"> notes saying
 * why each one is needed in this step.
 */
function readNewIn(node) {
  if (!node) return null;
  const ids = (attr) => (node.dataset[attr] || "").split(/\s+/).filter(Boolean);
  const why = {};
  node.querySelectorAll(":scope > .why[data-item]").forEach((w) => { why[w.dataset.item] = w; });
  return { items: ids("items"), review: ids("review"), why };
}

function readExercise() {
  const cfgNode = $("#exercise");
  const cfg = JSON.parse(cfgNode.textContent);
  cfgNode.remove();

  const intro = $("#intro");
  const finish = $("#finish");
  const steps = [...document.querySelectorAll("article.step")].map((node, i) => {
    const part = (cls) => node.querySelector(`:scope > .${cls}`);
    return {
      title: node.dataset.title || `Step ${i + 1}`,
      story: part("story"),
      task: part("task"),
      hint: part("hint"),
      expect: part("expect"),
      newIn: readNewIn(part("new-in-step")),
      start: readCode(node.querySelector('script.start[type="text/x-python"]')),
      solution: readCode(node.querySelector('script.solution[type="text/x-python"]')),
    };
  });
  // By convention a step starts from the previous step's solution.
  steps.forEach((s, i) => {
    if (!s.start) s.start = i === 0 ? "import streamlit as st\n" : steps[i - 1].solution;
  });
  // Optional "Try it yourself": the same skills on a new dataset, as a separate
  // app with its own code. Hints point at commented sections of earlier steps.
  const tryNode = $("#try-it");
  let tryIt = null;
  if (tryNode && cfg.tryIt) {
    const part = (cls) => tryNode.querySelector(`:scope > .${cls}`);
    tryIt = {
      ...cfg.tryIt,
      story: part("story"),
      task: part("task"),
      expect: part("expect"),
      hints: [...tryNode.querySelectorAll(":scope > .try-hint")].map((h) => ({
        title: h.dataset.title || "Hint",
        note: h,
        sections: (h.dataset.sections || "").split("|").filter(Boolean).map((s) => {
          const at = s.indexOf(":");
          return { step: Number(s.slice(0, at)), comment: s.slice(at + 1).trim() };
        }),
      })),
      start: readCode(tryNode.querySelector('script.start[type="text/x-python"]')),
      solution: readCode(tryNode.querySelector('script.solution[type="text/x-python"]')),
    };
  }
  tryNode?.remove();
  intro?.remove();
  finish?.remove();
  document.querySelectorAll("article.step").forEach((n) => n.remove());
  return { cfg, intro, finish, steps, tryIt };
}

// ================================================================ engine ===

const { cfg, intro, finish, steps, tryIt } = readExercise();
const store = makeStore(cfg.id);
let saved = store.load();
// Views: 0 = intro, 1..n = steps, then "Try it yourself" (if any), then finish.
const TRY = tryIt ? steps.length + 1 : -1;
const LAST = steps.length + (tryIt ? 2 : 1);
const allDatasets = [...cfg.datasets, ...(tryIt?.datasets || [])];

const state = {
  view: Number.isInteger(saved.view) && saved.view >= 0 && saved.view <= LAST ? saved.view : 0,
  done: Array.isArray(saved.done) ? saved.done.filter(Number.isInteger) : [],
  seen: Array.isArray(saved.seen) ? saved.seen.filter(Number.isInteger) : [], // steps whose cards have been shown
};

// Two separate pieces of code: the main app, and the Try it yourself app.
const codes = {
  main: typeof saved.code === "string" && saved.code.trim() ? saved.code : steps[0].start,
  try: tryIt ? (typeof saved.tryCode === "string" && saved.tryCode.trim() ? saved.tryCode : tryIt.start) : "",
};
let activeBuffer = state.view === TRY ? "try" : "main";

function persist() {
  if (editor.impl) codes[activeBuffer] = editor.getValue();
  saved = { view: state.view, done: state.done, seen: state.seen, code: codes.main, tryCode: codes.try, updated: Date.now() };
  store.save(saved);
}

/** The datasets that belong to the code in the editor (main app or Try it). */
function bufferDatasets(buffer = activeBuffer) {
  return buffer === "try" ? tryIt.datasets : cfg.datasets;
}

// ---------------------------------------------------------------- layout ---

const ui = {};

function buildLayout() {
  document.body.classList.add("exercise");
  document.title = `${cfg.title} · Streamlit beginnings`;

  ui.status = el("span", { class: "py-status", role: "status", "aria-live": "polite", "data-state": "loading" }, "Python: loading");
  const topbar = el("header", { class: "topbar" },
    el("a", { class: "back", href: "../index.html" }, "← ", el("span", { class: "back-text" }, "All exercises")),
    el("h1", {}, `${cfg.number}. ${cfg.title}`),
    ui.status,
  );

  // Steps pane
  ui.stepList = el("ol", { class: "step-list", "aria-label": "Steps" });
  ui.stepView = el("div", { class: "step-view" });
  ui.extras = buildExtras();
  const stepsPane = el("section", { class: "pane pane-steps", "aria-label": "Instructions" },
    el("div", { class: "pane-body" },
      el("div", { class: "steps-scroll" },
        el("div", { class: "steps-top" }, ui.stepList,
          el("button", { class: "btn btn-small ref-btn", type: "button", onclick: () => openReference() }, "Function reference")),
        ui.stepView, ui.extras)),
  );

  // Editor pane
  ui.runBtn = el("button", { class: "btn btn-primary", type: "button", disabled: true, title: "Run (Ctrl+Enter)", onclick: () => run() }, "▶ Run");
  ui.resetBtn = el("button", { class: "btn btn-small", type: "button", onclick: () => loadStepStart() }, "Reset to step start");
  ui.downloadBtn = el("button", { class: "btn btn-small", type: "button", onclick: () => downloadCode() }, "Download .py");
  ui.editorHost = el("div", { class: "editor-host" });
  ui.codeTitle = el("h2", {}, "Your code");
  const editorPane = el("section", { class: "pane pane-editor", "aria-label": "Code editor" },
    el("div", { class: "pane-head" }, ui.codeTitle, ui.runBtn, ui.resetBtn, ui.downloadBtn),
    el("div", { class: "pane-body" }, ui.editorHost),
    el("div", { class: "editor-foot" },
      el("p", { id: "editor-help" },
        el("kbd", {}, "Ctrl"), "+", el("kbd", {}, "Enter"), " runs your code. ",
        el("kbd", {}, "Tab"), " indents; press ", el("kbd", {}, "Esc"), " then ", el("kbd", {}, "Tab"), " to leave the editor."),
      ui.suggestLabel = el("label", { class: "suggest-toggle", hidden: true },
        ui.suggestBox = el("input", { type: "checkbox", "aria-describedby": "suggest-help" }),
        " Suggestions",
        el("span", { id: "suggest-help", class: "visually-hidden" },
          "When on, the editor suggests Streamlit, pandas and Plotly functions and column names as you type. Enter or Tab inserts the highlighted suggestion; the arrow keys choose another; Esc closes the list."),
      ),
    ),
  );

  // App pane
  ui.restartBtn = el("button", { class: "btn btn-small", type: "button", onclick: () => restartPython() }, "Stop / restart Python");
  ui.messages = el("div", { class: "app-messages", "aria-live": "polite" });
  ui.appHost = el("div", { class: "app-host" });
  ui.loading = buildLoading();
  const appPane = el("section", { class: "pane pane-app", "aria-label": "Your app" },
    el("div", { class: "pane-head" }, el("h2", {}, "Your app"), ui.restartBtn),
    el("div", { class: "pane-body" }, ui.messages, ui.appHost, ui.loading),
  );

  const main = el("main", { class: "workspace", id: "main" }, stepsPane, editorPane, appPane);
  document.body.prepend(el("a", { class: "skip-link", href: "#main" }, "Skip to the exercise"), topbar, main);
}

function buildLoading() {
  ui.loadBar = el("span");
  ui.loadStage = el("p", { class: "loading-stage" }, "Starting Python…");
  ui.loadTime = el("p", { class: "muted" }, "");
  return el("div", { class: "loading" },
    el("div", { class: "loading-card" },
      el("h3", {}, "Getting Python ready"),
      el("p", { class: "muted" }, "Python is loading inside your browser. The first load can take 30 seconds or more; later loads are faster because your browser keeps a copy. Read the introduction while you wait."),
      el("div", { class: "loading-bar", "aria-hidden": "true" }, ui.loadBar),
      ui.loadStage,
      ui.loadTime,
    ),
  );
}

function buildExtras() {
  const files = cfg.datasets.map((d) => d.path.split("/").pop());
  return el("div", { class: "page-extras" },
    el("details", {},
      el("summary", {}, "How this page works"),
      el("p", {}, "Your code runs inside this browser tab using Python compiled for the web (Pyodide) and Streamlit (through stlite). Nothing you type is uploaded or sent anywhere, and there is no account."),
      el("p", {}, "Your progress and code are saved in this browser only, so they will be there next time you open this page on this device. Clearing your browser data or using a private window removes them."),
      files.length
        ? el("p", {}, "Download .py saves your code as a normal Streamlit file. To run it on your own computer, put it in a folder together with a ", el("code", {}, "data"), " folder holding ", files.map((f, i) => [i ? " and " : "", el("code", {}, f)]), ", then follow the instructions at the top of the file.")
        : el("p", {}, "Download .py saves your code as a normal Streamlit file. To run it on your own computer, follow the instructions at the top of the file."),
      el("p", {}, "As you type, the editor suggests Streamlit, pandas and Plotly functions (after ", el("code", {}, "st."), ", ", el("code", {}, "pd."), ", ", el("code", {}, "px."), " or a table's name) and column names (inside quotes). Enter or Tab inserts the highlighted suggestion, the arrow keys choose another, and Esc closes the list. If the suggestions get in the way, untick Suggestions under the editor."),
      el("p", {}, "If the app freezes (for example, because of a loop that never ends), press Stop / restart Python. Your code is kept."),
    ),
    el("p", { class: "muted" },
      el("button", { class: "btn-link", type: "button", onclick: resetProgress }, "Reset progress"),
      " for this exercise (clears your saved code and ticks).",
    ),
  );
}

// ----------------------------------------------------------------- steps ---

function renderStepList() {
  ui.stepList.replaceChildren();
  const labels = ["Start", ...steps.map((_, i) => String(i + 1)), ...(tryIt ? ["Try it"] : []), "Finish"];
  labels.forEach((label, v) => {
    const name = v === 0 ? "Introduction" : v === LAST ? "Finish" : v === TRY ? `Try it yourself: ${tryIt.title}` : `Step ${v}: ${steps[v - 1].title}`;
    const isDone = v > 0 && v < LAST && state.done.includes(v);
    ui.stepList.append(el("li", {},
      el("button", {
        type: "button",
        class: isDone ? "is-done" : null,
        "aria-current": v === state.view ? "step" : null,
        "aria-label": name + (isDone ? " (done)" : ""),
        title: name,
        onclick: () => showView(v, true),
      }, isDone ? `✓ ${label}` : label),
    ));
  });
}

function clone(node) {
  if (!node) return null;
  const c = node.cloneNode(true);
  c.removeAttribute("class");
  return c;
}

function renderView() {
  const v = state.view;
  const view = ui.stepView;
  view.replaceChildren();

  if (v === 0) {
    const heading = el("h2", { tabindex: "-1" }, cfg.title);
    view.append(el("p", { class: "step-count" }, `Exercise ${cfg.number} · ${steps.length} steps`), heading, clone(intro));
    view.append(el("div", { class: "step-nav" },
      el("button", { class: "btn btn-primary", type: "button", onclick: () => showView(1, true) }, "Start step 1 →")));
    return heading;
  }

  if (v === LAST) {
    const heading = el("h2", { tabindex: "-1" }, "Finished!");
    view.append(el("p", { class: "step-count" }, "Finish"), heading, clone(finish));
    const dataLinks = (list) => list.map((d) => el("a", { class: "btn", href: d.url, download: d.path.split("/").pop() }, `Download the data (${d.path.split("/").pop()})`));
    const downloads = el("div", { class: "finish-downloads" },
      el("button", { class: "btn btn-primary", type: "button", onclick: () => downloadCode("main") }, `Download your code (${cfg.filename})`),
      dataLinks(cfg.datasets),
      tryIt ? [
        el("button", { class: "btn btn-primary", type: "button", onclick: () => downloadCode("try") }, `Download your Try it yourself code (${tryIt.filename})`),
        dataLinks(tryIt.datasets),
      ] : null,
    );
    const model = steps[steps.length - 1].solution;
    view.append(
      el("h3", {}, "Keep your app"),
      downloads,
      el("h3", {}, "Run it on your own computer"),
      el("ol", {},
        cfg.datasets.length
          ? el("li", {}, "Make a folder, put ", el("code", {}, cfg.filename), " in it, and make a ", el("code", {}, "data"), " folder inside it for the data file.")
          : el("li", {}, "Make a folder and put ", el("code", {}, cfg.filename), " in it."),
        el("li", {}, "Install the packages once: ", el("code", {}, PIP_LINE)),
        el("li", {}, "In a terminal in that folder, run ", el("code", {}, `streamlit run ${cfg.filename}`)),
      ),
      el("details", { class: "hint" },
        el("summary", {}, "Compare with one possible answer"),
        el("p", {}, "There is more than one right answer. If your app does what each step asked, it's correct."),
        el("pre", {}, el("code", {}, model)),
      ),
      el("div", { class: "step-nav" },
        el("button", { class: "btn", type: "button", onclick: () => showView(LAST - 1, true) }, "← Previous step"),
        el("a", { class: "btn btn-primary", href: "../index.html" }, "Back to all exercises")),
    );
    return heading;
  }

  // Every step asks for comments, and the self-check includes them.
  const commentTask = el("p", { class: "comment-note" }, "Add a short ", el("code", {}, "#"), " comment above each new section of code you write.");
  const commentCheck = el("p", { class: "comment-note" }, "Each new section of your code has a short comment above it saying what it does.");

  if (v === TRY) return renderTry(view, commentTask, commentCheck);

  const step = steps[v - 1];
  const heading = el("h2", { tabindex: "-1" }, step.title);
  view.append(el("p", { class: "step-count" }, `Step ${v} of ${steps.length}`), heading);
  if (step.story) view.append(clone(step.story));
  if (step.newIn) view.append(renderNewIn(step.newIn, v));
  if (step.task) view.append(el("div", { class: "box box-task" }, el("h3", {}, "Your task"), ...clone(step.task).childNodes, commentTask));
  if (step.hint) view.append(renderHint(step.hint));
  if (step.expect) view.append(el("div", { class: "box box-expect" }, el("h3", {}, "What you should see"), ...clone(step.expect).childNodes, commentCheck));
  view.append(
    el("div", { class: "step-actions" },
      el("button", { class: "btn btn-small", type: "button", onclick: () => loadStepStart() }, "Load the starting code for this step"),
    ),
    el("div", { class: "step-nav" },
      el("button", { class: "btn", type: "button", onclick: () => showView(v - 1, true) }, v === 1 ? "← Introduction" : "← Previous"),
      el("button", {
        class: "btn btn-primary", type: "button",
        onclick: () => {
          if (!state.done.includes(v)) state.done.push(v);
          showView(v + 1, true);
        },
      }, v < steps.length ? "Done, next step →" : tryIt ? "Done, try it yourself →" : "Done, finish →"),
    ),
  );
  return heading;
}

// ------------------------------------------------- new in this step ---

/** One card: kind, name and summary, opening to the full explanation. */
function conceptCard(id, { open = false, why = null } = {}) {
  const c = CONCEPTS[id];
  const idea = /idea/i.test(c.kind);
  const body = el("div", { class: "concept-body", html: c.body });
  if (why) body.prepend(el("div", { class: "concept-why" }, el("strong", {}, "In this step: "), ...clone(why).childNodes));
  return el("details", { class: "concept", open, "data-concept": id },
    el("summary", {},
      el("span", { class: "concept-kind", "data-kind": c.kind }, c.kind),
      el("span", { class: "concept-name" }, idea ? c.name : el("code", {}, c.name)),
      el("span", { class: "concept-summary" }, c.summary),
    ),
    body,
  );
}

/** The "New in this step" section. Cards are open on a step's first visit. */
function renderNewIn(newIn, v) {
  const first = !state.seen.includes(v);
  if (first) state.seen.push(v);
  const known = newIn.items.filter((id) => {
    if (!CONCEPTS[id]) console.warn(`New in this step: no card called "${id}"`);
    return CONCEPTS[id];
  });
  const box = el("section", { class: "new-in-step", "aria-labelledby": `new-${v}` },
    el("h3", { id: `new-${v}` }, "New in this step"),
    known.map((id) => conceptCard(id, { open: first, why: newIn.why[id] })),
  );
  const review = newIn.review.filter((id) => CONCEPTS[id]);
  if (review.length) {
    box.append(el("p", { class: "seen-before" }, "Seen before: ",
      review.map((id, i) => [i ? ", " : "", el("button", { class: "btn-link", type: "button", onclick: () => openReference(id) },
        /idea/i.test(CONCEPTS[id].kind) ? CONCEPTS[id].name : el("code", {}, CONCEPTS[id].name))]),
      " (opens the Function reference)"));
  }
  return box;
}

/** Everything introduced up to where the student is now, by exercise. */
function conceptsSoFar() {
  const stepNow = state.view >= 1 && state.view <= steps.length ? state.view : state.view === 0 ? 0 : Infinity;
  return CONCEPT_ORDER.filter((id) => {
    const [ex, st] = CONCEPTS[id].at;
    return ex < cfg.number || (ex === cfg.number && st <= stepNow);
  });
}

let referenceDialog = null;

/** The Function reference: a dialog of every card so far. */
function openReference(focusId = null) {
  if (!referenceDialog) {
    referenceDialog = el("dialog", { class: "reference", "aria-labelledby": "reference-title" });
    referenceDialog.addEventListener("click", (e) => { if (e.target === referenceDialog) referenceDialog.close(); });
    document.body.append(referenceDialog);
  }
  const ids = conceptsSoFar();
  const groups = {};
  ids.forEach((id) => { (groups[CONCEPTS[id].at[0]] ||= []).push(id); });
  referenceDialog.replaceChildren(
    el("div", { class: "reference-head" },
      el("h2", { id: "reference-title" }, "Function reference"),
      el("button", { class: "btn btn-small", type: "button", onclick: () => referenceDialog.close() }, "Close"),
    ),
    el("div", { class: "reference-body" },
      el("p", { class: "muted" }, "Everything introduced so far, in the order you met it. Open a card to see what it does, how to use it and examples."),
      ids.length
        ? Object.keys(groups).map((ex) => [
          el("h3", {}, `Exercise ${ex}: ${EXERCISE_NAMES[ex] || ""}`),
          groups[ex].map((id) => conceptCard(id, { open: id === focusId })),
        ])
        : el("p", {}, "Nothing yet. New functions and ideas are added here as you reach them in the steps."),
    ),
  );
  referenceDialog.showModal();
  if (focusId) {
    const card = referenceDialog.querySelector(`[data-concept="${focusId}"]`);
    card?.scrollIntoView({ block: "start" });
    card?.querySelector("summary")?.focus();
  }
}

/**
 * The commented section of an earlier step's solution that starts with
 * `comment`: the comment line and the code after it, up to the next section
 * comment (a top-level # line) or the end. Blank lines inside are kept, so
 * blocks like `with tab1:` stay with the st.tabs line above them.
 */
function codeSection(stepNo, comment) {
  const lines = (steps[stepNo - 1]?.solution || "").split("\n");
  const start = lines.findIndex((l) => l.trim() === comment);
  if (start < 0) {
    console.warn(`Try it yourself: no section "${comment}" in step ${stepNo}`);
    return null;
  }
  const indent0 = lines[start].length - lines[start].trimStart().length;
  let end = start + 1;
  while (end < lines.length) {
    const l = lines[end];
    const isNextSection = l.trim().startsWith("#") && l.length - l.trimStart().length <= indent0 && lines[end - 1].trim() === "";
    if (isNextSection) break;
    end++;
  }
  while (end > start + 1 && lines[end - 1].trim() === "") end--;
  const block = lines.slice(start, end);
  const indent = Math.min(...block.filter((l) => l.trim()).map((l) => l.length - l.trimStart().length));
  return block.map((l) => l.slice(indent)).join("\n");
}

function renderTry(view, commentTask, commentCheck) {
  const heading = el("h2", { tabindex: "-1" }, `Try it yourself: ${tryIt.title}`);
  view.append(el("p", { class: "step-count" }, "Try it yourself · a new app with new data"), heading);
  if (tryIt.story) view.append(clone(tryIt.story));
  if (tryIt.task) view.append(el("div", { class: "box box-task" }, el("h3", {}, "Your task"), ...clone(tryIt.task).childNodes, commentTask));
  if (tryIt.hints.length) {
    view.append(el("h3", { class: "try-hints-title" }, "Hints: code you've already written"));
    for (const h of tryIt.hints) {
      const details = el("details", { class: "hint" }, el("summary", {}, h.title));
      details.append(...clone(h.note).childNodes);
      for (const { step, comment } of h.sections) {
        const code = codeSection(step, comment);
        if (!code) continue;
        details.append(
          el("p", { class: "try-from" }, `From step ${step}, ${steps[step - 1].title}:`),
          el("pre", {}, el("code", {}, code)),
        );
      }
      view.append(details);
    }
  }
  if (tryIt.expect) view.append(el("div", { class: "box box-expect" }, el("h3", {}, "What you should see"), ...clone(tryIt.expect).childNodes, commentCheck));
  view.append(
    el("div", { class: "step-actions" },
      el("button", { class: "btn btn-small", type: "button", onclick: () => loadStepStart() }, "Load the starting code"),
    ),
    el("details", { class: "hint" },
      el("summary", {}, "Compare with one possible answer"),
      el("p", {}, "There is more than one right answer. If your app does what the task asked, it's correct."),
      el("pre", {}, el("code", {}, tryIt.solution)),
    ),
    el("div", { class: "step-nav" },
      el("button", { class: "btn", type: "button", onclick: () => showView(TRY - 1, true) }, "← Previous"),
      el("button", {
        class: "btn btn-primary", type: "button",
        onclick: () => {
          if (!state.done.includes(TRY)) state.done.push(TRY);
          showView(LAST, true);
        },
      }, "Done, finish →"),
    ),
  );
  return heading;
}

// A hint has two levels: a reminder of the functions and parameters needed
// (.hint-recall), then, on request, code with blanks to fill in (.hint-blanks).
// A hint without those parts is shown as a single level.
function renderHint(hint) {
  const recall = hint.querySelector(":scope > .hint-recall");
  const blanks = hint.querySelector(":scope > .hint-blanks");
  if (!recall && !blanks) {
    return el("details", { class: "hint" }, el("summary", {}, "Show a hint"), ...clone(hint).childNodes);
  }
  const details = el("details", { class: "hint" }, el("summary", {}, "Show a hint"));
  if (recall) details.append(...clone(recall).childNodes);
  if (blanks) {
    details.append(el("details", { class: "hint-more" },
      el("summary", {}, "Still stuck? Show the code with blanks"),
      el("p", {}, "Replace each ", el("code", {}, "____"), " with the right code, and put the lines in the right place in your app."),
      ...clone(blanks).childNodes,
    ));
  }
  return details;
}

function showView(v, focus = false) {
  state.view = Math.max(0, Math.min(LAST, v));
  switchBuffer(state.view === TRY ? "try" : "main");
  renderStepList();
  const heading = renderView();
  persist();
  const scroller = ui.stepView.closest(".pane-body");
  if (scroller) scroller.scrollTop = 0;
  if (focus) {
    heading.focus({ preventScroll: window.innerWidth < 760 ? false : true });
    if (window.innerWidth < 760) heading.scrollIntoView({ block: "start" });
  }
}

/**
 * Show the main app's code or the Try it yourself code in the editor. Each
 * keeps its own text; switching runs the newly shown code.
 */
function switchBuffer(buffer) {
  if (buffer === activeBuffer || !editor.impl) return;
  codes[activeBuffer] = editor.getValue();
  activeBuffer = buffer;
  editor.setValue(codes[buffer]);
  ui.codeTitle.textContent = buffer === "try" ? "Try it yourself" : "Your code";
  clearMessages();
  if (py.ready) run();
}

/** The code a student starts the current view from. */
function currentStartCode() {
  if (state.view === TRY) return { code: tryIt.start, label: "Try it yourself" };
  const idx = Math.min(Math.max(state.view, 1), steps.length) - 1;
  return { code: steps[idx].start, label: `step ${idx + 1}` };
}

function loadStepStart() {
  const { code, label } = currentStartCode();
  const current = editor.getValue();
  if (current.trim() && current.trim() !== code.trim()) {
    const ok = window.confirm(`Replace the code in the editor with the starting code for ${label}?\n\nYour current code will be lost. Use Download .py first if you want to keep it.`);
    if (!ok) return;
  }
  editor.setValue(code);
  persist();
  editor.focus();
  if (py.ready) run();
}

function resetProgress() {
  const ok = window.confirm("Reset this exercise? Your saved code (including Try it yourself) and ticks for this exercise will be cleared.");
  if (!ok) return;
  store.clear();
  state.view = 0;
  state.done = [];
  codes.main = steps[0].start;
  codes.try = tryIt ? tryIt.start : "";
  activeBuffer = "main";
  editor.setValue(codes.main);
  ui.codeTitle.textContent = "Your code";
  showView(0, true);
  if (py.ready) run();
}

// ---------------------------------------------------------------- editor ---

const editor = {
  impl: null,
  getValue() { return this.impl.getValue(); },
  setValue(v) { this.impl.setValue(v); },
  focus() { this.impl.focus(); },
  gotoLine(n) { this.impl.gotoLine(n); },
};

const saveSoon = debounce(() => persist(), 400);

function makeTextarea(initial) {
  const ta = el("textarea", {
    class: "editor-fallback",
    spellcheck: "false",
    autocapitalize: "off",
    autocomplete: "off",
    "aria-label": "Python code",
    "aria-describedby": "editor-help",
  });
  ta.value = initial;
  ta.addEventListener("input", saveSoon);
  ta.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      run();
    } else if (e.key === "Tab" && !e.shiftKey && !ta.dataset.escaped) {
      e.preventDefault();
      ta.setRangeText("    ", ta.selectionStart, ta.selectionEnd, "end");
      saveSoon();
    } else if (e.key === "Escape") {
      ta.dataset.escaped = "1"; // next Tab leaves the editor
      return;
    }
    if (e.key !== "Escape") delete ta.dataset.escaped;
  });
  ui.editorHost.replaceChildren(ta);
  return {
    getValue: () => ta.value,
    setValue: (v) => { ta.value = v; },
    focus: () => ta.focus(),
    gotoLine: (n) => {
      const lines = ta.value.split("\n");
      const pos = lines.slice(0, n - 1).reduce((a, l) => a + l.length + 1, 0);
      ta.focus();
      ta.setSelectionRange(pos, pos + (lines[n - 1] || "").length);
    },
  };
}

async function upgradeToCodeMirror() {
  let cm;
  let completions = null;
  try {
    cm = await import("./vendor/codemirror.js");
  } catch (err) {
    console.warn("CodeMirror failed to load; using the plain text editor.", err);
    return;
  }
  try {
    completions = await import("./completions.js");
  } catch (err) {
    console.warn("Suggestions failed to load.", err);
  }
  const { EditorView, EditorState, Compartment, basicSetup, keymap, indentWithTab, python, HighlightStyle, syntaxHighlighting, indentUnit, autocompletion, acceptCompletion, tags: t } = cm;
  const value = editor.getValue();
  const hadFocus = ui.editorHost.contains(document.activeElement);

  const theme = EditorView.theme({
    "&": { backgroundColor: "var(--bg)", color: "var(--code)" },
    ".cm-content": { fontFamily: "var(--font-mono)", caretColor: "var(--text)", padding: "8px 0" },
    ".cm-scroller": { fontFamily: "var(--font-mono)", lineHeight: "1.5" },
    ".cm-gutters": { backgroundColor: "var(--panel)", color: "var(--muted)", borderRight: "1px solid var(--line)" },
    ".cm-activeLine": { backgroundColor: "color-mix(in srgb, var(--tint) 70%, transparent)" },
    ".cm-activeLineGutter": { backgroundColor: "var(--tint)", color: "var(--text)" },
    "&.cm-focused .cm-cursor": { borderLeftColor: "var(--text)" },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": { backgroundColor: "color-mix(in srgb, var(--focus) 28%, transparent) !important" },
    ".cm-matchingBracket": { backgroundColor: "color-mix(in srgb, var(--focus) 22%, transparent)", outline: "1px solid var(--focus)" },
    ".cm-tooltip": { backgroundColor: "var(--panel)", color: "var(--text)", border: "1px solid var(--line)" },
    ".cm-panels": { backgroundColor: "var(--panel)", color: "var(--text)" },
    ".cm-errorLine": { backgroundColor: "var(--errbg)" },
    ".cm-tooltip-autocomplete ul li[aria-selected]": { backgroundColor: "var(--accent)", color: "var(--accent-text)" },
    ".cm-completionDetail": { fontStyle: "normal", opacity: "0.75", marginLeft: "0.8em" },
    ".cm-completionInfo": { maxWidth: "260px", whiteSpace: "normal" },
  });

  // Suggestions: our own list only (no Python built-ins), shown after "st.",
  // "pd.", "px.", a table or a column, and column names inside quotes. The top
  // suggestion is pre-selected, as in VS Code: Enter or Tab inserts it and Esc
  // closes the list. A checkbox under the editor turns suggestions off.
  const suggestions = new Compartment();
  const source = completions?.makeCompletionSource(() => activeDatasets(editor.getValue()).flatMap((d) => d.columns || []));
  const suggestionsOn = () => autocompletion({ override: [source], icons: false });
  const suggestionsOff = () => autocompletion({ override: [() => null], activateOnTyping: false });
  const wantSuggestions = () => !!source && loadSettings().suggestions !== false;
  const highlight = HighlightStyle.define([
    { tag: [t.keyword, t.controlKeyword, t.moduleKeyword, t.operatorKeyword, t.definitionKeyword], color: "var(--syn-keyword)", fontWeight: "600" },
    { tag: [t.string, t.special(t.string)], color: "var(--syn-string)" },
    { tag: t.comment, color: "var(--syn-comment)", fontStyle: "italic" },
    { tag: [t.number], color: "var(--syn-number)" },
    { tag: [t.bool, t.null], color: "var(--syn-bool)" },
    { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "var(--syn-function)" },
    { tag: [t.definition(t.variableName)], color: "var(--code)", fontWeight: "600" },
  ]);

  const view = new EditorView({
    parent: ui.editorHost,
    state: EditorState.create({
      doc: value,
      extensions: [
        keymap.of([
          { key: "Mod-Enter", run: () => { run(); return true; } },
          { key: "Tab", run: acceptCompletion }, // only when a suggestion is selected
        ]),
        basicSetup,
        suggestions.of(wantSuggestions() ? suggestionsOn() : suggestionsOff()),
        keymap.of([indentWithTab]),
        indentUnit.of("    "),
        EditorState.tabSize.of(4),
        python(),
        theme,
        syntaxHighlighting(highlight),
        EditorView.contentAttributes.of({ "aria-label": "Python code", "aria-describedby": "editor-help" }),
        EditorView.updateListener.of((u) => { if (u.docChanged) saveSoon(); }),
      ],
    }),
  });
  ui.editorHost.querySelector(".editor-fallback")?.remove();

  editor.impl = {
    getValue: () => view.state.doc.toString(),
    setValue: (v) => view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: v } }),
    focus: () => view.focus(),
    gotoLine: (n) => {
      const line = view.state.doc.line(Math.max(1, Math.min(n, view.state.doc.lines)));
      view.dispatch({ selection: { anchor: line.from, head: line.to }, scrollIntoView: true });
      view.focus();
    },
  };
  if (source) {
    ui.suggestBox.checked = wantSuggestions();
    ui.suggestLabel.hidden = false;
    ui.suggestBox.addEventListener("change", () => {
      saveSetting("suggestions", ui.suggestBox.checked);
      view.dispatch({ effects: suggestions.reconfigure(ui.suggestBox.checked ? suggestionsOn() : suggestionsOff()) });
    });
  }
  if (hadFocus) view.focus();
}

// ------------------------------------------------------------- downloads ---

function saveBlob(text, filename, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = el("a", { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Download the main app's code, or the Try it yourself code ("try"). */
function downloadCode(buffer = activeBuffer) {
  if (editor.impl) codes[activeBuffer] = editor.getValue();
  const isTry = buffer === "try";
  const filename = isTry ? tryIt.filename : cfg.filename;
  const date = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
  const files = bufferDatasets(buffer).map((d) => d.path);
  const stepInfo = isTry ? ""
    : state.view >= 1 && state.view <= steps.length ? ` (step ${state.view} of ${steps.length})`
      : state.view === LAST ? " (finished)" : "";
  const header = [
    isTry
      ? `# Streamlit beginnings, exercise ${cfg.number}, Try it yourself: ${tryIt.title}`
      : `# Streamlit beginnings, exercise ${cfg.number}: ${cfg.title}`,
    `# Downloaded on ${date}${stepInfo}`,
    "#",
    "# To run this app on your own computer:",
    `#   1. Install the packages (you only need to do this once):`,
    `#        ${PIP_LINE}`,
    files.length
      ? `#   2. Put this file in a folder. Next to it, make a folder called "data" holding ${files.map((f) => f.split("/").pop()).join(" and ")}.`
      : "#   2. Put this file in a folder.",
    `#   3. Open a terminal in that folder and run:`,
    `#        streamlit run ${filename}`,
    "",
    "",
  ].join("\n");
  saveBlob(header + codes[buffer].replace(/\s+$/, "") + "\n", filename, "text/x-python");
}

// ================================================================ python ===

// A short event log, read by the automated checks (window.__exercise.log).
const eventLog = [];
function trace(msg) {
  eventLog.push(`${Math.round(performance.now())} ${msg}`);
  if (eventLog.length > 200) eventLog.shift();
}

const py = {
  controller: null,
  ready: false,
  runCount: 0,
  lastCode: "",
  running: false,
  firstRunPending: true,
  awaitingWelcome: false,
  compileError: false,
  autorun: false,
  welcomeTimer: null,
  startedAt: 0,
  timer: null,
  stuckTimer: null,
};

let stliteModule = null;
async function loadStlite() {
  if (stliteModule) return stliteModule;
  if (!document.querySelector("link[data-stlite]")) {
    document.head.append(el("link", { rel: "stylesheet", href: STLITE_BASE + "stlite.css", "data-stlite": "" }));
  }
  stliteModule = await import(STLITE_BASE + "stlite.js");
  return stliteModule;
}

function setStatus(stateName, text) {
  ui.status.dataset.state = stateName;
  ui.status.textContent = text;
}

function setLoading(visible, stage, pct) {
  ui.loading.hidden = !visible;
  if (stage) ui.loadStage.textContent = stage;
  if (pct != null) ui.loadBar.style.width = `${pct}%`;
}

async function startPython({ autorun }) {
  py.ready = false;
  py.firstRunPending = true;
  ui.runBtn.disabled = true;
  ui.runBtn.textContent = "▶ Run";
  clearMessages();
  setStatus("loading", "Python: loading");
  setLoading(true, "Starting Python…", 3);
  py.startedAt = performance.now();
  clearInterval(py.timer);
  py.timer = setInterval(() => {
    const s = Math.round((performance.now() - py.startedAt) / 1000);
    ui.loadTime.textContent = `${s} seconds so far`;
  }, 1000);

  let stlite;
  try {
    stlite = await loadStlite();
  } catch (err) {
    loadFailed(err, true);
    return;
  }

  const mountPoint = el("div", { class: "stlite-mount" });
  ui.appHost.replaceChildren(mountPoint);

  const files = { "app.py": WELCOME_APP };
  for (const d of allDatasets) files[d.path] = { url: new URL(d.url, location.href).href };

  try {
    py.controller = stlite.mount({
      entrypoint: "app.py",
      requirements: REQUIREMENTS,
      files,
      streamlitConfig: {
        "server.runOnSave": true,
        "client.toolbarMode": "viewer",
      },
      disableProgressToasts: true,
    }, mountPoint);
  } catch (err) {
    loadFailed(err, false);
    return;
  }

  // _kernel is marked unstable in stlite; the version is pinned (see AGENTS.md).
  const kernel = py.controller._kernel;
  const worker = kernel._worker;
  worker.addEventListener("message", (e) => {
    if (worker !== py.controller?._kernel?._worker) return; // an old, restarted worker
    onWorkerMessage(e.data);
  });
  kernel.addEventListener("loadProgress", (e) => {
    const msg = String(e.detail || "");
    const stage = LOAD_STAGES.find(([prefix]) => msg.startsWith(prefix));
    const friendly = {
      "Loading Pyodide": "Downloading Python…",
      "Mounting files": "Adding the data files…",
      "Unpacking archives": "Adding the data files…",
      "Installing packages": "Installing pandas, Plotly and openpyxl…",
      "Loading streamlit package": "Loading Streamlit…",
    }[stage?.[0]] || "Starting Streamlit…";
    setLoading(true, friendly, stage ? stage[1] : null);
    setStatus("loading", "Python: loading");
  });
  kernel.addEventListener("loadError", (e) => loadFailed(e.detail, false));
  kernel.addEventListener("loadFinished", () => {
    trace("loadFinished");
    setLoading(true, "Starting your app…", 97);
    // Wait for the welcome app's first run to end, so it can't be mistaken for
    // the student's run. If that signal never arrives, carry on anyway.
    py.autorun = autorun;
    py.awaitingWelcome = true;
    py.welcomeTimer = setTimeout(welcomeDone, 25000);
  });
}

function welcomeDone() {
  if (!py.awaitingWelcome) return;
  trace("welcome app finished");
  py.awaitingWelcome = false;
  clearTimeout(py.welcomeTimer);
  py.ready = true;
  ui.runBtn.disabled = false;
  setStatus("ready", "Python: ready");
  if (py.autorun) {
    run();
  } else {
    finishLoading();
    showMessage("ok", "Python has restarted", "Your code is still in the editor. Press Run when you're ready.");
  }
}

function finishLoading() {
  clearInterval(py.timer);
  setLoading(false);
  py.firstRunPending = false;
}

function loadFailed(err, cdnProblem) {
  console.error(err);
  clearInterval(py.timer);
  setLoading(false);
  setStatus("error", "Python: failed to load");
  ui.runBtn.disabled = true;
  const box = showMessage("err", "Python couldn't load",
    cdnProblem
      ? "Your browser couldn't download stlite from cdn.jsdelivr.net. Check your internet connection. On a school network, a web filter may be blocking this site: let your teacher know."
      : "Something went wrong while starting Python. Try again; if it keeps happening, reload the page or try another browser.");
  box.append(
    el("details", {}, el("summary", {}, "Show the technical details"), el("pre", {}, String(err?.stack || err?.message || err))),
    el("div", { class: "btn-row" }, el("button", { class: "btn btn-small", type: "button", onclick: () => restartPython(true) }, "Try again")),
  );
}

function restartPython(autorun = false) {
  try {
    py.controller?.unmount();
  } catch (err) {
    console.warn("unmount failed", err);
  }
  py.controller = null;
  py.running = false;
  py.awaitingWelcome = false;
  clearTimeout(py.welcomeTimer);
  clearTimeout(py.stuckTimer);
  startPython({ autorun });
}

async function run() {
  if (!py.ready || !py.controller) return;
  const code = editor.getValue();
  persist();
  py.lastCode = code;
  py.runCount += 1;
  trace(`run ${py.runCount} sent`);
  py.running = true;
  clearMessages();
  setStatus("running", "Python: running");
  ui.runBtn.textContent = "▶ Running…";
  clearTimeout(py.stuckTimer);
  py.stuckTimer = setTimeout(() => {
    if (!py.running) return;
    showMessage("warn", "Still running…",
      "Your app is taking a long time. If it seems stuck (for example, a loop that never ends), press Stop / restart Python. Your code will be kept.");
  }, 15000);

  // A trailing comment makes each Run a real file change, so Streamlit always reruns.
  try {
    await py.controller.writeFile("app.py", code.replace(/\s+$/, "") + `\n# run ${py.runCount}\n`);
  } catch (err) {
    console.error(err);
    py.running = false;
    showMessage("err", "Couldn't send your code to Python", "Press Stop / restart Python and try again.");
    return;
  }
}

// ---------------------------------------------------- watching the app ---
//
// stlite passes Streamlit's protobuf ForwardMsgs from the worker as
// "websocket:message" events. A top-level field 6 (script_finished) means a
// script run has ended: status 0 = finished, 1 = compile error, 2 = stopped
// early because a rerun was requested (not the end), 3 = fragment finished.
// This catches the end of every run, including reruns caused by widgets.

function readVarint(bytes, pos) {
  let value = 0;
  let shift = 0;
  while (pos < bytes.length) {
    const b = bytes[pos++];
    value += (b & 0x7f) * 2 ** shift;
    if (b < 0x80) return [value, pos];
    shift += 7;
  }
  return [null, pos];
}

function scriptFinishedStatus(payload) {
  const bytes = payload instanceof Uint8Array ? payload
    : payload instanceof ArrayBuffer ? new Uint8Array(payload)
      : ArrayBuffer.isView(payload) ? new Uint8Array(payload.buffer, payload.byteOffset, payload.byteLength)
        : null;
  if (!bytes) return null;
  let pos = 0;
  while (pos < bytes.length) {
    let key;
    [key, pos] = readVarint(bytes, pos);
    if (key == null) return null;
    const field = Math.floor(key / 8);
    const wire = key % 8;
    if (wire === 0) {
      let value;
      [value, pos] = readVarint(bytes, pos);
      if (field === 6) return value;
    } else if (wire === 2) {
      let len;
      [len, pos] = readVarint(bytes, pos);
      if (len == null) return null;
      pos += len;
    } else if (wire === 1) {
      pos += 8;
    } else if (wire === 5) {
      pos += 4;
    } else {
      return null;
    }
  }
  return null;
}

function onWorkerMessage(msg) {
  if (!msg || msg.type !== "websocket:message" || !msg.data) return;
  const status = scriptFinishedStatus(msg.data.payload);
  if (status == null || status === 2) return;
  trace(`script_finished ${status}`);
  // Give the app a moment to draw what the script sent before we look at it.
  setTimeout(() => {
    if (py.awaitingWelcome) welcomeDone();
    else runFinished(status);
  }, 250);
}

async function runFinished(status) {
  trace(`runFinished (running=${py.running})`);
  py.compileError = status === 1;
  if (py.compileError) {
    await showCompileError();
  } else {
    setTimeout(updateErrorHint, 900); // late-drawn elements
  }
  if (!py.running) {
    updateErrorHint(); // a rerun caused by a widget
    return;
  }
  py.running = false;
  clearTimeout(py.stuckTimer);
  ui.runBtn.textContent = "▶ Run";
  if (py.firstRunPending) finishLoading();
  const stuck = ui.messages.querySelector('[data-kind="warn"]');
  if (stuck) stuck.remove();
  const hadError = py.compileError || updateErrorHint();
  const time = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" });
  setStatus(hadError ? "error" : "ready", hadError ? `Ran at ${time}, with an error` : `Ran at ${time}`);
}

// ------------------------------------------------------------ messages ---

function clearMessages() {
  ui.messages.replaceChildren();
}

function showMessage(kind, title, body) {
  ui.messages.querySelector(`[data-kind="${kind}"]`)?.remove();
  const box = el("div", { class: `note note-${kind}`, "data-kind": kind, role: kind === "err" ? "alert" : null },
    el("h3", {}, title));
  if (typeof body === "string") box.append(el("p", {}, body));
  else if (body) box.append(body);
  ui.messages.append(box);
  return box;
}

// --------------------------------------------------------- error hints ---

const COMMON_ST = ["title", "header", "subheader", "write", "markdown", "text", "caption", "code", "dataframe", "table",
  "metric", "columns", "tabs", "sidebar", "expander", "container", "selectbox", "multiselect", "slider", "checkbox",
  "toggle", "radio", "button", "text_input", "number_input", "file_uploader", "plotly_chart", "line_chart", "bar_chart",
  "info", "success", "warning", "error", "stop", "divider", "image", "download_button", "segmented_control", "pills"];
const COMMON_PX = ["bar", "line", "scatter", "histogram", "box", "pie", "area", "violin", "strip", "sunburst", "treemap"];

let lastErrorKey = "";

// Streamlit reports code it can't compile (SyntaxError, IndentationError) in a
// dialog over the whole page rather than in the app. We close that dialog,
// compile the code ourselves to get the details, and show our usual hint.
async function showCompileError() {
  closeStreamlitErrorDialog();
  setTimeout(closeStreamlitErrorDialog, 400);
  let info = null;
  try {
    const probe = [
      "import json, traceback",
      `_src = ${JSON.stringify(py.lastCode)}`,
      "try:",
      '    compile(_src, "app.py", "exec")',
      "    _result = None",
      "except SyntaxError as _e:",
      '    _result = json.dumps({"type": type(_e).__name__, "msg": _e.msg, "line": _e.lineno, "text": "".join(traceback.format_exception_only(type(_e), _e))})',
      "_result",
    ].join("\n");
    const res = await py.controller.runPython(probe);
    info = typeof res === "string" ? JSON.parse(res) : null;
  } catch (err) {
    console.warn("compile check failed", err);
  }
  const type = info?.type || "SyntaxError";
  const msg = info?.msg || "invalid syntax";
  const { title, html } = explainError(`${type}: ${msg}`, info?.text || "");
  const body = el("div", { html });
  addLineAndTrace(body, info?.line || null, (info?.text || `${type}: ${msg}`).trim());
  body.prepend(el("p", {}, "Python couldn't read your code, so your app below hasn't been updated."));
  lastErrorKey = "";
  showMessage("err", title, body);
}

function closeStreamlitErrorDialog() {
  for (const dialog of document.querySelectorAll('[role="dialog"]')) {
    if (!/error/i.test(dialog.textContent || "")) continue;
    const close = [...dialog.querySelectorAll("button")].find((b) => /close/i.test(b.textContent + " " + (b.getAttribute("aria-label") || "")));
    close?.click();
  }
}

function addLineAndTrace(body, line, fullTrace) {
  if (line) {
    const lineText = (py.lastCode.split("\n")[line - 1] ?? "").trimEnd();
    body.prepend(
      el("p", {}, `The problem is on line ${line} of your code`, lineText ? ":" : "."),
      lineText ? el("div", { class: "err-line" }, lineText) : "",
    );
  }
  body.append(
    el("div", { class: "btn-row" },
      line ? el("button", { class: "btn btn-small", type: "button", onclick: () => editor.gotoLine(line) }, `Go to line ${line}`) : ""),
    el("details", {}, el("summary", {}, "Show the full error message"), el("pre", {}, fullTrace)),
  );
}

function updateErrorHint() {
  if (py.compileError) return true;
  const exc = ui.appHost.querySelector('[data-testid="stException"]');
  if (!exc) {
    ui.messages.querySelector('[data-kind="err"]')?.remove();
    lastErrorKey = "";
    return false;
  }
  const messageNode = exc.querySelector('[data-testid="stExceptionMessage"]');
  const message = (messageNode?.textContent || exc.textContent || "").trim();
  const traceRows = [...exc.querySelectorAll('[data-testid="stExceptionTraceRow"]')].map((r) => r.textContent);
  const fullTrace = [message, ...traceRows].join("\n");
  const key = fullTrace;
  if (key === lastErrorKey && ui.messages.querySelector('[data-kind="err"]')) return true;
  lastErrorKey = key;

  const { title, html } = explainError(message, fullTrace);
  const line = findLine(message, traceRows);
  const body = el("div", { html });
  addLineAndTrace(body, line, fullTrace);
  showMessage("err", title, body);
  return true;
}

function findLine(message, traceRows) {
  for (let i = traceRows.length - 1; i >= 0; i--) {
    const m = traceRows[i].match(/app\.py", line (\d+)/);
    if (m) return Number(m[1]);
  }
  const m = message.match(/app\.py, line (\d+)/) || message.match(/\bline (\d+)\b/);
  return m ? Number(m[1]) : null;
}

/**
 * The datasets the code uses (by file path), so hints and suggestions list the
 * right columns. Falls back to the datasets for the code in the editor.
 */
function activeDatasets(code = py.lastCode || editor.getValue()) {
  const used = allDatasets.filter((d) => code.includes(d.path));
  return used.length ? used : bufferDatasets();
}

function columnsHtml() {
  const known = activeDatasets().filter((d) => d.columns?.length);
  if (!known.length) {
    return "<p>Check the column names in the table your app shows (use <code>st.write(df.columns.tolist())</code> to list them). They must match exactly, including capital letters and underscores.</p>";
  }
  return known.map((d) =>
    `<p>The columns in <code>${escapeHtml(d.path)}</code> are: ${d.columns.map((c) => `<code>${escapeHtml(c)}</code>`).join(", ")}.</p>`,
  ).join("") + "<p>Column names must match exactly, including capital letters and underscores.</p>";
}

function allColumns() {
  return activeDatasets().flatMap((d) => d.columns || []);
}

function didYouMean(word, options) {
  const guess = closest(word, options);
  return guess && guess !== word ? `<p>Did you mean <code>${escapeHtml(guess)}</code>?</p>` : "";
}

function explainError(message, fullTrace) {
  // "SomeError: details", possibly with a module prefix such as
  // "streamlit.errors.StreamlitDuplicateElementId: ...". Any name counts,
  // not only ones ending in Error.
  const m = message.match(/^([A-Za-z_][\w.]*)(?:\s*:\s*([\s\S]*))?$/);
  const type = m ? m[1].split(".").pop() : "";
  const detail = m ? (m[2] || "").trim() : message;
  const files = bufferDatasets().map((d) => `<code>${escapeHtml(d.path)}</code>`).join(" and ");

  switch (type) {
    case "KeyError": {
      const name = detail.replace(/^['"]|['"]$/g, "");
      return {
        title: `There's no column called "${name}"`,
        html: `<p>A <code>KeyError</code> usually means you asked for a column that isn't in the table.</p>${didYouMean(name, allColumns())}${columnsHtml()}`,
      };
    }
    case "FileNotFoundError": {
      const file = (detail.match(/'([^']+)'/) || [])[1] || "that file";
      return {
        title: "Python couldn't find the file",
        html: `<p>There's no file called <code>${escapeHtml(file)}</code>.</p>${files ? `<p>The data file${bufferDatasets().length > 1 ? "s" : ""} for this app: ${files}. Check the spelling and that the path starts with <code>data/</code>.</p>` : ""}`,
      };
    }
    case "NameError": {
      const name = (detail.match(/name '([^']+)' is not defined/) || [])[1] || "";
      if (/^_{2,}$/.test(name)) {
        return {
          title: "There's still a blank to fill in",
          html: "<p>Your code still has a <code>____</code> from the hint. Replace each one with the right code, then press Run again.</p>",
        };
      }
      const imports = { st: "import streamlit as st", pd: "import pandas as pd", px: "import plotly.express as px" };
      if (imports[name]) {
        return {
          title: `Python doesn't know what "${name}" is`,
          html: `<p>You need to import it first. Add this line near the top of your code:</p><pre><code>${imports[name]}</code></pre>`,
        };
      }
      const known = { streamlit: "st", pandas: "pd", plotly: "px", Pandas: "pd", ST: "st", PD: "pd", PX: "px" };
      return {
        title: `Python doesn't know what "${name}" is`,
        html: `<p>A <code>NameError</code> means a name is used before it has been created.</p><ul>
          <li>Check the spelling and capital letters: <code>df</code> and <code>DF</code> are different names.</li>
          <li>Make sure the line that creates <code>${escapeHtml(name)}</code> (for example <code>${escapeHtml(name)} = ...</code>) comes <em>above</em> the line where you use it.</li>
          <li>Text needs quotes around it: <code>"Melbourne"</code>, not <code>Melbourne</code>.</li>
          ${known[name] ? `<li>Did you mean <code>${known[name]}</code>?</li>` : ""}
        </ul>`,
      };
    }
    case "IndentationError":
    case "TabError":
      return {
        title: "The indentation (spaces at the start of a line) is wrong",
        html: `<p>Python uses spaces at the start of a line to group code. Lines inside an <code>if</code>, <code>for</code>, <code>with</code> or <code>else</code> block need 4 spaces; other lines should start right at the left edge.</p><p>Python said: <em>${escapeHtml(detail)}</em></p>`,
      };
    case "SyntaxError":
      return {
        title: "Python couldn't understand part of your code",
        html: `<p>This is a <code>SyntaxError</code>. Common causes:</p><ul>
          <li>a missing bracket <code>)</code> or <code>]</code>, or a missing quote <code>"</code></li>
          <li>a missing colon <code>:</code> at the end of an <code>if</code>, <code>else</code>, <code>for</code> or <code>with</code> line</li>
          <li>a missing comma between arguments</li>
          <li>using <code>=</code> (store a value) where you meant <code>==</code> (compare)</li>
        </ul><p>The real mistake is sometimes at the end of the line <em>before</em> the one Python points to.</p><p>Python said: <em>${escapeHtml(detail)}</em></p>`,
      };
    case "ModuleNotFoundError":
    case "ImportError": {
      const mod = (detail.match(/'([^']+)'/) || [])[1] || "";
      return {
        title: `Python couldn't import "${mod || "a module"}"`,
        html: `<p>Check the spelling of your <code>import</code> lines. The packages used in these exercises are imported like this:</p><pre><code>import streamlit as st
import pandas as pd
import plotly.express as px</code></pre><p>Other packages aren't available on this page.</p>`,
      };
    }
    case "AttributeError": {
      const mod = detail.match(/module '([^']+)' has no attribute '([^']+)'/);
      if (mod) {
        const [, modName, attr] = mod;
        const prefix = modName.startsWith("streamlit") ? "st" : modName.startsWith("plotly") ? "px" : modName.startsWith("pandas") ? "pd" : modName;
        const pool = prefix === "st" ? COMMON_ST : prefix === "px" ? COMMON_PX : [];
        const guess = closest(attr, pool);
        return {
          title: `${prefix}.${attr} doesn't exist`,
          html: `<p>Check the spelling after the dot.${guess ? ` Did you mean <code>${prefix}.${guess}</code>?` : ""}</p>`,
        };
      }
      const dfAttr = detail.match(/'DataFrame' object has no attribute '([^']+)'/);
      if (dfAttr) {
        return {
          title: `The table has no "${dfAttr[1]}"`,
          html: `<p>If <code>${escapeHtml(dfAttr[1])}</code> is meant to be a column, use square brackets and quotes: <code>df["${escapeHtml(dfAttr[1])}"]</code>.${didYouMean(dfAttr[1], allColumns())}</p>${columnsHtml()}`,
        };
      }
      return { title: "Python couldn't find that attribute", html: `<p>Something after a dot doesn't exist. Check the spelling. Python said: <em>${escapeHtml(detail)}</em></p>` };
    }
    case "ValueError": {
      const col = detail.match(/Value of '(\w+)' is not the name of a column[\s\S]*?received:\s*(.+)/i);
      if (col) {
        const given = col[2].trim().replace(/^['"]|['"]$/g, "");
        const expected = detail.match(/Expected one of \[([^\]]*)\]/i);
        const names = expected ? [...expected[1].matchAll(/'([^']*)'/g)].map((m) => m[1]) : allColumns();
        const list = expected
          ? `<p>The columns in that table are: ${names.map((c) => `<code>${escapeHtml(c)}</code>`).join(", ")}. Names must match exactly, including capital letters.</p>`
          : columnsHtml();
        return {
          title: `"${given}" isn't a column`,
          html: `<p>Plotly was given <code>${escapeHtml(col[1])}="${escapeHtml(given)}"</code>, but the table you gave it has no column with that name.</p>${didYouMean(given, names)}${list}`,
        };
      }
      return { title: "A value wasn't what Python expected", html: `<p>Python said: <em>${escapeHtml(detail.split("\n")[0])}</em></p>` };
    }
    case "TypeError":
      return {
        title: "Something was given the wrong kind of value",
        html: `<p>A <code>TypeError</code> often means a missing or extra argument, or mixing text and numbers (for example <code>"Total: " + 5</code>). Python said: <em>${escapeHtml(detail.split("\n")[0])}</em></p>`,
      };
    case "StreamlitDuplicateElementId":
    case "StreamlitDuplicateElementKey":
      return {
        title: "Two widgets are identical",
        html: "<p>Two widgets of the same kind have exactly the same label and settings, so Streamlit can't tell them apart. Give one of them a different label, or give each one its own <code>key</code>, for example <code>key=\"rain\"</code> and <code>key=\"wind\"</code>.</p>",
      };
    case "StreamlitAPIException":
      return { title: "Streamlit didn't like one of its arguments", html: `<p>Streamlit said: <em>${escapeHtml(detail.split("\n")[0])}</em></p>` };
    default:
      return {
        title: "Your code stopped with an error",
        html: `<p>The last line of the error message says what went wrong: <em>${escapeHtml(message.split("\n")[0])}</em></p>`,
      };
  }
}

// ================================================================== boot ===

buildLayout();
editor.impl = makeTextarea(codes[activeBuffer]);
if (activeBuffer === "try") ui.codeTitle.textContent = "Try it yourself";
showView(state.view);
startPython({ autorun: true }); // start downloading Python straight away
upgradeToCodeMirror();

// Exposed for automated testing (see AGENTS.md).
window.__exercise = {
  steps: steps.map((s) => ({ title: s.title, start: s.start, solution: s.solution })),
  setCode: (c) => editor.setValue(c),
  getCode: () => editor.getValue(),
  run,
  restart: restartPython,
  get ready() { return py.ready; },
  get running() { return py.running; },
  error: () => ui.messages.querySelector('[data-kind="err"]')?.textContent || null,
  appText: () => ui.appHost.innerText,
  tryIt: tryIt ? { start: tryIt.start, solution: tryIt.solution, hints: tryIt.hints.map((h) => h.sections.map((x) => !!codeSection(x.step, x.comment))) } : null,
  showView: (v) => showView(v),
  TRY,
  log: eventLog,
  _controller: () => py.controller,
};
