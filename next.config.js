/** @type {import('next').NextConfig} */

const path = require('path');

module.exports = {

    webpack(config, { isServer }) {
      // Grab the existing rule that handles SVG imports
      const fileLoaderRule = config.module.rules.find((rule) =>
        rule.test?.test?.('.svg'),
      )
  
      config.module.rules.push(
        // Reapply the existing rule, but only for svg imports ending in ?url
        {
          ...fileLoaderRule,
          test: /\.svg$/i,
          resourceQuery: /url/, // *.svg?url
        },
        // Convert all other *.svg imports to React components
        {
          test: /\.svg$/i,
          issuer: fileLoaderRule.issuer,
          resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
          use: ['@svgr/webpack'],
        },
      )
  
      // Modify the file loader rule to ignore *.svg, since we have it handled now.
      fileLoaderRule.exclude = /\.svg$/i

      if (!isServer) {
        // Ensure that all imports of 'yjs' resolve to the same instance
        config.resolve.alias['yjs'] = path.resolve(__dirname, 'node_modules/yjs')
      }
  
      return config
    },
  
    // ...other config
  }