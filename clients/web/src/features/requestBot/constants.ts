import { RequestBotModel } from "./types";

export const MODELS: Record<RequestBotModel, { src: string }> = {
  app: {
    src:
      "https://widget.writesonic.com/CDN/index.html?service-base-url=https%3A%2F%2Fapi-azure.botsonic.ai&token=ecb64aff-5d8a-40e6-b07b-80b14997c80f&base-origin=https%3A%2F%2Fbot.writesonic.com&instance-name=Botsonic&standalone=true&page-url=https%3A%2F%2Fbot.writesonic.com%2Fbots%2Fd59d951e-714f-41d9-8834-4d8dfa437b0e%2Fintegrations",
  },

  ruleTypes: {
    src:
      "https://widget.writesonic.com/CDN/index.html?service-base-url=https%3A%2F%2Fapi-azure.botsonic.ai&token=57820efb-1855-4c32-95ec-8e4c2e8cbc11&base-origin=https%3A%2F%2Fbot.writesonic.com&instance-name=Botsonic&standalone=true&page-url=https%3A%2F%2Fbot.writesonic.com%2Fbots%2F4f46552d-83ac-4d6d-a3df-ab9c3df0336e%2Fintegrations",
  },
};
