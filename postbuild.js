export function onWriteBundle() {
  return {
    name: 'onWriteBundle',
    writeBundle(options, bundle) {
      Object.entries(bundle).map(([fileName, chunk]) => {
        const {
          type,
          dynamicImports,
          implicitlyLoadedBefore,
          importedBindings,
          imports,
          modules,
          moduleIds,
          isImplicitEntry,
          isEntry,
          isDynamicEntry,
          exports,
          viteMetadata,
          referencedFiles,
          map,
          preliminaryFileName,
          sourcemapFileName,
          //   code,
          ...restChunk
        } = chunk
        const { name } = restChunk
        if (
          ['.png', '.json', '.css'].some((substring) => fileName.endsWith(substring)) ||
          ['service-worker', 'popup', 'devtools', 'options', 'polyfill', 'index', 'client'].some(
            (substring) => fileName.includes(substring) || (name && name.includes(substring)),
          )
        )
          return
        console.log(restChunk)
      })
    },
  }
}
