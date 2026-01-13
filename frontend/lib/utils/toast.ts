import { toast as sonnerToast, ExternalToast } from "sonner";

/**
 * Custom toast utilities with brand styling consistent with Alert components
 * Colors and styling match the existing design system
 */

// Solid colors for toast styling (matches brand)
const TOAST_BG = "#1a1625";
const TOAST_BORDER = "#3d3654";
const TOAST_TEXT = "#f5f5f5";
const TOAST_ACCENT = "#9B6AF6";
const TOAST_ERROR = "#ef4444";
const TOAST_WARNING = "#facc15";
const TOAST_MUTED = "#a1a1aa";

// Default toast options with brand styling
const defaultOptions: ExternalToast = {
  duration: 4000,
  closeButton: true,
  style: {
    background: TOAST_BG,
    border: `1px solid ${TOAST_BORDER}`,
    color: TOAST_TEXT,
  },
};

// Success toast with accent colors (matching text-accent)
export const success = (message: string, options?: ExternalToast) => {
  return sonnerToast.success(message, {
    ...defaultOptions,
    duration: 4000,
    style: {
      background: TOAST_BG,
      border: `1px solid ${TOAST_ACCENT}4d`,
      color: TOAST_ACCENT,
      ...options?.style,
    },
    ...options,
  });
};

// Error toast with destructive colors (matching text-destructive)
export const error = (message: string, options?: ExternalToast) => {
  return sonnerToast.error(message, {
    ...defaultOptions,
    duration: 6000, // Longer for errors
    style: {
      background: TOAST_BG,
      border: `1px solid ${TOAST_ERROR}80`,
      color: TOAST_ERROR,
      ...options?.style,
    },
    ...options,
  });
};

// Warning toast with yellow colors (matching text-yellow-400)
export const warning = (message: string, options?: ExternalToast) => {
  return sonnerToast.warning(message, {
    ...defaultOptions,
    duration: 5000,
    style: {
      background: TOAST_BG,
      border: `1px solid ${TOAST_WARNING}4d`,
      color: TOAST_WARNING,
      ...options?.style,
    },
    ...options,
  });
};

// Info toast with default colors
export const info = (message: string, options?: ExternalToast) => {
  return sonnerToast.info(message, {
    ...defaultOptions,
    duration: 3000,
    ...options,
  });
};

// Loading toast for async operations
export const loading = (message: string, options?: ExternalToast) => {
  return sonnerToast.loading(message, {
    ...defaultOptions,
    duration: Infinity, // Manual dismiss
    ...options,
  });
};

// Promise toast for handling async operations
export const promise = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((result: T) => string);
    error: string | ((error: any) => string);
  },
  options?: ExternalToast
) => {
  return sonnerToast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
    ...defaultOptions,
    ...options,
  });
};

// Configuration error toast (persistent until dismissed)
export const configError = (message: string, description?: string, action?: { label: string; onClick: () => void }) => {
  return sonnerToast.error(message, {
    description,
    duration: Infinity,
    closeButton: true,
    action: action ? {
      label: action.label,
      onClick: action.onClick,
    } : undefined,
    style: {
      background: TOAST_BG,
      border: `1px solid ${TOAST_ERROR}80`,
      color: TOAST_ERROR,
    },
  });
};

// User rejection toast (brief, non-intrusive)
export const userRejected = (message: string) => {
  return sonnerToast.info(message, {
    duration: 2000,
    closeButton: false,
    style: {
      background: TOAST_BG,
      border: `1px solid ${TOAST_BORDER}`,
      color: TOAST_MUTED,
    },
  });
};

// Export the original toast for custom usage
export { sonnerToast as toast };

// Export all functions as a single object for convenience
export default {
  success,
  error,
  warning,
  info,
  loading,
  promise,
  configError,
  userRejected,
  toast: sonnerToast,
};