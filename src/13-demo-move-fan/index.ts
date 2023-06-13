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
  throw new Error('compile shader failed: ' + message)
}

window.onload = function () {
  const canvasElement = document.getElementById('canvas_id')
  if (!isCanvasElement(canvasElement)) throw new Error('git canvas failed')
  const gl = canvasElement.getContext('webgl')
  if (!gl) throw new Error('not gl')
  const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    `
    attribute vec4 position;
    uniform float deg;
    uniform vec2 direction;
    void main() {
      float p_x = position.x;
      float p_y = position.y;
      float p_z = position.z;
      float p_w = position.w;
      float d_x = direction.x;
      float d_y = direction.y;
      gl_Position = vec4(
        p_x * cos(deg) - p_y *sin(deg) + d_x,
        p_x * sin(deg) + p_y * cos(deg) + d_y,
        p_z, p_w
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
      gl_FragColor = vec4(1.0, 0.2, 1.0, 1.0);
    }
  `
  )

  const program = gl.createProgram()
  if (!program) throw new Error('create program failed')
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? ''
    gl.deleteProgram(program)
    throw new Error('link program failed: ' + message)
  }
  gl.useProgram(program)

  const arrayBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer)
  const pointArr = [0, 0, 0, 1]
  pointArr.push(0.3, 0.04, 0, 1, 0.3, -0.04, 0, 1)
  pointArr.push(
    pointArr[4] * Math.cos(90) - pointArr[5] * Math.sin(90),
    pointArr[4] * Math.sin(90) + pointArr[5] * Math.cos(90),
    0,
    1,
    pointArr[8] * Math.cos(90) - pointArr[9] * Math.sin(90),
    pointArr[8] * Math.sin(90) + pointArr[9] * Math.cos(90),
    0,
    1
  )
  pointArr.push(
    pointArr[12] * Math.cos(90) - pointArr[13] * Math.sin(90),
    pointArr[12] * Math.sin(90) + pointArr[13] * Math.cos(90),
    0,
    1,
    pointArr[16] * Math.cos(90) - pointArr[17] * Math.sin(90),
    pointArr[16] * Math.sin(90) + pointArr[17] * Math.cos(90),
    0,
    1
  )
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointArr), gl.STATIC_DRAW)
  const positionIndex = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(positionIndex)
  gl.vertexAttribPointer(positionIndex, 4, gl.FLOAT, false, 0, 0)

  const elementBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer)
  const drawPointArr = [0, 1, 2, /**/ 0, 3, 4, 0, 5, 6]
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(drawPointArr), gl.STATIC_DRAW)

  const deg = gl.getUniformLocation(program, 'deg')
  gl.uniform1f(deg, (window.deg = 0))

  const direction = gl.getUniformLocation(program, 'direction')
  gl.uniform2f(direction, (window.x = 0), (window.y = 0))

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.clearColor(1, 1, 1, 1)

  function drawElements (gl: WebGLRenderingContext) {
    gl.drawElements(gl.TRIANGLES, drawPointArr.length, gl.UNSIGNED_SHORT, 0)
  }
  window.addEventListener('keypress', ({ key }) => {
    switch (key) {
      case 'w':
        gl.uniform2f(direction, window.x, (window.y += 0.01))
        break
      case 's':
        gl.uniform2f(direction, window.x, (window.y -= 0.01))
        break
      case 'a':
        gl.uniform2f(direction, (window.x -= 0.01), window.y)
        break
      case 'd':
        gl.uniform2f(direction, (window.x += 0.01), window.y)
    }
    gl.uniform1f(deg, (window.deg += 0.1))
    drawElements(gl)
  })
  function requestAnimationFrame () {
    window.requestAnimationFrame(() => {
      if (!gl) throw new Error('')
      gl.uniform1f(deg, (window.deg += 0.01))
      drawElements(gl)
      requestAnimationFrame()
    })
  }
  window.requestAnimationFrame(requestAnimationFrame)
}
