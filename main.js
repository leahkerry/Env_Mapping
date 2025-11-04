// Lab 1: PLY Renderer
//------------------------------------------------------------------------------
// 1. WebGLRenderer class handles high‐level setup (initializing GL, shaders, DOM events, and driving the render loop)
// 2. Mesh class manages the 3D model data: load PLY → compute normals/edges → create GL buffers → bind for draw.
// 3. Camera class manages all the math for projection/modelView/normal matrices, and provides simple rotate/adjustZoom methods.
// 4. Controls class handles mouse/keyboard events to rotate/zoom the camera.
// 5. ShaderProgram encapsulates shader compilation, attribute/uniform cache, and helpers
// 6. Geometry provides static methods for scaling/centering vertices, computing normals, and wireframe edges.
// 7. PLYParser class parses PLY files into vertex/face arrays.
//------------------------------------------------------------------------------
import { WebGLRenderer } from './src/render.js';

// Usage
window.addEventListener('load', () => {
    new WebGLRenderer('glcanvas', 'status');
});