import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
/**
 * ...
 * @author
 */
export class Tool {
    constructor() {
    }
    static linearModel(sprite3D, lineSprite3D, color) {
        var vertex1 = new Vector3();
        var vertex2 = new Vector3();
        var vertex3 = new Vector3();
        var lineCount = 0;
        if (sprite3D instanceof MeshSprite3D) {
            var meshSprite3D = sprite3D;
            var mesh = meshSprite3D.meshFilter.sharedMesh;
            var vbBuffer = mesh._vertexBuffer;
            var vbBufferData = vbBuffer.getFloat32Data();
            var ibBufferData = mesh._indexBuffer.getData();
            var vertexStrideCount = vbBuffer.vertexDeclaration.vertexStride / 4;
            var loopCount = 0;
            var index = 0;
            for (var i = 0; i < ibBufferData.length; i += 3) {
                loopCount = 0;
                index = 0;
                vertex1.x = vbBufferData[ibBufferData[i + loopCount] * vertexStrideCount + index++];
                vertex1.y = vbBufferData[ibBufferData[i + loopCount] * vertexStrideCount + index++];
                vertex1.z = vbBufferData[ibBufferData[i + loopCount] * vertexStrideCount + index++];
                loopCount++;
                index = 0;
                vertex2.x = vbBufferData[ibBufferData[i + loopCount] * vertexStrideCount + index++];
                vertex2.y = vbBufferData[ibBufferData[i + loopCount] * vertexStrideCount + index++];
                vertex2.z = vbBufferData[ibBufferData[i + loopCount] * vertexStrideCount + index++];
                loopCount++;
                index = 0;
                vertex3.x = vbBufferData[ibBufferData[i + loopCount] * vertexStrideCount + index++];
                vertex3.y = vbBufferData[ibBufferData[i + loopCount] * vertexStrideCount + index++];
                vertex3.z = vbBufferData[ibBufferData[i + loopCount] * vertexStrideCount + index++];
                loopCount++;
                Vector3.transformCoordinate(vertex1, meshSprite3D.transform.worldMatrix, vertex1);
                Vector3.transformCoordinate(vertex2, meshSprite3D.transform.worldMatrix, vertex2);
                Vector3.transformCoordinate(vertex3, meshSprite3D.transform.worldMatrix, vertex3);
                lineSprite3D.addLine(vertex1, vertex2, color, color);
                lineSprite3D.addLine(vertex2, vertex3, color, color);
                lineSprite3D.addLine(vertex3, vertex1, color, color);
            }
        }
        for (var i = 0, n = sprite3D.numChildren; i < n; i++)
            Tool.linearModel(sprite3D.getChildAt(i), lineSprite3D, color);
    }
    static DrawBoundingBox(sprite3D, sprite, color) {
        var boundingBox = sprite3D.meshRenderer.bounds._boundBox;
        boundingBox.getCorners(Tool.corners);
        /*lineSprite3D.addLine(corners[0], corners[1], Color.RED, Color.RED);
        lineSprite3D.addLine(corners[1], corners[2], Color.RED, Color.RED);
        lineSprite3D.addLine(corners[2], corners[3], Color.RED, Color.RED);
        lineSprite3D.addLine(corners[3], corners[0], Color.RED, Color.RED);
        lineSprite3D.addLine(corners[4], corners[5], Color.RED, Color.RED);
        lineSprite3D.addLine(corners[5], corners[6], Color.RED, Color.RED);
        lineSprite3D.addLine(corners[6], corners[7], Color.RED, Color.RED);
        lineSprite3D.addLine(corners[7], corners[4], Color.RED, Color.RED);
        lineSprite3D.addLine(corners[0], corners[4], Color.RED, Color.RED);
        lineSprite3D.addLine(corners[1], corners[5], Color.RED, Color.RED);
        lineSprite3D.addLine(corners[2], corners[6], Color.RED, Color.RED);
        lineSprite3D.addLine(corners[3], corners[7], Color.RED, Color.RED);*/
        var rotate = new Vector3(0, 0, 90);
        Tool.DrawTwelveLines(Tool.corners[0], Tool.corners[1], rotate, sprite);
        rotate.setValue(0, 0, 0);
        Tool.DrawTwelveLines(Tool.corners[1], Tool.corners[2], rotate, sprite);
        rotate.setValue(0, 0, 90);
        Tool.DrawTwelveLines(Tool.corners[2], Tool.corners[3], rotate, sprite);
        rotate.setValue(0, 0, 0);
        Tool.DrawTwelveLines(Tool.corners[3], Tool.corners[0], rotate, sprite);
        rotate.setValue(0, 0, 90);
        Tool.DrawTwelveLines(Tool.corners[4], Tool.corners[5], rotate, sprite);
        rotate.setValue(0, 0, 0);
        Tool.DrawTwelveLines(Tool.corners[5], Tool.corners[6], rotate, sprite);
        rotate.setValue(0, 0, 90);
        Tool.DrawTwelveLines(Tool.corners[6], Tool.corners[7], rotate, sprite);
        rotate.setValue(0, 0, 0);
        Tool.DrawTwelveLines(Tool.corners[7], Tool.corners[4], rotate, sprite);
        rotate.setValue(90, 0, 0);
        Tool.DrawTwelveLines(Tool.corners[0], Tool.corners[4], rotate, sprite);
        rotate.setValue(90, 0, 0);
        Tool.DrawTwelveLines(Tool.corners[1], Tool.corners[5], rotate, sprite);
        rotate.setValue(90, 0, 0);
        Tool.DrawTwelveLines(Tool.corners[2], Tool.corners[6], rotate, sprite);
        rotate.setValue(90, 0, 0);
        Tool.DrawTwelveLines(Tool.corners[3], Tool.corners[7], rotate, sprite);
        /*for (var i:int = 0; i < 12; i++ ){
            
        }
        var length:Number = Math.abs(corners[0].x - corners[1].x);
        var cylinder:MeshSprite3D = scene.addChild(new MeshSprite3D(PrimitiveMesh.createCylinder(0.004, length, 8))) as MeshSprite3D;
        cylinder.transform.rotate(new Vector3(0, 0, 90), false, false);
        var cylPos:Vector3 = cylinder.transform.position;
        var x:Number = corners[0].x + corners[1].x;
        var y:Number = corners[0].y + corners[1].y;
        var z:Number = corners[0].z + corners[1].z;
        cylPos.setValue(x / 2, y / 2, z / 2);
        cylinder.transform.position = cylPos;*/
    }
    static DrawTwelveLines(start, end, rotate, sprite3D) {
        var length = Vector3.distance(start, end);
        var cylinder = sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createCylinder(0.004, length, 3)));
        cylinder.transform.rotate(rotate, true, false);
        var cylPos = cylinder.transform.position;
        var x = start.x + end.x;
        var y = start.y + end.y;
        var z = start.z + end.z;
        cylPos.setValue(x / 2, y / 2, z / 2);
        cylinder.transform.position = cylPos;
    }
}
Tool.corners = [];
Tool.lineWidth = 0.1;
