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

// Small sample tables used in the examples. (The automated check defines the
// same tables, so every example can be run.)
const MATCHES = mini("<code>matches</code>", ["team", "goals"], [["Hawks", 3], ["Owls", 1], ["Hawks", 2], ["Ravens", 0], ["Owls", 2]]);
const RAIN = mini("<code>rain</code>", ["day", "city", "rain_mm"], [["Mon", "Perth", 0], ["Mon", "Hobart", 12], ["Tue", "Perth", 4], ["Tue", "Hobart", 7]]);
const PLAYERS = mini("<code>players</code>", ["name", "age", "goals"], [["Ava", 12, 4], ["Ben", 14, 9], ["Cai", 13, 6], ["Dee", 15, 11]]);
const SCORES = mini("<code>scores</code>", ["team", "half", "goals"], [["Hawks", "1st", 2], ["Hawks", "2nd", 1], ["Owls", "1st", 0], ["Owls", "2nd", 3], ["Hawks", "1st", 1]]);

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

  // ================================================ exercise 1, steps 2-5 ===
  import: {
    name: "Importing libraries",
    kind: "Python idea",
    at: [1, 2],
    summary: "Load extra tools, such as Streamlit and pandas, so your code can use them.",
    body: `
      <p>Python on its own doesn't know how to make web pages or read data tables. Those abilities come from <strong>libraries</strong>: packages of code other people have written. An <code>import</code> line loads a library so your script can use it.</p>
      <p><code>as</code> gives the library a short nickname. Everyone uses the same nicknames, so code from the internet, from your teacher and from these exercises all looks alike.</p>
      ${parts("The three libraries in these exercises", [
        ["import streamlit as st", "Web pages, widgets and layout. Used as <code>st.</code>"],
        ["import pandas as pd", "Data tables (DataFrames). Used as <code>pd.</code>"],
        ["import plotly.express as px", "Charts. Used as <code>px.</code>"],
      ])}
      ${example("The top of a typical app:", `import streamlit as st\nimport pandas as pd`)}
      ${watch([
        "Put the imports at the very top of the script, before anything uses them. Using <code>pd</code> before <code>import pandas as pd</code> gives <code>NameError: name 'pd' is not defined</code>.",
        "The library names must be spelt exactly: <code>pandas</code>, not <code>panda</code>.",
        "On your own computer, a library must be installed first (<code>pip install ...</code>). On this site they're already installed.",
      ])}`,
  },
  variables: {
    name: "Variables",
    kind: "Python idea",
    at: [1, 2],
    summary: "A name that stores a value so you can use it later.",
    body: `
      <p>A <strong>variable</strong> is a name for a value. <code>=</code> stores the value on the right under the name on the left. After that, you can use the name anywhere you'd use the value.</p>
      ${parts("The parts", [
        ["name = value", "Store <strong>value</strong> under <strong>name</strong>. The value can be text, a number, a table or anything else."],
      ])}
      ${example("Store some values, then use them:", `city = "Hobart"\nwettest_day = 12\nst.write("The wettest day in", city, "had", wettest_day, "mm.")`, "The wettest day in Hobart had <code>12</code> mm.")}
      ${example("A whole table can be stored in a variable too:", `rain = pd.read_csv("data/rain.csv")`)}
      <p>Names can use letters, numbers and underscores (<code>_</code>), but no spaces, and can't start with a number. By convention a table is often called <code>df</code>, short for DataFrame.</p>
      ${watch([
        "Names are case-sensitive: <code>rain</code> and <code>Rain</code> are different variables.",
        "A variable must be created (on a line above) before you use it, or you get a <code>NameError</code>.",
        "Don't reuse the names <code>st</code>, <code>pd</code> or <code>px</code> for your own variables, or you'll lose the library.",
      ])}`,
  },
  "pd.read_csv": {
    name: "pd.read_csv()",
    kind: "pandas",
    at: [1, 2],
    summary: "Reads a CSV file into a DataFrame (a table you can work with).",
    body: `
      <p>A <strong>CSV</strong> (comma-separated values) file is a plain-text table: one row per line, with commas between the values. The first line holds the column names. <code>pd.read_csv</code> reads the file and gives back a DataFrame.</p>
      ${parts("How to use it", [["pd.read_csv(path)", "<strong>path</strong> is where the file is, in quotes, relative to your app's folder."]])}
      ${example("Read a rainfall file and show it:", `rain = pd.read_csv("data/rain.csv")\nst.dataframe(rain)`)}
      ${watch([
        "The path includes the folder: <code>\"data/rain.csv\"</code>, not just <code>\"rain.csv\"</code>. Otherwise you get <code>FileNotFoundError</code>.",
        "The path goes in quotes, and the spelling (including capital letters) must match the file's name exactly.",
        "Store the result in a variable, or the table is read and then thrown away.",
      ])}`,
  },
  dataframes: {
    name: "DataFrames",
    kind: "pandas idea",
    at: [1, 2],
    summary: "pandas' name for a table: named columns, with one row per record.",
    body: `
      <p>A <strong>DataFrame</strong> is a table of data, like one sheet of a spreadsheet. Each <strong>column</strong> has a name and holds one kind of information. Each <strong>row</strong> is one record: one day, one person, one match.</p>
      <div class="concept-example"><p class="concept-caption">A small DataFrame of rainfall readings:</p>${RAIN}</div>
      <p>Down the left, each row also has a label called the <strong>index</strong>. When you read a file it's just 0, 1, 2 and so on. Many pandas functions give back a new DataFrame, so you can keep working on the result.</p>
      ${watch([
        "Column names are text, so they go in quotes when you use them: <code>\"rain_mm\"</code>.",
      ])}`,
  },
  "st.subheader": {
    name: "st.subheader()",
    kind: "Streamlit",
    at: [1, 2],
    summary: "A smaller heading that starts a new section of the page.",
    body: `
      <p>Splits your page into sections. Streamlit has three sizes of heading:</p>
      ${parts("Headings, biggest first", [
        ["st.title(text)", "The app's name. Use once, at the top."],
        ["st.header(text)", "A main section."],
        ["st.subheader(text)", "A smaller section. Used for most sections in these exercises."],
      ])}
      ${example("Start a section about the data:", `st.subheader("This week's rain")\nst.dataframe(rain)`)}
      ${watch(["Headings are for labelling sections. For ordinary sentences, use <code>st.write()</code>."])}`,
  },
  "st.dataframe": {
    name: "st.dataframe()",
    kind: "Streamlit",
    at: [1, 2],
    summary: "Shows a DataFrame as an interactive table.",
    body: `
      <p>Shows a whole table that the reader can explore: scroll through it, click a column heading to sort, and use the toolbar that appears above it (on hover) to search, go full screen or download it.</p>
      ${parts("How to use it", [
        ["st.dataframe(df)", "<strong>df</strong> is the DataFrame to show."],
        ["hide_index=True", "Optional. Hides the row labels (0, 1, 2 …) down the left, for a tidier table."],
      ])}
      ${example("Show a table:", `st.dataframe(rain)`)}
      ${example("Without the row labels:", `st.dataframe(rain, hide_index=True)`)}
      ${watch([
        "Optional settings go after the table, separated by a comma.",
        "Large tables are fine: the reader scrolls inside the table, not the page.",
      ])}`,
  },
  "df.shape": {
    name: "df.shape",
    kind: "pandas",
    at: [1, 3],
    summary: "How many rows and columns a DataFrame has.",
    body: `
      <p>Gives two numbers in brackets: the number of <strong>rows</strong>, then the number of <strong>columns</strong>. It's usually the first thing to check about new data.</p>
      ${example("The size of the <code>rain</code> table:", `st.write(rain.shape)`, "(4, 3): 4 rows and 3 columns.")}
      <p>Because it holds two values, you can store them in two variables at once. The first name gets the rows, the second the columns:</p>
      ${example("Two variables from one line:", `rows, columns = rain.shape\nst.write("Readings:", rows)`, "Readings: <code>4</code>")}
      ${watch([
        "<code>shape</code> has no brackets after it: it's a value the table already knows, not something it has to work out.",
        "<code>len(df)</code> gives just the number of rows.",
      ])}`,
  },
  "df.columns": {
    name: "df.columns",
    kind: "pandas",
    at: [1, 3],
    summary: "The names of a DataFrame's columns.",
    body: `
      <p>Holds the column names. Add <code>.tolist()</code> to turn them into an ordinary Python list, which is easier to read and to use in widgets later.</p>
      ${example("List the columns of <code>rain</code>:", `st.write(rain.columns.tolist())`, "a list: <code>\"day\"</code>, <code>\"city\"</code>, <code>\"rain_mm\"</code>.")}
      ${watch([
        "<code>columns</code> has no brackets, but <code>tolist()</code> does: <code>df.columns.tolist()</code>.",
        "Check this list when you get a <code>KeyError</code>: it shows the exact spelling of every column.",
      ])}`,
  },
  lists: {
    name: "Lists",
    kind: "Python idea",
    at: [1, 3],
    summary: "Several values kept in order, inside square brackets.",
    body: `
      <p>A <strong>list</strong> holds several values in order. Write it with square brackets, with commas between the values.</p>
      ${example("Some lists:", `cities = ["Perth", "Hobart", "Darwin"]\nreadings = [0, 12, 4, 7]\nst.write(cities)`)}
      <p>You'll use lists for widget options (the choices in a drop-down menu), for tab names, and for picking several columns at once: <code>rain[["city", "rain_mm"]]</code>.</p>
      ${parts("Handy things to do with a list", [
        ["len(cities)", "How many items: 3."],
        ["cities[0]", "The first item: \"Perth\". Python counts from 0."],
        ["sorted(cities)", "A new list in order (see exercise 3)."],
      ])}
      ${watch([
        "Commas between items, and quotes around text items.",
        "<code>df[[\"a\", \"b\"]]</code> has two sets of brackets: the outer ones pick from the table, the inner ones make the list of columns.",
      ])}`,
  },
  "df.describe": {
    name: "df.describe()",
    kind: "pandas",
    at: [1, 3],
    summary: "Summary statistics for every number column in one table.",
    body: `
      <p>Works out the main statistics for each number column at once, and gives them back as a table. Text columns are left out.</p>
      ${parts("What each row means", [
        ["count", "How many values there are (empty cells aren't counted)."],
        ["mean", "The average."],
        ["std", "The standard deviation: how spread out the values are."],
        ["min / max", "The smallest and biggest values."],
        ["25% / 50% / 75%", "The quartiles. 50% is the median, the middle value."],
      ])}
      ${example("Summarise the rainfall:", `st.dataframe(rain.describe())`, "for <code>rain_mm</code>: count 4, mean 5.75, min 0, median (50%) 5.5, max 12.")}
      ${watch(["It needs brackets: <code>df.describe()</code>."])}`,
  },
  sort_values: {
    name: "df.sort_values()",
    kind: "pandas",
    at: [1, 4],
    summary: "Puts the rows in order of one column's values.",
    body: `
      <p>Gives back a new copy of the table with its rows in order of one column. Numbers sort by size, and text sorts alphabetically. The original table isn't changed, so store the result.</p>
      ${parts("How to use it", [
        ['df.sort_values("column")', "Smallest first (or A to Z)."],
        ["ascending=False", "Optional. Biggest first (or Z to A)."],
      ])}
      ${example("The wettest readings first:", `wettest = rain.sort_values("rain_mm", ascending=False)\nst.dataframe(wettest)`, "Hobart Mon (12), Hobart Tue (7), Perth Tue (4), Perth Mon (0).")}
      ${watch([
        "The column name goes in quotes.",
        "<code>ascending</code> is lower case, and <code>False</code> starts with a capital F.",
      ])}`,
  },
  head: {
    name: "df.head()",
    kind: "pandas",
    at: [1, 4],
    summary: "Keeps just the first few rows of a table.",
    body: `
      <p>Gives back the first rows of a table: 5 unless you say otherwise. Its partner <code>df.tail()</code> gives the last rows. After sorting, the first rows are the top results, so this is how you get a "top 10".</p>
      ${parts("How to use it", [["df.head(n)", "<strong>n</strong> is how many rows to keep. Leave it out for 5."]])}
      ${example("The first two rows:", `st.dataframe(rain.head(2))`, "the Perth Mon and Hobart Mon rows.")}
      ${watch(["<code>head</code> takes rows from the top of the table as it is now. To get the biggest values, sort first."])}`,
  },
  chaining: {
    name: "Chaining methods",
    kind: "pandas idea",
    at: [1, 4],
    summary: "Put several steps on one line, each working on the last one's result.",
    body: `
      <p>Many pandas methods give back a new table. So you can add another <code>.</code> and a method straight after, and it works on that new table. Read a chain from left to right, one step at a time.</p>
      ${example("Sort, then keep the top two, in one line:", `top_two = rain.sort_values("rain_mm", ascending=False).head(2)\nst.dataframe(top_two)`, "Hobart Mon (12) and Hobart Tue (7).")}
      <p>That line does the same as these two:</p>
      <pre><code>${esc(`sorted_rain = rain.sort_values("rain_mm", ascending=False)\ntop_two = sorted_rain.head(2)`)}</code></pre>
      ${watch([
        "Order matters. <code>.head(2).sort_values(...)</code> takes the first two rows <em>before</em> sorting, which gives a different answer.",
        "If a chain gets hard to read, split it over two lines with a variable in between.",
      ])}`,
  },
  "df[column]": {
    name: "Picking a column: df[\"name\"]",
    kind: "pandas idea",
    at: [1, 5],
    summary: "Square brackets and a column name give you just that column.",
    body: `
      <p>Put a column's name in square brackets after the table to get just that column. One column on its own is called a <strong>Series</strong>. You can then do calculations on it, such as <code>.sum()</code>.</p>
      ${example("The rain column on its own:", `st.write(rain["rain_mm"])`, "the four values: 0, 12, 4, 7.")}
      ${example("Several columns: give a list, so there are two sets of brackets:", `st.dataframe(rain[["city", "rain_mm"]])`, "a table with just those two columns.")}
      ${watch([
        "The name must match exactly, including capital letters. A misspelt name gives a <code>KeyError</code>.",
        "Square brackets, not round ones: <code>rain[\"rain_mm\"]</code>.",
      ])}`,
  },
  comparisons: {
    name: "Comparisons: == != > >= < <=",
    kind: "Python idea",
    at: [1, 5],
    summary: "Ask a question about two values. The answer is True or False.",
    body: `
      <p>A <strong>comparison</strong> checks two values and gives back <code>True</code> or <code>False</code>.</p>
      ${parts("The comparisons", [
        ["a == b", "Equal to."],
        ["a != b", "Not equal to."],
        ["a > b", "Greater than. <code>a &gt;= b</code> is greater than or equal to."],
        ["a < b", "Less than. <code>a &lt;= b</code> is less than or equal to."],
      ])}
      ${example("Comparing single values:", `st.write(12 > 5)\nst.write("Perth" == "Hobart")`, "True, then False.")}
      <p>Compare a whole column and you get one <code>True</code> or <code>False</code> for every row. That's what filtering uses.</p>
      ${example("Which readings were over 5 mm?", `st.write(rain["rain_mm"] > 5)`, "False, True, False, True: one answer for each row.")}
      ${watch([
        "Two equals signs to compare (<code>==</code>). One equals sign (<code>=</code>) stores a value in a variable.",
        "Text must match exactly: <code>\"Perth\" == \"perth\"</code> is <code>False</code>.",
      ])}`,
  },
  filtering: {
    name: "Filtering rows",
    kind: "pandas idea",
    at: [1, 5],
    summary: "Keep only the rows where a condition is True.",
    body: `
      <p>Put a comparison inside square brackets after the table, and you get a new table with only the rows where the comparison is <code>True</code>.</p>
      ${parts("How it reads", [
        ['rain[rain["city"] == "Hobart"]', "Keep the rows of <code>rain</code> where the city column equals \"Hobart\"."],
      ])}
      <div class="concept-example">
        <p class="concept-caption">Just Hobart's readings:</p>
        ${RAIN}
        <pre><code>${esc(`hobart = rain[rain["city"] == "Hobart"]`)}</code></pre>
        ${mini("<code>hobart</code>", ["day", "city", "rain_mm"], [["Mon", "Hobart", 12], ["Tue", "Hobart", 7]])}
      </div>
      ${example("Any comparison works, such as the wet days only:", `wet = rain[rain["rain_mm"] > 5]`)}
      ${watch([
        "The table's name appears twice: once outside the brackets and once inside.",
        "If nothing matches, you get an empty table, not an error. Check the spelling of text values.",
      ])}`,
  },
  "column-maths": {
    name: ".sum(), .mean(), .max(), .min()",
    kind: "pandas",
    at: [1, 5],
    summary: "Work out one number from a whole column.",
    body: `
      <p>Add one of these to a column to get a single answer for the whole column.</p>
      ${parts("The calculations", [
        [".sum()", "The total."],
        [".mean()", "The average (mean)."],
        [".max() / .min()", "The biggest / smallest value."],
        [".median()", "The middle value."],
        [".count()", "How many values (not counting empty cells)."],
      ])}
      ${example("Total and average rainfall:", `total = rain["rain_mm"].sum()\naverage = rain["rain_mm"].mean()\nst.write("Total:", total, "Average:", average)`, "Total: <code>23</code> Average: <code>5.75</code>")}
      ${watch([
        "Pick a number column first: <code>rain[\"rain_mm\"].sum()</code>. Adding up a text column doesn't make sense.",
        "They need brackets at the end: <code>.mean()</code>.",
      ])}`,
  },
  round: {
    name: "round()",
    kind: "Python",
    at: [1, 5],
    summary: "Rounds a number to a set number of decimal places.",
    body: `
      <p>Averages often have long decimals, such as 5.75 or 19.3972. <code>round</code> makes them readable.</p>
      ${parts("How to use it", [
        ["round(number)", "To the nearest whole number."],
        ["round(number, 1)", "To 1 decimal place (or 2, 3 …)."],
      ])}
      ${example("Rounding an average:", `average = rain["rain_mm"].mean()\nst.write(round(average, 1))`, "5.8")}
      ${watch(["The number of places goes after a comma, inside the same brackets: <code>round(average, 1)</code>."])}`,
  },
  "st.metric": {
    name: "st.metric()",
    kind: "Streamlit",
    at: [1, 5],
    summary: "Shows one important number in large type, with a label.",
    body: `
      <p>Draws a single number big and bold, with a small label above it, like the headline figures on a dashboard.</p>
      ${parts("How to use it", [
        ["st.metric(label, value)", "<strong>label</strong> is the text above; <strong>value</strong> is the number (or short text) to show."],
        ["delta=2", "Optional. Shows a change underneath, with a green up arrow (or red down arrow if negative)."],
      ])}
      ${example("Total rainfall as a metric:", `st.metric("Total rain (mm)", rain["rain_mm"].sum())`, "<strong>Total rain (mm)</strong> above a large 23.")}
      ${example("With a change since last week:", `st.metric("Total rain (mm)", 23, delta=5)`)}
      ${watch(["The label comes first, then the value."])}`,
  },

  // ================================================ exercise 2, steps 1-6 ===
  "pd.read_excel": {
    name: "pd.read_excel()",
    kind: "pandas",
    at: [2, 1],
    summary: "Reads an Excel spreadsheet (.xlsx) into a DataFrame.",
    body: `
      <p>Works just like <code>pd.read_csv</code>, but for Excel files. It reads the first sheet unless you choose another.</p>
      ${parts("How to use it", [
        ["pd.read_excel(path)", "<strong>path</strong> is the file's location, in quotes."],
        ['sheet_name="Results"', "Optional. Which sheet to read, by name."],
      ])}
      ${example("Read a results spreadsheet:", `results = pd.read_excel("data/results.xlsx")\nst.dataframe(results)`)}
      ${watch([
        "On your own computer, reading Excel needs the <code>openpyxl</code> package: <code>pip install openpyxl</code>. It's already installed here.",
        "The first row of the sheet should hold the column names.",
      ])}`,
  },
  len: {
    name: "len()",
    kind: "Python",
    at: [2, 1],
    summary: "Counts things: rows in a table, items in a list, letters in text.",
    body: `
      <p>Gives back how long something is.</p>
      ${parts("What it counts", [
        ["len(df)", "The number of rows in a DataFrame."],
        ["len(a_list)", "The number of items in a list."],
        ['len("Hobart")', "The number of characters in text: 6."],
      ])}
      ${example("How many readings?", `st.write("Readings:", len(rain))`, "Readings: <code>4</code>")}
      ${watch(["For a table, <code>len(df)</code> counts rows only. Use <code>df.shape</code> for rows and columns."])}`,
  },
  dictionaries: {
    name: "Dictionaries",
    kind: "Python idea",
    at: [2, 3],
    summary: "Pairs of keys and values, like words and their meanings.",
    body: `
      <p>A <strong>dictionary</strong> stores pairs: a <strong>key</strong> and its <strong>value</strong>. Look a value up by its key, like looking up a word in a dictionary.</p>
      ${parts("How to write one", [
        ['{"Hawks": "orange"}', "Curly brackets around the whole thing, and a colon between each key and its value."],
        ['{"a": 1, "b": 2}', "Commas between the pairs."],
      ])}
      ${example("Each team's colour, over several lines so it's easy to read:", `team_colours = {\n    "Hawks": "orange",\n    "Owls": "purple",\n    "Ravens": "black",\n}\nst.write(team_colours["Owls"])`, "purple")}
      <p>Plotly uses dictionaries for colours (<code>color_discrete_map=</code>) and labels (<code>labels=</code>).</p>
      ${watch([
        "Keys must match exactly. <code>team_colours[\"owls\"]</code> gives a <code>KeyError</code> because the key is \"Owls\".",
        "A comma after the last pair is allowed, and makes adding another pair easier.",
      ])}`,
  },
  "chart-options": {
    name: "Chart options: color, title, labels, text",
    kind: "Plotly Express",
    at: [2, 3],
    summary: "Extra keyword arguments that colour, title and label a chart.",
    body: `
      <p>Every Plotly Express chart takes extra <strong>keyword arguments</strong>: a name, <code>=</code>, and a value. Add as many as you need, in any order, after the table.</p>
      ${parts("The options used in these exercises", [
        ['color="team"', "Colour by a column: a different colour for each value, with a legend. (American spelling.)"],
        ["color_discrete_map=colours", "Choose the exact colour for each value, using a dictionary."],
        ['title="Goals by team"', "A title above the chart."],
        ['labels={"goals": "Goals"}', "Nicer names for columns on the axes and legend, using a dictionary."],
        ['text="goals"', "Write each value on its bar."],
        ['hover_name="team"', "What to show in bold when you hover over a bar or dot."],
      ])}
      ${example("A finished bar chart, one argument per line:", `fig = px.bar(\n    totals,\n    x="team",\n    y="goals",\n    color="team",\n    color_discrete_map={"Hawks": "orange", "Owls": "purple", "Ravens": "black"},\n    title="Goals by team",\n    labels={"team": "Team", "goals": "Goals"},\n    text="goals",\n)\nst.plotly_chart(fig)`)}
      ${watch([
        "It's <code>color</code>, not <code>colour</code>. Plotly uses American spelling.",
        "Put a comma after each argument. Splitting a long call over several lines is fine while it's inside the round brackets.",
        "Colour names such as <code>\"orange\"</code> are standard web colour names. <code>\"royalblue\"</code> and <code>\"seagreen\"</code> work too.",
      ])}`,
  },
  "groupby-two": {
    name: "Grouping by two columns",
    kind: "pandas idea",
    at: [2, 4],
    summary: "Give groupby a list of columns to get one row for each combination.",
    body: `
      <p>Give <code>groupby</code> a <strong>list</strong> of columns, and you get one result for every combination of their values: each team in each half, each house in each year level.</p>
      <div class="concept-example">
        <p class="concept-caption">Goals for each team in each half:</p>
        ${SCORES}
        <pre><code>${esc(`by_half = scores.groupby(["team", "half"])["goals"].sum().reset_index()`)}</code></pre>
        ${mini("<code>by_half</code>", ["team", "half", "goals"], [["Hawks", "1st", 3], ["Hawks", "2nd", 1], ["Owls", "1st", 0], ["Owls", "2nd", 3]])}
      </div>
      <p>A table like this suits a chart with <code>x</code> as one column and <code>color</code> as the other.</p>
      ${watch(["The columns go in a list, so there are square brackets inside the round ones: <code>groupby([\"team\", \"half\"])</code>."])}`,
  },
  barmode: {
    name: "barmode",
    kind: "Plotly Express",
    at: [2, 4],
    summary: "Choose whether coloured bars sit side by side or stack up.",
    body: `
      <p>When a bar chart is coloured by a column, each x value has several bars. <code>barmode</code> decides how they're arranged.</p>
      ${parts("The choices", [
        ['barmode="relative"', "The default: bars stack on top of each other, so the full height is the total."],
        ['barmode="group"', "Bars sit side by side, which makes it easier to compare them."],
      ])}
      ${example("Each team's goals in each half, side by side:", `fig = px.bar(by_half, x="team", y="goals", color="half", barmode="group")\nst.plotly_chart(fig)`)}
      ${watch(["<code>barmode</code> only changes anything when <code>color</code> gives each x value more than one bar."])}`,
  },
  "px.scatter": {
    name: "px.scatter()",
    kind: "Plotly Express",
    at: [2, 5],
    summary: "A scatter plot: one dot for each row, placed by two numbers.",
    body: `
      <p>Draws one dot for each row of a table. One column sets how far across the dot goes (x) and another sets how far up (y). Scatter plots show whether two things are related: do older players score more goals?</p>
      ${parts("How to use it", [
        ["px.scatter(table, x=..., y=...)", "The table, then the column for across and the column for up."],
        ['hover_name="name"', "Optional. Shows each dot's name when you hover over it."],
        ['color="team"', "Optional. Colours the dots by a column. It also takes the other chart options."],
      ])}
      <div class="concept-example">
        <p class="concept-caption">Age against goals:</p>
        ${PLAYERS}
        <pre><code>${esc(`fig = px.scatter(players, x="age", y="goals", hover_name="name")\nst.plotly_chart(fig)`)}</code></pre>
        <p class="concept-shows"><span>Shows:</span> four dots rising from left to right: the older players scored more.</p>
      </div>
      ${watch(["Each dot is a row, so filter the table first if you only want some rows."])}`,
  },
  "px.box": {
    name: "px.box()",
    kind: "Plotly Express",
    at: [2, 5],
    summary: "A box plot: the spread of the values in each group.",
    body: `
      <p>Summarises many values in one shape. For each group on the x axis it draws a box:</p>
      <ul>
        <li>The <strong>box</strong> covers the middle half of the values (the 25% to 75% quartiles).</li>
        <li>The <strong>line</strong> inside the box is the median.</li>
        <li>The <strong>whiskers</strong> reach out to the smallest and biggest values, apart from any unusual ones, which are drawn as dots.</li>
      </ul>
      ${parts("How to use it", [["px.box(table, x=..., y=...)", "<strong>x</strong> is the column to group by; <strong>y</strong> is the numbers to summarise."]])}
      ${example("The spread of goals for each team:", `fig = px.box(matches, x="team", y="goals")\nst.plotly_chart(fig)`)}
      ${watch(["Box plots need several values per group to be useful. With only one or two, use a scatter plot instead."])}`,
  },
  "st.tabs": {
    name: "st.tabs()",
    kind: "Streamlit",
    at: [2, 6],
    summary: "Splits part of the page into tabs, so readers see one section at a time.",
    body: `
      <p>Makes a row of tabs. Give it a list of tab names, and it gives back one tab for each name, in the same order. Store them in variables, then use <code>with</code> to put things inside each tab.</p>
      ${parts("How to use it", [["tab1, tab2 = st.tabs([\"Chart\", \"Data\"])", "A list of names in, the same number of tabs out."]])}
      ${example("A chart tab and a data tab:", `tab1, tab2 = st.tabs(["Chart", "Data"])\n\nwith tab1:\n    st.plotly_chart(px.bar(totals, x="team", y="goals"))\n\nwith tab2:\n    st.dataframe(totals)`)}
      ${watch(["You need as many variable names on the left as tab names in the list."])}`,
  },
  with: {
    name: "with blocks and indentation",
    kind: "Python idea",
    at: [2, 6],
    summary: "Indented lines under a with line go inside that tab, sidebar or column.",
    body: `
      <p>A <code>with</code> line ends in a colon, and the lines <strong>indented</strong> underneath it belong to it. In Streamlit, everything in a <code>with</code> block appears inside that part of the page: a tab, the sidebar or a column. The block ends at the first line that isn't indented.</p>
      ${example("Two lines in a tab, then one outside it:", `with tab1:\n    st.subheader("Goals")\n    st.dataframe(totals)\n\nst.write("This line is outside the tab.")`)}
      ${parts("Indentation rules", [
        ["4 spaces", "Each level of indentation is 4 spaces. Pressing <kbd>Tab</kbd> in the editor adds them."],
        [":", "The line before an indented block always ends with a colon."],
      ])}
      ${watch([
        "Missing indentation, or a mix of different amounts, gives an <code>IndentationError</code>.",
        "Indentation means something in Python. Lines that should be outside a block must start right at the left edge.",
      ])}`,
  },

  // ================================================ exercise 3, steps 2-6 ===
  "st.selectbox": {
    name: "st.selectbox()",
    kind: "Streamlit",
    at: [3, 2],
    summary: "A drop-down menu. Gives back the option the user picked.",
    body: `
      <p>Draws a drop-down menu of options. Each time the script runs, it gives back whichever option is chosen now.</p>
      ${parts("How to use it", [
        ['st.selectbox("label", options)', "<strong>label</strong> is the text above the menu; <strong>options</strong> is a list of choices."],
        ["index=1", "Optional. Which option it starts on, counting from 0. Without it, the first option is chosen."],
      ])}
      ${example("Choose a city, then use the choice:", `city = st.selectbox("Choose a city", ["Perth", "Hobart", "Darwin"])\nst.write("You chose", city)`)}
      ${example("Options taken from the data, starting on the second one:", `cities = sorted(rain["city"].unique().tolist())\ncity = st.selectbox("Choose a city", cities, index=1)`)}
      ${watch([
        "It gives back the option itself (such as \"Hobart\"), not its position.",
        "Use the variable without quotes when you filter: <code>rain[rain[\"city\"] == city]</code>.",
      ])}`,
  },
  unique: {
    name: ".unique()",
    kind: "pandas",
    at: [3, 2],
    summary: "Each different value in a column, once.",
    body: `
      <p>Gives back every different value in a column, with no repeats, in the order they first appear. Add <code>.tolist()</code> to get an ordinary Python list, which is what widgets want.</p>
      ${example("The cities in the <code>rain</code> table:", `cities = rain["city"].unique().tolist()\nst.write(cities)`, "<code>\"Perth\"</code>, <code>\"Hobart\"</code>: each city once, even though each appears twice.")}
      ${watch(["Use it on one column: <code>df[\"city\"].unique()</code>."])}`,
  },
  sorted: {
    name: "sorted()",
    kind: "Python",
    at: [3, 2],
    summary: "A new copy of a list, in order.",
    body: `
      <p>Gives back a new list with the same items in order: numbers smallest first, text alphabetically. Sorted options make a drop-down menu much easier to use.</p>
      ${parts("How to use it", [
        ["sorted(a_list)", "Smallest first, or A to Z."],
        ["sorted(a_list, reverse=True)", "Biggest first, or Z to A."],
      ])}
      ${example("Sort some city names:", `st.write(sorted(["Perth", "Hobart", "Darwin"]))`, "Darwin, Hobart, Perth")}
      ${watch(["Upper-case letters sort before lower-case ones, so keep the capitals consistent."])}`,
  },
  "st.slider": {
    name: "st.slider()",
    kind: "Streamlit",
    at: [3, 3],
    summary: "A slider to pick a number by dragging. Gives back the number.",
    body: `
      <p>Draws a slider between a smallest and a biggest value. Each time the script runs, it gives back the number it's set to now.</p>
      ${parts("How to use it, in this order", [
        ["label", "The text above the slider."],
        ["min_value", "The smallest number it can go to."],
        ["max_value", "The biggest number it can go to."],
        ["value", "The number it starts on."],
        ["step=5", "Optional. Moves in jumps of 5 instead of 1."],
      ])}
      ${example("Choose a minimum amount of rain, then filter:", `min_rain = st.slider("Minimum rain (mm)", 0, 20, 5)\nwet = rain[rain["rain_mm"] >= min_rain]\nst.dataframe(wet)`)}
      ${watch([
        "Keep the order: label, smallest, biggest, starting value.",
        "The starting value must be between the smallest and the biggest.",
      ])}`,
  },
  "st.multiselect": {
    name: "st.multiselect()",
    kind: "Streamlit",
    at: [3, 4],
    summary: "Pick several options. Gives back a list of the chosen ones.",
    body: `
      <p>Like a drop-down menu, but the user can choose several options. Each one shows as a tag with an × to remove it. It gives back a <strong>list</strong> of the chosen options.</p>
      ${parts("How to use it", [
        ['st.multiselect("label", options)', "The label and the list of choices. Nothing is chosen to start with."],
        ["default=options", "Optional. Which options start chosen. Give it the whole list to start with everything chosen."],
      ])}
      ${example("Choose cities, all chosen to start with:", `cities = sorted(rain["city"].unique().tolist())\nchosen = st.multiselect("Cities", cities, default=cities)\nst.write(chosen)`)}
      ${watch(["It gives back a list, even if only one option is chosen. Filter with <code>.isin()</code>, not <code>==</code>."])}`,
  },
  isin: {
    name: ".isin()",
    kind: "pandas",
    at: [3, 4],
    summary: "True for each row whose value is in a list. Use it to filter by several choices.",
    body: `
      <p>Checks each value in a column against a list, and gives <code>True</code> for every row whose value is in the list. Put it in square brackets to filter, just like a comparison.</p>
      ${example("Keep the rows for chosen cities:", `chosen = ["Hobart", "Darwin"]\nsome = rain[rain["city"].isin(chosen)]\nst.dataframe(some)`, "the two Hobart rows. (There are no Darwin rows in <code>rain</code>.)")}
      ${watch(["The list goes inside the round brackets: <code>.isin(chosen)</code>."])}`,
  },
  "and-or-not": {
    name: "and, or, not",
    kind: "Python idea",
    at: [3, 4],
    summary: "Combine or flip True/False values.",
    body: `
      <p>These words work with <code>True</code> and <code>False</code>.</p>
      ${parts("What they do", [
        ["a and b", "<code>True</code> only if <strong>both</strong> are true."],
        ["a or b", "<code>True</code> if <strong>either</strong> is true."],
        ["not a", "Flips it: <code>not True</code> is <code>False</code>."],
      ])}
      ${example("Run some lines only when a box is <em>not</em> ticked:", `include_perth = st.checkbox("Include Perth", value=True)\nif not include_perth:\n    rain = rain[rain["city"] != "Perth"]\nst.dataframe(rain)`)}
      ${example("Two conditions at once:", `rain_mm = 12\nwindy = True\nif rain_mm > 10 and windy:\n    st.write("Stormy!")`, "Stormy!")}
      ${watch(["Inside pandas square brackets these words don't work on whole columns. To combine filters, filter one step at a time, as in these exercises."])}`,
  },
  "f-strings": {
    name: "f-strings",
    kind: "Python idea",
    at: [3, 5],
    summary: "Text with variables dropped into it.",
    body: `
      <p>Put an <code>f</code> just before the opening quote, and anything inside curly brackets <code>{ }</code> is replaced by its value. It's the easiest way to build titles and messages that change.</p>
      ${example("A title that follows the chosen city:", `city = "Hobart"\ntotal = 19\nst.subheader(f"Rain in {city}: {total} mm")`, "Rain in Hobart: 19 mm")}
      ${watch([
        "The <code>f</code> goes outside the quotes: <code>f\"...\"</code>.",
        "Without the <code>f</code>, you'd see the curly brackets and the variable names, not the values.",
      ])}`,
  },
  "st.sidebar": {
    name: "st.sidebar",
    kind: "Streamlit",
    at: [3, 6],
    summary: "A panel down the left of the page, usually for the app's controls.",
    body: `
      <p>Anything you put in the sidebar appears in a panel on the left, so the main page is free for results. Readers can hide it with the arrow at its top.</p>
      ${parts("Two ways to use it", [
        ["with st.sidebar:", "Everything indented underneath goes in the sidebar."],
        ['st.sidebar.selectbox(...)', "Put one thing in the sidebar, using <code>st.sidebar.</code> instead of <code>st.</code>."],
      ])}
      ${example("Controls in the sidebar, results on the page:", `with st.sidebar:\n    st.header("Filters")\n    city = st.selectbox("City", ["Perth", "Hobart"])\n\nst.dataframe(rain[rain["city"] == city])`)}
      ${watch(["<code>st.sidebar</code> has no brackets when used with <code>with</code>."])}`,
  },
  "st.columns": {
    name: "st.columns()",
    kind: "Streamlit",
    at: [3, 6],
    summary: "Puts things side by side in columns.",
    body: `
      <p>Splits the page (or the current section) into columns, side by side. Give it the number of columns, and it gives back that many, which you store in variables.</p>
      ${parts("How to use it", [
        ["col1, col2 = st.columns(2)", "Two equal columns. Give a list such as <code>[2, 1]</code> for a wide one and a narrow one."],
        ['col1.metric(...)', "Put one thing in a column."],
        ["with col1:", "Put several indented lines in a column."],
      ])}
      ${example("Two metrics side by side:", `col1, col2 = st.columns(2)\ncol1.metric("Total rain (mm)", rain["rain_mm"].sum())\ncol2.metric("Readings", len(rain))`)}
      ${watch([
        "You need as many variable names on the left as the number of columns.",
        "Columns are narrow on a phone, where Streamlit stacks them on top of each other.",
      ])}`,
  },
  "message-boxes": {
    name: "st.info(), st.success(), st.warning(), st.error()",
    kind: "Streamlit",
    at: [3, 6],
    summary: "Coloured message boxes for tips, good news, warnings and problems.",
    body: `
      <p>Each shows its text in a coloured box, so important messages stand out.</p>
      ${parts("The four boxes", [
        ["st.info(text)", "Blue: a tip or instructions."],
        ["st.success(text)", "Green: something went well."],
        ["st.warning(text)", "Yellow: be careful, or nothing to show."],
        ["st.error(text)", "Red: something is wrong."],
      ])}
      ${example("A warning when nothing matches:", `wet = rain[rain["rain_mm"] > 50]\nif len(wet) == 0:\n    st.warning("No readings over 50 mm.")`)}
      ${watch(["These show messages for the reader. Python's own errors appear in the app by themselves."])}`,
  },
  "st.stop": {
    name: "st.stop()",
    kind: "Streamlit",
    at: [3, 6],
    summary: "Stops the script at this line, so nothing below it runs.",
    body: `
      <p>Ends this run of the script straight away. Everything shown so far stays on the page; nothing after <code>st.stop()</code> runs. Use it inside an <code>if</code> to stop when there's nothing sensible to show.</p>
      ${example("Stop with a message if no rows match:", `wet = rain[rain["rain_mm"] > 50]\nif len(wet) == 0:\n    st.warning("No readings over 50 mm.")\n    st.stop()\n\nst.dataframe(wet)`, "only the warning, because no reading is over 50 mm.")}
      ${watch(["Put the message <em>before</em> <code>st.stop()</code>, or it will never show."])}`,
  },
  iloc: {
    name: ".iloc[]",
    kind: "pandas",
    at: [3, 6],
    summary: "Picks a row by its position: 0 for the first row.",
    body: `
      <p>Gets one row by its position in the table. Positions count from 0, so <code>.iloc[0]</code> is the first row and <code>.iloc[-1]</code> is the last. Then take a value from the row with its column name.</p>
      ${example("The wettest reading's city:", `wettest = rain.sort_values("rain_mm", ascending=False).iloc[0]\nst.write("Wettest:", wettest["city"], wettest["rain_mm"], "mm")`, "Wettest: Hobart <code>12</code> mm")}
      ${watch([
        "It uses square brackets, not round ones: <code>.iloc[0]</code>.",
        "On an empty table there's no row 0, so you get an error. Check the table isn't empty first.",
      ])}`,
  },

  // ================================================ exercise 4, steps 1-4 ===
  "st.file_uploader": {
    name: "st.file_uploader()",
    kind: "Streamlit",
    at: [4, 1],
    summary: "An upload box. Gives back the file, or None until one is chosen.",
    body: `
      <p>Draws a box where the reader can drag in a file or browse for one. Until they do, it gives back <code>None</code>. After that, it gives back the file, which pandas can read directly.</p>
      ${parts("How to use it", [
        ['st.file_uploader("label")', "The text above the box."],
        ['type=["csv", "xlsx"]', "Optional. A list of the file endings to allow."],
        ["uploaded.name", "The file's name, such as \"rain.csv\"."],
      ])}
      ${example("Upload a CSV and show it:", `uploaded = st.file_uploader("Choose a CSV file", type=["csv"])\nif uploaded is not None:\n    st.dataframe(pd.read_csv(uploaded))`)}
      ${watch([
        "Always check for <code>None</code> before using the file.",
        "Changing the uploader's label or settings creates a new uploader, so you'll need to upload the file again.",
      ])}`,
  },
  none: {
    name: "None and is None",
    kind: "Python idea",
    at: [4, 1],
    summary: "Python's value for \"nothing here\", and how to check for it.",
    body: `
      <p><code>None</code> means "no value". A file uploader gives back <code>None</code> before a file is chosen, for example. Check for it with <code>is None</code>, or its opposite <code>is not None</code>.</p>
      ${example("Do something only when there is a value:", `uploaded = st.file_uploader("Choose a file")\nif uploaded is None:\n    st.info("Upload a file to start.")\nelse:\n    st.write("Thanks for", uploaded.name)`)}
      <p>You can also store <code>None</code> yourself to mean "not set". Plotly treats <code>color=None</code> as no colour.</p>
      ${watch(["<code>None</code> has a capital N and no quotes. <code>\"None\"</code> in quotes is just text."])}`,
  },
  endswith: {
    name: ".endswith()",
    kind: "Python",
    at: [4, 2],
    summary: "True if some text ends with the letters you give it.",
    body: `
      <p>A text method: checks the end of the text and gives back <code>True</code> or <code>False</code>. Useful for checking a file's type from its name. Its partner <code>.startswith()</code> checks the beginning.</p>
      ${example("Is it an Excel file?", `name = "results.xlsx"\nst.write(name.endswith(".xlsx"))\nst.write(name.endswith(".csv"))`, "True, then False.")}
      ${watch(["It's case-sensitive: <code>\"RESULTS.XLSX\".endswith(\".xlsx\")</code> is <code>False</code>. Add <code>.lower()</code> first to be safe."])}`,
  },
  isna: {
    name: ".isna()",
    kind: "pandas",
    at: [4, 2],
    summary: "Finds empty cells (missing values).",
    body: `
      <p>Real data often has gaps. <code>df.isna()</code> gives back a table of <code>True</code> (empty) and <code>False</code> (filled). Add it up to count the gaps: <code>True</code> counts as 1.</p>
      ${parts("Counting missing values", [
        ["df.isna().sum()", "The number of empty cells in each column."],
        ["df.isna().sum().sum()", "The total for the whole table: add up the column totals."],
      ])}
      ${example("Empty cells in the <code>rain</code> table:", `st.write(rain.isna().sum().sum())`, "0: every cell is filled.")}
      ${watch([
        "One <code>.sum()</code> gives a total for each column; the second adds those totals up. With only one, you get a list of numbers, not a single number.",
        "A cell with a space or a dash in it isn't empty, so it isn't counted.",
      ])}`,
  },
  select_dtypes: {
    name: "df.select_dtypes()",
    kind: "pandas",
    at: [4, 3],
    summary: "Keeps only the columns of one kind, such as number columns.",
    body: `
      <p>Every column has a data type: numbers, text, dates or True/False values. <code>select_dtypes</code> gives back a table with only the columns of the kind you ask for.</p>
      ${parts("How to use it", [["df.select_dtypes(\"number\")", "Only the number columns. Add <code>.columns.tolist()</code> to get their names."]])}
      ${example("The number columns in <code>rain</code>:", `number_columns = rain.select_dtypes("number").columns.tolist()\nst.write(number_columns)`, "just <code>\"rain_mm\"</code>.")}
      ${watch(["A file might have no number columns at all, so check the list isn't empty before using it."])}`,
  },
  "st.radio": {
    name: "st.radio()",
    kind: "Streamlit",
    at: [4, 3],
    summary: "A set of buttons to pick one option. Gives back the choice.",
    body: `
      <p>Shows every option at once, with a round button beside each, and the reader picks one. It's good for a few options; for long lists, use a selectbox.</p>
      ${parts("How to use it", [
        ['st.radio("label", options)', "The label and a list of options. The first one starts chosen."],
        ["horizontal=True", "Optional. Puts the options in a row instead of a column."],
      ])}
      ${example("Choose a chart type:", `chart = st.radio("Chart type", ["Bar", "Line"], horizontal=True)\nst.write("You chose", chart)`)}
      ${watch(["Like a selectbox, it gives back the option itself, as text."])}`,
  },
  elif: {
    name: "elif",
    kind: "Python idea",
    at: [4, 3],
    summary: "Short for \"else if\": choose between more than two options.",
    body: `
      <p>An <code>if</code> can have any number of <code>elif</code> parts, then an optional <code>else</code>. Python checks them from the top and runs the <strong>first</strong> one that's true, then skips the rest.</p>
      ${example("Three choices:", `chart = st.radio("Chart type", ["Bar", "Line", "Scatter"])\nif chart == "Bar":\n    fig = px.bar(totals, x="team", y="goals")\nelif chart == "Line":\n    fig = px.line(totals, x="team", y="goals")\nelse:\n    fig = px.scatter(totals, x="team", y="goals")\nst.plotly_chart(fig)`)}
      ${watch([
        "Every <code>if</code>, <code>elif</code> and <code>else</code> line ends with a colon, and they all line up at the same indentation.",
        "<code>else</code> has no condition. It catches everything the others didn't.",
      ])}`,
  },
  "px.line": {
    name: "px.line()",
    kind: "Plotly Express",
    at: [4, 3],
    summary: "A line chart: values joined up in order, often over time.",
    body: `
      <p>Draws a line joining the values in order along the x axis. Line charts suit things that change over time, such as temperature through the year.</p>
      ${parts("How to use it", [
        ["px.line(table, x=..., y=...)", "The table, the column along the bottom (often dates) and the column of values."],
        ['color="city"', "Optional. One line for each value in a column, each in its own colour."],
      ])}
      ${example("One line for each city:", `fig = px.line(rain, x="day", y="rain_mm", color="city")\nst.plotly_chart(fig)`)}
      ${watch(["If the table mixes several groups without <code>color</code>, the line zigzags between them. Colour by the group, or filter to one group first."])}`,
  },
  "list-joining": {
    name: "Joining lists with +",
    kind: "Python idea",
    at: [4, 4],
    summary: "Add two lists together to make one longer list.",
    body: `
      <p><code>+</code> joins two lists into a new list: the items of the first, then the items of the second. It's handy for adding an extra choice, such as "(none)", to the front of a list of options.</p>
      ${example("Put an extra option first:", `options = ["(none)"] + rain.columns.tolist()\nst.write(options)`, "<code>\"(none)\"</code>, <code>\"day\"</code>, <code>\"city\"</code>, <code>\"rain_mm\"</code>.")}
      ${watch(["Both sides must be lists. To add one item, put it in its own list: <code>[\"(none)\"]</code>."])}`,
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
