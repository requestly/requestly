import { GlobalModals } from "./modals/types";

export interface GlobalSliceState {
  activeModals: GlobalModals;
  [key: string]: any;
}
