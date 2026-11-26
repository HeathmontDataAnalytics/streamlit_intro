// Streamlit beginnings: the "New in this step" cards and the Function reference.
//
// Each function or idea is explained once, here. A step lists the ids it
// introduces (see AGENTS.md), and the engine shows those cards in the step and
// everything introduced so far in the Function reference.
//
// Entry fields:
//   name     what the card is called (shown as code unless kind is an "idea")
//   kind     "Streamlit", "pandas", "Plotly Express", "Python idea" or "Streamlit idea"
//   at       [exercise, step] where it is first introduced
//   summary  one line: what it is for
//   body     HTML: what it does, how to use it, examples, watch out
//
// Examples use different data from the exercise, so they explain the idea
// without giving away the answer.

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** A code example: caption, code and (optionally) what it shows. */
const example = (caption, code, shows) =>
  `<div class="concept-example"><p class="concept-caption">${caption}</p><pre><code>${esc(code.trim())}</code></pre>${
    shows ? `<p class="concept-shows"><span>Shows:</span> ${shows}</p>` : ""
  }</div>`;

/** A table of arguments or parts: rows of [name, explanation]. */
const parts = (heading, rows) =>
  `<h4>${heading}</h4><table class="concept-parts"><tbody>${rows
    .map(([n, d]) => `<tr><th scope="row"><code>${esc(n)}</code></th><td>${d}</td></tr>`)
    .join("")}</tbody></table>`;

/** A small data table: header row and body rows. */
const mini = (caption, head, rows) =>
  `<div class="mini"><p class="mini-caption">${caption}</p><table class="mini-table"><thead><tr>${head.map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div>`;

