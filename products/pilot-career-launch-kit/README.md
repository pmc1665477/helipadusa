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

## Known TODO

The "Recommended Gear & Study Materials" section (`build_recommended_gear()` in `build.py`)
currently uses **plain, non-monetized Amazon search links** as placeholders, because as of
2026-09-16 it was unconfirmed whether the user has an Amazon Associates account. Before this
earns any affiliate money:

1. Confirm the user has (or has created) an Amazon Associates account at
   affiliate-program.amazon.com.
2. Get their associate tag (looks like `sometag-20`).
3. Update the `link` values in `build_recommended_gear()` to real Amazon product links with
   `?tag=<their-tag>` appended (or generated via Amazon's SiteStripe tool, seen active in a
   screenshot from this same session — the user already has *some* Amazon affiliate
   relationship, via "Influencers & Associates" SiteStripe toolbar, so this may already be
   resolved — check before assuming a fresh signup is needed).
4. Re-run `python3 build.py` and re-upload the new PDF to the Gumroad listing.
