import debug from 'debug'
import mime from 'mime'

const log = debug('create-update-bundle:assets')

export default async function assets(
  request: Bun.BunRequest<'/assets'>,
): Promise<Response> {
  log(request.headers.toJSON())

  const url = new URL(request.url)
  const params = url.searchParams.toJSON()
  const metadata = await import('../../../../dist/metadata.json')

  if (typeof params.asset !== 'string') {
    return new Response(undefined, { status: 400 })
  }

  const asset = Bun.file(`./dist/${params.asset}`)
  const assetMetadata = [
    ...metadata.fileMetadata.ios.assets,
    { path: metadata.fileMetadata.ios.bundle, ext: 'bundle' },
  ].find(({ path }) => params.asset === path)

  const contentType =
    typeof assetMetadata !== 'undefined'
      ? assetMetadata.ext === 'bundle'
        ? 'application/javascript'
        : mime.getType(assetMetadata.ext)
      : undefined

  const headers = new Headers({
    ...(contentType && { 'Content-Type': contentType }),
  })

  return new Response(asset, { headers, status: 200 })
}
