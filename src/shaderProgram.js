export class ShaderProgram {
    constructor(gl, vertexSource, fragmentSource) {
        this.gl = gl;
        this.program = this.createProgram(vertexSource, fragmentSource); // compile & link vertex + fragment shaders into a WebGLProgram
        // maps to cache attribute/uniform locations by name so we only call gl.getXLocation(...) once per name
        this.attributes = new Map();
        this.uniforms = new Map();
    }

    createProgram(vertexSource, fragmentSource) {
        const gl = this.gl;
        // 1) compileShader(...) for vertex and fragment
        const vertexShader = this.compileShader(vertexSource, gl.VERTEX_SHADER);
        const fragmentShader = this.compileShader(fragmentSource, gl.FRAGMENT_SHADER);

        // 2) gl.createProgram()
        const program = gl.createProgram();

        // 3) attach both shaders, link program
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        // 4) check link status; if failed, delete and throw
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const error = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error('Shader program linking failed: ' + error);
        }

        // 5) delete individual shaders, only need the linked program
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        return program; // WebGLProgram object
    }

    compileShader(source, type) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source); // source is the string 
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            const shaderType = type === gl.VERTEX_SHADER ? 'Vertex' : 'Fragment';
            throw new Error(`${shaderType} shader compilation failed: ${error}`);
        }
        return shader;
    }

    reload(vertexSource, fragmentSource) {
        const newProgram = this.createProgram(vertexSource, fragmentSource);
        this.gl.deleteProgram(this.program);
        this.program = newProgram;
        this.attributes.clear();
        this.uniforms.clear();
    }

    use() {
        this.gl.useProgram(this.program); 
    }

    getAttributeLocation(name) { // use map 
        if (!this.attributes.has(name)) {
            this.attributes.set(name, this.gl.getAttribLocation(this.program, name));
        }
        return this.attributes.get(name);
    }

    getUniformLocation(name) { // use map 
        if (!this.uniforms.has(name)) {
            this.uniforms.set(name, this.gl.getUniformLocation(this.program, name));
        }
        return this.uniforms.get(name);
    }

    enableAttribute(name, size, type, normalized, stride, offset) {
        const location = this.getAttributeLocation(name); // use map get location 
        if (location >= 0) {
            this.gl.enableVertexAttribArray(location); // ?? 
            this.gl.vertexAttribPointer(
                location, // the attribute index in the shader where u_direction lives 
                size, 
                type, 
                normalized, 
                stride, 
                offset);
        }
    }

    setMatrix4(name, matrix) {
        const location = this.getUniformLocation(name);
        if (location) {
            this.gl.uniformMatrix4fv(location, false, matrix);
        }
    }

    setMatrix3(name, matrix) {
        const location = this.getUniformLocation(name);
        if (location) {
            this.gl.uniformMatrix3fv(location, false, matrix);
        }
    }

    setVector3(name, vector) {
        // uniform name in the shader (e.g., "u_lightDirectionEye")
        const location = this.getUniformLocation(name);
        if (location) {
            this.gl.uniform3fv(location, vector);
        }
    }

    setVector4(name, vector) {
        const location = this.getUniformLocation(name);
        if (location) {
            this.gl.uniform4fv(location, vector);
        }
    }

    setInteger(name, value) {
        const location = this.getUniformLocation(name);
        if (location) {
            this.gl.uniform1i(location, value);
        }
    }

    setFloat(name, value) {
        const location = this.getUniformLocation(name);
        if (location) {
            this.gl.uniform1f(location, value);
        }
    }

    dispose() {
        this.gl.deleteProgram(this.program);
    }
}