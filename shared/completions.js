// Streamlit beginnings: the editor's autocomplete suggestions.
//
// A short, hand-picked list rather than everything in each library, so the
// suggestions stay readable for beginners. Each entry is
//   [name, signature, one-line description]
// Suggestions appear only after "st.", "pd.", "px.", a table name or a column,
// and column names are suggested inside quotes where a column is expected.

const ST = [
  ["title", "title(text)", "A big title at the top of the page"],
  ["header", "header(text)", "A section heading"],
  ["subheader", "subheader(text)", "A smaller heading"],
  ["write", "write(thing, ...)", "Show text, numbers, tables and more"],
  ["markdown", "markdown(text)", "Text with **bold**, *italics* and lists"],
  ["caption", "caption(text)", "Small grey text"],
  ["dataframe", "dataframe(df, hide_index=False)", "An interactive table"],
  ["table", "table(df)", "A plain, fixed table"],
  ["metric", "metric(label, value)", "One number in large type"],
  ["plotly_chart", "plotly_chart(fig)", "Show a Plotly chart"],
  ["line_chart", "line_chart(df, x=None, y=None)", "A quick built-in line chart"],
  ["bar_chart", "bar_chart(df, x=None, y=None)", "A quick built-in bar chart"],
  ["selectbox", "selectbox(label, options, index=0)", "A drop-down menu; returns the choice"],
  ["multiselect", "multiselect(label, options, default=None)", "Pick several; returns a list"],
  ["slider", "slider(label, min_value, max_value, value)", "Drag to pick a number"],
  ["checkbox", "checkbox(label, value=False)", "A tick box; returns True or False"],
  ["toggle", "toggle(label, value=False)", "An on/off switch; returns True or False"],
  ["radio", "radio(label, options, horizontal=False)", "Pick one option; returns the choice"],
  ["button", "button(label)", "A button; True on the run after a click"],
  ["text_input", "text_input(label, value=\"\")", "A box to type text into"],
  ["number_input", "number_input(label, value=0)", "A box to type a number into"],
  ["file_uploader", "file_uploader(label, type=None)", "Upload a file; None until one is chosen"],
  ["download_button", "download_button(label, data, file_name)", "A button that downloads data"],
  ["columns", "columns(number)", "Side-by-side columns: col1, col2 = st.columns(2)"],
  ["tabs", "tabs([names])", "Tabs: tab1, tab2 = st.tabs([\"A\", \"B\"])"],
  ["sidebar", "sidebar", "The sidebar: with st.sidebar:"],
  ["expander", "expander(label)", "A section that opens and closes: with st.expander(\"...\"):"],
  ["container", "container()", "A group of elements: with st.container():"],
  ["divider", "divider()", "A horizontal line"],
  ["info", "info(text)", "A blue message box"],
  ["success", "success(text)", "A green message box"],
  ["warning", "warning(text)", "A yellow message box"],
  ["error", "error(text)", "A red message box"],
  ["stop", "stop()", "Stop the script here"],
  ["image", "image(path_or_url)", "Show a picture"],
];

const PD = [
  ["read_csv", "read_csv(path)", "Read a CSV file into a DataFrame"],
  ["read_excel", "read_excel(path)", "Read an Excel file into a DataFrame"],
  ["DataFrame", "DataFrame(data)", "Make a table from a dictionary or list"],
  ["to_datetime", "to_datetime(column)", "Turn text into dates"],
  ["concat", "concat([df1, df2])", "Stack tables on top of each other"],
];

const DF = [
  ["head", "head(n=5)", "The first n rows"],
  ["tail", "tail(n=5)", "The last n rows"],
  ["describe", "describe()", "Summary statistics for number columns"],
  ["sort_values", "sort_values(column, ascending=True)", "Sort the rows by a column"],
  ["groupby", "groupby(column)", "Group rows, then .sum(), .mean() ..."],
  ["reset_index", "reset_index()", "Turn a groupby result back into a table"],
  ["shape", "shape", "(rows, columns)"],
  ["columns", "columns", "The column names; .tolist() makes a list"],
  ["isna", "isna()", "True where a cell is empty"],
  ["dropna", "dropna()", "Remove rows with empty cells"],
  ["select_dtypes", "select_dtypes(\"number\")", "Keep only some kinds of column"],
  ["iloc", "iloc[row]", "Pick a row by its position: iloc[0] is the first"],
  ["mean", "mean()", "The average of each column"],
  ["sum", "sum()", "The total of each column"],
  ["round", "round(decimals)", "Round the numbers"],
  ["to_csv", "to_csv(index=False)", "The table as CSV text"],
];

const SERIES = [
  ["mean", "mean()", "The average"],
  ["sum", "sum()", "The total"],
  ["max", "max()", "The biggest value"],
  ["min", "min()", "The smallest value"],
  ["median", "median()", "The middle value"],
  ["count", "count()", "How many values (not empty)"],
  ["unique", "unique()", "Each different value once"],
  ["value_counts", "value_counts()", "How many times each value appears"],
  ["isin", "isin(list)", "True where the value is in the list"],
  ["round", "round(decimals)", "Round the numbers"],
  ["tolist", "tolist()", "Turn into a Python list"],
  ["idxmax", "idxmax()", "The label of the biggest value"],
  ["idxmin", "idxmin()", "The label of the smallest value"],
  ["str", "str.contains(text)", "Text methods, e.g. .str.contains(\"Mega\")"],
];

