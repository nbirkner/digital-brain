# shared/

This directory holds content shared with a partner, housemate, or collaborator — housing, finances, travel, and anything else that's joint.

## Option A: Git submodule (recommended for two-person setups)

```bash
# Add your shared repo as a submodule:
git submodule add https://github.com/yourname/your-shared-repo.git shared

# To push changes you make in shared/:
git push --recurse-submodules=on-demand

# To pull changes your partner made:
git submodule update --remote shared
git add shared && git commit -m "chore: sync shared content" && git push
```

## Option B: Just put files here directly

No submodule needed. Create folders and markdown files directly in `shared/`:

```
shared/
  housing/housing.md
  finances/finances.md
  travel/trips/my-trip.md
```

Files here appear in Life Admin in the site.

## Structure (matches the Life Admin sidebar)

```
shared/
  housing/      → /life/housing
  finances/     → /life/finances
  travel/       → /life/travel
  cars/         → /life/cars
  luci/         → /life/luci  (or rename to pets/, etc.)
  relationship/ → /self/relationship
```
