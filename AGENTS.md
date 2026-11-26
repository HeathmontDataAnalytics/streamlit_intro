# AGENTS.md: conventions for Streamlit beginnings

Self-paced browser exercises that teach secondary students the basics of Streamlit:
reading CSV/Excel into pandas, plotting with Plotly Express, and widgets that drive
the app. Everything runs client-side with stlite (Streamlit on Pyodide) and is hosted
as static files on GitHub Pages. No server, no install, no accounts.

## Repo layout

```text
index.html                     landing page: one card per exercise, reads saved progress
exercises/NN-name.html         one page per exercise: content only (see below)
shared/engine.js               editor, stlite, run/hint/download/progress logic (ES module)
shared/style.css               all styles, light/dark tokens
shared/completions.js          the editor's autocomplete list and rules (see "Suggestions")
shared/vendor/codemirror.js    prebuilt CodeMirror 6 bundle (see "Vendored CodeMirror")
shared/vendor/codemirror.entry.js  the entry file that bundle was built from
data/                          datasets students read (CSV and XLSX, each < 1 MB)
```

There is no build step and no package manager. Every file is deployed as-is.

## Exercise page format

An exercise page holds only content. `shared/engine.js` reads it, removes it and
builds the three-pane workspace (steps | editor | app).

```html
<script type="application/json" id="exercise">
{ "id": "01-weather-explorer", "number": 1, "title": "Weather explorer",
  "filename": "01_weather_explorer.py",
  "datasets": [ { "path": "data/weather.csv", "url": "../data/weather.csv",
                  "columns": ["date", "city", ...] } ] }
</script>

<section id="intro"> ...story before step 1... </section>

<article class="step" data-title="Load the data">
  <div class="story">...</div>        <!-- context and new ideas -->
  <div class="task">...</div>         <!-- shown in a "Your task" box -->
  <div class="hint">                  <!-- two levels, see "Hints" below -->
    <div class="hint-recall">...</div>  <!-- behind "Show a hint" -->
    <div class="hint-blanks">...</div>  <!-- behind "Still stuck? Show the code with blanks" -->
  </div>
  <div class="expect">...</div>       <!-- "What you should see": concrete, checkable -->
  <script type="text/x-python" class="start">...</script>     <!-- optional -->
  <script type="text/x-python" class="solution">...</script>  <!-- required -->
</article>

<section id="try-it"> ...optional, see "Try it yourself" below... </section>
<section id="finish"> ...recap shown after the last step... </section>
<script type="module" src="../shared/engine.js"></script>
```

- `id` is also the localStorage key suffix (`streamlit-beginnings:<id>`). Don't
  rename it after release, or students lose saved work. Update the matching card's
  `data-exercise` and `data-steps` in `index.html` when adding or changing steps.
