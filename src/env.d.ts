/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_APP_URL: string;
  readonly PUBLIC_WHATSAPP: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}