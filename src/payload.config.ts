import { buildConfig } from 'payload/config'
import path from 'path'
import { Users } from './collections/Users'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Header } from './globals/Header'
import { Footer } from './globals/Footer'
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seo } from '@payloadcms/plugin-seo'
import { search } from '@payloadcms/plugin-search'
import { redirects } from '@payloadcms/plugin-redirects'
import { nestedDocs } from '@payloadcms/plugin-nested-docs'
import { formBuilder } from '@payloadcms/plugin-form-builder'

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [Categories, Media, Pages, Posts, Users],
  globals: [Header, Footer],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(process.cwd(), 'src/payload-types.ts'),
  },
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL,
    },
  }),

  /**
   * This is temporary - we need to patch Payload until they fix this.
   * @see https://github.com/payloadcms/payload/issues/5545
   *
   * Alternatively, you can use the `mongooseAdapter` and transpile your config
   * to CommonJS.
   */
  // @ts-expect-error
  express: {
    json: {
      limit: '100mb',
    },
  },

  plugins: [
    // This plugin is used to build forms dynamically
    // See https://payloadcms.com/docs/plugins/form-builder
    formBuilder({
      fields: {
        payment: false,
      },
    }),
    // This plugin is used to create nested docs within collections
    // See https://payloadcms.com/docs/plugins/nested-docs
    nestedDocs({
      collections: ['categories'],
    }),
    // This plugin is used to manage redirects
    // See https://payloadcms.com/docs/plugins/redirects
    redirects({
      collections: ['pages', 'posts'],
    }),
    // This plugin is used to search through collections
    // See https://payloadcms.com/docs/plugins/search
    search({
      collections: ['pages', 'posts'],
    }),
    // This plugin is used to manage SEO data
    // See https://payloadcms.com/docs/plugins/seo
    seo({
      collections: ['pages', 'posts'],
      uploadsCollection: 'media',
    }),
    // This plugin is used to connect to Vercel Blob Storage
    // See https://payloadcms.com/docs/plugins/storage-vercel-blob
    vercelBlobStorage({
      collections: {
        [Media.slug]: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
})
