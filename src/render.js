import { PLYParser } from "./ply.js";
import { Camera } from "./camera.js";
import { ShaderProgram } from "./shaderProgram.js";
import { Controls } from "./controls.js";
import { Mesh } from "./mesh.js";
import { loadPPMFromText } from "./ppm.js";

export class WebGLRenderer {
  constructor(canvasId, statusId) {
    this.canvas = document.getElementById(canvasId); // make a canvas
    this.statusElem = document.getElementById(statusId); // tells user status, eg file loaded successfully
    this.gl = null; // webgl context
    this.camera = new Camera(); // our own camera class; handles transformations
    this.objectTransform = {
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      scale: 1,
    };
    this.controls = new Controls(this); // pass the entire renderer instance

    // two different objects with different shader programs
    this.programs = {}; // shader program manager
    this.innerMesh = new Mesh(); // the inner object
    this.outerMesh = new Mesh(); // the outer object
    this.textures = {environment: null, object: null};

    this.init();
  }

  async init() {
    if (!this.initGL()) return;
    await this.setupShaders();
    await this.loadOuter(); // load the outer sphere mesh
    this.startRenderLoop();
  }

  initGL() {
    this.gl = this.canvas.getContext("webgl");
    if (!this.gl) {
      this.statusElem.textContent =
        "Error: WebGL not supported in this browser.";
      return false;
    }
    this.gl.clearColor(0.1, 0.1, 0.1, 1.0); // background color is dark grey by default
    this.gl.enable(this.gl.DEPTH_TEST);
    return true;
  }

  async setupShaders() {
    try {
      await this.loadShaders("inner");
      await this.loadShaders("outer");
      this.statusElem.textContent = "Shaders loaded successfully!";
    } catch (error) {
      console.error("Shader setup failed:", error);
      this.statusElem.textContent =
        "Shader compilation failed: " + error.message;
    }
  }

  /************** File Reading Helper Functions ***************/

  async loadShaders(name) {
    console.log(`program name: ${name}`)
    const vsText = await fetch(`./shaders/${name}.vert`).then((r) => r.text());
    const fsText = await fetch(`./shaders/${name}.frag`).then((r) => r.text());
    this.programs[name] = new ShaderProgram(this.gl, vsText, fsText);
  }

