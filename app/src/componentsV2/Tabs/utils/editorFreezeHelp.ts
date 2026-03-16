import { Modal } from "antd";

let isShowing = false;

export function showEditorFreezeHelpIfDesktop() {
  if (typeof window === "undefined") return;

  const isDesktop = (window as any)?.RQ?.MODE === "DESKTOP";
  if (!isDesktop) return;

  if (isShowing) return;
  isShowing = true;

  Modal.info({
    title: "Editors look frozen?",
    content:
      "On the Windows desktop app, editors can temporarily stop accepting typing after you cancel a 'Discard changes' prompt.\n\nTo unfreeze them, switch to another window and come back, or minimize and restore the Requestly window. Your changes were not discarded because you clicked Cancel.",
    okText: "Got it",
    onOk: () => {
      isShowing = false;
    },
    onCancel: () => {
      isShowing = false;
    },
  });
}
