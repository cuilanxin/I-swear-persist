console.log('输出是 ts 文件')

if ((module as any).hot) {
  (module as any).hot.accept()
}