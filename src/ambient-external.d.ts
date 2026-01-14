declare module "userhome" {
  export default function userhome(subPath?: string): string;
}

declare module "which" {
  export function sync(cmd: string): string;
}
