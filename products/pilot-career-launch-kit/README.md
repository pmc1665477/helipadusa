# Helicopter Pilot Career Launch Kit

A paid digital PDF sold on Gumroad (not on helipadusa.com itself) — 18-page guide for people
starting helicopter flight training, built from an earlier 9-page version plus a round of
additions made 2026-09-16.

## Regenerating the PDF

```
pip install reportlab
python3 build.py
```

Writes `/tmp/Helicopter_Pilot_Career_Launch_Kit_v2.pdf`. Edit `build.py` and re-run any time
content needs to change — it's plain Python + reportlab, no external assets required.

## Amazon affiliate links — RESOLVED 2026-09-17

The user already had a working Amazon Associates account (confirmed via a screenshot of
their live SiteStripe toolbar). Their tracking ID is **`helipadusa-20`** — set as the
`AMAZON_TAG` constant near `build_recommended_gear()` in `build.py`. All three Amazon links
in that section now carry `&tag=helipadusa-20` and were verified (by inspecting the PDF's
actual embedded `/URI` link targets, not just the displayed text) to point to the correct,
fully-tagged URL. Displayed link text is a short "Shop on Amazon →" / "Get it free →" label
rather than the raw URL, both to look cleaner and because the raw query string wrapped badly
across lines.

If the tag ever changes, just update `AMAZON_TAG` and re-run `python3 build.py` — don't
hand-edit the individual `link` values, they're built from that constant.
