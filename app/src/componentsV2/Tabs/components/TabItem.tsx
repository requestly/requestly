import React, { useCallback } from "react";
import { ActiveBlocker, TabState } from "../store/tabStore";
import { StoreApi } from "zustand";
import { GenericStateContext } from "hooks/useGenericState";
import { useTabServiceWithSelector } from "../store/tabServiceStore";
import { RequestViewState } from "features/apiClient/screens/apiClient/components/views/store";

export const TabItem: React.FC<React.PropsWithChildren<{ store: StoreApi<TabState> }>> = React.memo((props) => {
  const [
    activeTabId,
    incrementVersion,
    resetPreviewTab,
    closeTabById,
    upsertTabSource,
  ] = useTabServiceWithSelector((state) => [
    state.activeTabId,
    state.incrementVersion,
    state.resetPreviewTab,
    state.closeTabById,
    state.upsertTabSource,
  ]);
  const viewStore = props.store.getState().viewStore;
  const createViewStore = props.store.getState().source.createViewStore;
  return (
    <GenericStateContext.Provider
      value={{
        genericStore: viewStore ? (viewStore as StoreApi<RequestViewState>) : null,
        createGenericStore: createViewStore,
        close: useCallback(() => {
          closeTabById(props.store.getState().id);
        }, [closeTabById, props.store]),

        replace: useCallback(
          (tabSource: TabState["source"]) => {
            upsertTabSource(props.store.getState().id, tabSource);
          },
          [props.store, upsertTabSource]
        ),

        getIsNew: useCallback(() => {
          return props.store.getState().isNewTab;
        }, [props.store]),

        setIsNew: useCallback(
          (isNewTab: boolean) => {
            props.store.getState().setIsNewTab(isNewTab);
            incrementVersion();
          },
          [incrementVersion, props.store]
        ),

        getIsActive: useCallback(() => {
          return activeTabId === props.store.getState().id;
        }, [activeTabId, props.store]),

        addCloseBlocker: useCallback(
          (topic: ActiveBlocker["topic"], id: ActiveBlocker["id"], details: ActiveBlocker["details"]) => {
            props.store.getState().addCloseBlocker(topic, id, {
              canClose: false,
              details,
            });
            incrementVersion();
          },
          [incrementVersion, props.store]
        ),

        removeCloseBlocker: useCallback(
          (topic: ActiveBlocker["topic"], id: ActiveBlocker["id"]) => {
            props.store.getState().removeCloseBlocker(topic, id);
            incrementVersion();
          },
          [incrementVersion, props.store]
        ),

        setTitle: useCallback(
          (title: string) => {
            props.store.getState().setTitle(title);
            incrementVersion();
          },
          [incrementVersion, props.store]
        ),

        setIcon: useCallback(
          (icon: React.ReactNode) => {
            props.store.getState().setIcon(icon);
            incrementVersion();
          },
          [incrementVersion, props.store]
        ),

        setPreview: useCallback(
          (preview: boolean) => {
            props.store.getState().setPreview(preview);
            if (!preview) {
              resetPreviewTab();
            }
            incrementVersion();
          },
          [props.store, incrementVersion, resetPreviewTab]
        ),

        setUnsaved: useCallback(
          (unsaved: boolean) => {
            props.store.getState().setUnsaved(unsaved);
            incrementVersion();
          },
          [incrementVersion, props.store]
        ),
      }}
    >
      {props.children}
    </GenericStateContext.Provider>
  );
});
