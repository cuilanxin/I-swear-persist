export function isCanvasElement (dom: any): dom is HTMLCanvasElement {
  if (dom.getContext) return true
  return false
}