  async reloadShaders(name) {
    try {
      const vsText = await fetch(`./shaders/${name}.vert`).then((r) => r.text());
      const fsText = await fetch(`./shaders/${name}.frag`).then((r) => r.text());
      this.programs[name].reload(vsText, fsText);
      this.statusElem.textContent = "Shaders reloaded successfully!";
    } catch (error) {
      console.error("Shader reload failed:", error);
      this.statusElem.textContent =
        "Shader reload failed: " + error.message;
    }
  }

  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  async loadPLYFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    this.statusElem.textContent = "Loading PLY file...";
    try {
      const text = await this.readFileAsText(file);
      const plyData = PLYParser.parse(text);
      this.innerMesh.loadData(plyData.vertices, plyData.faces);
      this.innerMesh.processGeometry();
      this.innerMesh.createBuffers(this.gl);
      this.statusElem.textContent = `PLY "${file.name}" loaded successfully! (${plyData.vertices.length / 3
        } vertices, ${plyData.faces.length / 3} faces)`;
    } catch (error) {
      console.error(`PLY "${file.name}" loading failed:`, error);
      this.statusElem.textContent =
        `Error loading PLY "${file.name}": ` + error.message;
    }
  }

  async loadPPMFile(event, name) {
    const file = event.target.files[0];
    if (!file) return;
    this.statusElem.textContent = "Loading PPM file...";
    try {
      const text = await this.readFileAsText(file);
      const { tex, width, height } = loadPPMFromText(this.gl, text);

      this.textures[name] = tex;

      const textureUnit = {
        environment: this.gl.TEXTURE0,
        object: this.gl.TEXTURE1,
      }[name] || this.gl.TEXTURE0;

      this.gl.activeTexture(textureUnit);
      this.gl.bindTexture(this.gl.TEXTURE_2D, tex);

      this.statusElem.textContent = `PPM "${file.name}" loaded successfully! (${width} x ${height})`;
    } catch (error) {
      console.error(`PPM "${file.name}" loading failed:`, error);
      this.statusElem.textContent =
        `Error loading PPM "${file.name}": ` + error.message;
    }
  }

  resizeCanvasToDisplaySize() {
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = Math.round(this.canvas.clientWidth * dpr);
    const displayHeight = Math.round(this.canvas.clientHeight * dpr);
    if (
      this.canvas.width !== displayWidth ||
      this.canvas.height !== displayHeight
    ) {
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
      this.gl.viewport(0, 0, displayWidth, displayHeight);
    }
  }

  startRenderLoop() {
    const renderLoop = () => {
      this.render();
      requestAnimationFrame(renderLoop);
    };
    renderLoop();
  }

  // outer sphere initialization
  async loadOuter() {
    const file = "../data/sphere.ply";
    const texFile = "../data/sphere-map-market.ppm";
    try {
      const response = await fetch(file);
      const text = await response.text();
      const plyData = PLYParser.parse(text);
      this.outerMesh.loadData(plyData.vertices, plyData.faces);
      this.outerMesh.processGeometry();
      this.outerMesh.createBuffers(this.gl);
      console.log(`Outer mesh "${file}" loaded successfully! (${plyData.vertices.length / 3
        } vertices, ${plyData.faces.length / 3} faces)`);
      const texResponse = await fetch(texFile);
      const texText = await texResponse.text();
      const { tex, width, height } = loadPPMFromText(this.gl, texText);
      this.textures["environment"] = tex;
      console.log(`Texture "${texFile}" loaded successfully! (${width} x ${height})`);
    } catch (error) {
      console.error(`Outer mesh "${file}" loading failed:`, error);
    }
  }

  // compute the model world matrix for inner object
  objectMatrix() {
    const modelWorld = mat4.create();
    // apply object transformations here
    mat4.rotateX(modelWorld, modelWorld, (this.objectTransform.rotateX / 180) * Math.PI);
    mat4.rotateY(modelWorld, modelWorld, (this.objectTransform.rotateY / 180) * Math.PI);
    mat4.rotateZ(modelWorld, modelWorld, (this.objectTransform.rotateZ / 180) * Math.PI);
    mat4.scale(modelWorld, modelWorld, [
      this.objectTransform.scale,
      this.objectTransform.scale,
      this.objectTransform.scale,
    ]);
    return modelWorld;
  }

  render() {
    this.resizeCanvasToDisplaySize(); // make sure canvas size is correct

    const gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const matrices = this.camera.getMatrices(
      this.canvas.clientWidth / this.canvas.clientHeight
    ); // camera transformations
    // TODO: render two objects here
    if (this.outerMesh.isReady()) this.renderOuter(matrices);
    if (this.innerMesh.isReady()) this.renderInner(matrices);
  }

  renderInner(matrices) {
    // TODO: use the inner shader program
    const gl = this.gl;
    const program = this.programs.inner;
    program.use();
    // set textures
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures["environment"]);
    program.setInteger("uTexture", 0);
    if (this.textures["object"]) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.textures["object"]);
      program.setInteger("uObjectTexture", 1);
    }
    else {
      program.setInteger("uObjectTexture", 0);
    }

    // model matrix, view matrix and projection matrix are provided
    const modelMatrix = this.objectMatrix();
    const modelViewMatrix = matrices.modelView;
    const projectionMatrix = matrices.projection;

    // OLD get texture color of environment and object
    // vec4 texColorWorld = texture2D(uTexture, vTexCoord);
    // vec4 texColorObj = texture2D(uObjectTexture, vTexCoord);

    const invProjectionMatrix = mat4.create();
    mat4.invert(invProjectionMatrix, projectionMatrix);
    const invModelViewMatrix = mat4.create();
    mat4.invert(invModelViewMatrix, modelViewMatrix);
    const invModelMatrix = mat4.create();
    mat4.invert(invModelMatrix, modelMatrix);
    const invNormalMatrix = mat4.create();
    mat4.invert(invNormalMatrix, matrices.normal);

    // TODO: calculate the rest variables here
    // NOTE: since we are using webgl 1.0, shaders cannot call inverse or transpose functions.
    program.setMatrix4("u_projectionMatrix", matrices.projection); // this is computed in camera.js
    program.setMatrix4("u_modelViewMatrix", matrices.modelView); // this is computed in camera.js
    program.setMatrix4("u_modelMatrix", modelMatrix);
    program.setMatrix3("u_normalMatrix", matrices.normal); // this is computed in camera.js

    program.setMatrix4("u_invProjectionMatrix", invProjectionMatrix); // this is computed in camera.js
    program.setMatrix4("u_invModelViewMatrix", invModelViewMatrix); // this is computed in camera.js
    program.setMatrix4("u_invModelMatrix", invModelMatrix);
    program.setMatrix3("u_invNormalMatrix", invNormalMatrix); // this is computed in camera.js
    // TODO: set uniforms
    // program.setMatrix4("viewMatrix", viewMatrix);
    // program.setMatrix4("projectionMatrix", projectionMatrix);

    // fixed light direction
    program.setVector3("u_lightDirWorld", [0.0, 0.0, -1.0]);
    // given controls from UI
    program.setFloat("u_blend", this.controls.blend ? parseFloat(this.controls.blend.value) : 0.0);
    program.setInteger("u_diffuse", this.controls.diffuse ? 1 : 0);

    program.setVector3("u_eye")
    
    // bind VAO
    this.innerMesh.bindForFillRender(gl, program);
    // draw call
    gl.drawArrays(gl.TRIANGLES, 0, this.innerMesh.getVertexCount());
  }

  renderOuter(matrices) {
    const gl = this.gl;
    // use the outer shader program
    const program = this.programs.outer;
    program.use();
    // set texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures["environment"]);
    program.setInteger("uTexture", 0);
    // TODO: set uniforms
    program.setMatrix4("u_projectionMatrix", matrices.projection); // this is computed in camera.js
    program.setMatrix4("u_modelViewMatrix", matrices.modelView); // this is computed in camera.js
    program.setMatrix3("u_normalMatrix", matrices.normal); // this is computed in camera.js

    // bind VAO
    this.outerMesh.bindForFillRender(gl, program);
    // draw call
    gl.drawArrays(gl.TRIANGLES, 0, this.outerMesh.getVertexCount());
  }
}
