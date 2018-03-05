/**
 * Generates TriangleMesh vertex data for a cone of a given radius length,
 * centered at the origin.
 * 
 * @param {Number} radius the radius of the disk
 * @param {Number} slices the number of triangles
 */
var generateConeData = function(radius=1.0, slices=16.0) {

    var v = []; //the position array

    for(let i = 0; i < slices; i++){
        let theta = ( (2*(Math.PI))/slices ) * i;
        let x = radius * Math.cos( theta );
        let y = radius * Math.sin( theta );
        let z = -1;
        v.push(x,y,z);
    }
    v.push(0,0,0);

    var n = [];
    for(let k = 0; k <= slices; k++){
        n.push(0,0,0);
    }

    var el = [];//index array

    for(let j = 0; j < slices; j++){
        el.push(slices,j,(j+1)%slices);
    }

    return {
        index: el,
        normal: n,
        position: v,
    };
};