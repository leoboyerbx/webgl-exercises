import dat from'dat.gui'
import { Matrix4 } from 'three'
import vertexShader from './shaders/vertexShader.glsl'
import fragmentShader from './shaders/fragmentShader.glsl'
/*
 * Draw a triangle and apply transforms values with a GUI
 * in clip space (translate and scale)
 */

// Keep the WebGL context global to make code easier to read

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
        this.rotation = 0
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
transform.add(context.params, 'scale', 0.1, 1)
transform.add(context.params, 'translateX', -0.5, 0.5)
transform.add(context.params, 'translateY', -0.5, 0.5)
transform.add(context.params, 'rotation', 0, 360, 1);

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
         * Transform object and matrix
         */
        this.transformMatrix = null

        this.transform = {
            scale: 0,
            position: new Vector2D(0, 0),
            rotation: 0
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

        this.uniforms.transformMatrix = WebGLHelpers.getUniformLocation(this.program, "uTransform")
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
     * Set rotation value (degrees)
     */
    setRotation(angleDeg)
    {
        this.transform.rotation = Math.PI * angleDeg / 180
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

    /*
     * Update transform matrix
     */
    updateTransformMatrix()
    {
        // Compute and assign this.transformMatrix

        // Create a matrix for each transformation: scaling, rotation, translation
        // const elements = new Float32Array([
        //     a00, a10, a20, a30,
        //     a01, a11, a21, a31,
        //     a02, a12, a22, a32,
        //     a03, a13, a23, a33
        //  ])


        // Create a scaling matrix
        // ...
        const scaleMatrix = new Matrix4().makeScale(
            this.transform.scale,
            this.transform.scale,
            this.transform.scale
        )

        // Compute rotation with
        // ...
        const rotationMatrix = new Matrix4().makeRotationZ(this.transform.rotation)

        // Compute translation with
        // ..
        const translationMatrix = new Matrix4().makeTranslation(
            this.transform.position.x,
            this.transform.position.y,
            0
        )

        // Compute the product of the 3 matrices with following syntax
        // return matrixC.multiply(matrixB).multiply(matrixA);
        // Remember: matrix product is not commutative

        console.log(translationMatrix)
        this.transformMatrix = translationMatrix
            .multiply(rotationMatrix)
            .multiply(scaleMatrix)
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

        // Compute and set the transform matrix uniform
        // ..
        this.updateTransformMatrix()
        gl.uniformMatrix4fv(this.uniforms.transformMatrix, false, this.transformMatrix.elements)
        // ..

        // Set the color
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

    context.triangle = new Triangle([0.8, 0.2, 0.0], false)
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

    // Update the triangle transform with rotation, position and scale from GUI params
    context.triangle.setPosition(context.params.translateX, context.params.translateY)
    context.triangle.setScale(context.params.scale)
    context.triangle.setRotation(context.params.rotation)

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
