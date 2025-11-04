export class Geometry {
  // output: Float32Array of length nFaces * 3, where each group [i*3, i*3+1 i*3+2] is the normal of face i.
  static render(vertices, faces) {
    // TODO function 1
    // this shoudl be called compute VERTEX normals !!!!!
    const nFaces = faces.length / 3; // number of faces (triangles)
    // Float32Array of size (nFaces * 3 vertices * (3 pos + 3 normal))
    const expanded = new Float32Array(nFaces * 3 * 6);
    let offset = 0; // // write position in “expanded”

    for (let f = 0; f < nFaces; f++) {
      // Vertex‐indices of this face
      const i0 = faces[f * 3 + 0];
      const i1 = faces[f * 3 + 1];
      const i2 = faces[f * 3 + 2];

      // positions of the three corners of the current triangle
      const p0 = [
        vertices[i0 * 3 + 0],
        vertices[i0 * 3 + 1],
        vertices[i0 * 3 + 2],
      ];
      const p1 = [
        vertices[i1 * 3 + 0],
        vertices[i1 * 3 + 1],
        vertices[i1 * 3 + 2],
      ];
      const p2 = [
        vertices[i2 * 3 + 0],
        vertices[i2 * 3 + 1],
        vertices[i2 * 3 + 2],
      ];

      // one call to the provided helper, same as C++ setNormal
      // nx ny nz = xyz of the normal
      const [nx, ny, nz] = Geometry.setNormal(p0, p1, p2);

      // pack corner 0
      expanded[offset++] = p0[0]; // this vertex x coord
      expanded[offset++] = p0[1]; // this vertex y coord
      expanded[offset++] = p0[2]; // this vertex z coord
      expanded[offset++] = nx; // this vertex normal x value
      expanded[offset++] = ny; // this vertex normal y value
      expanded[offset++] = nz; // this vertex normal z value

      // pack corner 1
      expanded[offset++] = p1[0]; //  ^^ same as above, for 2nd corner (vertex) of the triangle
      expanded[offset++] = p1[1];
      expanded[offset++] = p1[2];
      expanded[offset++] = nx;
      expanded[offset++] = ny;
      expanded[offset++] = nz;

      // pack corner 2
      expanded[offset++] = p2[0]; // ^^ same
      expanded[offset++] = p2[1];
      expanded[offset++] = p2[2];
      expanded[offset++] = nx;
      expanded[offset++] = ny;
      expanded[offset++] = nz;
    }
    return expanded;
  }

  // render() calls setNormal() and passes in 3 points of a triangle to set the
  // face normal of this triangle made up of p0, p1, p2
  static setNormal(p0, p1, p2) {
    // p0, p1, p2 are arrays [x,y,z]
    const e1 = [
      // compute the first side of the triangle
      p0[0] - p1[0],
      p0[1] - p1[1],
      p0[2] - p1[2],
    ];

    const e2 = [
      // compute the second side of the triangle
      p1[0] - p2[0],
      p1[1] - p2[1],
      p1[2] - p2[2],
    ];
    // compute the unnormalized face normal via cross product:
    let normal = Geometry.cross(e1, e2);
    // normalize it in-place:
    Geometry.normalize(normal);
    return normal;
  }

  static scaleAndCenter(vertices) {
    // TODO function 2
    // nVerts = number of vertices
    const nVerts = vertices.length / 3;

    // TODO: find the centroid
    let cx = 0,
      cy = 0,
      cz = 0; // variables to accumulate sum

    // TODO: sum up vertices positions
    for (let i = 0; i < nVerts; i++) {
      cx += vertices[i * 3]; // sum up all x positions
      cy += vertices[i * 3 + 1]; // sum up all y positions
      cz += vertices[i * 3 + 2]; // sum up all z positions
    }

    // TODO: find the center of mass
    cx /= nVerts;
    cy /= nVerts;
    cz /= nVerts;

    // TODO: move centroid to center and find max absolute coordinate for scaling
    let maxAbs = 0;
    for (let i = 0; i < nVerts; i++) {
      vertices[i * 3] -= cx; // move x position
      vertices[i * 3 + 1] -= cy; // move y position
      vertices[i * 3 + 2] -= cz; // move z position

      // find max absolute coordinate
      maxAbs = Math.max(
        maxAbs,
        Math.abs(vertices[i * 3]),
        Math.abs(vertices[i * 3 + 1]),
        Math.abs(vertices[i * 3 + 2])
      );
    }

    // TODO: scale to fit in [-0.5, 0.5] aka 1x1x1 bounding box
    if (maxAbs > 0) {
      // sanity check: maxAbs should never be negative
      const scale = 0.5 / maxAbs; // scaling factor
      for (let i = 0; i < vertices.length; i++) {
        vertices[i] *= scale; // scale all coordinates
      }
    }
  }

  static computeVertexNormals(vertices, faces) {
    const v = vertices;        // Float32Array, layout: [x0,y0,z0, x1,y1,z1, ...]
    const f = faces;           // Uint32Array/Uint16Array, length = 3 * numTris
    const countV = v.length / 3;

    const normals = new Float32Array(v.length); // 与 vertices 等长

    for (let i = 0; i < f.length; i += 3) {
      const i0 = f[i]   * 3;
      const i1 = f[i+1] * 3;
      const i2 = f[i+2] * 3;

      const x0 = v[i0],   y0 = v[i0+1],   z0 = v[i0+2];
      const x1 = v[i1],   y1 = v[i1+1],   z1 = v[i1+2];
      const x2 = v[i2],   y2 = v[i2+1],   z2 = v[i2+2];

      const e1x = x1 - x0, e1y = y1 - y0, e1z = z1 - z0;
      const e2x = x2 - x0, e2y = y2 - y0, e2z = z2 - z0;

      const nx = e1y * e2z - e1z * e2y;
      const ny = e1z * e2x - e1x * e2z;
      const nz = e1x * e2y - e1y * e2x;

      normals[i0]   += nx; normals[i0+1] += ny; normals[i0+2] += nz;
      normals[i1]   += nx; normals[i1+1] += ny; normals[i1+2] += nz;
      normals[i2]   += nx; normals[i2+1] += ny; normals[i2+2] += nz;
    }

    for (let i = 0; i < countV; ++i) {
      const j = i * 3;
      const nx = normals[j], ny = normals[j+1], nz = normals[j+2];
      const len = Math.hypot(nx, ny, nz) || 1.0;
      normals[j]   = nx / len;
      normals[j+1] = ny / len;
      normals[j+2] = nz / len;
    }

    return normals;
  }

  static renderSmooth(vertices, faces, vertexNormals) {
    const f = faces;
    const v = vertices;
    const n = vertexNormals;

    const cornerCount = f.length;
    const out = new Float32Array(cornerCount * 6);

    let o = 0;
    for (let k = 0; k < f.length; ++k) {
      const vi = f[k] * 3;

      out[o++] = v[vi];
      out[o++] = v[vi+1];
      out[o++] = v[vi+2];

      out[o++] = n[vi];
      out[o++] = n[vi+1];
      out[o++] = n[vi+2];
    }
    return out;
  }

  //------------------------------------------------------------------------------
  //                              helper functions
  //------------------------------------------------------------------------------
  static computeWireframeEdges(vertices, faces) {
    // simply store every edge of every single triangle
    const nFaces = faces.length / 3;
    const edges = new Float32Array(nFaces * 3 * 6); // 3 edges per face, 2 vertices per edge, 3 coords per vertex

    let offset = 0; // to write position in 鈥渆dges鈥� array

    // loop over each face ie. trianlge
    for (let f = 0; f < nFaces; f++) {
      const i0 = faces[f * 3]; // first index of current triangle
      const i1 = faces[f * 3 + 1]; // second index of current triangle
      const i2 = faces[f * 3 + 2]; // third index of current triangle

      //  the actual xyz coordinates of this triangle (each corner)
      const positions = [
        // point1 xyz, point2 xyz, point3 xyz
        [vertices[i0 * 3], vertices[i0 * 3 + 1], vertices[i0 * 3 + 2]],
        [vertices[i1 * 3], vertices[i1 * 3 + 1], vertices[i1 * 3 + 2]],
        [vertices[i2 * 3], vertices[i2 * 3 + 1], vertices[i2 * 3 + 2]],
      ];

      // three edges: 0-1, 1-2, 2-0, repersented as index-pairs into the positions array
      const edgeIndices = [
        [0, 1],
        [1, 2],
        [2, 0],
      ];

      // loop over each of the 3 edges:
      for (const [start, end] of edgeIndices) {
        // store the start vertices, which are 3 floats
        edges[offset++] = positions[start][0];
        edges[offset++] = positions[start][1];
        edges[offset++] = positions[start][2];
        // store the end vertices, which are 3 floats
        edges[offset++] = positions[end][0];
        edges[offset++] = positions[end][1];
        edges[offset++] = positions[end][2];
      }
    }

    return edges;
  }

  static cross(a, b) {
    // compute the cross product of two 3D vectors a and b
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
  }

  static normalize(v) {
    // normalize the 3d vector v
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (len > 1e-6) {
      v[0] /= len;
      v[1] /= len;
      v[2] /= len;
    } else {
      // fallback to defaults if length is too small
      v[0] = 0;
      v[1] = 0;
      v[2] = 1;
    }
  }
}