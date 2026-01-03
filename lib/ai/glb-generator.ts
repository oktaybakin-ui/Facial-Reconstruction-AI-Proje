/**
 * GLB (GLTF Binary) mesh generation and export utilities
 */

import { Document, NodeIO, Primitive, Accessor } from '@gltf-transform/core';

export interface MeshData {
  vertices: Float32Array;
  indices: Uint16Array;
  normals?: Float32Array;
}

/**
 * Creates a GLB file from mesh data
 * @param meshData Mesh vertices, indices, and normals
 * @param metadata Optional metadata for the model
 * @returns Buffer containing the GLB file
 */
export async function createGLBFromMesh(
  meshData: MeshData,
  metadata?: { name?: string; author?: string }
): Promise<Buffer> {
  const io = new NodeIO();
  const document = new Document();

  // Set metadata
  if (metadata?.name) {
    document.getRoot().setDefaultScene(document.getRoot().listScenes()[0]);
  }

  // Create buffer for geometry data
  const buffer = document.createBuffer();

  // Create accessor for vertices
  const vertexAccessor = document
    .createAccessor()
    .setArray(meshData.vertices)
    .setType('VEC3')
    .setBuffer(buffer);

  // Create accessor for normals (if provided)
  let normalAccessor: Accessor | null = null;
  if (meshData.normals && meshData.normals.length > 0) {
    normalAccessor = document
      .createAccessor()
      .setArray(meshData.normals)
      .setType('VEC3')
      .setBuffer(buffer);
  }

  // Create accessor for indices
  const indexAccessor = document
    .createAccessor()
    .setArray(meshData.indices)
    .setType('SCALAR')
    .setBuffer(buffer);

  // Create material
  const material = document.createMaterial().setDoubleSided(true);

  // Create primitive
  const primitive = document
    .createPrimitive()
    .setAttribute('POSITION', vertexAccessor)
    .setIndices(indexAccessor)
    .setMaterial(material);

  if (normalAccessor) {
    primitive.setAttribute('NORMAL', normalAccessor);
  }

  // Create mesh
  const mesh = document.createMesh().addPrimitive(primitive);

  // Create node
  const node = document.createNode().setMesh(mesh);

  // Create scene
  const scene = document.createScene().addChild(node);
  document.getRoot().setDefaultScene(scene);

  // Write GLB
  const glbArrayBuffer = await io.writeBinary(document);
  return Buffer.from(glbArrayBuffer);
}
