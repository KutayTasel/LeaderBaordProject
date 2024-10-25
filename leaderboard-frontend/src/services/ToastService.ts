import React from "react";
import { toast, Theme } from "react-toastify";

const ToastService = {
  toastSuccess(message: string, theme: Theme | null = null) {
    baseToast("success", message, theme);
  },
  toastWarning(message: string, theme: Theme | null = null) {
    baseToast("warn", message, theme);
  },
  toastError(message: string, theme: Theme | null = null) {
    baseToast("error", message, theme);
  },
  toastInfo(message: string, theme: Theme | null = null) {
    baseToast("info", message, theme);
  },
};

function baseToast(
  type: "success" | "warn" | "error" | "info",
  message: string,
  theme: Theme | null = null
) {
  toast[type](message, {
    autoClose: 3000,
    theme: theme === "dark" ? "dark" : "colored",
  });
}

export default ToastService;
