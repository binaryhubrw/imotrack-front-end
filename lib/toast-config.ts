export const toastStyles = {
  success: {
    style: {
      background: "#28a745", // Success green from image
      color: "#fff",
      border: "1px solid #218838",
      fontSize: "14px",
      fontWeight: "500",
      borderRadius: "8px",
      boxShadow: "0 8px 25px rgba(40, 167, 69, 0.25)",
      padding: "12px 16px",
      lineHeight: "1.4",
      maxWidth: "320px",
      margin: "0 auto",
      letterSpacing: "0.01em",
      backdropFilter: "blur(10px)",
    },
    duration: 4000,
    icon: "✓",
  },
  error: {
    style: {
      background: "#dc3545", // Danger red from image
      color: "#fff",
      border: "1px solid #c82333",
      fontSize: "14px",
      fontWeight: "500",
      borderRadius: "8px",
      boxShadow: "0 8px 25px rgba(220, 53, 69, 0.25)",
      padding: "12px 16px",
      lineHeight: "1.4",
      maxWidth: "320px",
      margin: "0 auto",
      letterSpacing: "0.01em",
      backdropFilter: "blur(10px)",
    },
    duration: 5000,
    icon: "✕",
  },
  info: {
    style: {
      background: "#17a2b8", // Info teal from image
      color: "#fff",
      border: "1px solid #138496",
      fontSize: "14px",
      fontWeight: "500",
      borderRadius: "8px",
      boxShadow: "0 8px 25px rgba(23, 162, 184, 0.25)",
      padding: "12px 16px",
      lineHeight: "1.4",
      maxWidth: "320px",
      margin: "0 auto",
      letterSpacing: "0.01em",
      backdropFilter: "blur(10px)",
    },
    duration: 4000,
    icon: "ℹ",
  },
  warning: {
    style: {
      background: "#ffc107", // Warning yellow from image
      color: "#212529", // Dark text for better contrast
      border: "1px solid #e0a800",
      fontSize: "14px",
      fontWeight: "500",
      borderRadius: "8px",
      boxShadow: "0 8px 25px rgba(255, 193, 7, 0.25)",
      padding: "12px 16px",
      lineHeight: "1.4",
      maxWidth: "320px",
      margin: "0 auto",
      letterSpacing: "0.01em",
      backdropFilter: "blur(10px)",
    },
    duration: 4000,
    icon: "⚠",
  },
  primary: {
    style: {
      background: "#007bff", // Primary blue from image
      color: "#fff",
      border: "1px solid #0056b3",
      fontSize: "14px",
      fontWeight: "500",
      borderRadius: "8px",
      boxShadow: "0 8px 25px rgba(0, 123, 255, 0.25)",
      padding: "12px 16px",
      lineHeight: "1.4",
      maxWidth: "320px",
      margin: "0 auto",
      letterSpacing: "0.01em",
      backdropFilter: "blur(10px)",
    },
    duration: 4000,
    icon: "🔵",
  },
  secondary: {
    style: {
      background: "#868e96", // Secondary gray from image
      color: "#fff",
      border: "1px solid #6c757d",
      fontSize: "14px",
      fontWeight: "500",
      borderRadius: "8px",
      boxShadow: "0 8px 25px rgba(134, 142, 150, 0.25)",
      padding: "12px 16px",
      lineHeight: "1.4",
      maxWidth: "320px",
      margin: "0 auto",
      letterSpacing: "0.01em",
      backdropFilter: "blur(10px)",
    },
    duration: 4000,
    icon: "⚪",
  },
  loading: {
    style: {
      background: "#343a40", // Dark from image
      color: "#fff",
      border: "1px solid #23272b",
      fontSize: "14px",
      fontWeight: "500",
      borderRadius: "8px",
      boxShadow: "0 8px 25px rgba(52, 58, 64, 0.25)",
      padding: "12px 16px",
      lineHeight: "1.4",
      maxWidth: "320px",
      margin: "0 auto",
      letterSpacing: "0.01em",
      backdropFilter: "blur(10px)",
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
