import * as React from 'react'
import { createRoot } from 'react-dom/client'
import Popup from './Popup'

createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
)
