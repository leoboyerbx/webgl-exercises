import vertexShader from './shaders/vertexShader.glsl'
import fragmentShader from './shaders/fragmentShader.glsl'

class Triangle
{
    constructor(size, color)
    {
        this.coords = new Float32Array([
             0, size,       1, 0, 0,
            -size, -size,   0, 1, 0,
             size, -size,   0, 0, 1,
        ])

        this.color = color

        this.program = null
        this.attributes = {
            position : null,
            color : null,
        }
        this.uniforms = {
            animation: null
        }
        this.animation = 0

        this.vertexBuffer = null

        this.initProgram()
        this.initGeometry()
    }

    setAnimation(a) {
        this.animation = a
        gl.uniform1f(this.uniforms.animation, this.animation)
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
        this.attributes.color = getAttributeLocation(this.program, "aColor")
        this.uniforms.animation = getUniformLocation(this.program, "uAnimation")

        // Get all uniforms locations
        // This will allow to set the values from the javascript code with the gl.uniform function
        // this.uniforms.color = getUniformLocation(this.program, "uColor")
    }

    initGeometry() {
        this.vertexBufferBPE = this.coords.BYTES_PER_ELEMENT
        this.vertexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.coords, gl.STATIC_DRAW)
    }

    draw()
    {
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
let triangle
function draw()
{
    // Clear the color buffer before drawing all the points

    /**
     *  Si Pi -> un demi tour donc 5 secondes pour un aller
     *  Si PI * 2 -> un tour donc 5 secondes pour un aller retour
     */
    // console.log(lum)
    triangle = new Triangle(0.5, [1, 0, 0])
    // const triangle2 = new Triangle(0.2, [0, 0, 1])
    // triangle2.draw()
    loop()
}
function loop() {
    gl.clear(gl.COLOR_BUFFER_BIT)
    const lum = Math.sin((Date.now() * Math.PI * 2) / 5000) * 0.5 + 0.5
    triangle.setAnimation(lum)
    triangle.draw()
    requestAnimationFrame(loop)
}
init()
draw(0)
