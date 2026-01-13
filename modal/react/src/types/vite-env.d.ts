/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly CHAINRAILS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
