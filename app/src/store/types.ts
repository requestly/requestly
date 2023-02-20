import { reduxStore } from "store";

export type RootState = ReturnType<typeof reduxStore.getState>;
