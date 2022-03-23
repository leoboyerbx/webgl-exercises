import './style.css'
// @ts-ignore
import vertexShaderSource from './shaders/vertexShader.glsl'
// @ts-ignore
import fragmentShaderSource from './shaders/fragmentShader.glsl'

const canvas: HTMLCanvasElement = document.querySelector('#canvas')
const gl = canvas.getContext('webgl')

gl.clearColor(0, 0, 0, 1)
gl.clear(gl.COLOR_BUFFER_BIT)

const loadShader = (gl, source, type) => {
    const shader = gl.createShader(type)
    gl.shaderSource(shader,  source)
    gl.compileShader(shader)
    return shader
}

const vShader = loadShader(gl, vertexShaderSource, gl.VERTEX_SHADER)
const fShader = loadShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER)

const program = gl.createProgram()
gl.attachShader(program, vShader)
gl.attachShader(program, fShader)
gl.linkProgram(program)
gl.validateProgram(program)
gl.useProgram(program)

gl.drawArrays(gl.POINTS, 0, 1)
