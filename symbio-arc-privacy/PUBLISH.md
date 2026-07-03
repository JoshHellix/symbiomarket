# Publish as standalone GitHub repo

This folder is designed to be pushed to **`JoshHellix/symbio-arc-privacy`** (or your org).

## Steps

```powershell
cd symbio-arc-privacy
git init
git add .
git commit -m "Initial release: Arc confidential settlement kit for builders"
git remote add origin https://github.com/JoshHellix/symbio-arc-privacy.git
git push -u origin main
```

## Then

1. Fill **[Arc Open Source Showcase](https://forms.gle/LDCYyqT8ayp8Tp3Y6)**
2. Link from SymbioMarket root README:
   `Companion repo: symbio-arc-privacy — privacy kit for Arc builders`
3. Mention in Lepton video (20s): fork for confidential agent spend

## Keep in sync

When you change `fhe-contracts/` in SymbioMarket, copy updates here:

```powershell
Copy-Item ..\fhe-contracts\contracts\*.sol .\contracts\
# Merge script changes into symbio-arc-privacy/scripts/
```
