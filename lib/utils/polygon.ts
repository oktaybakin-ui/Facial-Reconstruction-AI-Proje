/**
 * Polygon Utility Functions
 * Geometrik hesaplamalar icin yardimci fonksiyonlar
 * - Alan hesaplama (Shoelace formulu)
 * - Nokta-poligon icinde mi kontrolu (Ray casting)
 * - Poligon cakisma kontrolu
 * - Centroid hesaplama
 * - Mesafe hesaplamalari
 */

type Point = { x: number; y: number };

/**
 * Shoelace formulu ile poligon alani hesaplar.
 * Mutlak alan dondurur (yonu onemli degil).
 */
export function polygonArea(points: Array<Point>): number {
  if (points.length < 3) return 0;

  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

/**
 * Ray casting algoritmasi ile bir noktanin poligon icinde olup olmadigini kontrol eder.
 */
export function pointInPolygon(
  point: Point,
  polygon: Array<Point>
): boolean {
  if (polygon.length < 3) return false;

  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Iki poligonun cakisip cakismadigini kontrol eder.
 * Herhangi bir poligonun kosesi digerinin icindeyse cakisma vardir.
 */
export function polygonsOverlap(
  poly1: Array<Point>,
  poly2: Array<Point>
): boolean {
  if (poly1.length < 3 || poly2.length < 3) return false;

  // poly1'in herhangi bir kosesi poly2'nin icinde mi?
  for (const vertex of poly1) {
    if (pointInPolygon(vertex, poly2)) {
      return true;
    }
  }

  // poly2'nin herhangi bir kosesi poly1'in icinde mi?
  for (const vertex of poly2) {
    if (pointInPolygon(vertex, poly1)) {
      return true;
    }
  }

  return false;
}

/**
 * Poligonun agirlik merkezini (centroid) hesaplar.
 */
export function polygonCentroid(points: Array<Point>): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return { x: points[0].x, y: points[0].y };
  if (points.length === 2) {
    return {
      x: (points[0].x + points[1].x) / 2,
      y: (points[0].y + points[1].y) / 2,
    };
  }

  let cx = 0;
  let cy = 0;
  let signedArea = 0;
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const cross = points[i].x * points[j].y - points[j].x * points[i].y;
    signedArea += cross;
    cx += (points[i].x + points[j].x) * cross;
    cy += (points[i].y + points[j].y) * cross;
  }

  signedArea /= 2;

  // Dejenere poligon kontrolu (alan sifira cok yakin)
  if (Math.abs(signedArea) < 1e-10) {
    // Basit ortalama al
    const sumX = points.reduce((s, p) => s + p.x, 0);
    const sumY = points.reduce((s, p) => s + p.y, 0);
    return { x: sumX / n, y: sumY / n };
  }

  cx /= 6 * signedArea;
  cy /= 6 * signedArea;

  return { x: cx, y: cy };
}

/**
 * Iki nokta arasindaki Oklid mesafesini hesaplar.
 */
export function pointDistance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Bir noktanin bir poligonun en yakin kenarindaki minimum mesafesini hesaplar.
 * Poligonun her kenari icin nokta-dogru parcasi mesafesi hesaplanir,
 * en kucuk deger dondurulur.
 */
export function pointToPolygonDistance(
  point: Point,
  polygon: Array<Point>
): number {
  if (polygon.length === 0) return Infinity;
  if (polygon.length === 1) return pointDistance(point, polygon[0]);

  let minDist = Infinity;
  const n = polygon.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dist = pointToSegmentDistance(point, polygon[i], polygon[j]);
    if (dist < minDist) {
      minDist = dist;
    }
  }

  return minDist;
}

/**
 * Bir noktanin bir dogru parcasina olan en kisa mesafesini hesaplar.
 * Nokta-dogru parcasi mesafesi formulu kullanilir.
 */
function pointToSegmentDistance(
  point: Point,
  segStart: Point,
  segEnd: Point
): number {
  const dx = segEnd.x - segStart.x;
  const dy = segEnd.y - segStart.y;
  const lengthSq = dx * dx + dy * dy;

  // Dogru parcasi dejenere (tek nokta)
  if (lengthSq === 0) {
    return pointDistance(point, segStart);
  }

  // Noktanin dogru parcasi uzerindeki projeksiyonu (t parametresi)
  let t = ((point.x - segStart.x) * dx + (point.y - segStart.y) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t)); // [0, 1] araligina sabitle

  // Projeksiyon noktasi
  const projX = segStart.x + t * dx;
  const projY = segStart.y + t * dy;

  return pointDistance(point, { x: projX, y: projY });
}
