import './style.css'
import WebGLShaderUtils from './lib/webgl-shader-utils'
import WebGLHelpers from './lib/webgl-helpers'
import WebGLUtils from './lib/webgl-utils'
/*
            * Draw points under mouse clicks
            *
            * When the center of the point is on the left half of the canvas, the points is red
            * When the center of the point is on the right half of the canvas, the points is blue
            */

// Keep the WebGL context global to make code easier to read
let gl

// Use only one global context object to keep code clear
let points = []

class Point
{
    private x: number;
    private y: number;
    private size: number;
    private color: Array<number>;
    private program: WebGLProgram;
    private attributes: any;
    private uniforms: any;

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
        this.attributes.position = WebGLHelpers.getAttributeLocation(this.program, "aPosition")
        this.attributes.pointSize = WebGLHelpers.getAttributeLocation(this.program, "aPointSize")

        // Get all uniforms locations
        // This will allow to set the values from the javascript code with the gl.uniform function
        this.uniforms.color = WebGLHelpers.getUniformLocation(this.program, "uColor")
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
    const canvas: HTMLCanvasElement = document.querySelector("#canvas")
    gl = canvas.getContext('webgl')

    // Set the default value of the color buffer
    gl.clearColor(0.0, 0.0, 0.0, 1.0)

    // Clear the color buffer at init to clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT)
    return canvas
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

const canvas = init()
canvas.onmouseup = click
