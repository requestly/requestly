// not used anywhere
export const updateSearch = (prevState, action) => {
  prevState.search[action.payload.searchType] = action.payload.value;
};
