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
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    return shader
}
class PointData {
    public coords: Array<number>
    public color: Array<number>
    constructor(coords: Array<number>, color: Array<number>) {
        this.coords = coords
        this.color = color
    }
}
const points: Array<PointData> = []
const vShader = loadShader(gl, vertexShaderSource, gl.VERTEX_SHADER)
const fShader = loadShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER)

const program = gl.createProgram()
gl.attachShader(program, vShader)
gl.attachShader(program, fShader)
gl.linkProgram(program)
gl.validateProgram(program)
gl.useProgram(program)

const positionAttrib = gl.getAttribLocation(program, 'aPosition')
const colorAttrib = gl.getUniformLocation(program, 'uColor')
const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT)
    points.forEach(point => {
        gl.vertexAttrib2fv(positionAttrib, point.coords)
        gl.uniform4fv(colorAttrib, point.color)
        gl.drawArrays(gl.POINTS, 0, 1)
    })
}


const canvasRect = canvas.getBoundingClientRect()
canvas.addEventListener('click', (e: PointerEvent) => {
    const {width, height} = canvasRect
    const x = (e.offsetX / width) * 2 - 1
    const y = (e.offsetY / height) * 2 - 1

    const color = x > 0
        ? [1, 0, 0, 1]
        : [0, 0, 1, 1]

    points.push(new PointData([x, -y], color))

    render()
})

render()
