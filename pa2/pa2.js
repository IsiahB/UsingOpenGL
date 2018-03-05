/*
Name: Isiah Behner
Assignment: Programming Assignment 2
Course/Semester: CS 412 - Spring 2018
Instructor: Dr. Wolff
Sources consulted: Professor & classmates
Known Bugs: The loaded objects are not colored for some reason
*/

// The WebGL object, we keep this in the global scope.
var gl;

// The HTML canvas
var canvas;

// The current shape being drawn
var shape;

// Uniform variable locations
var uni = {
    uModel: null,
    uView: null,
    uProj: null,
    uColor: null
};

// The rotation axis and angles for animation
var axis = 0;
var angle = vec3.create();

/**
 * Initialize the WebGL context, load/compile shaders, and initialize our shapes.
 */
var init = function() {
    
    // Set up WebGL
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    // Set the viewport transformation
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Set the background color
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    
    // Enable the z-buffer
    gl.enable(gl.DEPTH_TEST);

    // Load and compile shaders
    program = Utils.loadShaderProgram(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Find the uniform variable locations
    uni.uModel = gl.getUniformLocation(program, "uModel");
    uni.uView = gl.getUniformLocation(program, "uView");
    uni.uProj = gl.getUniformLocation(program, "uProj");
    uni.uColor = gl.getUniformLocation(program, "uColor");

    // Initialize our shapes
    Shapes.init(gl);
    shape = Shapes.cube;  // Draw the cube by default

    // Init the event handlers
    initEventHandlers();

    // Start the animation sequence
    render();

    //rendering all of the objModel objects from files
    Promise.all([
        Obj.load(gl, "media/teapot/teapot.obj"),
        Obj.load(gl, "media/bob/bob_tri.obj"),
        Obj.load(gl, "media/bunny/bunny_med.obj")
    ]).then(function (values) {
        Shapes.teapot = values[0];
        Shapes.bob = values[1];
        Shapes.bunny = values[2];

        render();
    });
};

/**
 * Render the scene!
 */
var render = function() {
    // Request another draw
    window.requestAnimFrame(render, canvas);

    // Clear the color and depth buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    setupMatrices();

    // Draw our shape (green)
    shape.render(gl, uni, Float32Array.from([0,1,0]));
};

/** 
 * Initialize the event handlers for the buttons and the shape select.
 */
var initEventHandlers = function() {
    var xButton = document.getElementById("rotate-x");
    xButton.addEventListener("click", function() { axis = 0; });
    var yButton = document.getElementById("rotate-y");
    yButton.addEventListener("click", function() { axis = 1; });
    var zButton = document.getElementById("rotate-z");
    zButton.addEventListener("click", function() { axis = 2; });

    var shapeSelect = document.getElementById("shape-select");
    shapeSelect.addEventListener("change", function(evt) {
        var val = this.value;
        switch(val) {
            case "0":
                shape = Shapes.cube;
                break;
            // Add other shapes here.
            case "2": //added
                shape = Shapes.disk;
                break;
            case "3":
                shape = Shapes.cylinder;
                break;
            case "4":
                shape = Shapes.cone;
                break;
            case "5":
                shape = Shapes.teapot;
                break;
            case "6":
                shape = Shapes.bob;
                break;
            case "7":
                shape = Shapes.bunny;
                break;
        }
    });
};

/**
 * This function sets up the required transformation matrices to define a 
 * "camera", apply the rotation, and perform a perspective projection. 
 * For this assignment, you can ignore this function, we will learn the
 * details of all of this in class and in future assignments.
 */
var setupMatrices = function() {
    // Update angle
    angle[axis] += 0.01;
    if( angle[axis] > 2.0 * Math.PI ) angle[axis] -= 2.0 * Math.PI;

    var model = mat4.create();
    mat4.rotateX(model, model, angle[0]);
    mat4.rotateY(model, model, angle[1]);
    mat4.rotateZ(model, model, angle[2]);

    var view = mat4.create();
    var at = vec3.fromValues(0,0,0);
    var up = vec3.fromValues(0,1,0);
    var eye = vec3.fromValues(0,0,2.5);
    mat4.lookAt(view, eye, at, up);

    var proj = mat4.create();
    var aspect = canvas.width / canvas.height;
    mat4.perspective(proj, 60.0 * Math.PI / 180.0, aspect, 0.5, 100.0);

    gl.uniformMatrix4fv(uni.uModel, false, model);
    gl.uniformMatrix4fv(uni.uView, false, view);
    gl.uniformMatrix4fv(uni.uProj, false, proj);
};

// When the HTML document is loaded, call the init function.
window.addEventListener("load", init);