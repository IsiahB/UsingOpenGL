/**
 * Generates TriangleMesh vertex data for a disk of a given radius length,
 * centered at the origin.
 * 
 * @param {Number} radius the radius of the disk
 */
var generateDiskData = function(radius=1.0, slices=16.0) {

    var v = []; //the position array

    for(let i = 0; i < slices; i++){
        let theta = ( (2*(Math.PI))/slices ) * i;
        let x = radius * Math.cos( theta );
        let y = radius * Math.sin( theta );
        let z = 0;
        v.push(x,y,z);
    }
    v.push(0,0,0);

    var n = [];
    for(let k = 0; k <= slices; k++){
        n.push(0,0,0);
    }

    var tc = [
        // Q1
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        // Q2
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        // Q3
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        // Q4
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
    ];

    var el = [];//index array

    for(let j = 0; j < slices; j++){
        el.push(slices,j,(j+1)%slices);
    }

    return {
        index: el,
        normal: n,
        position: v,
        texCoord: tc
    };
};