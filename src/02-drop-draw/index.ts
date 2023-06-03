// 坐标轴计算
// canvas 的 x y,  webgl的 w h
// x / canvas.width = (1 + w) / 2;
// w = 2(x/canvas.width) - 1
// y / canvas.height = (1 - h) / 2
// h = 1 - 2(y/canvas.height)
import { isCanvasElement } from '../utils/utils'
function getGl (): { gl: WebGLRenderingContext, canvasElement: HTMLCanvasElement } {
  const canvasElement = document.getElementById('canvas_id')
  if (!isCanvasElement(canvasElement)) throw new Error('没有 canvas ')
  const gl = canvasElement.getContext('webgl')
  if (!gl) throw new Error('没有 gl 能力')
  return { gl, canvasElement }
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
  throw new Error('shader 失败， message: ' + message)
}
function createProgram (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLShader {
  const program = gl.createProgram()
  if (!program) throw new Error('没有 program 能力')
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (success) {
    gl.useProgram(program)
    return program
  }
  const message = gl.getProgramInfoLog(program) ?? ''
  gl.deleteProgram(program)
  throw new Error('program 失败， message：' + message)
}

function drawArrays (gl: WebGLRenderingContext, program: WebGLShader): number {
  const aPosition = gl.getAttribLocation(program, 'a_position')
  const data = new Float32Array([0.0, 0.0, 0.0, 1.0])
  gl.vertexAttrib4fv(aPosition, data)

  gl.clearColor(1, 1, 1, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.POINTS, 0, 4)
  return aPosition
}
const vertexSource = `
attribute vec4 a_position;
void main(){
  gl_Position = a_position;
  gl_PointSize = 10.0;
}
`
const fragmentSource = `

void main() {
  gl_FragColor = vec4(1, 0.5, 1.0, 1.0);
}
`
window.onload = function () {
  const { gl, canvasElement } = getGl()
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = createProgram(gl, vertexShader, fragmentShader)
  const aPosition = drawArrays(gl, program)

  const arr = [{ x: 0, y: 0 }]
  canvasElement.addEventListener('click', ({ offsetX, offsetY }) => {
    const x = (offsetX / canvasElement.width) * 2 - 1
    const y = 1 - (offsetY / canvasElement.height) * 2
    arr.push({ x, y })
    for (let i = 0; i < arr.length; i++) {
      gl.vertexAttrib4fv(aPosition, [arr[i].x, arr[i].y, 0.0, 1.0])
      gl.drawArrays(gl.POINTS, 0, 1)
    }
  })
}
