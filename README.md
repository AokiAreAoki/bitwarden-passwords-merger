# Simple BitWarden Passwords Merger

### To install dependencies:
```bash
bun install
```

### To build:
```bash
bun run build
```

### To run:
```bash
bun run .
```
or build and use an executable

### Usage:
```bash
bitwarden-passwords-merger <...filesToMerge> <outputFile>
```
### Example:
```bash
$ bitwarden-passwords-merger.exe ./bitwarden_*.json ./output.json
Merging:
- `bitwarden_*.json`; matched:
  - `bitwarden_export_20251028093700.json`
  - `bitwarden_export_20251028105846.json`
  - `bitwarden_export_20251028112804.json`
Output file: `output.json`
Merged 4 folders into 1 unique folders. (3 duplicates)
Merged 1540 items into 334 unique items. (1206 duplicates)
```

#### Note: export passwords as an unencrypted `.json`

###### This project was created using `bun init` in bun v1.0.26. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
