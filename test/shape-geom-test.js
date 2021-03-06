var assert = require('assert'),
    api = require("../");


describe('mapshaper-shape-geom.js', function () {

  //       e
  //      / \
  //     /   \
  //    /  a  \
  //   /  / \  \
  //  h  d   b  f
  //   \  \ /  /
  //    \  c  /
  //     \   /
  //      \ /
  //       g
  //
  //   abcda, efghe
  //   0/-1,  1/-2

  var arcs = [[[3, 4, 3, 2, 3], [4, 3, 2, 3, 4]],
      [[3, 5, 3, 1, 3], [5, 3, 1, 3, 5]]];
  var arcData = new api.ArcDataset(arcs);
  var lyr1 = {
        geometry_type: 'polygon',
        data: new api.data.DataTable([{foo: 1}]),
        shapes: [[[1], [-1]]]
      };
  var lyr2 = {
        geometry_type: 'polygon',
        data: new api.data.DataTable([{foo: 4}]),
        shapes: [[[1], [-1], [0]]]
      };

  describe('figure 1', function () {
    it('getShapeArea()', function () {
      assert.equal(api.getShapeArea(lyr1.shapes[0], arcData), 6)
      assert.equal(api.getShapeArea(lyr2.shapes[0], arcData), 8)
    })

    it('getShapeCentroid()', function () {
      assert.deepEqual(api.getShapeCentroid(lyr1.shapes[0], arcData), {x: 3, y: 3})
    })

    it('getAvgPathXY()', function () {
      assert.deepEqual(api.getAvgPathXY([1], arcData), {x: 3, y: 3})
    })

    it('getMaxPath()', function () {
      assert.deepEqual(api.getMaxPath(lyr2.shapes[0], arcData), [1])
    })

    describe('testPointInRing()', function () {

      it('test inside', function () {
        // vertical ray at x hits a vertex on the path
        assert.equal(api.testPointInRing(3, 3, [1], arcData), true);
        // no ray-vertex intersection
        assert.equal(api.testPointInRing(4, 3, [1], arcData), true);
        assert.equal(api.testPointInRing(1.3, 3, [1], arcData), true);
      })

      it('test outside', function () {
        assert.equal(api.testPointInRing(5, 2, [1], arcData), false);
        assert.equal(api.testPointInRing(4, 1, [1], arcData), false);
        assert.equal(api.testPointInRing(1, 2, [1], arcData), false);
        assert.equal(api.testPointInRing(5, 4, [1], arcData), false);
        assert.equal(api.testPointInRing(3, 0.5, [1], arcData), false);

      })

      it('test touching a boundary vertex (false)', function() {
        assert.equal(api.testPointInRing(5, 3, [1], arcData), false);
        assert.equal(api.testPointInRing(3, 5, [1], arcData), false);
        assert.equal(api.testPointInRing(3, 1, [1], arcData), false);
        assert.equal(api.testPointInRing(1, 3, [1], arcData), false);
      })
    })

    describe('testPointInShape()', function () {
      it('point in a hole', function () {
        assert.equal(api.testPointInShape(3, 3, lyr1.shapes[0], arcData), false)
        assert.equal(api.testPointInShape(3.1, 3.1, lyr1.shapes[0], arcData), false)
      })

      it('point outside hole', function () {
        assert.equal(api.testPointInShape(3, 1.2, lyr1.shapes[0], arcData), true)
        assert.equal(api.testPointInShape(3.1, 1.3, lyr1.shapes[0], arcData), true)
      })

      it('point outside shape', function () {
        assert.equal(api.testPointInShape(3.1, 1, lyr1.shapes[0], arcData), false)
        assert.equal(api.testPointInShape(3, 0.2, lyr1.shapes[0], arcData), false)
      })
    })

    describe('getPointToPathDistance()', function () {
      it('exterior distance', function () {
        assert.equal(api.getPointToPathDistance(3, 0, [1], arcData), 1);
      })

      it('interior distance', function() {
        assert.equal(api.getPointToPathDistance(3, 3, [1], arcData), Math.sqrt(2));
        assert.equal(api.getPointToPathDistance(3, 4, [1], arcData), Math.sqrt(2) / 2);
        assert.equal(api.getPointToPathDistance(4, 3, [1], arcData), Math.sqrt(2) / 2);
      })

      it('point is on boundary', function() {
        assert.equal(api.getPointToPathDistance(3, 5, [1], arcData), 0);
        assert.equal(api.getPointToPathDistance(4, 4, [1], arcData), 0);
        assert.equal(api.getPointToPathDistance(1, 3, [1], arcData), 0);
        assert.equal(api.getPointToPathDistance(2, 2, [1], arcData), 0);
      })

    })
  })

})