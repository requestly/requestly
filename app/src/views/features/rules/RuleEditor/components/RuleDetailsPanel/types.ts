export enum ExampleType {
  USE_TEMPLATE = "use_template",
  DOWNLOAD_DESKTOP_APP = "download_desktop_app",
  PLAYGROUND_LINK = "playground_link",
  UNKNOWN = "unknown",
}

export type UseCaseExample =
  | {
      type: ExampleType.USE_TEMPLATE;
      suggestedTemplateId: string;
    }
  | {
      type: ExampleType.PLAYGROUND_LINK;
      link: string;
    }
  | {
      type: ExampleType.DOWNLOAD_DESKTOP_APP;
      link: string;
    };