const watch = (items) => `<h4>Watch out</h4><ul class="concept-watch">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;

const MATCHES = mini("<code>matches</code>", ["team", "goals"], [["Hawks", 3], ["Owls", 1], ["Hawks", 2], ["Ravens", 0], ["Owls", 2]]);

export const CONCEPTS = {
  // ------------------------------------------------------- exercise 1 ---
  "st.title": {
    name: "st.title()",
    kind: "Streamlit",
    at: [1, 1],
    summary: "A big heading at the top of the page: your app's name.",
    body: `
      <p>Shows its text as the largest heading on the page. Think of it as the name of your app, like the title on the cover of a book.</p>
      <p>Use it <strong>once</strong>, near the top of your script. For headings further down, use <code>st.header()</code> or the smaller <code>st.subheader()</code>.</p>
      ${parts("How to use it", [["st.title(text)", "<strong>text</strong> is the words to show, inside quotes."]])}
      ${example("A title for a rainfall app:", `st.title("Rainfall tracker")`, "<strong>Rainfall tracker</strong> as a big heading.")}
      ${watch([
        "Text needs quotes around it: <code>st.title(\"Rainfall tracker\")</code>, not <code>st.title(Rainfall tracker)</code>.",
        "Two titles on one page look odd. If you need another heading, use <code>st.header()</code>.",
      ])}`,
  },
  "st.write": {
    name: "st.write()",
    kind: "Streamlit",
    at: [1, 1],
    summary: "Adds almost anything to the page: text, numbers, lists or tables.",
    body: `
      <p>Streamlit's all-purpose command. Give it something and it works out how to show it: text appears as a paragraph, a number appears as a number, and a table appears as a table.</p>
      <p>You can give it <strong>several things at once</strong>, separated by commas. They're shown side by side on one line, which is handy for a label and a value.</p>
      ${parts("How to use it", [
        ["st.write(thing)", "Shows one thing."],
        ["st.write(thing1, thing2, ...)", "Shows several things on one line, with a space between them."],
      ])}
      ${example("One thing:", `st.write("Welcome to the rainfall tracker.")`, "the sentence as a paragraph.")}
      ${example("Several things: text, then a number, then more text:", `wettest_day = 38\nst.write("The wettest day had", wettest_day, "mm of rain.")`, "The wettest day had <code>38</code> mm of rain. (Numbers are shown in a small grey box.)")}
      <p>Text can use simple formatting: <code>**bold**</code> and <code>*italics*</code>.</p>
      ${watch([
        "Separate the things with commas. Joining text and a number with <code>+</code>, like <code>\"Total: \" + 38</code>, gives a <code>TypeError</code>.",
        "Each <code>st.write</code> starts a new line on the page, in the order the lines run in your script.",
      ])}`,
  },
  comments: {
    name: "Comments",
    kind: "Python idea",
    at: [1, 1],
    summary: "Notes for people reading your code. Python ignores them.",
    body: `
      <p>Everything from a <code>#</code> to the end of the line is a <strong>comment</strong>. Python skips it completely, so comments never change what your app does. They're for people: your teacher, a classmate, or you in a few weeks' time.</p>
      <p>In these exercises, put a short comment <strong>above each section</strong> of code (a group of lines that do one job together), saying what that section does.</p>
      ${example("A comment above a section:", `# Show the app's name and what it's for\nst.title("Rainfall tracker")\nst.write("Track the rain at our school.")`)}
      ${example("A comment can also go at the end of a line:", `wettest_day = 38  # millimetres`)}
      ${watch([
        "Say what the section is <em>for</em>, not what each word does. <code># Show the app's name</code> helps; <code># call st.title</code> doesn't.",
        "Putting <code>#</code> in front of a line of code switches it off. This is handy for testing, but remember to remove it.",
      ])}`,
  },
  groupby: {
    name: "df.groupby()",
    kind: "pandas",
    at: [1, 6],
    summary: "Splits the rows into groups, then works out one answer for each group.",
    body: `
      <p>Often you want the same calculation for every group in your data: total goals for each team, average temperature for each city. <code>groupby</code> does it in one line. It gathers the rows that share a value, then calculates one result per group.</p>
      ${parts("The three parts", [
        ['.groupby("team")', "Which column to group by. One group for each different value."],
        ['["goals"]', "Which column to do the calculation on."],
        [".sum()", "The calculation. Others: <code>.mean()</code> (average), <code>.max()</code>, <code>.min()</code>, <code>.count()</code> (how many rows)."],
      ])}
      <p>Read it from left to right: <em>group the rows by team, take the goals column, add it up for each group.</em></p>
      <div class="concept-example">
        <p class="concept-caption">Total goals for each team:</p>
        ${MATCHES}
        <pre><code>${esc(`totals = matches.groupby("team")["goals"].sum()`)}</code></pre>
        ${mini("<code>totals</code>", ["team", "goals"], [["Hawks", 5], ["Owls", 3], ["Ravens", 0]])}
      </div>
      ${example("The average instead of the total:", `matches.groupby("team")["goals"].mean()`, "Hawks 2.5, Owls 1.5, Ravens 0.0")}
      ${watch([
        "Column names go in quotes and must match exactly, including capital letters.",
        "Choose the calculation that answers your question: <code>.sum()</code> for a total, <code>.mean()</code> for an average.",
        "The group names become the row labels on the left, not an ordinary column. (Exercise 2 shows how to turn them back into a column.)",
      ])}`,
  },
  idxmax: {
    name: ".idxmax()",
    kind: "pandas",
    at: [1, 6],
    summary: "Gives the label of the biggest value, such as which team scored most.",
    body: `
      <p>After a <code>groupby</code>, each value has a label: the group's name. <code>.max()</code> tells you the biggest <em>value</em>; <code>.idxmax()</code> tells you <em>whose</em> it is. Its partner <code>.idxmin()</code> gives the label of the smallest value.</p>
      ${example("Which team scored the most goals?", `totals = matches.groupby("team")["goals"].sum()\nst.write("Top scorers:", totals.idxmax())`, "Top scorers: Hawks")}
      ${watch([
        "If two groups tie for the biggest value, <code>.idxmax()</code> gives only the first one.",
      ])}`,
  },

  // ------------------------------------------------------- exercise 2 ---
  reset_index: {
    name: ".reset_index()",
    kind: "pandas",
    at: [2, 2],
    summary: "Turns a groupby result back into an ordinary table with named columns.",
    body: `
      <p>A <code>groupby</code> result keeps its group names as row labels (pandas calls these the <strong>index</strong>), not as a column. Many tools, including Plotly, need every value in a named column. <code>.reset_index()</code> moves the labels back into a column.</p>
      <div class="concept-example">
        <p class="concept-caption">Before and after:</p>
        ${mini("<code>matches.groupby(\"team\")[\"goals\"].sum()</code>: team names are row labels", ["", "goals"], [["<strong>Hawks</strong>", 5], ["<strong>Owls</strong>", 3], ["<strong>Ravens</strong>", 0]])}
        <pre><code>${esc(`totals = matches.groupby("team")["goals"].sum().reset_index()`)}</code></pre>
        ${mini("<code>totals</code>: an ordinary table with two columns", ["team", "goals"], [["Hawks", 5], ["Owls", 3], ["Ravens", 0]])}
      </div>
      ${watch([
        "Put it at the very end of the groupby line, after the calculation: <code>...sum().reset_index()</code>.",
        "Without it, <code>px.bar(totals, x=\"team\", ...)</code> fails, because there's no column called <code>team</code>.",
      ])}`,
  },
  "px.bar": {
    name: "px.bar()",
    kind: "Plotly Express",
    at: [2, 2],
    summary: "Makes a bar chart from a table: one bar for each row.",
    body: `
      <p><strong>Plotly Express</strong> makes interactive charts in one line. Import it once at the top of your script with <code>import plotly.express as px</code>.</p>
      <p><code>px.bar</code> draws one bar for each row of a table. You tell it which column goes along the bottom (x) and which sets the bar heights (y). It gives back a <strong>figure</strong>, which you store in a variable (usually <code>fig</code>) and then show with <code>st.plotly_chart</code>.</p>
      ${parts("How to use it", [
        ["px.bar(table, x=..., y=...)", "<strong>table</strong> is the DataFrame to draw. It always comes first."],
        ['x="team"', "The column for the labels along the bottom: one bar for each."],
        ['y="goals"', "The column of numbers that sets each bar's height."],
      ])}
      ${example("A bar chart of goals per team (using <code>totals</code> from <code>.reset_index()</code>):", `fig = px.bar(totals, x="team", y="goals")\nst.plotly_chart(fig)`, "three bars: Hawks 5, Owls 3, Ravens 0.")}
      <p>In the next steps you'll add more options to <code>px.bar</code>, such as a title, colours and labels.</p>
      ${watch([
        "<code>x</code> and <code>y</code> must be column names in the table you give it, in quotes.",
        "Making <code>fig</code> doesn't show anything yet. You need <code>st.plotly_chart(fig)</code>.",
        "If the y column has several rows for the same x value, the bars stack up. Add up with <code>groupby</code> first.",
      ])}`,
  },
  "st.plotly_chart": {
    name: "st.plotly_chart()",
    kind: "Streamlit",
    at: [2, 2],
    summary: "Shows a Plotly chart on the page.",
    body: `
      <p>Puts a figure made with Plotly Express onto your Streamlit page. The chart is interactive: hover over it to see exact values, drag across it to zoom in, and double-click to zoom back out. The camera icon saves it as a picture.</p>
      ${parts("How to use it", [["st.plotly_chart(fig)", "<strong>fig</strong> is the figure from <code>px.bar</code>, <code>px.scatter</code> and so on."]])}
      ${example("Make a figure, then show it:", `fig = px.bar(totals, x="team", y="goals")\nst.plotly_chart(fig)`)}
      ${watch([
        "Each chart needs its own <code>st.plotly_chart</code>. If you make two figures, give them different names (<code>fig</code>, <code>fig2</code>) and show each one.",
      ])}`,
  },

  // ------------------------------------------------------- exercise 3 ---
  reruns: {
    name: "Reruns: how widgets work",
    kind: "Streamlit idea",
    at: [3, 1],
    summary: "Each time someone uses a widget, your whole script runs again, from the top.",
    body: `
      <p>This is the big idea behind every Streamlit app:</p>
      <ol class="concept-steps">
        <li>Streamlit runs your script from top to bottom and draws the page.</li>
        <li>Someone uses a widget: ticks a box, picks from a menu or drags a slider.</li>
        <li>Streamlit runs your <strong>whole script again</strong>, from the top.</li>
        <li>This time, the widget gives back the <strong>new</strong> value, so the lines after it can use it.</li>
      </ol>
      <p>So you write a widget like an ordinary variable: <code>shout = st.checkbox("Shout")</code>. On each run, <code>shout</code> holds whatever the box says right now.</p>
      ${example("Each tick or untick reruns the script, and a different line runs:", `shout = st.checkbox("Shout")\nif shout:\n    st.write("HELLO!")\nelse:\n    st.write("hello")`, "<em>hello</em>, or <em>HELLO!</em> while the box is ticked.")}
      ${watch([
        "Ordinary variables start fresh on every run. Only widgets remember what the user chose.",
        "Because everything reruns, keep the code quick: small data files and no endless loops.",
      ])}`,
  },
  if: {
    name: "if statements",
    kind: "Python idea",
    at: [3, 1],
    summary: "Run some lines only when a condition is True.",
    body: `
      <p>An <code>if</code> statement lets your app make a choice. The indented lines underneath it run only when its <strong>condition</strong> is <code>True</code>; otherwise Python skips them.</p>
      ${parts("The parts", [
        ["if", "The keyword that starts it."],
        ["condition", "Something that is <code>True</code> or <code>False</code>: a checkbox's value, or a comparison such as <code>rain &gt; 10</code> or <code>city == \"Perth\"</code>."],
        [":", "A colon ends the <code>if</code> line."],
        ["    lines", "The lines that belong to the <code>if</code> are indented by 4 spaces (press <kbd>Tab</kbd>)."],
        ["else:", "Optional. Lines indented under <code>else:</code> run when the condition is <code>False</code>."],
      ])}
      ${example("A comparison as the condition:", `rain = 12\nif rain > 10:\n    st.write("Take an umbrella!")\nst.write("Have a good day.")`, "both lines, because 12 is more than 10. The last line isn't indented, so it always runs.")}
      ${watch([
        "A missing colon or missing indentation gives a <code>SyntaxError</code> or <code>IndentationError</code>.",
        "To compare, use two equals signs: <code>==</code>. One equals sign (<code>=</code>) stores a value instead.",
        "A checkbox's value is already <code>True</code> or <code>False</code>, so write <code>if show_data:</code>, not <code>if show_data == True:</code>.",
      ])}`,
  },
  "st.checkbox": {
    name: "st.checkbox()",
    kind: "Streamlit",
    at: [3, 1],
    summary: "A tick box. Gives back True when it's ticked and False when it isn't.",
    body: `
      <p>Draws a tick box with a label. Like every widget, it gives back its current value each time the script runs: <code>True</code> if it's ticked, <code>False</code> if not. Store that value in a variable and use it in an <code>if</code>.</p>
      ${parts("How to use it", [
        ['st.checkbox("label")', "<strong>label</strong> is the text next to the box. The box starts unticked."],
        ["value=True", "Optional. Makes the box start ticked."],
      ])}
      ${example("Show extra detail only when it's wanted:", `show_details = st.checkbox("Show the details")\nif show_details:\n    st.write("Rain is measured in millimetres.")`)}
      ${example("A box that starts ticked:", `include_weekends = st.checkbox("Include weekends", value=True)`)}
      ${watch([
        "Store the result: <code>show_details = st.checkbox(...)</code>. On its own, <code>st.checkbox(...)</code> draws the box, but you can't use its value.",
        "Two checkboxes with exactly the same label and settings cause an error, because Streamlit can't tell them apart. Give them different labels, or give each one its own <code>key</code>: <code>st.checkbox(\"Show the details\", key=\"rain\")</code> and <code>st.checkbox(\"Show the details\", key=\"wind\")</code>.",
      ])}`,
  },
};

/** Headings for the Function reference. */
export const EXERCISE_NAMES = {
  1: "Weather explorer",
  2: "Carnival charts",
  3: "Pokémon explorer",
  4: "My data dashboard",
};

/** Ids in the order they are introduced: by exercise, then step, then listing order. */
export const CONCEPT_ORDER = Object.keys(CONCEPTS).sort((a, b) => {
  const [ea, sa] = CONCEPTS[a].at;
  const [eb, sb] = CONCEPTS[b].at;
  return ea - eb || sa - sb;
});
