import { isCanvasElement } from '../utils/utils'
import { fragmentSource, vertexSource } from './shader'
import imgLandscape from './img-landscape.png'
import imgMist from './img-mist.png'

function createShader (gl: WebGLRenderingContext, type: GLenum, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('shader failed')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) return shader
  const message = gl.getShaderInfoLog(shader) ?? ''
  gl.deleteShader(shader)
  throw new Error('shader message: ' + message)
}

function createProgram (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
  const program = gl.createProgram()
  if (!program) throw new Error('program failed')
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (success) {
    gl.useProgram(program)
    return program
  }
  const message = gl.getProgramInfoLog(program)
  gl.deleteProgram(program)
  throw new Error('program message: ' + (message ?? ''))
}

function createBuffer (gl: WebGLRenderingContext, type: GLenum, size: Uint8Array | Float32Array) {
  const buffer = gl.createBuffer()
  gl.bindBuffer(type, buffer)
  gl.bufferData(type, size, gl.STATIC_DRAW)
  return buffer
}

window.onload = function () {
  const canvasElement = document.getElementById('canvas_id')
  if (!isCanvasElement(canvasElement)) throw new Error('canvas failed')
  const gl = canvasElement.getContext('webgl')
  if (!gl) throw new Error('gl failed')
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = createProgram(gl, vertexShader, fragmentShader)

  createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array([
    -1, 1, 0, 1, /** */0, 1,
    1, 1, 0, 1, /** */ 1, 1,
    -1, -1, 0, 1, /** */ 0, 0,
    1, -1, 0, 1, /** */ 1, 0
  ]))
  createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint8Array([
    0, 1, 2,
    2, 1, 3
  ]))

  const positionIndex = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(positionIndex)
  gl.vertexAttribPointer(positionIndex, 4, gl.FLOAT, false, 6 * 4, 0)

  const inVaryingIndex = gl.getAttribLocation(program, 'inVarying')
  gl.enableVertexAttribArray(inVaryingIndex)
  gl.vertexAttribPointer(inVaryingIndex, 2, gl.FLOAT, false, 6 * 4, 4 * 4)

  const landscapeTexture = gl.createTexture()
  const textureIndex = gl.getUniformLocation(program, 'texture')
  if (!landscapeTexture) throw new Error('texture2D failed')
  const landscape = new Image()
  landscape.src = imgLandscape
  landscape.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, landscapeTexture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, landscape)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  }

  const mistTexture = gl.createTexture()
  const texture2Index = gl.getUniformLocation(program, 'texture2')
  if (!mistTexture) throw new Error('texture2D failed')
  const mist = new Image()
  mist.src = imgMist
  mist.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, mistTexture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mist)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  }

  setTimeout(() => {
    gl.clearColor(1, 1, 1, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, landscapeTexture)
    gl.uniform1i(textureIndex, 0)

    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, mistTexture)
    gl.uniform1i(texture2Index, 1)

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0)
  }, 1000)
}
