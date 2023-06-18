import { isCanvasElement } from '../utils/utils'
import { fragmentSource, vertexSource } from './webgl'
import point16 from '../static/point16.png'

function createShader (gl: WebGLRenderingContext, type: GLenum, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('create shader failed')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    return shader
  }
  const message = gl.getShaderInfoLog(shader) ?? ''
  throw new Error('shader message:' + message)
}

function createProgram (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
  const program = gl.createProgram()
  if (!program) throw new Error('create program failed')
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  gl.useProgram(program)
  return program
}

function createBuffer (gl: WebGLRenderingContext, type: GLenum, size: Uint16Array | Float32Array) {
  const buffer = gl.createBuffer()
  if (!buffer) throw new Error('create buffer failed')
  gl.bindBuffer(type, buffer)
  gl.bufferData(type, size, gl.STATIC_DRAW)
  return buffer
}

function createTexture (gl: WebGLRenderingContext, program: WebGLProgram, draw: () => void) {
  const uniformTextureIndex = gl.getUniformLocation(program, 'texture')
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  const texture2D = gl.createTexture()
  if (!texture2D) throw new Error('create texture failed')
  gl.bindTexture(gl.TEXTURE_2D, texture2D)
  const ima = new Image()
  ima.src = point16
  ima.onload = function () {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ima)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)

    gl.uniform1i(uniformTextureIndex, 0)
    draw()
  }
}

function draw (gl: WebGLRenderingContext, count: number) {
  gl.clearColor(1, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.drawElements(gl.POINTS, count, gl.UNSIGNED_SHORT, 0)
}

window.onload = function () {
  const canvasElement = document.getElementById('canvas_id')
  if (!isCanvasElement(canvasElement)) throw new Error('canvas')
  const gl = canvasElement.getContext('webgl')
  if (!gl) throw new Error('gl')
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = createProgram(gl, vertexShader, fragmentShader)
  const pointData = [-0.5, 0.5, 0, 1, 0.5, 0.5, 0, 1, -0.5, -0.5, 0, 1, -0.52, 0.5, 0, 1]
  createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(pointData))
  const elementData = [0, 1, 2, 3]
  createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(elementData))

  const positionIndex = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(positionIndex)
  gl.vertexAttribPointer(positionIndex, 4, gl.FLOAT, false, 0, 0)

  createTexture(gl, program, () => {
    draw(gl, elementData.length)
  })
}
