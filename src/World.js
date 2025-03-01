// Vertex shader program
//--------------------------------------------------------------------------------
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() { 
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position; 
    v_UV = a_UV; 
  }`

// Fragment shader program
//--------------------------------------------------------------------------------
var FSHADER_SOURCE = ` 
  precision mediump float; 
  varying vec2 v_UV;
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
    
    //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>
  
    //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}

//UI globals
//--------------------------------------------------------------------------------
let g_selectedColor = [1,1,1,1];
let g_globalX = 0;
let g_globalY = 0;
let g_neckAngle = 0;
let g_headAngle = 0;
let g_legAngle = 0;
let g_animation = false;
let g_fov = 50;


//html ui
//--------------------------------------------------------------------------------
function addActionsforHtmlUI(){

    document.getElementById('on').onclick = function(){
        g_animation = true;
    };
    document.getElementById('off').onclick = function(){
        g_animation = false;
        g_hatAngle = 0;
        g_headAngle = 0;
        g_neckAngle = 0;
        g_legAngle = 0;
    };
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
let g_mouseDown = false;
let g_lastX = 0;
let g_lastY = 0;
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

    //look around
    canvas.onmousemove = function(ev){
        look(ev);
    }

    initTextures();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 1, 1.0);
    //renderAllShapes();
    
    requestAnimationFrame(tick);
}

//mouse movement
//--------------------------------------------------------------------------------
function convertCoordinatesEventToGL(ev){
    var x = ev.clientX; 
    var y = ev.clientY; 
    var rect = ev.target.getBoundingClientRect() ;
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    return [x,y];
}
 
function look(ev){
    coords = convertCoordinatesEventToGL(ev);
    if(coords[0] < 0.5){ 
       g_camera.panLeft(coords[0]*-5);
    } else{
       g_camera.panRight(coords[0]*-5);
    }
}

//add/delete blocks
//--------------------------------------------------------------------------------
function placeBlock(){
    let xPos = g_camera.eye.elements[0]; 
    let zPos = g_camera.eye.elements[2]; 
    let x = Math.round(xPos + 16);
    let y = Math.round(zPos + 16); 
    if (x >= 0 && x < 32 && y >= 0 && y < 32) {
        g_map[y][x] += 1; 
        renderScene();
    } 
}

function deleteBlock(){
    let xPos = g_camera.eye.elements[0]; 
    let zPos = g_camera.eye.elements[2]; 
    let x = Math.round(xPos + 16);
    let y = Math.round(zPos + 16); 
    if (x >= 0 && x < 32 && y >= 0 && y < 32) {
        if(g_map[y][x] != 0){
            g_map[y][x] -= 1
        } 
        renderScene();
    } 
}

//map stuff
//--------------------------------------------------------------------------------
var g_map=[
    [2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, , 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 ];

function drawMap(){
    for(x=0; x<32; x++){
        for(y=0; y<32; y++){
            let height = g_map[y][x]; 
            if(height > 0){ 
                for(let h = 0; h < height; h++){ 
                    var block = new Cube();
                    block.color = [0,0,0,1]; 
                    block.textureNum = -3;
                    block.matrix.translate(x - 16, h - .75, y - 16); // Stack blocks upwards
                    //block.matrix.scale(0.4, 0.4, 0.4);
                    block.renderfast();
                }
            }
        }
    }
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
    
    //c
    }else if(ev.keyCode == 67){
        placeBlock();
    //x
    }else if(ev.keyCode == 88){
        deleteBlock();
    }
    renderScene();
}

//animation
//--------------------------------------------------------------------------------
var g_startTime = performance.now()/1000
var g_seconds = performance.now()/1000-g_startTime;

//tick
function tick(){

    g_seconds = performance.now()/1000-g_startTime;

    updateAnimationAngles();

    renderScene();

    requestAnimationFrame(tick);

}

//animation angles
function updateAnimationAngles(){

    if(g_animation){

        g_neckAngle = 10*Math.sin(g_seconds);

        g_headAngle = 5*Math.sin(g_seconds);

        g_legAngle = 20*Math.sin(g_seconds);
    }
}