- `datasets[].path` is where the file appears in the virtual filesystem (what the
  student's code reads); `url` is where the page fetches it from. `columns` feed the
  KeyError and Plotly hints. Use `"datasets": []` for upload-only exercises.
- A step with no `start` begins from the previous step's `solution`. Step 1 needs a
  `start` (otherwise it begins with just `import streamlit as st`).
- Python goes in `<script type="text/x-python">` blocks, written flush-left, with
  no HTML escaping. In ordinary HTML (hints, stories), escape `<`, `>` and `&`.
- Numbers quoted in `expect` must come from the real data. Re-check them if a
  dataset changes.

### Try it yourself

Optional. A short, separate app after the last step that uses the same skills on
a new dataset. It needs both a config entry and a section:

```json
"tryIt": { "title": "Canteen sales", "filename": "01_try_canteen_sales.py",
           "datasets": [ { "path": "data/canteen.csv", "url": "../data/canteen.csv",
                           "columns": ["date", "day", ...] } ] }
```

```html
<section id="try-it">
  <div class="story">...</div>
  <div class="task"><ol>...3 or 4 tasks...</ol></div>
  <div class="try-hint" data-title="1. Load the data"
       data-sections="2:# Load the weather data from the CSV file|3:# How big is the table, and what are its columns?">
    <p>What to change for the new data.</p>
  </div>
  <div class="expect">...</div>
  <script type="text/x-python" class="start">...</script>
  <script type="text/x-python" class="solution">...</script>
</section>
```

- It gets its own view ("Try it" in the step list), its own saved code
  (`tryCode` in storage) and its own download. Moving between it and the steps
  swaps the editor's code; the main app's code is never overwritten.
- Each `try-hint` shows its note, then the code sections it names, taken from the
  earlier steps' solutions. `data-sections` is a `|`-separated list of
  `step:comment`, where the comment is a section's comment line exactly. A section
  runs to the next top-level comment. If a solution's comment changes, update the
  hints; the testing hook reports whether each section was found.
- Its datasets are mounted with the exercise's. Column hints and suggestions use
  the datasets the code actually reads.

### Hints

Hints never show the whole answer. They come in two levels:

1. **`hint-recall`:** a short "Remember:" list of the functions, parameter names and
   syntax the step needs, especially ones from earlier exercises. Name them; don't
   assemble them into the answer.
2. **`hint-blanks`:** the new code with the key parts replaced by `____` (four
   underscores): function names, column names, argument values and keywords such
   as `else`. Keep the section comments. Leave out lines the student already has,
   or show them unchanged for context. Put plain `<p>` notes between code blocks
   if needed. The engine adds the "Replace each `____`" instruction.

Every line in a blanks block must match a line of that step's solution, with each
`____` standing for any text. Check this after editing. If a student runs code
with a `____` left in, the engine gives a "There's still a blank" hint.

## Rules for student-facing code

- Plain, standard Streamlit that runs unchanged with `streamlit run`. Nothing
  stlite-specific, no `await`, no `micropip`.
- Only `streamlit`, `pandas`, `plotly.express` (and `openpyxl` via `pd.read_excel`).
- Avoid `time.sleep`, network requests, `st.cache_*`, and Streamlit features newer
  than the pinned stlite's Streamlit (1.65.0 in stlite 1.12.2).
- Avoid widgets that can return `None` unexpectedly (e.g. `st.segmented_control`);
  prefer `st.radio(..., horizontal=True)` for beginners.
- Use `.unique().tolist()` for widget options (numpy scalars display as
  `np.int64(1)`).
- Don't use the deprecated `use_container_width`; elements stretch by default.
- One concept per step; 5–6 steps per exercise; each step's solution builds on the
  last.
- **Comments:** one short `#` comment (under 60 characters) above each section of
  code, where a section is a paragraph separated by blank lines. Say what the
  section does or why, in plain words; don't restate the syntax or comment single
  lines. Once a comment appears, every later step keeps it. Apply this to starting
  code, solutions and the code in hints, but not to the small syntax examples in
  stories. The engine adds a standard "add a comment" line to every task box and a
  matching check to every "What you should see" box.

## Engine notes (shared/engine.js)

- **stlite pin:** `STLITE_VERSION` (currently `1.12.2`). Upgrade by changing the
  constant, then re-run every exercise's checks (see Testing). The mount uses
  `files` with absolute URLs for data, `requirements: ["pandas", "plotly",
  "openpyxl"]`, `streamlitConfig: {"server.runOnSave": true,
  "client.toolbarMode": "viewer"}`.
- **Run** writes `app.py` with `controller.writeFile`; `server.runOnSave` makes
  Streamlit rerun. A trailing `# run N` comment makes every Run a real change.
- **Run finished** is detected from the worker's messages: stlite forwards
  Streamlit's protobuf `ForwardMsg`s as `websocket:message` events, and top-level
  field 6 is `script_finished` (0 ok, 1 compile error, 2 early for rerun, 3
  fragment). DOM attributes are not reliable because React batches the
  running/not-running states. This relies on `controller._kernel._worker`, which
  stlite marks unstable: re-check it when upgrading.
- **Ready** means the welcome app's first run has finished (it also imports pandas
  and plotly so the student's first run is quick). Then the editor's code runs.
- **Error hints** read Streamlit's exception element
  (`[data-testid="stException"]`, `stExceptionMessage`, `stExceptionTraceRow`).
  Compile errors (SyntaxError, IndentationError) never reach the app: Streamlit
  shows a modal instead. The engine closes that modal, compiles the code with
  `controller.runPython` to get the details, and shows its own hint.
- **Stop / restart Python** unmounts (which terminates the worker) and mounts
  again without auto-running, so endless loops can't restart themselves.
- **Storage:** one JSON value per exercise, `{view, done, code, tryCode, updated}`, plus
  `streamlit-beginnings:settings` for page-wide settings (`{suggestions}`). Every
  access is in try/catch; the page works without storage.
- **Suggestions:** `shared/completions.js` holds a short, hand-picked list of
  Streamlit, pandas, DataFrame/column and Plotly Express functions, each with a
  signature and a one-line description. They appear only after `st.`, `pd.`,
  `px.`, a table variable (worked out from assignments like `= pd.read_csv(` or
  `= df[...]`) or a column (`df["x"].`). Column names from the page's
  `datasets[].columns` appear inside quotes where a column is expected (`df["`,
  `x="`, `groupby("` ...). Python's built-in suggestions are switched off. The top
  suggestion is pre-selected, as in VS Code: Enter or Tab inserts it, the arrow
  keys choose another and Esc closes the list. Students can turn suggestions off with the checkbox under the
  editor, and the choice applies to every exercise. Keep the list short: add a
  function only when an exercise uses it or a student is likely to want it.
- **Testing hook:** `window.__exercise` exposes `steps`, `setCode`, `getCode`,
  `run`, `ready`, `running`, `error()`, `appText()`, `log` and `_controller()`.

## Vendored CodeMirror

Separate CDN imports of CodeMirror 6 load two copies of `@codemirror/language`,
which breaks highlighting. So the editor comes from one prebuilt, minified bundle.
To rebuild it (needs Node; output is committed):

```sh
npm i codemirror@6.0.2 @codemirror/lang-python@6.2.1 @codemirror/view@6.43.15 \
      @codemirror/state@6.7.6 @codemirror/commands@6.11.1 @codemirror/language@6.13.1       @codemirror/autocomplete@6.20.4 esbuild
npx esbuild shared/vendor/codemirror.entry.js --bundle --format=esm --minify \
      --legal-comments=eof --outfile=shared/vendor/codemirror.js
```

Then put back the header comment listing the versions. Run `npm ls @codemirror/state`
first: there must be exactly one version. If the bundle fails to load, the
engine falls back to a plain textarea.

## Visual style

Matches the SQL mystery games on mrmatho.github.io: Outfit 600 headings, Public Sans
400/600 body, the monospace stack in `--font-mono`, and the light/dark tokens at
the top of `style.css`. Dark mode follows `prefers-color-scheme`. Keep everything
keyboard accessible (focus rings, `aria-current` on the step list, live regions
for status and errors).

## Testing

1. `python -m http.server 8000` in the repo root, then open
   `http://localhost:8000/`.
2. For each exercise: wait for "Python: ready", then for each step load the
   solution (`__exercise.setCode(__exercise.steps[i].solution); __exercise.run()`)
   and check there's no exception and the "What you should see" text is true.
   Exercise 4 needs a file uploaded after each step.
3. Check deliberate mistakes give the right hint: KeyError on a column,
   FileNotFoundError, NameError for `st`/`pd`/`px`, IndentationError,
   SyntaxError, misspelt import, `st.` typo, wrong Plotly column.
4. Download the `.py`, put it next to a `data/` folder and run
   `streamlit run <file>` with `pip install streamlit pandas plotly openpyxl`.
5. Check widths of 1440, 1024 and 390 px, light and dark mode, and the console.

## Known constraints

- First load is tens of MB (Pyodide, Streamlit, pandas, pyarrow, plotly).
- School web filters may block cdn.jsdelivr.net. If so, self-host the stlite
  build (and Pyodide, via the `pyodideUrl` mount option) inside the repo and
  point `STLITE_BASE` at it.
- Low-end Chromebooks and iPads have little memory: keep datasets small and run
  one app per page.
