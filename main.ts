import './style.css'

const canvas: HTMLCanvasElement = document.querySelector('#canvas')
const gl = canvas.getContext('webgl')

gl.clearColor(1, 0.7, 0, 1)
gl.clear(gl.COLOR_BUFFER_BIT)
