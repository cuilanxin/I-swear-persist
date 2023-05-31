import fragmentSource from './webgl/fragment-shader'
import vertexSource from './webgl/vertex-shader'
import { isCanvasElement } from '../utils/utils'

function getElement (): WebGLRenderingContext {
  const canvasElement = document.getElementById('canvas_id')
  if (!isCanvasElement(canvasElement)) throw new Error('没有 canvas 元素')
  const gl = canvasElement.getContext('webgl')
  if (!gl) throw new Error('没有 webgl 能力')
  // 第一次时初始化，改变绘制范围的时候需要从新调用
  // gl.viewport(0, 0, canvasElement.width, canvasElement.height)
  return gl
}

function createShader (gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('没有 shader 能力')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) return shader
  const message = gl.getShaderInfoLog(shader) ?? ''
  gl.deleteShader(shader)
  throw new Error('没有 shader 能力，message: ' + message)
}

function createProgram (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
  const program = gl.createProgram()
  if (!program) throw new Error('没有 program 能力，')
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (success) return program
  const message = gl.getProgramInfoLog(program) ?? ''
  throw new Error('没有 program 能力，message: ' + message)
}

function drawArrays (gl: WebGLRenderingContext, program: WebGLProgram): void {
  gl.useProgram(program)
  gl.clearColor(1, 1, 1, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.POINTS, 0, 1)
}
window.onload = function () {
  try {
    // 初始化
    const gl = getElement()
    // 创建着色器
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource)
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
    // 链接着色器
    const program = createProgram(gl, vertexShader, fragShader)
    // 绘制
    drawArrays(gl, program)
  } catch (error: any) {
    console.error(error.message)
  }
}
