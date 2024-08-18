function transformPolygonPoints(svgPoints, newOrigin, scale) {
    // Parse the SVG points string into an array of [x, y] pairs
    const pointsArray = svgPoints.trim().split(/\s+/).map(point => {
        const [x, y] = point.split(',').map(Number);
        return [x, y];
    });

    // Apply the transformation: shift and scale
    const transformedPoints = pointsArray.map(([x, y]) => {
        const shiftedX = (x - newOrigin.x) * scale;
        const shiftedY = (y - newOrigin.y) * scale;
        return [shiftedX, shiftedY];
    });

    return transformedPoints;
}

function adjustPolygon(vertices, offsetDistance) {
  // Helper function to calculate the normal vector of an edge
  function calculateNormal(p1, p2) {
    const edge = [p2[0] - p1[0], p2[1] - p1[1]];
    // Rotate 90 degrees to get normal: Inward normal for clockwise polygons
    const normal = [-edge[1], edge[0]];
    const length = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
    // Normalize
    return [normal[0] / length, normal[1] / length];
  }

  // Helper function to find intersection of two lines (p1p2 and p3p4)
  function findIntersection(p1, p2, p3, p4) {
    const det = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]);
    if (det === 0) {
      return null; // Parallel lines
    }
    const x = ((p1[0] * p2[1] - p1[1] * p2[0]) * (p3[0] - p4[0]) - (p1[0] - p2[0]) * (p3[0] * p4[1] - p3[1] * p4[0])) / det;
    const y = ((p1[0] * p2[1] - p1[1] * p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] * p4[1] - p3[1] * p4[0])) / det;
    return [x, y];
  }

  const n = vertices.length;
  const newVertices = [];
  for (let i = 0; i < n; i++) {
    const p1 = vertices[i];
    const p2 = vertices[(i + 1) % n];
    const p0 = vertices[(i - 1 + n) % n]; // Previous vertex

    const normal1 = calculateNormal(p0, p1);
    const normal2 = calculateNormal(p1, p2);

    // Scale normals by offset distance
    const scaledNormal1 = [normal1[0] * offsetDistance, normal1[1] * offsetDistance];
    const scaledNormal2 = [normal2[0] * offsetDistance, normal2[1] * offsetDistance];

    // Calculate adjusted points
    const adjustedP1 = [p1[0] + scaledNormal1[0], p1[1] + scaledNormal1[1]];
    const adjustedP2 = [p1[0] + scaledNormal2[0], p1[1] + scaledNormal2[1]];
    const adjustedP0 = [p0[0] + scaledNormal1[0], p0[1] + scaledNormal1[1]];
    const adjustedP3 = [p2[0] + scaledNormal2[0], p2[1] + scaledNormal2[1]];

    // Find intersection of lines (adjustedP0-adjustedP1) and (adjustedP2-adjustedP3)
    const newVertex = findIntersection(adjustedP0, adjustedP1, adjustedP2, adjustedP3);
    if (newVertex) {
      newVertices.push(newVertex);
    }
  }

  return newVertices;
}

function calculateNodeDistances(vertices,nodeAngles,innerThick) {
  // Function to calculate distance between two points

  function calculateDistance(p1, p2) {
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  const distances = []; // To store distances between consecutive vertices
  const n = vertices.length;

  for (let i = 0; i < n; i++) {
    const p1 = vertices[i];
    const p2 = vertices[(i + 1) % n]; // Ensure cyclic calculation back to the first vertex
    const distance = calculateDistance(p1, p2)-innerThick*0;
    distances.push(distance);
  }


  for (let i=0; i<distances.length; i++){
    let ii=0;
    if (i==0){
      ii=distances.length-1;
    }else{
      ii=i-1
    }

    if(Math.cos(Math.PI/2-(nodeAngles[i]-nodeAngles[ii])*Math.PI/180)>0){
      let refinSize=innerThick*Math.cos(Math.PI/2-(nodeAngles[i]-nodeAngles[ii])*Math.PI/180);
      let beta=(nodeAngles[i]-nodeAngles[ii])*Math.PI/180;
      if (beta <= -Math.PI / 2) {
        beta+=Math.PI*2
      }
      if (beta>=Math.PI/2 ){
        // console.log(beta*180/Math.PI)
      refinSize=innerThick*((1+Math.sin(beta-Math.PI/2))/(Math.cos(beta-Math.PI/2)));
      }
      distances[i]-=refinSize;
    }
  }

  return distances;
}

function calculateEdgeAnglesRelativeToXAxis(vertices) {
  // Function to calculate the angle of an edge relative to the x-axis
  function calculateAngleRelativeToXAxis(p1, p2) {
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const angleRadians = Math.atan2(dy, dx); // Angle in radians relative to the x-axis
    return angleRadians * (180 / Math.PI); // Convert to degrees
  }

  const angles = []; // To store angles of edges relative to the x-axis
  const n = vertices.length;

  for (let i = 0; i < n; i++) {
    const p1 = vertices[i];
    const p2 = vertices[(i + 1) % n]; // Next vertex, ensuring cyclic calculation
    const angle = calculateAngleRelativeToXAxis(p1, p2);
    angles.push(angle);
  }

  return angles;
}

function calculatePolygonArea(ZZ) {
  let area = 0; // Initialize area
  
  // Iterate over each point in the array
  for (let i = 0; i < ZZ.length; i++) {
      // Get the current and next point
      let j = (i + 1) % ZZ.length; // Wrap around to the first point at the end
      
      // Add to the area using the Shoelace formula
      area += (ZZ[i][0] * ZZ[j][1]) - (ZZ[j][0] * ZZ[i][1]);
  }
  
  // Divide by 2 and take the absolute value to get the final area
  return Math.abs(area / 2.0);
}

function calculateRefinSize(innerThick, nodeAngles, i, ii) {
  let refinSize = innerThick * Math.cos(Math.PI / 2 - (nodeAngles[i] - nodeAngles[ii]) * Math.PI / 180);

  let beta = (nodeAngles[i] - nodeAngles[ii]) * Math.PI / 180;
  if (beta <= -Math.PI / 2) {
    beta+=Math.PI*2
  }
  if (beta >= Math.PI / 2 ) {
    refinSize = innerThick * ((1 + Math.sin(beta - Math.PI / 2)) / (Math.cos(beta - Math.PI / 2)));
  }
  // refinSize=innerThick*((1+Math.sin(beta-Math.PI/2))/(Math.cos(beta-Math.PI/2)));
if (refinSize <= 0) {
    refinSize = 0;
  }
  // if (refinSize > 0) {
  //   console.log(`For i=${i}: beta = ${beta*180/Math.PI}, refinSize = ${refinSize}`);
  // }
  
  return refinSize;
}


export { transformPolygonPoints, adjustPolygon, calculateNodeDistances, calculateEdgeAnglesRelativeToXAxis ,calculatePolygonArea, calculateRefinSize};