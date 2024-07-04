export interface InstallExtensionContent<T = string> extends Record<string, unknown> {
  heading?: T;
  subHeading?: T;
  eventPage: T;
  isUpdateRequired?: boolean;
}
