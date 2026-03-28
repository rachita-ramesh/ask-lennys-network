# Data Setup

This app requires expert content data to function. The data is **not included** in this repository because it is derived from Lenny Rachitsky's copyrighted newsletter and podcast content.

## How to generate the data

1. **Get the source content.** You need a local copy of Lenny's newsletter and podcast archive in the expected format: a directory with an `index.json` file listing all entries, plus individual markdown files for each podcast/newsletter.

   The archive is available to paid subscribers of [Lenny's Newsletter](https://www.lennysnewsletter.com).

2. **Place it adjacent to this project.** The build script expects the archive at `../lennys-newsletterpodcastdata-all/` relative to this project root.

3. **Run the indexing script:**

   ```bash
   npm run build-index
   ```

   This will generate:
   - `public/data/people.json` — Full expert directory (metadata for ~297 experts)
   - `public/data/people-meta.json` — Compact version used in Claude prompts
   - `public/data/chunks/` — Content chunks (~2000+ files) used for retrieval

4. **Start the app** as normal with `npm run dev`.

## Data format

If you want to adapt this to a different content source, the build script (`scripts/build-index.ts`) expects:

- An `index.json` with `podcasts[]` and `newsletters[]` arrays
- Each podcast entry has: `title`, `date`, `filename`, `guest`, `tags[]`
- Each newsletter entry has: `title`, `date`, `filename`, `subtitle`, `tags[]`
- Podcast markdown files contain transcripts with speaker turns formatted as: `**Name (HH:MM:SS):** text`
- Newsletter markdown files contain the full article text

You can modify `build-index.ts` to work with your own content format.
