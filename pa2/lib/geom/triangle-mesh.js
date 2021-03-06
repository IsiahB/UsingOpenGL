/**
 * A TriangleMesh object is a generic shape.  It can be initialized with vertex data
 * via the initBuffers method, then rendered using the render method.  It is not 
 * drawable until initialized with initBuffers.
 * 
 * Example:
 * 
 * // In the init (only done once)
 * var myMesh = new TriangleMesh(gl, vertexData);
 * 
 * // In the render function (done once per frame)
 * myMesh.render(gl, uni);
 * 
 * @param {WebGL2RenderingContext} gl the WebGL2RenderingContext object
 * @param {Object} vertexData the vertex data.  This must consist of an object with at least the 
 * following properties: index, position and normal.  It may also include a property named texCoord.
 * The values of position and normal must be arrays containing floating point numbers.  The lengths of
 * the two must be the same.  Each consecutive group of three numbers correspond to a single point or
 * normal.  The number of points/normals is equivalent to the length of the arrays divided by 3.
 * The value of the index property must be an array of unsigned integers.  Each group of consecutive
 * three numbers in this array define a triangle.  Each integer is an index into the point/normal/texCoord
 * arrays.  However, the index is based on triples (or doubles in the case of texCoord).  Essentially,
 * you can imagine that the index value is multiplied by 3.  For example,
 * index 1 in the index array corresponds to the point that begins at index 3 in the position array.
 */
var TriangleMesh = function(gl, vertexData) {
    this.nVerts = 0;     // Number of vertices
    this.vao = null;     // The VAO for the faces

    this.nEdgeVerts = 0;  // Number of edge vertices
    this.edgeVao = null;  // The VAO for the edges

    this.buffers = [];    // All of the GPU buffers used by this mesh

    // Check that vertexData has the needed properties
    if( ! ('index' in vertexData && 'position' in vertexData && 'normal' in vertexData) )  {
        alert("ERROR (initBuffers): indicies, position, or normal arrays are missing from vertexData.");
    }

    // Init the GPU buffers
    this.initBuffers(gl, vertexData);

    // Generate edge data
    this.initEdgeBuffers(gl, vertexData.index);
};

/**
 *  Initialize the WebGL vertex buffers with the provided data.  This should only be called once per
 * object.  It copies the data into WebGL memory, and creates the vertex array object.
 * 
 * @param {WebGL2RenderingContext} gl the WebGL2RenderingContext object
 * @param {Object} vertexData the vertex data.  See documentation in TriangleMesh.
 */
TriangleMesh.prototype.initBuffers = function(gl, vertexData) {

    // Check whether or not the buffers have already been initialized, if so, delete them
    if( this.vao ) {
        this.deleteBuffers(gl);
    }

    this.nVerts = vertexData.index.length;

    // Index buffer
    this.buffers[0] = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers[0]);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint32Array.from(vertexData.index), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null); // done with this buffer

    // Position buffer
    this.buffers[1] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[1]);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertexData.position), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null); // done with this buffer

    // Normal buffer
    this.buffers[2] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[2]);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertexData.normal), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null); // done with this buffer

    // Texture coord buffer
    if( 'texCoord' in vertexData ) {
        this.buffers[3] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[3]);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertexData.texCoord), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null); // done with this buffer
    }

    // Setup VAO
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    // Set up the element buffer.  The buffer bound to GL_ELEMENT_ARRAY_BUFFER
    // is used by glDrawElements to pull index data (the indices used to access
    // data in the other buffers).
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers[0]);

    // Set up the position pointer.  The position is bound to vertex attribute 0.
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[1]);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(0);

    // Set up the normal pointer.  The normal is bound to vertex attribute 1.
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[2]);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(1);

    // Set up the texture coordinate pointer.  This is bound to vertex attribute 2.
    if( 'texCoord' in vertexData ) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[3]);
        gl.vertexAttribPointer(2, 2, gl.FLOAT, gl.FALSE, 0, 0);
        gl.enableVertexAttribArray(2);
    }
    gl.bindVertexArray(null); // Done with this VAO
};

