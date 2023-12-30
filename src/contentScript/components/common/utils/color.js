export const generateColors = (colorStart, colorEnd, nColors, name) => {
  const step = 1 / (nColors - 1)

  for (let i = 0; i < nColors; i++) {
    const color = interpolateColor(colorStart, colorEnd, step * i)
    const variableName = `${name}-${i}`
    document.documentElement.style.setProperty(`--${variableName}`, color)
  }
}

const interpolateColor = (colorStart, colorEnd, fraction) => {
  const startColor = colorToRgb(colorStart)
  const endColor = colorToRgb(colorEnd)
  const interpolatedColor = []

  for (let i = 0; i < 3; i++) {
    const channel = Math.round(startColor[i] + fraction * (endColor[i] - startColor[i]))
    interpolatedColor.push(channel)
  }

  return formatColor(interpolatedColor)
}

const colorToRgb = (color) => {
  if (color.startsWith('#')) {
    return parseHexColor(color)
  } else if (color.startsWith('rgb')) {
    return parseRGBColor(color)
  } else if (color.startsWith('hsl')) {
    return parseHSLColor(color)
  } else if (isNamedColor(color)) {
    return parseNamedColor(color)
  } else {
    return parseNamedColor('white')
  }
}

const parseHexColor = (hex) => {
  const hexValue = hex.replace('#', '')
  const r = parseInt(hexValue.substr(0, 2), 16)
  const g = parseInt(hexValue.substr(2, 2), 16)
  const b = parseInt(hexValue.substr(4, 2), 16)
  return [r, g, b]
}

const parseRGBColor = (rgb) => {
  const values = rgb.match(/\d+/g).map(Number)
  return values.slice(0, 3)
}

const parseHSLColor = (hsl) => {
  const values = hsl.match(/\d+/g).map(Number)
  const [h, s, l] = values.slice(0, 3)
  return hslToRgb(h, s, l)
}

const parseNamedColor = (color) => {
  const namedColor = color.toLowerCase()
  const element = document.createElement('div')
  element.style.color = namedColor
  document.body.appendChild(element)
  const rgbColor = getComputedStyle(element).color
  document.body.removeChild(element)
  return parseRGBColor(rgbColor)
}

const isNamedColor = (color) => {
  const COLOR_NAMES = [
    'aliceblue',
    'antiquewhite',
    'aqua',
    'aquamarine',
    'azure',
    'beige',
    'bisque',
    'black',
    'blanchedalmond',
    'blue',
    'blueviolet',
    'brown',
    'burlywood',
    'cadetblue',
    'chartreuse',
    'chocolate',
    'coral',
    'cornflowerblue',
    'cornsilk',
    'crimson',
    'cyan',
    'darkblue',
    'darkcyan',
    'darkgoldenrod',
    'darkgray',
    'darkgreen',
    'darkgrey',
    'darkkhaki',
    'darkmagenta',
    'darkolivegreen',
    'darkorange',
    'darkorchid',
    'darkred',
    'darksalmon',
    'darkseagreen',
    'darkslateblue',
    'darkslategray',
    'darkslategrey',
    'darkturquoise',
    'darkviolet',
    'deeppink',
    'deepskyblue',
    'dimgray',
    'dimgrey',
    'dodgerblue',
    'firebrick',
    'floralwhite',
    'forestgreen',
    'fuchsia',
    'gainsboro',
    'ghostwhite',
    'gold',
    'goldenrod',
    'gray',
    'green',
    'greenyellow',
    'grey',
    'honeydew',
    'hotpink',
    'indianred',
    'indigo',
    'ivory',
    'khaki',
    'lavender',
    'lavenderblush',
    'lawngreen',
    'lemonchiffon',
    'lightblue',
    'lightcoral',
    'lightcyan',
    'lightgoldenrodyellow',
    'lightgray',
    'lightgreen',
    'lightgrey',
    'lightpink',
    'lightsalmon',
    'lightseagreen',
    'lightskyblue',
    'lightslategray',
    'lightslategrey',
    'lightsteelblue',
    'lightyellow',
    'lime',
    'limegreen',
    'linen',
    'magenta',
    'maroon',
    'mediumaquamarine',
    'mediumblue',
    'mediumorchid',
    'mediumpurple',
    'mediumseagreen',
    'mediumslateblue',
    'mediumspringgreen',
    'mediumturquoise',
    'mediumvioletred',
    'midnightblue',
    'mintcream',
    'mistyrose',
    'moccasin',
    'navajowhite',
    'navy',
    'oldlace',
    'olive',
    'olivedrab',
    'orange',
    'orangered',
    'orchid',
    'palegoldenrod',
    'palegreen',
    'paleturquoise',
    'palevioletred',
    'papayawhip',
    'peachpuff',
    'peru',
    'pink',
    'plum',
    'powderblue',
    'purple',
    'rebeccapurple',
    'red',
    'rosybrown',
    'royalblue',
    'saddlebrown',
    'salmon',
    'sandybrown',
    'seagreen',
    'seashell',
    'sienna',
    'silver',
    'skyblue',
    'slateblue',
    'slategray',
    'slategrey',
    'snow',
    'springgreen',
    'steelblue',
    'tan',
    'teal',
    'thistle',
    'tomato',
    'turquoise',
    'violet',
    'wheat',
    'white',
    'whitesmoke',
    'yellow',
    'yellowgreen',
  ]
  return COLOR_NAMES.includes(color.toLowerCase())
}

