
/*
 * Draw points under mouse clicks
 *
 * When the center of the point is on the left half of the canvas, the points is red
 * When the center of the point is on the right half of the canvas, the points is blue
 */
// Use only one global context object to keep code clear
let points = []

class Point
{
    constructor(x, y, size, color)
    {
        /*
         * Use the 2D clip space coordinate to create the point
         * It will be used to set the vertex shader position attribute
         */
        this.x = x
        this.y = y

        this.size = size
        this.color = color

        this.program = null
        this.attributes = {}
        this.uniforms = {}

        this.initProgram()
    }

    static get vertexShader()
    {
        return WebGLShaderUtils.shaderArrayToString([
            "attribute vec2 aPosition;",
            "attribute float aPointSize;",
            "",
            "void main()",
            "{",
            // gl_Position is a vec4 value in clip space (-1 .. +1)
            "   gl_Position = vec4(aPosition, 0.0, 1.0);",

            // gl_PointSize should be set with a value in pixels
            "   gl_PointSize = aPointSize;",
            "}"
        ])
    }

    static get fragmentShader()
    {
        return WebGLShaderUtils.shaderArrayToString([
            "precision mediump float;",
            "",
            "uniform vec3 uColor;",
            "",
            "void main()",
            "{",
            // The fragment color has 4 channels (r, g, b, a)
            "   gl_FragColor = vec4(uColor, 1.0);",
            "}"
        ])
    }

    initProgram()
    {
        // Create the program with shader code
        this.program = WebGLShaderUtils.createProgram(gl, Point.vertexShader, Point.fragmentShader)

        // Use the program to allow access to attributes and uniforms location
        gl.useProgram(this.program)

        // Get all attributes locations
        // This will allow to set the values from the javascript code with the gl.vertexAttrib function
        this.attributes.position = getAttributeLocation(this.program, "aPosition")
        this.attributes.pointSize = getAttributeLocation(this.program, "aPointSize")

        // Get all uniforms locations
        // This will allow to set the values from the javascript code with the gl.uniform function
        this.uniforms.color = getUniformLocation(this.program, "uColor")
    }

    draw()
    {
        gl.useProgram(this.program)

        gl.vertexAttrib2f(this.attributes.position, this.x, this.y)
        gl.vertexAttrib1f(this.attributes.pointSize, this.size)
        gl.uniform3fv(this.uniforms.color, this.color)

        gl.drawArrays(gl.POINTS, 0, 1)
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
function drawPoints()
{
    // Clear the color buffer before drawing all the points
    gl.clear(gl.COLOR_BUFFER_BIT)

    points.forEach(point => {
        point.draw()
    })
}

/*
 * Click handler
 * Convert mouse click coordinates from the canvas space into clip space
 * Don't draw the point directly, the color buffer flush have lose previous
 * draw calls. Store the point and draw the whole array in a row instead
 */
function click(event)
{
    const rect = event.target.getBoundingClientRect()

    let xClip = (2 * (event.clientX - rect.left) / rect.width) - 1
    let yClip = -((2 * (event.clientY - rect.top) / rect.height) - 1)

    /*
     * Set the uniform color value for the fragment shader depending on the
     * x-axis value, red points on the left half, blue points on the right half
     */
    let color = xClip < 0 ? [1.0, 0.0, 0.0] : [0.0, 0.0, 1.0]
    let point = new Point(xClip, yClip, 10, color)

    // Store the new point in the points array
    points.push(point)

    // Draw the whole set of points
    drawPoints()
}

init()
canvas.onmouseup = click