/**
 * Generates an array of indices suitable for drawing the edges of the mesh.
 * These edges are not optimized and many edges will be drawn twice.  
 * The indices are loaded into a VAO that can be used to draw the edges.
 * The VAO is stored in this.edgeVao.
 * 
 * @param {WebGL2RenderingContext} gl the WebGL2RenderingContext object
 * @param {Array} indices the triangle indices 
 */
TriangleMesh.prototype.initEdgeBuffers = function(gl, indices) {
    var edgeIndices = [];
    for (var i = 0; i < indices.length; i += 3) {
        var idx0 = indices[i];
        var idx1 = indices[i+1];
        var idx2 = indices[i+2];
        edgeIndices.push(idx0, idx1, idx1, idx2, idx2, idx0);
    }
    this.nEdgeVerts = edgeIndices.length;

    // Index buffer
    var buf = gl.createBuffer();
    this.buffers.push(buf);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint32Array.from(edgeIndices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null); // done with this buffer

    // We'll re-use the position buffer (which should be at this.buffers[1])

    // Setup VAO
    this.edgeVao = gl.createVertexArray();
    gl.bindVertexArray(this.edgeVao);

    // Set up the element buffer.  The buffer bound to GL_ELEMENT_ARRAY_BUFFER
    // is used by glDrawElements to pull index data (the indices used to access
    // data in the other buffers).
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf);

    // Set up the position pointer.  The position is bound to vertex attribute 0.
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[1]);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(0);

    gl.bindVertexArray(null);
};

/**
 * Deletes all of the vertex data in WebGL memory for this object.  This invalidates the
 * vertex arrays, and the object can no longer be drawn.
 * 
 * @param {WebGL2RenderingContext} gl 
 */
TriangleMesh.prototype.deleteBuffers = function(gl) {
    // Delete all buffers
    for( let i in this.buffers ) {
        gl.deleteBuffer(this.buffers[i]);
    }
    this.buffers = [];

    // Delete the VAOs
    if( this.vao ) {
        gl.deleteVertexArray(this.vao);
        this.vao = null;
    }
    if(this.edgeVao) {
        gl.deleteVertexArray(this.edgeVao);
        this.edgeVao = null;
    }
};

/**
 * Draws the object.  It will also try to draw edges if they have been defined.
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {Object} uni An object containing the locations of all uniform variables in the shader
 * @param {vec3 or Float32Array} color The color to use when rendering faces, defaults to light gray.
 */
TriangleMesh.prototype.render = function(gl, uni, color=vec3.fromValues(0.8,0.8,0.8)) {
    // If the buffers haven't been initialized, do nothing
    if( ! this.vao ) return;

    // Set the uniform variable for the color
    gl.uniform3fv(uni.uColor, color);

    // Bind to the VAO and draw the triangles
    gl.bindVertexArray(this.vao);
    gl.drawElements( gl.TRIANGLES, this.nVerts, gl.UNSIGNED_INT, 0);
    gl.bindVertexArray(null);  // Un-bind the VAO

    // If we have edges, draw them.
    if( this.edgeVao ) {
        gl.uniform3fv(uni.uColor, Float32Array.from([0,0,0]));
        this.renderEdges(gl);
    }
};

/**
 * Draws the edges of the object (if they have been defined).
 * @param {WebGL2RenderingContext} gl 
 */
TriangleMesh.prototype.renderEdges = function(gl) {
    // If the buffers haven't been initialized
    if( ! this.edgeVao ) return;

    gl.bindVertexArray(this.edgeVao);
    gl.drawElements( gl.LINES, this.nEdgeVerts, gl.UNSIGNED_INT, 0);
    gl.bindVertexArray(null);
};