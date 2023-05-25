/* eslint-disable camelcase */
const fs = require('fs')

class HtmlPlugin {
  constructor ({ paths, htmlName }) {
    this.paths = paths
    this.htmlName = htmlName
  }

  apply (compiler) {
    const paths = this.paths
    const htmlName = this.htmlName
    compiler.hooks.emit.tap('在html中生成no_js', function (compilation) {
      const no_js_ids = []
      for (let index = 0; index < paths.length; index++) {
        const file_source = fs.readFileSync(paths[index], 'UTF-8')
        const [var_code, ...other] = file_source.split(/;|\n/)
        if (var_code.includes('script id')) {
          const id = var_code.replace(/ |script id|=/g, '')
          no_js_ids.push(id)
          const file_emit = other.filter((it) => it).join(';')
          compilation.assets[id + '.js'] = {
            source () {
              return file_emit
            },
            size () {
              return file_emit.length
            }
          }
        }
      }
      const html_source = compilation.assets[htmlName]
      const html_value_source = html_source._value.split('\n').map((it) => {
        if (it.includes('<script')) {
          let str = ''
          for (let index = 0; index < no_js_ids.length; index++) {
            const id = no_js_ids[index]
            str += `<script type="no_js" id="${id}" src="./${id}.js"></script>`
          }
          return (str += it)
        }
        return it
      })
      compilation.assets[htmlName]._value = html_value_source.join('\n')
      compilation.assets[htmlName]._valueAsString = html_value_source.join('\n')
    })
  }
}

module.exports = HtmlPlugin
