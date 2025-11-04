// Mesh class is the model data manager, as a bridge between: 
//      1) raw geometry (vertices and faces)
//      2) geometry processing (normals, edges)
//      3) WebGL buffers for rendering (GPU)
import { Geometry } from './geometry.js';
export class Mesh {
    // the Mesh data structure holds: 
    // - vertices: original 3D coordinates from PLY file 
    // - faces: indices into vertices forming triangles
    // - additional processed data: 
    //      - expanded vertices with normals, 
    //      - edge vertices for wireframe
    constructor() {
        this.vertices = null;
        this.faces = null;
        this.buffers = {  // after createBuffers(gl), these become WebGLBuffer objects
            vertex: null, // holds expandedVertices (position + normal)
            edge: null    // holds edgeVertices (wireframe line endpoints)
        };
        this.expandedVertices = null; // each face produces 3 corner‐vertices, each storing [x,y,z, nx,ny,nz]
        this.edgeVertices = null; // each face produces 3 edges, each edge has 2 endpoints, each endpoint is [x,y,z]
        this.vertexCount = 0;
        this.edgeCount = 0; // number of line‐vertices (edgeVertices.length / 3 floats per vertex)
    }

    loadData(vertices, faces) { // load geometry data from PLY parser into the Mesh class 
        this.vertices = vertices;
        this.faces = faces;
    }

    // process the geometry data by calling functions from Geometry class:
    //  - scale and center the vertices
    //  - compute per-face normals for (flat) lighting
    //  - compute wireframe edges
    processGeometry() {
        if (!this.vertices || !this.faces) return; // data not set 

        Geometry.scaleAndCenter(this.vertices);
        // this.expandedVertices = Geometry.render(this.vertices, this.faces);
        const vertexNormals = Geometry.computeVertexNormals(this.vertices, this.faces);
        this.expandedVertices = Geometry.renderSmooth(this.vertices, this.faces, vertexNormals);
        this.edgeVertices = Geometry.computeWireframeEdges(this.vertices, this.faces);
        this.vertexCount = this.faces.length; // 3 vertices per face
        this.edgeCount = this.edgeVertices.length / 3; // number of line‐vertices (edgeVertices.length / 3 floats per vertex)
    }

    // create WebGL buffers for the processed geometry data
    // - vertex buffer for expanded vertices (position + normal)
    // - edge buffer for wireframe edges (start and end vertices for every edge)
    createBuffers(gl) {
        // if we have per‐corner vertices (with normals), upload them
        if (this.expandedVertices) {
            this.buffers.vertex = gl.createBuffer(); // create gpu buffer object 
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertex); // bind it to ARRAY_BUFFER target 
            gl.bufferData(gl.ARRAY_BUFFER, this.expandedVertices, gl.STATIC_DRAW); // upload data 
        }
        // if we have wireframe edges, upload them 
        if (this.edgeVertices) {
            this.buffers.edge = gl.createBuffer();  // create gpu buffer object 
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.edge); // bind it to ARRAY_BUFFER target 
            gl.bufferData(gl.ARRAY_BUFFER, this.edgeVertices, gl.STATIC_DRAW); // upload data 
        }
    }

    bindForFillRender(gl, program) {  
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertex); // bind the GPU buffer that holds [x,y,z, nx,ny,nz]
        const stride = 6 * Float32Array.BYTES_PER_ELEMENT; // cuz x,y,z,nx,ny,nz

        // position is the first 3 floats (offset 0)
        program.enableAttribute(
            'a_position', // attribteu name in shader 
            3, // size = 3 floats (x, y, z)
            gl.FLOAT, // x y z are floats 
            false, // not noramlized 
            stride, // just stride 
            0); // offset into each vertex = 0
        // normal is the next 3 floats (offset = 3 floats = 3 * 4 bytes)
        program.enableAttribute(
            'a_normal', // attribteu name in shader 
            3, // nx ny nz 
            gl.FLOAT, // nx ny nz are floats 
            false, // not normalized 
            stride, // same stride 
            3 * Float32Array.BYTES_PER_ELEMENT // skip the first 3 cuz it's [x,y,z, nx,ny,nz] and we want nx ny nz 
        ); 
    }

    // do the same for wireframe drawing 
    bindForWireframeRender(gl, program) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.edge);
        program.enableAttribute(
            'a_posLine', // attribteu name in shader 
            3, // x y z per vertex 
            gl.FLOAT, 
            false, // not normalized 
            0, // no stride
            0 // no offset 
        );
    }

    isReady() {
        return this.buffers.vertex !== null;
    }

    getVertexCount() {
        return this.vertexCount;
    }

    getEdgeCount() {
        return this.edgeCount;
    }

    dispose(gl) { // destructor 
        if (this.buffers.vertex) gl.deleteBuffer(this.buffers.vertex);
        if (this.buffers.edge) gl.deleteBuffer(this.buffers.edge);
    }
}