const PX = [
  ["bar", "bar(df, x, y, color=None, title=None)", "A bar chart"],
  ["line", "line(df, x, y, color=None, title=None)", "A line chart"],
  ["scatter", "scatter(df, x, y, color=None, hover_name=None)", "One dot per row"],
  ["histogram", "histogram(df, x, nbins=None)", "How often values fall in each range"],
  ["box", "box(df, x, y)", "The spread of values in each group"],
  ["pie", "pie(df, names, values)", "Slices of a whole"],
  ["area", "area(df, x, y, color=None)", "A filled line chart"],
];

function toOptions(list, type) {
  return list.map(([label, detail, info]) => ({ label, detail, info, type }));
}

const OPTIONS = {
  st: toOptions(ST, "function"),
  pd: toOptions(PD, "function"),
  px: toOptions(PX, "function"),
  df: toOptions(DF, "method"),
  series: toOptions(SERIES, "method"),
  list: toOptions([["tolist", "tolist()", "Turn into a Python list"]], "method"),
  upload: toOptions([["name", "name", "The uploaded file's name, e.g. \"weather.csv\""]], "property"),
};

// Variables that hold a table: assigned from pd.read_*, pd.DataFrame, or from
// another table (df[...], df.groupby(...) etc.). Worked out from the code.
function tableNames(code) {
  const names = new Set(["df"]);
  const assigns = [...code.matchAll(/^[ \t]*([A-Za-z_]\w*)\s*=\s*(.+)$/gm)];
  let grew = true;
  while (grew) {
    grew = false;
    for (const [, name, rhs] of assigns) {
      if (names.has(name)) continue;
      const fromPandas = /^pd\.(read_\w+|DataFrame|concat)\(/.test(rhs);
      const fromTable = [...names].some((t) => new RegExp(`^${t}\\s*[.\\[]`).test(rhs));
      // A single column like df["x"] or df["x"].sum() is not a table.
      const isColumn = /^\w+\[\s*["'][^"']*["']\s*\]/.test(rhs) && !/\]\s*\]/.test(rhs);
      if ((fromPandas || fromTable) && !isColumn) {
        names.add(name);
        grew = true;
      }
    }
  }
  return names;
}

// True if the cursor is in a comment (a # outside any string on this line).
function inComment(lineBefore) {
  let quote = null;
  for (const ch of lineBefore) {
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === "#") {
      return true;
    }
  }
  return false;
}

// Places where a column name goes, ending just after the opening quote:
// df["   df[["   x="   y="   color="   hover_name="   groupby("   sort_values("
// (The [ must follow a name or bracket, so lists like st.tabs(["A"]) don't count.)
const COLUMN_CONTEXT = /(?:[\w\])]\[\s*\[?|\b(?:x|y|color|hover_name|text|names|values|by)\s*=\s*|\b(?:groupby|sort_values)\(\s*\[?)\s*(["'])([^"']*)$/;

/**
 * Make a CodeMirror completion source.
 * @param {() => string[]} getColumns column names known on this page
 */
export function makeCompletionSource(getColumns) {
  return (context) => {
    const line = context.state.doc.lineAt(context.pos);
    const before = line.text.slice(0, context.pos - line.from);
    if (inComment(before)) return null;

    // Column names inside quotes.
    const col = before.match(COLUMN_CONTEXT);
    if (col) {
      const columns = getColumns();
      if (!columns.length) return null;
      return {
        from: context.pos - col[2].length,
        options: columns.map((c) => ({ label: c, type: "property", detail: "column" })),
        validFor: /^[\w ]*$/,
      };
    }

    // Anything else in a string is left alone.
    const quotes = (before.match(/["']/g) || []).length;
    if (quotes % 2 === 1) return null;

    // A list of values or column names: offer .tolist().
    const listy = before.match(/\.(?:unique\(\s*\)|columns)\s*\.\s*(\w*)$/);
    if (listy) {
      return { from: context.pos - listy[1].length, options: OPTIONS.list, validFor: /^\w*$/ };
    }

    const member = before.match(/(\b[A-Za-z_]\w*|\])\s*\.\s*(\w*)$/);
    if (!member) return null;
    const [, owner, typed] = member;
    const from = context.pos - typed.length;
    const code = context.state.doc.toString();
    let options = null;
    if (owner === "st" || owner === "pd" || owner === "px") options = OPTIONS[owner];
    else if (new RegExp(`^[ \\t]*${owner}\\s*=\\s*st\\.file_uploader\\(`, "m").test(code)) options = OPTIONS.upload;
    else if (owner === "]") options = /\]\s*\]\s*\.\s*\w*$/.test(before) ? OPTIONS.df : OPTIONS.series;
    else if (tableNames(code).has(owner)) options = OPTIONS.df;
    if (!options) return null;
    return { from, options, validFor: /^\w*$/ };
  };
}
