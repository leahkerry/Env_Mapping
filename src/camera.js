/* global mat4, mat3 */
// this is where all of the per-frame math happens! applies transformations via mouse controls
// uses glMatrix functions such as mat4.persepctive, mat4.translate,
// mat4.perspective is Float32Array(16) under the hood i think
export class Camera {
  constructor() {
    this.rotU = 0; // rotation around world's Y axis
    this.rotV = 0; // rotation around world's Y axis
    this.zoom = 0.0; // initial camera position for zoom scale
  }

  getMatrices(aspectRatio) {
    // 1) build a 4×4 perspective projection matrix
    const projection = mat4.create(); // creates a 4x4 identity matrix
    // foreshortening: takes camera-space X, Y, Z and scales X and Y by 1/Z (so farther points shrink)
    // near-far clipping,
    mat4.perspective(
      // used later by e.g. vert shader via uniform mat4 u_projectionMatrix
      projection, // apply the following transformations to the identity matrix
      Math.PI / 4, // 45 degree FOV
      aspectRatio, // canvas width / height
      0.1, // near plane
      100.0 // far plane
    );

    // build a 4x4 model-view matrix (camera at (0,0,zoom) with rotU/rotV)
    // takes an object which is at the origin in world space, move it to camera space
    const modelView = mat4.create(); // creates a new 4x4 identity matrix
    mat4.translate(modelView, modelView, [0, 0, -this.zoom]); // translate "backwards" along z axis - camera looks at -z
    mat4.rotateX(modelView, modelView, this.rotU); // rotate around the world-X axis by rotU (pitch up/down):
    mat4.rotateY(modelView, modelView, this.rotV); // rotate around the world-Y axis by rotV (left/right) yaw ??

    // make a 3×3 normal matrix from the model-view for lighting
    const normal = mat3.create();
    mat3.normalFromMat4(normal, modelView);

    return { projection, modelView, normal }; // used later for rendering shading etc
  }

  rotate(deltaX, deltaY) {
    this.rotV += deltaX * 0.01; // dragging left/right (deltaX) changes rotV (rotation around world's Y axis)
    this.rotU += deltaY * 0.01; // dragging up/down (deltaY) changes rotU (rotation around world's X axis)
  }

  setRotate(rotateX, rotateY) {
    // console.log(`setRotate called, rotateX: ${rotateX}, rotateY: ${rotateY}`);
    this.rotV = rotateX;
    this.rotU = rotateY;
  }

  setZoom(newZoom) {
    this.zoom = Math.max(1.0, Math.min(10.0, newZoom)); // update camera position, clipped between 1 and 10
  }

  adjustZoom(deltaY) {
    // positive deltaY (scrolling up) increases z (camera moves back, object smaller)
    // negative deltaY (scrolling down) decreases z (camera moves forward, object bigger)
    const baseZoom = 3.0; // baseline camera distance
    const newZoom = baseZoom / deltaY;

    this.setZoom(newZoom);
  }
}
