//triangle class
class Sphere{

    //class constructor
    constructor(){
        this.type = 'sphere';
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1,1,1,1];
        //this.sCount = g_selectedSegments;
        //this.size = 5;
        this.matrix = new Matrix4();
        //specify texture
        this.textureNum = -2;
    }

    render() {  
        var rgba = this.color;
        //specify which texture to use
        gl.uniform1i(u_whichTexture, this.textureNum);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
       
        //front
        drawTriangle3DUVNormal([0.0,1.0,0.0, 1.0,1.0,0.0, 0.0,0.0,0.0 ], [0,0, 1,0, 1,1], 
        [0,0,-1, 0,0,-1, 0,0,-1]);
        drawTriangle3DUVNormal([0.0,0.0,0.0, 1.0,0.0,0.0, 1.0,1.0,0.0 ], [0,1, 1,1, 0,0],
        [0,0,-1, 0,0,-1, 0,0,-1]);
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        //back
        drawTriangle3DUVNormal([0.0,1.0,1.0, 1.0,1.0,1.0, 0.0,0.0,1.0 ],[0,0, 1,0, 1,1],
        [0,1,0, 0,1,0, 0,1,0]);
        drawTriangle3DUVNormal([0.0,0.0,1.0, 1.0,0.0,1.0, 1.0,1.0,1.0 ],[0,1, 1,1, 0,0],
        [0,1,0, 0,1,0, 0,1,0]);
        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

        //top
        drawTriangle3DUVNormal([0.0,1.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0 ],[0,0, 1,0, 1,1],
        [1,0,0, 1,0,0, 1,0,0]);
        drawTriangle3DUVNormal([0.0,1.0,1.0, 0.0,1.0,0.0, 1.0,1.0,1.0 ],[0,0, 1,0, 1,1],
        [1,0,0, 1,0,0, 1,0,0]);
        gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);

        //bot
        drawTriangle3DUVNormal([0.0,0.0,0.0, 0.0,0.0,1.0, 1.0,0.0,0.0 ],[0,0, 1,0, 1,1],
        [-1,0,0, -1,0,0, -1,0,0]);
        drawTriangle3DUVNormal([1.0,0.0,0.0, 1.0,0.0,1.0, 0.0,0.0,1.0 ],[0,0, 1,0, 1,1],
        [-1,0,0, -1,0,0, -1,0,0]);
        gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);

        //left
        drawTriangle3DUVNormal([0.0,0.0,0.0, 0.0,1.0,0.0, 0.0,1.0,1.0 ],[0,0, 1,0, 1,1],
        [0,-1,0, 0,-1,0, 0,-1,0]);
        drawTriangle3DUVNormal([0.0,1.0,1.0, 0.0,0.0,0.0, 0.0,0.0,1.0 ],[0,1, 1,1, 0,0],
        [0,-1,0, 0,-1,0, 0,-1,0]);
        gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);

        //right
        drawTriangle3DUVNormal([1.0,0.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0 ],[0,0, 1,0, 1,1],
        [0,0,1, 0,0,1, 0,0,1]);
        drawTriangle3DUVNormal([1.0,1.0,1.0, 1.0,0.0,0.0, 1.0,0.0,1.0 ],[0,1, 1,1, 0,0],
        [0,0,1, 0,0,1, 0,0,1]);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    }

    renderfast(){
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var allverts = [];
        //front
        allverts = allverts.concat([0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0 ]);
        allverts = allverts.concat([0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0 ]);
        //back
        allverts = allverts.concat([0.0,0.0,1.0, 1.0,1.0,1.0, 1.0,0.0,1.0 ]);
        allverts = allverts.concat([0.0,0.0,1.0, 0.0,1.0,1.0, 1.0,1.0,1.0 ]);
        //top
        allverts = allverts.concat([0.0,1.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0 ]);
        allverts = allverts.concat([0.0,1.0,1.0, 0.0,1.0,0.0, 1.0,1.0,1.0 ]);
        //bot
        allverts = allverts.concat([0.0,0.0,0.0, 0.0,0.0,1.0, 1.0,0.0,0.0 ]);
        allverts = allverts.concat([1.0,0.0,0.0, 1.0,0.0,1.0, 0.0,0.0,1.0 ]);
        //left
        allverts = allverts.concat([0.0,0.0,0.0, 0.0,1.0,0.0, 0.0,1.0,1.0 ]);
        allverts = allverts.concat([0.0,1.0,1.0, 0.0,0.0,0.0, 0.0,0.0,1.0 ]);
        //right
        allverts = allverts.concat([1.0,0.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0 ]);
        allverts = allverts.concat([1.0,1.0,1.0, 1.0,0.0,0.0, 1.0,0.0,1.0 ]);
        
        //uvs
        var alluvs = [
        //front
        0, 0,  1, 1,  1, 0,
        0, 0,  0, 1,  1, 1,
        //back
        0, 0,  1, 1,  1, 0,
        0, 0,  0, 1,  1, 1,
        //top
        0, 0,  1, 0,  1, 1,
        0, 1,  0, 0,  1, 1,
        //bot
        0, 0,  0, 1,  1, 0,
        1, 0,  1, 1,  0, 1,
        //left
        0, 0,  0, 1,  1, 1,
        1, 1,  0, 0,  1, 0,
        //right
        0, 0,  0, 1,  1, 1,
        1, 1,  0, 0,  1, 0,
        ];

        drawTriangle3DUV(allverts, alluvs);
    }

}

