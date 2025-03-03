// Vertex shader program
//--------------------------------------------------------------------------------
var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_VertPos;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_NormalMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
        v_Normal = a_Normal;
        v_VertPos = u_ModelMatrix * a_Position;
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
    uniform vec3 u_lightPos;
    uniform vec3 u_cameraPos;
    varying vec4 v_VertPos;
    uniform bool u_lightOn;
    uniform bool u_spotlightOn;

    uniform vec3 u_ambientColor;

    uniform vec3 u_spotlightPos;  
    uniform vec3 u_spotlightDir;  
    uniform float u_spotlightAngle; 


    void main() {

        if(u_whichTexture == -2){                       //color
            gl_FragColor = u_FragColor;
        }else if(u_whichTexture == -1){                 //uv debug
            gl_FragColor = vec4(v_UV,1,1);
        }else if(u_whichTexture == 0){                  //texture 1
            gl_FragColor = texture2D(u_Sampler0, v_UV);  
        }else if(u_whichTexture == -3){                 //texture 2
            gl_FragColor = texture2D(u_Sampler1, v_UV); 
        }else if(u_whichTexture == 3){                  //normals
            gl_FragColor = vec4( (v_Normal + 1.0)/2.0, 1.0);
        }else{                                          //default color
            gl_FragColor = vec4(1,.2,.2,1);
        }
        
        vec3 objectColor = vec3(gl_FragColor);

        //normalize
        vec3 N = normalize(v_Normal);
        vec3 E = normalize(u_cameraPos - vec3(v_VertPos)); // Camera direction

        //ambient
        vec3 ambient = objectColor * u_ambientColor;  

        //default light
        vec3 normalLightColor = vec3(0.0);

        if(u_lightOn){

            vec3 L = normalize(u_lightPos - vec3(v_VertPos));

            //N dot L
            float nDotL = max(dot(N, L), 0.0);

            //reflect
            vec3 R = reflect(-L, N);

            //sepcular
            float specular = pow(max(dot(E, R), 0.0), 50.0) * 0.5;

            //diffuse
            vec3 diffuse = objectColor * nDotL * 0.7;

            //ambiant
            //vec3 ambient = objectColor * u_ambientColor;

            //final color
            normalLightColor = diffuse + specular;
        }

        //spotlight
        vec3 spotlightColor = vec3(0.0);

        if(u_spotlightOn){

            //w
            vec3 w = normalize(vec3(v_VertPos) - u_spotlightPos);

            //w dot d
            float spotlightFactor = dot(w, normalize(-u_spotlightDir));

            //if w dot d  > cos theta
            if (spotlightFactor > cos(radians(u_spotlightAngle))){ 

                vec3 spotlightVector = normalize(u_spotlightPos - vec3(v_VertPos));
                float spotlightDot = max(dot(N, spotlightVector), 0.0);
                vec3 spotlightReflection = reflect(-spotlightVector, N);
                float spotlightSpecular = pow(max(dot(E, spotlightReflection), 0.0), 50.0) * 0.5;

                vec3 spotlightDiffuse = objectColor * spotlightDot * 0.5;
                //vec3 spotlightAmbient = objectColor * u_ambientColor * 0.3; 

                spotlightColor = spotlightDiffuse + spotlightSpecular;
            }
        }

        //final color
        vec3 finalColor = ambient + normalLightColor + spotlightColor;

        if (u_whichTexture == -2 || u_whichTexture == 3) {
            gl_FragColor = vec4(finalColor, 1.0);
        }else{
            gl_FragColor = vec4(finalColor, 1.0);
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
let u_lightPos;
let u_cameraPos;
let u_lightOn;
let u_spotlightOn;
let u_ambientColor;

let u_spotlightPos;
let u_spotlightDir;
let u_spotlightAngle;

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
    //light pos
    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_lightPos) {
      console.log('Failed to get the storage location of u_lightPos');
      return false;
    }
    //camera pos
    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos) {
      console.log('Failed to get the storage location of u_cameraPos');
      return false;
    }
    //light on
    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    if (!u_lightOn) {
      console.log('Failed to get the storage location of u_cameraPos');
      return false;
    }
    //spotlight on
    u_spotlightOn = gl.getUniformLocation(gl.program, 'u_spotlightOn');
    if (!u_spotlightOn) {
      console.log('Failed to get the storage location of u_spotlighton');
      return false;
    }
    //ambient color
    u_ambientColor = gl.getUniformLocation(gl.program, 'u_ambientColor');
    if (!u_ambientColor) {
      console.log('Failed to get the storage location of u_ambientcolor');
      return false;
    }

    //spotlight pos
    u_spotlightPos = gl.getUniformLocation(gl.program, 'u_spotlightPos');
    if (!u_spotlightPos) {
      console.log('Failed to get the storage location of u_spotlightPos');
      return false;
    }
    //spotlight dir
    u_spotlightDir = gl.getUniformLocation(gl.program, 'u_spotlightDir');
    if (!u_spotlightDir) {
      console.log('Failed to get the storage location of u_spotlightdir');
      return false;
    }
    //spotlight angle
    u_spotlightAngle = gl.getUniformLocation(gl.program, 'u_spotlightAngle');
    if (!u_spotlightAngle) {
      console.log('Failed to get the storage location of u_spotlightangle');
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
let g_lightPos = [0,1,2];
let g_lightOn = true;

let g_spotlightOn = true;
let g_spotlightPos = [-2,1,1.5];
let g_spotlightDir = [0, 0, 1];   
let g_spotlightAngle = 30.0;

let g_ambientColor = [0.3, 0.3, 0.3];

//color picker helper func
//--------------------------------------------------------------------------------
function convert(hex){
    let bigint = parseInt(hex.substring(1), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

//html ui
//--------------------------------------------------------------------------------
function addActionsforHtmlUI(){

    document.getElementById('normalOn').onclick = function() {g_normalOn = true; renderScene();};
    document.getElementById('normalOff').onclick = function() {g_normalOn = false; renderScene();};

    document.getElementById('lightOn').onclick = function() {g_lightOn = true; renderScene();};
    document.getElementById('lightOff').onclick = function() {g_lightOn = false; renderScene();};

    document.getElementById('spotlightOn').onclick = function() {g_spotlightOn = true; renderScene();};
    document.getElementById('spotlightOff').onclick = function() {g_spotlightOn = false; renderScene();};

    document.getElementById('color').addEventListener('input', function() {
        let hexColor = this.value; 
        let rgb = convert(hexColor); 
        g_ambientColor = [rgb.r / 255, rgb.g / 255, rgb.b / 255]; 
        renderScene();
    });

    document.getElementById('lightX').addEventListener('mousemove', function(){
        g_lightPos[0] = this.value/100;
        renderScene();
    })
    document.getElementById('lightY').addEventListener('mousemove', function(){
        g_lightPos[1] = this.value/100;
        renderScene();
    })
    document.getElementById('lightZ').addEventListener('mousemove', function(){
        g_lightPos[2] = this.value/100;
        renderScene();
    })
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
    //renderScene();
    requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;


function tick(){   

    g_seconds = performance.now()/1000.0 - g_startTime;

    updateAnimationAngles();

    renderScene();

    requestAnimationFrame(tick);

}


function updateAnimationAngles(){

    g_lightPos[0] = 2.3*Math.cos(g_seconds);


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

    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
    gl.uniform1i(u_lightOn, g_lightOn);

    gl.uniform3f(u_spotlightPos, g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
    gl.uniform3f(u_spotlightDir, g_spotlightDir[0], g_spotlightDir[1], g_spotlightDir[2]);
    gl.uniform1f(u_spotlightAngle, g_spotlightAngle);
    gl.uniform1i(u_spotlightOn, g_spotlightOn);

    gl.uniform3f(u_ambientColor, g_ambientColor[0], g_ambientColor[1], g_ambientColor[2]);

    //objects
    var box = new Cube();
    box.color = [1,0,0,1];
    if(g_normalOn) box.textureNum = 3;
    box.matrix.translate(0,-2,-.5);
    box.render();

    var c = new Sphere();
    if(g_normalOn) c.textureNum = 3;
    c.matrix.translate(-1.5,-1.5,0);
    c.render();

    //light
    var light = new Cube();
    light.color =[2,2,0,1];
    light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(-.1,-.1,-.1);
    light.matrix.translate(-.5,-5,-.5);
    light.render();


    //spotlight
    var spotlight = new Cube();
    spotlight.color =[2,1,0,1];
    spotlight.matrix.translate(g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
    spotlight.matrix.scale(-.1,-.1,-.1);
    spotlight.matrix.translate(-.5,-5,-.5);
    spotlight.render();

    //floor
    var floor = new Cube();
    floor.color = [0.8,0.8,0.8,1];
    floor.textureNum = -2;
    floor.matrix.translate(0,-.75,0);
    floor.matrix.scale(32,32,32);
    floor.matrix.translate(-.5,-.1,-.5);
    floor.render();

    //sky
    var sky = new Cube();
    sky.color = [0.5, 0.5, 0.5, 1];  
    if(g_normalOn) sky.textureNum = 3;
    sky.matrix.scale(-10,-10,-10);
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



