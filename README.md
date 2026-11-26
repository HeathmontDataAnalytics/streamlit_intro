# Streamlit beginnings

Self-paced, in-browser exercises that teach secondary students the basics of
[Streamlit](https://streamlit.io): loading CSV and Excel data with pandas, charting
it with Plotly Express, and adding widgets that filter the data and drive the
charts. Python runs in the browser through [stlite](https://github.com/whitphx/stlite),
so there's nothing to install and no server.

| Exercise | Builds | Data |
| --- | --- | --- |
| 1. Weather explorer | A first app: read a CSV, explore, sort and filter | `data/weather.csv` (simulated) |
| 2. Carnival charts | Plotly bar, scatter and box charts, then tabs | `data/athletics.xlsx` (simulated) |
| 3. Pokémon explorer | Checkbox, selectbox, slider, multiselect, sidebar | `data/pokemon.csv` |
| 4. My data dashboard | A dashboard for any uploaded CSV or Excel file | upload your own |

Exercises 1 to 3 end with **Try it yourself**: a shorter, separate app that uses the
same skills on new data (canteen sales, a student survey and a music chart), with
hints that show the matching code from earlier steps.

Each exercise is a handful of longer steps, with a task, a hint and a description of
what the working app should look like. Students check their own work, can load the
starting code for any step, and can download their app as a `.py` file that runs
with `streamlit run`.

## Run it locally

```sh
python -m http.server 8000
```

Then open <http://localhost:8000/>. (Opening the HTML files directly from disk won't
work, because the data files are fetched over HTTP.)

## Deploy

Push to GitHub and turn on GitHub Pages for the branch root. There's no build step.

## Data

- `data/pokemon.csv`: [Pokemon Stats](https://www.kaggle.com/datasets/ulrikthygepedersen/pokemon-stats)
  by Ulrik Thyge Pedersen on Kaggle, licensed under
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Corrected here: one
  name typo, two misspelt types and three missing generations.
- `data/canteen.csv`, `data/survey.xlsx` and `data/music.csv` (Try it yourself):
  simulated; all names, songs and artists are made up.
- `data/weather.csv` and `data/athletics.xlsx`: simulated for these exercises. The
  weather follows each city's typical climate but isn't a real record, and all
  names in the athletics results are made up.

## For contributors

See [AGENTS.md](AGENTS.md) for the page format, the rules for student-facing code,
how the engine works and how to test.
