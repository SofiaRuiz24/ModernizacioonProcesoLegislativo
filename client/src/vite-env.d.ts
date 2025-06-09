/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTRACT_ADDRESS: string
  // Add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 