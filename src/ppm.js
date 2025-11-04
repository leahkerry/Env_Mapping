// ppm.js: ppm parser, mirrors c++ ppm parser 
export function loadPPMFromText(gl, ppmText) {
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

    // 1) split lines, strip comments
    const lines = ppmText.split('\n');
    const tokens = [];
    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('#')) continue;
        tokens.push(...line.split(/\s+/));
    }

    // 2) handle header
    const magic  = tokens.shift();
    if (magic !== 'P3') throw new Error('Only ASCII P3 PPM supported');
    const width  = parseInt(tokens.shift(), 10);
    const height = parseInt(tokens.shift(), 10);
    const maxVal = parseInt(tokens.shift(), 10);
    console.log(`PPM size: ${width} × ${height} (max=${maxVal})`);

    // 3) read pixels
    const pixelCount = width * height * 3;
    const raw = tokens.slice(0, pixelCount).map(n => parseInt(n, 10));
    if (raw.length < pixelCount) throw new Error('PPM too short');
    const imageData = new Uint8Array(raw);

    // 4) upload
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGB,
        width, height, 0,
        gl.RGB, gl.UNSIGNED_BYTE,
        imageData
    );

    // 5) error handling - POT vs NPOT
    const isPow2 = v => (v & (v - 1)) === 0;
    if (isPow2(width) && isPow2(height)) {
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }
    return { tex, imageData, width, height };
}