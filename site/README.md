# blockprotocol.org website

The public-facing blockprotocol.org serves the following endpoints:

- `/partners` provides a signup form
- `/gallery` shows the catalog of available blocks
- `/api/blocks` returns a JSON response w/ a list of available blocks
- `/blocks/<organisation>/<blockname>` is the CDN base-URL of an individual block (e.g. `/blocks/@hash/code`)

## Local development

Retrieve the 1password document `blockprotocol/site/.env.local` from the 1password vault
`HASH.dev/ai` and place it at `/site/.env.local`.

Before serving any blocks, they need to be built. Blocks can be registered in the repo's `/registry`
with a build-config. The build-script `/site/scripts/build-blocks.sh` allows to build blocks
individually. It requires the commandline tools `curl`, `rsync` and `jq` to be installed.

```sh
# build one or more blocks
yarn build-block ./registry/@hash/paragraph.json
# build all blocks
yarn build-blocks
```

Once the blocks are built, simply `yarn dev [--cwd ./site] [--port 3001]` and head over to
`localhost:3001/gallery`.

## Vercel Deployment

If no build-config is provided to the build-script, it will pick up all build-configs changed by the
last commit. This is part of `yarn build` which is also used by the deployment platform Vercel.

Vercel preserves nextjs' cache `/site/.next/cache` between builds. The build script synchronizes its
results with that cache and rebuilds only what has changed to speed up builds.