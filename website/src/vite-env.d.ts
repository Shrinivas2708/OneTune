/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APK_URL?: string;
  readonly VITE_APK_FILE_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
