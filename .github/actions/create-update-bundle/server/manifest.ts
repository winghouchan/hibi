import debug from 'debug'
import mime from 'mime'

const log = debug('create-update-bundle:manifest')

type Manifest = {
  [key: string]: any
  id: string
  createdAt: string
  runtimeVersion: string
  launchAsset: Asset
  assets: Asset[]
  metadata?: { [key: string]: string }
  extra?: { [key: string]: any }
}

type Asset = {
  hash?: string
  key: string
  contentType: string
  fileExtension?: string
  url: string
}

if (typeof process.env.UPDATES_URL === 'undefined') {
  throw new Error('UPDATES_URL environment variable needs to be set')
}

const updatesUrl = new URL(process.env.UPDATES_URL)

async function getAssetMetadata(
  path: string,
  extension: string,
): Promise<Asset> {
  const sha256 = new Bun.CryptoHasher('sha256')
  const md5 = new Bun.CryptoHasher('md5')
  const file = await Bun.file(`./dist/${path}`).arrayBuffer()

  return {
    hash: sha256
      .update(file)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, ''),
    key: md5.update(file).digest('hex'),
    contentType:
      extension === 'bundle'
        ? 'application/javascript'
        : `${mime.getType(extension)}`,
    fileExtension: `.${extension}`,
    url: `http://${updatesUrl.host}/assets?asset=${encodeURIComponent(path)}`,
  }
}

/**
 * Returns the update manifest
 *
 * ⚠️ This is not a fully compliant with the Expo Updates spec. A list of
 * non-exhaustive examples:
 *
 * - The latest bundle will be returned regardless of constraints, such as
 *   the runtime version sent by the client.
 * - Code signing data is not returned if requested by the client.
 * - Multipart responses are not returned if accepted by the client.
 *
 * This is acceptable because the endpoint is only designed to create a
 * bundle for loading in end-to-end tests.
 *
 * @see {@link https://docs.expo.dev/eas-update/how-it-works/#practical-overview}
 * @see {@link https://docs.expo.dev/technical-specs/expo-updates-1/#manifest-body}
 */
export default async function manifest(
  request: Bun.BunRequest<'/manifest'>,
): Promise<Response> {
  log(request.headers.toJSON())

  const metadata = await import('../../../../dist/metadata.json')
  const acceptedResponseMediaTypes = request.headers.get('accept')?.split(',')
  const platform = request.headers.get('expo-platform')
  const runtimeVersion = request.headers.get('expo-runtime-version')

  if (
    !acceptedResponseMediaTypes?.some(
      (accepted) =>
        accepted === 'application/json' || accepted === 'application/expo+json',
    )
  ) {
    return new Response(
      `"accept: ${acceptedResponseMediaTypes?.join(',')}" header not acceptable. Expected "application/json" or "application/expo+json".`,
      { status: 406 },
    )
  }

  if (platform !== 'android' && platform !== 'ios') {
    return new Response(
      `"expo-platform: ${platform}" header invalid. Expected "android" or "ios".`,
      { status: 400 },
    )
  }

  if (typeof runtimeVersion !== 'string') {
    return new Response(`Expected "expo-runtime-version" header.`, {
      status: 400,
    })
  }

  const manifest = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    runtimeVersion,
    launchAsset: await getAssetMetadata(
      metadata.fileMetadata[platform].bundle,
      'bundle',
    ),
    assets: await Promise.all(
      metadata.fileMetadata[platform].assets.map((asset) =>
        getAssetMetadata(asset.path, asset.ext),
      ),
    ),

    /**
     * This property is not part of the type for a manifest, however, it is
     * returned because the app raises the following JavaScript runtime error
     * ([source][1]):
     *
     * > Error: Cannot make a deep link into a standalone app with no custom
     * > scheme defined
     *
     * This error is thrown because because Expo Linking attempts to read the
     * scheme(s) from [`Constants.expoConfig`][2]. `expoConfig` is a getter,
     * [defined here][3], which returns this manifest when the app is opened
     * after an update ([this condition][4]).
     *
     * [1]: https://github.com/expo/expo/blob/21a4e63151f8bf0b62bf00d78a196fe8ea56c09a/packages/expo-linking/src/Schemes.ts#L117-L119
     * [2]: https://github.com/expo/expo/blob/21a4e63151f8bf0b62bf00d78a196fe8ea56c09a/packages/expo-linking/src/Schemes.ts#L72
     * [3]: https://github.com/expo/expo/blob/798dea09266bb888ee72f814b67c9534101d622d/packages/expo-constants/src/Constants.ts#L147-L176
     * [4]: https://github.com/expo/expo/blob/798dea09266bb888ee72f814b67c9534101d622d/packages/expo-constants/src/Constants.ts#L169-L171
     */
    scheme: 'hibi',
  } satisfies Manifest

  const response = Response.json(manifest, {
    headers: {
      'cache-control': 'private, max-age=0',
      'content-type': 'application/json',
      'expo-manifest-filters': '',
      'expo-protocol-version': '1',
      'expo-server-defined-headers': '',
      'expo-sfv-version': '0',
    },
    status: 200,
  })

  log(response)

  return response
}
