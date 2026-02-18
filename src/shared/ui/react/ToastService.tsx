import React from "react";
import { createRoot } from "react-dom/client";
import Toast, { type Props as ToastProps } from "./Toast";

export function showToast(props: Omit<ToastProps, "onClose">) {
  if (typeof window === "undefined") return;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  const handleClose = () => {
    try {
      root.unmount();
    } catch (e) {
      // ignore
    }
    if (container.parentNode) container.parentNode.removeChild(container);
  };

  root.render(<Toast {...props} onClose={handleClose} />);
}

export default showToast;
