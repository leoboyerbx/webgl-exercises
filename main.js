import vertexShader from './shaders/vertexShader.glsl'
import fragmentShader from './shaders/fragmentShader.glsl'

class Rectangle {
    constructor(width, height, color) {
        this.coords = new Float32Array([
            -width, height, 1, 0, 0,
            -width, -height, 0, 1, 0,
            width, -height, 0, 0, 1,
            width, height, 1, 1, 1,
        ])

        this.color = color

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

        const indices = new Uint8Array([0, 1, 3, 1, 3, 2])
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

        const colorIndices = new Uint8Array([0, 1, 3, 1, 3, 2])
        this.colorBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.colorBuffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, colorIndices, gl.STATIC_DRAW)
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

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0)
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

    const triangle = new Rectangle(0.8, 0.6, [1, 0, 0])
    triangle.draw()
    // const triangle2 = new Triangle(0.2, [0, 0, 1])
    // triangle2.draw()

}

init()
draw(0)
