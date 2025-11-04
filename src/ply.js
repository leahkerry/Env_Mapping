export class PLYParser { // GIVEN 
    static parse(text) {
        const lines = text.split(/\r?\n/);
        let nVertices = 0, nFaces = 0, headerEndIdx = 0;
        // Parse header
        for (let i = 0; i < lines.length; i++) {
            const tokens = lines[i].trim().split(/\s+/);
            if (tokens[0] === 'element') {
                if (tokens[1] === 'vertex') nVertices = parseInt(tokens[2]);
                if (tokens[1] === 'face') nFaces = parseInt(tokens[2]);
            }
            if (tokens[0] === 'end_header') {
                headerEndIdx = i + 1;
                break;
            }
        }
        if (nVertices <= 0 || nFaces <= 0) {
            throw new Error('Invalid PLY: missing vertex/face counts');
        }
        const vertices = new Float32Array(nVertices * 3);
        const faces = new Uint32Array(nFaces * 3);

        // Parse vertices
        for (let i = 0; i < nVertices; i++) {
            const line = lines[headerEndIdx + i].trim();
            if (!line) throw new Error(`Missing vertex data at line ${i}`);
            const coords = line.split(/\s+/).map(Number);
            if (coords.length < 3) throw new Error(`Invalid vertex data at line ${i}`);
            vertices[i * 3] = coords[0];
            vertices[i * 3 + 1] = coords[1];
            vertices[i * 3 + 2] = coords[2];
        }

        // Parse faces
        for (let i = 0; i < nFaces; i++) {
            const line = lines[headerEndIdx + nVertices + i].trim();
            if (!line) throw new Error(`Missing face data at line ${i}`);
            const parts = line.split(/\s+/).map(Number);
            if (parts.length < 4 || parts[0] !== 3) {
                throw new Error(`Face ${i} is not a triangle`);
            }
            faces[i * 3] = parts[1];
            faces[i * 3 + 1] = parts[2];
            faces[i * 3 + 2] = parts[3];
        }
        return { vertices, faces };
    }
}
