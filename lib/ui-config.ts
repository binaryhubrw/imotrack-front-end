export const toastStyles = {
  success: {
    style: {
      background: "#28a745", // Success green
      color: "#fff",
      border: "1px solid #218838",
      fontSize: "15px",
      fontWeight: "600",
      borderRadius: "12px",
      boxShadow: "0 4px 16px rgba(40, 167, 69, 0.15)",
      padding: "14px 18px",
      lineHeight: "1.5",
      maxWidth: "340px",
      margin: "0 auto",
      letterSpacing: "0.01em",
    },
    duration: 4000,
    icon: "✔️",
  },
  error: {
    style: {
      background: "#dc3545", // Danger red
      color: "#fff",
      border: "1px solid #b52a37",
      fontSize: "15px",
      fontWeight: "700",
      borderRadius: "12px",
      boxShadow: "0 4px 16px rgba(220, 53, 69, 0.15)",
      padding: "14px 18px",
      lineHeight: "1.5",
      maxWidth: "340px",
      margin: "0 auto",
      letterSpacing: "0.01em",
    },
    duration: 6000,
    icon: "❌",
  },
  info: {
    style: {
      background: "#17a2b8", // Info teal
      color: "#fff",
      border: "1px solid #138496",
      fontSize: "15px",
      fontWeight: "600",
      borderRadius: "12px",
      boxShadow: "0 4px 16px rgba(23, 162, 184, 0.15)",
      padding: "14px 18px",
      lineHeight: "1.5",
      maxWidth: "340px",
      margin: "0 auto",
      letterSpacing: "0.01em",
    },
    duration: 5000,
    icon: "ℹ️",
  },
  warning: {
    style: {
      background: "#ffc107", // Warning yellow
      color: "#fff", // Dark text for yellow bg
      border: "1px solid #d39e00",
      fontSize: "15px",
      fontWeight: "600",
      borderRadius: "12px",
      boxShadow: "0 4px 16px rgba(255, 193, 7, 0.17)",
      padding: "14px 18px",
      lineHeight: "1.5",
      maxWidth: "340px",
      margin: "0 auto",
      letterSpacing: "0.01em",
    },
    duration: 5000,
    icon: "⚠️",
  },
  primary: {
    style: {
      background: "#007bff", // Primary blue
      color: "#fff",
      border: "1px solid #0069d9",
      fontSize: "15px",
      fontWeight: "600",
      borderRadius: "12px",
      boxShadow: "0 4px 16px rgba(0,123,255,0.13)",
      padding: "14px 18px",
      lineHeight: "1.5",
      maxWidth: "340px",
      margin: "0 auto",
      letterSpacing: "0.01em",
    },
    duration: 5000,
    icon: "🔵",
  },
  secondary: {
    style: {
      background: "#868e96", // Secondary gray
      color: "#fff",
      border: "1px solid #6c757d",
      fontSize: "15px",
      fontWeight: "600",
      borderRadius: "12px",
      boxShadow: "0 4px 16px rgba(134,142,150,0.15)",
      padding: "14px 18px",
      lineHeight: "1.5",
      maxWidth: "340px",
      margin: "0 auto",
      letterSpacing: "0.01em",
    },
    duration: 5000,
    icon: "⚪",
  },
  loading: {
    style: {
      background: "#343a40", // Dark bg
      color: "#fff",
      border: "1px solid #23272b",
      fontSize: "15px",
      fontWeight: "600",
      borderRadius: "12px",
      boxShadow: "0 4px 16px rgba(52,58,64,0.14)",
      padding: "14px 18px",
      lineHeight: "1.5",
      maxWidth: "340px",
      margin: "0 auto",
      letterSpacing: "0.01em",
    },
    icon: "⏳",
  },
};

// Add keyframes for animations (to be injected in your CSS or styled-components)
/*
@keyframes toastFadeIn {
  0% {opacity: 0; transform: translateY(10px);}
  100% {opacity: 1; transform: translateY(0);}
}

@keyframes toastPulse {
  0%, 100% {opacity: 1;}
  50% {opacity: 0.6;}
}
*/

// Utility functions to retrieve toast config with icon
export const getToastConfig = (type: keyof typeof toastStyles) => {
  const config = toastStyles[type];
  return {
    ...config,
    icon: config.icon || undefined,
  };
};

// Convenience exports
export const successToastConfig = getToastConfig("success");
export const errorToastConfig = getToastConfig("error");
export const infoToastConfig = getToastConfig("info");
export const warningToastConfig = getToastConfig("warning");
export const primaryToastConfig = getToastConfig("primary");
export const secondaryToastConfig = getToastConfig("secondary");
export const loadingToastConfig = getToastConfig("loading");
