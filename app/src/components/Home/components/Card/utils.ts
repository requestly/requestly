import { CardType } from "./types";

export const getCardListItemType = (cardType: CardType): string => {
  switch (cardType) {
    case CardType.RULES:
      return "rules";
    case CardType.API_CLIENT:
      return "APIs";
    case CardType.API_MOCKING:
      return "mocks";
    default:
      return "records";
  }
};
