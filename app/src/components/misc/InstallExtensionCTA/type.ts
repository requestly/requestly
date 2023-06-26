export interface InstallExtensionCTA<T = string> extends Record<string, unknown> {
  heading: T;
  subHeading: T;
  eventPage: T;
}
