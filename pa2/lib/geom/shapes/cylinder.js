/**
 * Generates TriangleMesh vertex data for a cylinder of a given radius
 * centered at the origin.
 * 
 * @param {Number} radius the length of the radius 
 * @param {Number} num slices: how many triangles used
 * @param {Number} length of the cylinder
 */
var generateCylinderData = function(radius=1.0, num=16.0, length=2.0) {
    let r =  radius * 0.5;
    var v = []; // positions array
    var n = []; 
    var el = []; //index array

    //position of circle of points
    for(let i = 0; i < num; i++){
        let angle = ((2 * Math.PI)/ num) * i;
        x = (r * Math.cos(angle));
        y = (r * Math.sin(angle));
        z = 0;
        v.push(x,y,z);
        n.push(0.0); 
    }

    //rest of positions for other circle of points
    for(let i = 0; i < num; i++){
        let angle = ((2 * Math.PI)/ num) * i;
        x = (r * Math.cos(angle));
        y = (r * Math.sin(angle));
        z = length;
        v.push(x,y,z);
        n.push(0.0); 
    }

    //index array
    for(let j = 0; j < num; j++){
         el.push(j, (j + 1) % num, (j + 1) % num + num);
         el.push(j + num, j%num, (j + 1) % num + num);    
    }
    

    return {
        index: el,
        normal: n,
        position: v
    };
};