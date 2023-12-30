import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json' assert { type: 'json' }

export default defineManifest({
  name: packageData.name,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  icons: {
    16: 'img/logo-16.png',
    32: 'img/logo-34.png',
    48: 'img/logo-48.png',
    128: 'img/logo-128.png',
  },
  action: {
    default_popup: 'popup.html',
    default_icon: 'img/logo-48.png',
  },
  background: {
    service_worker: 'src/background/index.js',
    type: 'module',
  },
  content_scripts: [
    {
      matches: [
        // 'http://*/*',
        // 'https://*/*',
        // 'file://*/*',
        '*://www.youtube.com/*',
        // 'https://www.youtube.com/watch?v=R5i8alK5hPo',
      ],
      js: ['src/contentScript/index.jsx'],
    },
  ],
  web_accessible_resources: [
    {
      resources: ['img/logo-16.png', 'img/logo-34.png', 'img/logo-48.png', 'img/logo-128.png'],
      matches: [],
    },
  ],
  permissions: ['storage', 'contextMenus', 'tabs', 'activeTab'],
})