const hslToRgb = (h, s, l) => {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2

  let rgb

  if (h >= 0 && h < 60) {
    rgb = [c, x, 0]
  } else if (h >= 60 && h < 120) {
    rgb = [x, c, 0]
  } else if (h >= 120 && h < 180) {
    rgb = [0, c, x]
  } else if (h >= 180 && h < 240) {
    rgb = [0, x, c]
  } else if (h >= 240 && h < 300) {
    rgb = [x, 0, c]
  } else {
    rgb = [c, 0, x]
  }

  return rgb.map((v) => Math.round((v + m) * 255))
}

const formatColor = (colorValues) => {
  return `#${colorValues.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

const rgbToHsl = (r, g, b) => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l

  if (max === min) {
    h = 0
  } else if (max === r) {
    h = 60 * ((g - b) / (max - min))
  } else if (max === g) {
    h = 60 * ((b - r) / (max - min)) + 120
  } else {
    h = 60 * ((r - g) / (max - min)) + 240
  }

  if (h < 0) {
    h += 360
  }

  l = (max + min) / 2

  if (max === min) {
    s = 0
  } else if (l <= 0.5) {
    s = (max - min) / (2 * l)
  } else {
    s = (max - min) / (2 - 2 * l)
  }

  h = Math.round(h)
  s = Math.round(s * 100)
  l = Math.round(l * 100)

  return [h, s, l]
}

export const cssRgba = ({ color, r, g, b, a, rChange, gChange, bChange, aChange }) => {
  let rgb = [r || 0, g || 0, b || 0]
  if (color) rgb = colorToRgb(color)
  if (rChange) rgb[0] *= rChange
  if (gChange) rgb[1] *= gChange
  if (bChange) rgb[2] *= bChange
  rgb.push(a === 0 || aChange === 0 ? 0 : (a || 1) * (aChange || 1))
  return `rgba(${rgb.join(',')})`
}

export const cssHsla = ({ color, h, s, l, a, hChange, sChange, lChange, aChange }) => {
  let hsl = [h || 0, s || 0, l || 0]
  if (color) hsl = rgbToHsl(...colorToRgb(color))
  if (hChange) hsl[0] *= hChange
  if (sChange) hsl[1] *= sChange
  if (lChange) hsl[2] *= lChange
  hsl.push(a === 0 || aChange === 0 ? 0 : (a || 1) * (aChange || 1))
  hsl[1] = hsl[1].toString() + '%'
  hsl[2] = hsl[2].toString() + '%'
  return `hsla(${hsl.join(',')})`
}

export const linearGradient = (direction, ...colors) => {
  return `linear-gradient(${direction}, ${colors.join(', ')})`
}

export const radialGradient = (...colors) => {
  return `radial-gradient(${colors.join(', ')})`
}
