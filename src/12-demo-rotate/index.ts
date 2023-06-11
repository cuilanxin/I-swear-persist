import { isCanvasElement } from '../utils/utils'

function createShader (gl: WebGLRenderingContext, type: GLenum, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('create shader failed')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) return shader
  const message = gl.getShaderInfoLog(shader) ?? ''
  gl.deleteShader(shader)
  throw new Error('shader init failed:' + message)
}
window.onload = function () {
  const canvasElement = document.getElementById('canvas_id')
  if (!isCanvasElement(canvasElement)) throw new Error('get canvas failed')
  const gl = canvasElement.getContext('webgl')
  if (!gl) throw new Error('not gl')
  const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    `
    attribute vec4 position; 
    uniform float deg;
    void main(){
      // const {x, y, z, w} = position;
      float x = position.x;
      float y = position.y;
      float z = position.z;
      float w = position.w;
      gl_Position=vec4(
        x * cos(deg) - y * sin(deg), 
        x * sin(deg) + y * cos(deg), 
        z, w
      );
    }
  `
  )
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    `
    precision mediump float; 
    void main(){
      gl_FragColor=vec4(1.0, 0.5, 1.0, 1.0);
    }`
  )
  const program = gl.createProgram()
  if (!program) throw new Error('create program failed')
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (!success) {
    const message = gl.getProgramInfoLog(program) ?? ''
    gl.deleteProgram(program)
    throw new Error('link program failed: ' + message)
  }
  gl.useProgram(program)
  const positionIndex = gl.getAttribLocation(program, 'position')
  const uniformIndex = gl.getUniformLocation(program, 'deg')
  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      0, 0, 0, 1,
      //
      0.4, 0, 0, 1,
      //
      0.4, 0.2, 0, 1
    ]),
    gl.STATIC_DRAW
  )
  const elementBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2]), gl.STATIC_DRAW)

  gl.enableVertexAttribArray(positionIndex)
  gl.vertexAttribPointer(positionIndex, 4, gl.FLOAT, false, 0, 0)

  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.clearColor(1, 1, 1, 1)

  gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0)
  let deg = 0
  canvasElement.addEventListener('click', function () {
    gl.uniform1f(uniformIndex, (deg += 20))
    gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0)
  })
}
