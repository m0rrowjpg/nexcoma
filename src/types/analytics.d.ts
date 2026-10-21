export {};

declare global {
  interface Window {
    dataLayer: unknown[][];
    gtag: (...arguments_: unknown[]) => void;
  }
}
