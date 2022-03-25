import vertexShader from './shaders/vertexShader.glsl'
import fragmentShader from './shaders/fragmentShader.glsl'

class Polygon {
    constructor(radius, sides) {
        this.sides = sides
        const coords = [
            0, 0, 1, 0, 0
        ]
        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides
            const x = radius * Math.cos(angle)
            const y = radius * Math.sin(angle)
            coords.push(
                x, //x
                y,//y
                1, 0, 0 // color
            )
        }
        this.coords = new Float32Array(coords)

        this.program = null
        this.attributes = {}
        this.uniforms = {}

        this.vertexBuffer = null

        this.initProgram()
        this.initGeometry()
    }

    initProgram() {
        // Create the program with shader code
        this.program = WebGLShaderUtils.createProgram(gl, vertexShader, fragmentShader)

        // Use the program to allow access to attributes and uniforms location
        gl.useProgram(this.program)

        // Get all attributes locations
        // This will allow to set the values from the javascript code with the gl.vertexAttrib function
        this.attributes.position = getAttributeLocation(this.program, "aPosition")
        this.attributes.color = getAttributeLocation(this.program, "aColor")

        // Get all uniforms locations
        // This will allow to set the values from the javascript code with the gl.uniform function
        // this.uniforms.color = getUniformLocation(this.program, "uColor")
    }

    initGeometry() {
        this.vertexBufferBPE = this.coords.BYTES_PER_ELEMENT
        this.vertexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.coords, gl.STATIC_DRAW)

        const buildIndices = []
        for(let i = 0; i < this.sides; i++) {
            const isLastIteration = i === this.sides - 1
            buildIndices.push(
                0,
                i + 1,
                isLastIteration ? 1 : i + 2
            )
        }
        const indices = new Uint8Array(buildIndices)
        this.indexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
    }

    draw() {
        gl.useProgram(this.program)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)

        const stride = 5 * this.vertexBufferBPE
        gl.vertexAttribPointer(this.attributes.position,
            2,
            gl.FLOAT,
            false,
            stride,
            0
        )
        gl.vertexAttribPointer(this.attributes.color,
            3,
            gl.FLOAT,
            false,
            stride,
            2 * this.vertexBufferBPE
        )
        gl.enableVertexAttribArray(this.attributes.position)
        gl.enableVertexAttribArray(this.attributes.color)

        // gl.vertexAttribPointer(this.attributes.color, 3, gl.FLOAT, false, 0, 2)
        // gl.enableVertexAttribArray(this.attributes.color)
        // gl.uniform3fv(this.uniforms.color, this.color)

        gl.drawElements(gl.TRIANGLES, 3 * this.sides, gl.UNSIGNED_BYTE, 0)
    }
}

function init() {
    const canvas = document.getElementById("canvas")
    window.gl = WebGLUtils.setupWebGL(canvas)
    console.log(gl)

    // Set the default value of the color buffer
    gl.clearColor(0.0, 0.0, 0.0, 1.0)

    // Clear the color buffer at init to clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT)
}

/*
 * Draw all the points stored in the array
 */
function draw() {
    // Clear the color buffer before drawing all the points
    gl.clear(gl.COLOR_BUFFER_BIT)

    const poly = new Polygon(0.5, 6)
    poly.draw()
    // const triangle2 = new Triangle(0.2, [0, 0, 1])
    // triangle2.draw()

}

init()
draw(0)
