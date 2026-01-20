export const updateSelectedSharedLists = (prevState, action) => {
  prevState.sharedLists.selectedLists = action.payload;
};
