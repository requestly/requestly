export const toggleActiveModal = (prevState, action) => {
  const modalName = action.payload.modalName;

  prevState.activeModals[modalName].isActive = action.payload.newValue ?? !prevState.activeModals[modalName].isActive;

  prevState.activeModals[modalName].props = action.payload.newProps ?? prevState.activeModals[modalName].props;
};
