// processes the user/client's actions, computes deltaXY which are then used by camera
export class Controls {
  constructor(renderer) {
    this.renderer = renderer;
    this.canvas = renderer.canvas;
    this.camera = renderer.camera;

    // Environment
    this.ppmInput = document.getElementById("ppmInput");

    // Object Model
    this.objectRotateX = document.getElementById("objectRotateXSlider");
    this.objectRotateXOut = document.getElementById("objectRotateXVal");
    this.objectRotateY = document.getElementById("objectRotateYSlider");
    this.objectRotateYOut = document.getElementById("objectRotateYVal");
    this.objectRotateZ = document.getElementById("objectRotateZSlider");
    this.objectRotateZOut = document.getElementById("objectRotateZVal");
    this.objectScale = document.getElementById("objectScaleSlider");
    this.objectScaleOut = document.getElementById("objectScaleVal");

    // World Model
    this.rotate = document.getElementById("rotateSlider");
    this.scale = document.getElementById("scaleSlider");
    this.rotateOut = document.getElementById("rotateVal");
    this.scaleOut = document.getElementById("scaleVal");

    // Object
    this.objectPlyInput = document.getElementById("plyInput");
    this.objectPPMInput = document.getElementById("objectPPMInput");
    this.blend = document.getElementById("textureBlend");
    this.blendOut = document.getElementById("textureBlendVal");
    this.diffuse = false;
    this.diffuseCheckBox = document.getElementById("diffuseCheckbox");

    // Shader
    this.reloadShadersBtn = document.getElementById("reloadShadersBtn");

    // file input
    this.setupEventListeners(renderer);
    this.update(); // initialize output values
    this.getRotate(); // initialize rotation
    this.getScale();
  }

  setupEventListeners(renderer) {
    // Environment
    this.ppmInput?.addEventListener("change", (e) => renderer.loadPPMFile(e, "environment")); // get file

    // Object Model
    this.objectRotateX?.addEventListener("input", () => this.getObjectTransform());
    this.objectRotateY?.addEventListener("input", () => this.getObjectTransform());
    this.objectRotateZ?.addEventListener("input", () => this.getObjectTransform());
    this.objectScale?.addEventListener("input", () => this.getObjectTransform());

    // World Model
    this.rotate?.addEventListener("input", () => this.getRotate());
    this.scale?.addEventListener("input", () => this.getScale());

    // Object
    this.objectPlyInput?.addEventListener("change", (e) => renderer.loadPLYFile(e)); // get file
    this.objectPPMInput?.addEventListener("change", (e) => renderer.loadPPMFile(e, "object")); // get file
    this.diffuseCheckBox?.addEventListener("change", (e) => {
      this.diffuse = e.target.checked;
    });
    
    // Shader
    this.reloadShadersBtn?.addEventListener("click", () => { renderer.reloadShaders("inner"); renderer.reloadShaders("outer"); });

    ["input", "change"].forEach((evt) => {
      this.rotate?.addEventListener(evt, this.update);
      this.scale?.addEventListener(evt, this.update);
      this.objectRotateX?.addEventListener(evt, this.update);
      this.objectRotateY?.addEventListener(evt, this.update);
      this.objectRotateZ?.addEventListener(evt, this.update);
      this.objectScale?.addEventListener(evt, this.update);
      this.blend?.addEventListener(evt, this.update);
    });
  }

  update = () => {
    // update slider outputs
    if (this.rotate && this.rotateOut) {
      this.rotateOut.textContent = this.rotate.value;
    }
    if (this.scale && this.scaleOut) {
      this.scaleOut.textContent = this.scale.value;
    }
    if (this.blend && this.blendOut) {
      this.blendOut.textContent = this.blend.value;
    }
    if (this.objectRotateX && this.objectRotateXOut) {
      this.objectRotateXOut.textContent = this.objectRotateX.value;
    }
    if (this.objectRotateY && this.objectRotateYOut) {
      this.objectRotateYOut.textContent = this.objectRotateY.value;
    }
    if (this.objectRotateZ && this.objectRotateZOut) {
      this.objectRotateZOut.textContent = this.objectRotateZ.value;
    }
    if (this.objectScale && this.objectScaleOut) {
      this.objectScaleOut.textContent = this.objectScale.value;
    }
  };

  getRotate() {
    let rotate = 0;
    if (this.rotate) {
      rotate = parseFloat(this.rotate.value);
    }
    this.camera.setRotate((rotate / 180) * Math.PI, 0); // only rotate around Y axis
  }

  getScale() {
    let scale = 1;
    if (this.scale) {
      scale = parseFloat(this.scale.value);
    }
    this.camera.adjustZoom(scale);
  }

  getObjectTransform() {
    this.renderer.objectTransform.rotateX = parseFloat(this.objectRotateX.value);
    this.renderer.objectTransform.rotateY = parseFloat(this.objectRotateY.value);
    this.renderer.objectTransform.rotateZ = parseFloat(this.objectRotateZ.value);
    this.renderer.objectTransform.scale = parseFloat(this.objectScale.value);
  }
}