//shape list
var g_shapesList = [];
var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes = [];

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

    //blocks
    drawMap();

    //floor
    var floor = new Cube();
    floor.color = [0.8,0.8,0.8,1];
    floor.textureNum = -2;
    floor.matrix.translate(0,-.75,0);
    floor.matrix.scale(32,0,32);
    floor.matrix.translate(-.5,0,-.5);
    floor.renderfast();

    //sky
    var sky = new Cube();
    sky.color[1,0,0,1];
    sky.textureNum = 0;
    sky.matrix.scale(50,50,50);
    sky.matrix.translate(-.5,-.5,-.5);
    sky.renderfast();

    //body
    var body = new Cube();
    body.color = [.9, .9, 1, 1];
    //body.textureNum = 0;
    body.matrix.translate(-.25, -.3, 0);
    body.matrix.scale(0.45,.5,.5);
    body.renderfast();
    //tail
    var tail = new Cube();
    tail.color = [1, 1, 1, 1];
    tail.matrix.translate(-.37, -.1, -.05);
    tail.matrix.scale(0.45,.27,.6);
    tail.renderfast();
    //neck
    var neck = new Cube();
    neck.color = [1, 1, 1, 1];
    neck.matrix.rotate(g_neckAngle,0,0,1)

    //if(g_animation){
        //neck.matrix.rotate(10*Math.sin(g_seconds),0,0,1)
    //}else{
        //neck.matrix.rotate(g_neckAngle, 0, 0, 1);
    //}
    
    neck.matrix.translate(.1, -.2, .125);
    neck.matrix.scale(.2, .7 , .25);
    neck.renderfast();

    var neckCoordsMat = new Matrix4(neck.matrix);
    //head
    var head = new Cube();
    head.color = [.9, .9, 1, 1];
    head.matrix = new Matrix4(neckCoordsMat);
    head.matrix.translate(0, 1, 0);
    head.matrix.scale(1.2, .35 , 1);
    head.matrix.rotate(g_headAngle, 0, 0, 1);
    head.renderfast();

    var headCoordsMat = new Matrix4(head.matrix);
    
    //beak1
    var beak1 = new Cube();
    beak1.color = [1, 0.3, 0, 1];
    beak1.matrix = new Matrix4(headCoordsMat);
    beak1.matrix.translate(1, .1, .25);
    beak1.matrix.scale(.2, .7 , .5);
    beak1.renderfast();
    //beak2
    var beak2 = new Cube();
    beak2.color = [1, 0.3, 0, 1];
    beak2.matrix = new Matrix4(headCoordsMat);
    beak2.matrix.translate(1.2, .1, .25);
    beak2.matrix.scale(.2, .4 , .5);
    beak2.renderfast();
    //eye1
    var eye1 = new Cube();
    eye1.color = [0, 0, 0, 1];
    eye1.matrix = new Matrix4(headCoordsMat);
    eye1.matrix.translate(.5, .3, -.1);
    eye1.matrix.scale(.3, .3 , .2);
    eye1.renderfast();
    //eye2
    var eye2 = new Cube();
    eye2.color = [0, 0, 0, 1];
    eye2.matrix = new Matrix4(headCoordsMat);
    eye2.matrix.translate(.5, .3, .9);
    eye2.matrix.scale(.3, .3 , .2);
    eye2.renderfast();

    //leg1
    var leg1 = new Cube();
    leg1.color = [1, 0.3, 0, 1];
    leg1.matrix.rotate(g_legAngle, 0, 0, 1);
    leg1.matrix.translate(-.1, -.5, .1);
    leg1.matrix.scale(.1, .3 , .1);
    leg1.renderfast();

    var leg1CoordsMat = new Matrix4(leg1.matrix);

    //foot1
    var foot1 = new Cube();
    foot1.color = [1, 0.3, 0, 1];
    foot1.matrix = new Matrix4(leg1CoordsMat);
    foot1.matrix.translate(0, 0, 0);
    foot1.matrix.scale(2, .2 , 1);
    foot1.renderfast();

    //leg
    var leg2 = new Cube();
    leg2.color = [1, 0.3, 0, 1];
    leg2.matrix.rotate(-g_legAngle, 0, 0, 1);
    leg2.matrix.translate(-.1, -.5, .3);
    leg2.matrix.scale(.1, .3 , .1);
    leg2.renderfast();

    var leg2CoordsMat = new Matrix4(leg2.matrix);
    
    //foot2
    var foot2 = new Cube();
    foot2.color = [1, 0.3, 0, 1];
    foot2.matrix = new Matrix4(leg2CoordsMat);
    foot2.matrix.translate(0, 0, 0);
    foot2.matrix.scale(2, .2 , 1);
    foot2.renderfast();

    var duration = performance.now() - startTime;
    sendTextToHtml( " ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), "fpsDisplay");

}

function sendTextToHtml(text, htmlID){

    var htmlElm = document.getElementById(htmlID);

    htmlElm.innerHTML = text;

}



