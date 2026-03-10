declare module "@taias/aiapps-devtools" {
  import type { Router } from "express";
  export function devtoolsStaticServer(): Promise<Router>;
}
