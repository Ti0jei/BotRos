// frontend/utils/blurActiveElement.tsx

export function blurActiveElement() {
  if (
    typeof document !== "undefined" &&
    document.activeElement instanceof HTMLElement
  ) {
    document.activeElement.blur();
  }
}
