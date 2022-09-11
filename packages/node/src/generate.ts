import type { Config } from '@css-panda/types'
import glob from 'fast-glob'
import { ensureDir } from 'fs-extra'
import { extractAssets } from './extract-assets'
import { extractContent } from './extract-content'
import { initialize } from './initialize'
import { watch } from './watchers'

export async function generate(options: Config & { configPath?: string } = {}) {
  const ctx = await initialize(options)

  await ensureDir(ctx.paths.asset)

  async function buildOnce() {
    const globFiles = glob.sync(ctx.include, {
      cwd: ctx.cwd,
      ignore: ctx.exclude,
    })

    await Promise.all(
      globFiles.map(async (file) => {
        const css = await extractContent(ctx, file)
        await ctx.assets.write(file, css)
      }),
    )

    await extractAssets(ctx)
  }

  await buildOnce()

  if (ctx.watch) {
    await watch(ctx, {
      onConfigChange() {
        return generate({ ...options, clean: false })
      },
      onAssetChange() {
        return extractAssets(ctx)
      },
      async onContentChange(file) {
        const css = await extractContent(ctx, file)
        await ctx.assets.write(file, css)
      },
    })
  }
}