/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_LOCAL_API_KEY: string;
    readonly VITE_LOCAL_API_URL: string;
    readonly VITE_FIXED_LAT: number;
    readonly VITE_FIXED_LONG: number;
    readonly VITE_OPENROUTESERVICE_API: string;
    readonly VITE_GOOGLE_MAPS_API_KEY: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
