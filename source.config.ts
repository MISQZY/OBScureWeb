import { defineDocs, defineConfig, frontmatterSchema } from 'fumadocs-mdx/config';
import { z } from 'zod';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: frontmatterSchema.extend({
      // The OBScure app version this page's content was last verified
      // against — shown as a freshness badge on the page (see
      // src/components/docs/version-badge.tsx). Required so a page can't
      // silently omit it and lose the badge.
      appVersion: z.string(),
    }),
  },
});

export default defineConfig({
  mdxOptions: {},
});
