import dat from'dat.gui'
import vertexShader from './shaders/vertexShader.glsl'
import fragmentShader from './shaders/fragmentShader.glsl'
/*
 * Draw a triangle and apply transforms values with a GUI
 * in clip space (translate and scale)
 */

// Keep the WebGL context global to make code easier to read

// Use only one global context object to keep code clear
let context = {
    triangle: null,
    animation:
        {
            period: 10,
            phase: 0
        },
    paramsDef: null,
    params: null,
    gui: null
}

/*
 * Graphical User In terface params class
 * Define params to control runtime properties
 */
context.paramsDef = class {
    constructor() {
        this.scale = 1
        this.translateX = 0
        this.translateY = 0
    }
}

/*
 * Create GUI and params instances
 * Setup the interface with property association
 */
context.params = new context.paramsDef()
context.gui = new dat.GUI()

let transform = context.gui.addFolder("Clip space transform")
transform.open()
transform.add(context.params, 'scale', 0.01, 2)
transform.add(context.params, 'translateX', -1, 1)
transform.add(context.params, 'translateY', -1, 1)

/*
 * Triangle class
 * Implement API methods to set scale and position in clip space
 */
class Triangle
{
    constructor(color)
    {
        this.color = color

        /*
         * Program and shaders definitions
         */
        this.program = null
        this.uniforms = {}
        this.attributes = {}

        /*
         * Geometry definitions
         */
        this.vertexBuffer = null

        /*
         * Init program and geometry
         */
        this.initProgram()
        this.initGeometry()

        /*
         * Transform definition
         */
        this.transform = {
            scale: 1,
            position: new Vector2D(0, 0)
        }
    }

    static get vertexShader()
    {
        return vertexShader
    }

    static get fragmentShader()
    {
        return fragmentShader
    }

    initProgram()
    {
        // Create the program with shader code
        this.program = WebGLShaderUtils.createProgram(gl, Triangle.vertexShader, Triangle.fragmentShader)

        // Use the program to allow access to attributes and uniforms location
        gl.useProgram(this.program)

        // Get all attributes locations
        this.attributes.position = WebGLHelpers.getAttributeLocation(this.program, "aPosition")

        // Get all uniforms locations
        this.uniforms.color = WebGLHelpers.getUniformLocation(this.program, "uColor")

        this.uniforms.scale = WebGLHelpers.getUniformLocation(this.program, "uScale")

        this.uniforms.translate = WebGLHelpers.getUniformLocation(this.program, "uTranslate")
    }

    initGeometry()
    {
        // Positions definition (2D clip space)
        const positions = new Float32Array([
            -0.5, -0.5,
            0.0,  0.5,
            0.5, -0.5
        ]);

        // Create the vertex buffer
        this.vertexBuffer = gl.createBuffer()

        // Bind the new buffer to the ARRAY BUFFER
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)

        // Set positions data into the buffer
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
    }

    /*
     * Set scale value (clip space)
     */
    setScale(scale)
    {
        this.transform.scale = scale
    }

    /*
     * Set translate position (clip space)
     */
    setPosition(x, y)
    {
        this.transform.position.x = x
        this.transform.position.y = y
    }

    beforeDraw()
    {
        // Use the program
        gl.useProgram(this.program)

        // Bind the vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)

        // Define how the position attribute will be read into the buffer
        gl.vertexAttribPointer(this.attributes.position, 2, gl.FLOAT, false, 0, 0)

        // Enable the position attribute
        gl.enableVertexAttribArray(this.attributes.position)

        // Set transform values (clip space) with uniforms
        // ..
        gl.uniform2fv(this.uniforms.translate, this.transform.position.toArray())
        gl.uniform1f(this.uniforms.scale, this.transform.scale)

        // Set color
        gl.uniform3fv(this.uniforms.color, this.color)
    }

    draw()
    {
        this.beforeDraw()

        gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
}


/*
 * Init GL context and setup the scene
 */
function init()
{
    let canvas = document.getElementById("canvas")
    window.gl = WebGLUtils.setupWebGL(canvas)

    gl.clearColor(0.0, 0.0, 0.0, 1.0)

    context.triangle = new Triangle([0.8, 0.2, 0.0])
}

/*
 * Animation loop
 * Called once per frame
 *
 * Schedule next frame
 * Update the current state
 * Call render routine
 */
function animate()
{
    // Schedule next frame
    window.requestAnimationFrame(animate)

    // Update phase for animation (ramp from 0 to 1 during the period interval)
    context.animation.phase = ((Date.now() / 1000) % context.animation.period) / context.animation.period

    // Update the triangle position and scale from context params
    // ..
    context.triangle.setPosition(context.params.translateX, context.params.translateY)
    context.triangle.setScale(context.params.scale)

    render()
}

/*
 * Render routine, draw everything
 */
function render()
{
    // Clear the frame buffer
    gl.clear(gl.COLOR_BUFFER_BIT)

    // Draw the triangle
    context.triangle.draw()
}

init()
animate()
