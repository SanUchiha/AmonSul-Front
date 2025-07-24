import { ref } from "vue";

type ToastType = "success" | "error" | "info" | "warning";

const showToast = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

export function useToast() {
  const triggerToast = (type: ToastType, message: string) => {
    toastColor.value = getColor(type);
    toastMessage.value = message;
    showToast.value = true;
  };

  const getColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return "success";
      case "error":
        return "error";
      case "warning":
        return "orange";
      default:
        return "info";
    }
  };

  return {
    showToast,
    toastMessage,
    toastColor,
    triggerToast,
  };
}
