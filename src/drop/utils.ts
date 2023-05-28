export function isCanvasElement<T> (dom: any): dom is T {
  if (dom.getContext) return true
  return false
}
