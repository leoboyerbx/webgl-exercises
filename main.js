import vertexShader from './shaders/vertexShader.glsl'
import fragmentShader from './shaders/fragmentShader.glsl'

class Triangle
{
    constructor(size, color)
    {
        this.coords = new Float32Array([
             0, size,
            -size, -size,
             size, -size
        ])

        this.color = color

        this.program = null
        this.attributes = {}
        this.uniforms = {}

        this.vertexBuffer = null

        this.initProgram()
        this.initGeometry()
    }

    initProgram()
    {
        // Create the program with shader code
        this.program = WebGLShaderUtils.createProgram(gl, vertexShader, fragmentShader)

        // Use the program to allow access to attributes and uniforms location
        gl.useProgram(this.program)

        // Get all attributes locations
        // This will allow to set the values from the javascript code with the gl.vertexAttrib function
        this.attributes.position = getAttributeLocation(this.program, "aPosition")

        // Get all uniforms locations
        // This will allow to set the values from the javascript code with the gl.uniform function
        this.uniforms.color = getUniformLocation(this.program, "uColor")
    }

    initGeometry() {
        this.vertexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.coords, gl.STATIC_DRAW)
    }

    draw()
    {
        gl.useProgram(this.program)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)

        gl.vertexAttribPointer(this.attributes.position, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(this.attributes.position)

        gl.uniform3fv(this.uniforms.color, this.color)

        gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
}

function init()
{
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
function draw()
{
    // Clear the color buffer before drawing all the points
    gl.clear(gl.COLOR_BUFFER_BIT)

    const triangle = new Triangle(0.5, [1, 0, 0])
    triangle.draw()
    const triangle2 = new Triangle(0.2, [0, 0, 1])
    triangle2.draw()

}
init()
draw(0)
