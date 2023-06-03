'script id = vertex-shader'

export default `
// 一个属性值，将会从缓冲中获取数据
attribute vec4 a_position;
 
// 所有着色器都有一个main方法;
void main() {
 
  // gl_Position 是一个顶点着色器主要设置的变量;
  gl_Position = vec4(0, 0, 0, 1);
  gl_PointSize = 10.0;
}
`
