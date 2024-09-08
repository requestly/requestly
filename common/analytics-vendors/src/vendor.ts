export interface Vendor {
  name: string;
  icon: string;
  identify(url: string, method: string): boolean;
}
