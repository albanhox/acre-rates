# acre-rates

Public national-average mortgage rates for the acremortgage.com homepage rates strip.

A GitHub Action runs `fetch-rates.js` every morning (and again Thursday afternoon, after Freddie Mac
publishes its weekly survey) and commits `rates.json`. The website fetches:

```
https://raw.githubusercontent.com/albanhox/acre-rates/main/rates.json
```

Data comes from FRED (Federal Reserve Bank of St. Louis), no API key required:

| Key | Series | What it is | Cadence |
|---|---|---|---|
| `fixed30` | MORTGAGE30US | Freddie Mac PMMS 30-year fixed | weekly, Thursdays |
| `fixed15` | MORTGAGE15US | Freddie Mac PMMS 15-year fixed | weekly, Thursdays |
| `treasury10` | DGS10 | 10-year Treasury yield | daily |

These are national averages, labeled as such on the site, not Acre Mortgage's pricing. To switch to
Acre's own rates later, replace `fetch-rates.js` with a call to the pricing engine and keep the same
`rates.json` shape; the website needs no change.

Run manually: **Actions > Update rates > Run workflow**, or `node fetch-rates.js` locally.
