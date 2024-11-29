export default {
  plugins: [
    // 'preset-default',
    'cleanupAttrs',
    // {
    //   name: 'cleanupIds',
    //   params: {
    //     prefix: {
    //       toString() { this.counter ||= 0; return `id-${this.counter++}` }
    //     },
    //     minify: true
    //   }
    // },
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeEditorsNSData',
    'cleanupEnableBackground',
    // 'convertStyleToAttrs',
    'convertColors',
    'convertPathData',
    'convertTransform',
    'removeUnknownsAndDefaults',
    'removeNonInheritableGroupAttrs',
    'removeUselessStrokeAndFill',
    'removeUnusedNS',
    {
      name: 'cleanupNumericValues',
      params: {
        floatPrecision: 3
      }
    },
    {
      name: 'convertTransform',
      params: {
        floatPrecision: 3
      }
    },
    'cleanupListOfValues',
    'moveElemsAttrsToGroup',
    'moveGroupAttrsToElems',
    'collapseGroups',
    'removeRasterImages',
    'mergePaths',
    'convertShapeToPath',
    'sortAttrs',
    // {
    //   name: 'removeAttrs',
    //   params: { attrs: '(stroke|fill)' }
    // },
    'removeDimensions',
    'removeTitle',
    'removeDesc',
    'removeScriptElement',
    'removeUselessDefs',
    'removeEmptyContainers',
    'removeEmptyText',
    'removeOffCanvasPaths',
    'removeHiddenElems',
    'removeEmptyAttrs',
  ]
}
