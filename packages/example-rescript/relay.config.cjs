module.exports = {
  src: '.',
  schema: './schema.graphql',
  artifactDirectory: './__generated__',
  excludes: ['**/dist/**', '**/node_modules/**', '**/__generated__/**'],
  eagerEsModules: true,
  customScalars: {
    URI: 'string',
    DateTime: 'string',
  },
}
