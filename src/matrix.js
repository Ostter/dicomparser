import * as math from 'mathjs';

/*export function multiplyMatrix(A,B)
{
    let rowsA = A.length, colsA = A[0].length,
        rowsB = B.length, colsB = B[0].length,
        C = [];

    if (colsA !== rowsB) return false;

    for (let i = 0; i < rowsA; i++) C[i] = [];

    for (let k = 0; k < colsB; k++)
    { for (let i = 0; i < rowsA; i++)
    { let temp = 0;
        for (let j = 0; j < rowsB; j++) temp += A[i][j]*B[j][k];
        C[i][k] = temp;
    }
    }

    return C;
}*/

function splitSlash(src) {
    return src.replace(/['"]/g, "").split("\\").map(number => parseFloat(number));
}

//const for "1.2.840.113619.2.312.4120.8418826.10238.1389246409.981"
const ImageOrientationPatient = "1.0\\-0.0\\0.0\\-0.0\\1.0\\0.0";
let [ Xx, Xy, Xz, Yx, Yy, Yz ] = splitSlash(ImageOrientationPatient);

let [ Zx, Zy, Zz ] = math.cross(
                                [Xx, Xy, Xz],
                                [Yx, Yy, Yz]
);

const PixelSpacing = "0.9375\\0.9375";
let [ columnPixelResolution, rowPixelResolution ] = splitSlash(PixelSpacing);

const ImagePositionPatient = "-119.531\\-134.165\\-43.9149";
let [ Sx, Sy, Sz ] = splitSlash(ImagePositionPatient);

const SliceThickness = "1.0";
let [ zPixelResolution ] = splitSlash(SliceThickness);

/*export const matrixA = math.matrix([
    [Xx * columnPixelResolution, Yx * rowPixelResolution, Sx],
    [Xy * columnPixelResolution, Yy * rowPixelResolution, Sy],
    [Xz * columnPixelResolution, Yz * rowPixelResolution, Sz],
]);
*/

const matrixA = math.matrix([
    [Xx * columnPixelResolution, Yx * rowPixelResolution, Zx * zPixelResolution, Sx],
    [Xy * columnPixelResolution, Yy * rowPixelResolution, Zy * zPixelResolution, Sy],
    [Xz * columnPixelResolution, Yz * rowPixelResolution, Zz * zPixelResolution, Sz],
    [0, 0, 0, 1]
]);

export function coordToMatrixB (x,y,z) {
  return math.matrix([ [x], [y], [z], [1] ]);
}

export let mmToPixels = math.multiply.bind(null, matrixA);

//export function pixelsToMm(m) { return math.divide(m, matrixA) }
let matrixAInv = math.inv(matrixA);
export let pixelsToMm = math.multiply.bind(null, matrixAInv);
//export let pixelsToMmResult = pixelsToMm(mmToPixelsResult);


