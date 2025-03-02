// Vertex shader program
//--------------------------------------------------------------------------------
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() { 
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position; 
    v_UV = a_UV; 
    v_Normal = a_Normal;
  }`

// Fragment shader program
//--------------------------------------------------------------------------------
var FSHADER_SOURCE = ` 
  precision mediump float; 
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {

    if(u_whichTexture == -2){

        gl_FragColor = u_FragColor;

    }else if(u_whichTexture == -1){

        gl_FragColor = vec4(v_UV,1,1);

    }else if(u_whichTexture == 0){

        gl_FragColor = texture2D(u_Sampler0, v_UV);  

    }else if(u_whichTexture == -3){

        gl_FragColor = texture2D(u_Sampler1, v_UV); 

    }else if(u_whichTexture == 3){

        gl_FragColor = vec4( (v_Normal + 1.0)/2.0, 1.0);

    }else{
        gl_FragColor = vec4(1,.2,.2,1);
    }   
    
  }`

//GLSL global vars
//--------------------------------------------------------------------------------
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;
let texture0;
let texture1;

//setup webgl
//--------------------------------------------------------------------------------
function setupWebGL(){
    //get canvas elem
    canvas = document.getElementById('webgl', {preserveDrawingBuffer: true});
    //get rendering context for webgl
    gl = getWebGLContext(canvas);
    //on error
    if(!gl){
        console.log("failed to get rendering context for WebGL");
        return;
    }
    gl.enable(gl.DEPTH_TEST);
}

//connect GLSL vars
//--------------------------------------------------------------------------------
function connectVariablesToGLSL(){
    //init shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }
    //get storage pos of a_position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    //a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_uv');
        return;
    }
    //a_Normal
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
        console.log('Failed to get the storage location of a_Normal');
        return;
    }
    //u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }
    //u_modelMatrix
    u_ModelMatrix =gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_modelmatrix');
        return;
    }
    //u_GlobalRotateMatrix
    u_GlobalRotateMatrix =gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_globalrotatematrix');
        return;
    }
    //u_ViewMatrix
    u_ViewMatrix =gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_viewmatrix');
        return;
    }
    //u_ProjectionMatrix
    u_ProjectionMatrix =gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_projectionmatirix');
        return;
    }
    //u_Sampler0
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
      console.log('Failed to get the storage location of u_Sampler0');
      return false;
    }
    //u_Sampler1
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
      console.log('Failed to get the storage location of u_Sampler1');
      return false;
    }
    //u_whichTexture
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
      console.log('Failed to get the storage location of u_whichTexture');
      return false;
    }
    //indentity matrix
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

//init textures
//--------------------------------------------------------------------------------
function initTextures() {
    var image = new Image();  // Create the image object
    var image2 = new Image();  // Create the image object
    if (!image) {
      console.log('Failed to create the image object');
      return false;
    }
    // Register the event handler to be called on loading an image
    image.onload = function(){ loadTexture( image, "space"); };

    image2.onload = function(){ loadTexture( image2, "moon"); };
    // Tell the browser to load an image
    image.src = '../resources/space.jpg';
    image2.src = '../resources/moon.jpg';
    return true;
}

//load textures
//--------------------------------------------------------------------------------
function loadTexture( image, type) {
    var texture = gl.createTexture();   // Create a texture object

    if (!texture) {
      console.log('Failed to create the texture object');
      return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    
    if (type == "space") {
        gl.activeTexture(gl.TEXTURE0);  // Use Texture Unit 0
        texture0 = texture;
    } else if (type == "moon") {
        gl.activeTexture(gl.TEXTURE1);  // Use Texture Unit 1
        texture1 = texture;
    }
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // Set the texture unit 0 to the sampler
    if(type == "space"){
        gl.uniform1i(u_Sampler0, 0);
    }else if(type == "moon"){
        gl.uniform1i(u_Sampler1, 1);
    }

}

//UI globals
//--------------------------------------------------------------------------------
let g_selectedColor = [1,1,1,1];
let g_globalX = 0;
let g_globalY = 0;
let g_fov = 100;
let g_normalOn = false;


//html ui
//--------------------------------------------------------------------------------
function addActionsforHtmlUI(){

    document.getElementById('normalOn').onclick = function() {g_normalOn = true; renderScene();};
    document.getElementById('normalOff').onclick = function() {g_normalOn = false; renderScene();};

    document.getElementById('angleSlide').addEventListener('mousemove', function(){

        g_globalX = this.value;
        renderScene();

    });

    document.getElementById('fov').addEventListener('mousemove', function(){

        g_fov = this.value;
        g_camera.setFOV();
        renderScene();

    });

}

//camera and mouse vars
let g_camera;

//main
//--------------------------------------------------------------------------------
function main() {
    //set up webgl
    setupWebGL();
    //connect GLSL vars
    connectVariablesToGLSL();
    //HTML ui elements
    addActionsforHtmlUI();
    //camera
    g_camera = new Camera();
    //keyboard register
    document.onkeydown = keydown;
    initTextures();
    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 1, 1.0);
    //renderAllShapes();
    renderScene();
}


//keydown function
//--------------------------------------------------------------------------------
function keydown(ev){
    if(ev.keyCode == 81){
        //g_eye[0] += 0.1;
        g_camera.panLeft();
    }else if(ev.keyCode == 69){
        //g_eye[0] -= 0.1;
        g_camera.panRight();
    //w
    }else if(ev.keyCode == 87){
        g_camera.moveForward();
    //s
    }else if(ev.keyCode == 83){
        g_camera.moveBack();
    //a
    }else if(ev.keyCode == 65){
        g_camera.moveRight();
    //d
    }else if(ev.keyCode == 68){
        g_camera.moveLeft();
    }
    renderScene();
}




//camera control vars
var g_eye=[0,0,3];
var g_at=[0,0,-100];
var g_up=[0,1,0];

//renderScene function (render all shapes)
//--------------------------------------------------------------------------------
function renderScene(){

    //start time (for performance metrics)
    var startTime = performance.now();
    //projection matrix
    var projMat = g_camera.projMat;
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
    //view matrix
    var viewMat = g_camera.viewMat;
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
    //rotate matrix
    var globalRotMat = new Matrix4().rotate(g_globalX, 0, 1, 0).rotate(g_globalY, 1, 0, 0); 
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    //objects
    var box = new Cube();
    box.color = [1,0,0,1];
    if(g_normalOn) box.textureNum = 3;
    //box.textureNum = -2;
    box.matrix.translate(0,-.75,0);
    box.render();


    //floor
    var floor = new Cube();
    floor.color = [0.8,0.8,0.8,1];
    floor.textureNum = -2;
    floor.matrix.translate(0,-.75,0);
    floor.matrix.scale(32,32,32);
    floor.matrix.translate(-.5,0,-.5);
    floor.render();

    //sky
    var sky = new Cube();
    sky.color = [0.5, 0.7, 1, 1];  
    if(g_normalOn) sky.textureNum = 3;
    sky.matrix.scale(-20,-20,-20);
    sky.matrix.translate(-.5,-.5,-.5);
    sky.render();

    //fps counter
    var duration = performance.now() - startTime;
    sendTextToHtml( " ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), "fpsDisplay");

}

//fps counter
function sendTextToHtml(text, htmlID){

    var htmlElm = document.getElementById(htmlID);

    htmlElm.innerHTML = text;

}



