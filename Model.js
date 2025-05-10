function Model(name) {
    this.name = name;
    this.iVertexBuffer = gl.createBuffer();
    this.iIndexBuffer = gl.createBuffer();
    this.count = 0;
    this.type = gl.TRIANGLES;

    this.BufferData = function (vertices, indices) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);

        if (indices) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STREAM_DRAW);
            this.count = indices.length;
        } else {
            this.count = vertices.length / 3;
        }
    }

    this.Draw = function () {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);

        if (this.type === gl.TRIANGLES && this.iIndexBuffer) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
            gl.drawElements(this.type, this.count, gl.UNSIGNED_SHORT, 0);
        } else {
            gl.drawArrays(this.type, 0, this.count);
        }
    }

    this.DrawWireframe = function () {
        if (this.iIndexBuffer) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
            for (let p = 0; p < this.count; p += 3)
                gl.drawElements(gl.LINE_LOOP, 3, gl.UNSIGNED_SHORT, p * 2);
        }
    }

    // Surface of Revolution of a General Sinusoid
    this.CreateVertex = function (a, n, R, r, b) {
        const x = r * Math.cos(b),
            y = r * Math.sin(b),
            z = a * Math.cos(n * Math.PI * r / R);
        return [x, y, z];
    }

    this.CreateAstroidalTorus = function (a, r, segmentsCount, theta) {
        let vertices = [];
        let indices = [];

        let uSegments = segmentsCount;
        let vSegments = segmentsCount;

        let vertexCount = (uSegments + 1) * (vSegments + 1);

        for (let i = 0; i <= uSegments; i++) {
            let u = -Math.PI + (2 * Math.PI * i) / uSegments;
            if (i === uSegments) u = -Math.PI;

            let x_u = a * Math.pow(Math.cos(u), 3);
            let z_u = a * Math.pow(Math.sin(u), 3);

            for (let j = 0; j <= vSegments; j++) {
                let v = (2 * Math.PI * j) / vSegments;
                if (j === vSegments) v = 0;

                let X = (r + x_u * Math.cos(theta) - z_u * Math.sin(theta)) * Math.cos(v);
                let Y = (r + x_u * Math.cos(theta) - z_u * Math.sin(theta)) * Math.sin(v);
                let Z = x_u * Math.sin(theta) + z_u * Math.cos(theta);

                vertices.push(X, Y, Z);
            }
        }

        for (let i = 0; i < uSegments; i++) {
            for (let j = 0; j < vSegments; j++) {
                let current = i * (vSegments + 1) + j;
                let next = (i + 1) * (vSegments + 1) + j;

                indices.push(current, next, current + 1);
                indices.push(current + 1, next, next + 1);
            }
        }

        // u-seam
        for (let j = 0; j < vSegments; j++) {
            let current = (uSegments - 1) * (vSegments + 1) + j;
            let next = j;

            indices.push(current, next, current + 1);
            indices.push(current + 1, next, next + 1);
        }

        // v-seam
        for (let i = 0; i < uSegments; i++) {
            let current = i * (vSegments + 1) + (vSegments - 1);
            let next = (i + 1) * (vSegments + 1) + (vSegments - 1);

            indices.push(current, next, i * (vSegments + 1));
            indices.push(i * (vSegments + 1), next, (i + 1) * (vSegments + 1));
        }

        // кут
        let last = (uSegments - 1) * (vSegments + 1) + (vSegments - 1);
        let first = 0;

        indices.push(last, vSegments - 1, uSegments * (vSegments + 1) - 1);
        indices.push(uSegments * (vSegments + 1) - 1, vSegments - 1, first);

        this.BufferData(new Float32Array(vertices), new Uint16Array(indices));
    }

}
