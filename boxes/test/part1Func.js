
import { transformPolygonPoints, adjustPolygon, calculateNodeDistances, calculateEdgeAnglesRelativeToXAxis , calculateRefinSize} from './geometryUtils.js';
import config from './geometryConfig.json';
export  function part1Func(isBritishUnits,xt, yt, zt,innerThick, outerThick,isOpen,otherParams, intOrExtDim, dataType) {

   // constant parameters
  let s=1;
if (isBritishUnits===1){
s=1/25.4;
}
if (otherParams.isOpenBox.value===1){
  zt-=innerThick
}
  let gapFit =otherParams.gapFit.value;
  let tol = 0.8*s;



  let ZZZ = [];///for holes
  let ZZ=[];  //main contour
  

  const svgPointsZZZ = config.svgPointsZZZ;
  const newOrigin = config.newOrigin;

  const scale = 1*yt/config.initialOveralSize.y; // Define scaling factor (e.g., 1 for no scaling)

  ZZZ = transformPolygonPoints(svgPointsZZZ, newOrigin, scale);




let numHoles=1;
let qq=1;
let alpha=0;
let offset=config.offset.outside*innerThick

let nodes4Holes=adjustPolygon(ZZZ, offset); //offset edge nodes
let nodeAngles = calculateEdgeAnglesRelativeToXAxis(nodes4Holes);//Relative angle of each edge to X-axis
let nodeDist4Holes=calculateNodeDistances(nodes4Holes,nodeAngles,innerThick);//calculated long for each Edge 


let edgeNum=1;
let refinSize=calculateRefinSize(innerThick, nodeAngles, edgeNum, edgeNum-1)


alpha=nodeAngles[edgeNum]*Math.PI/180;
let edgeLong=nodeDist4Holes[edgeNum];

numHoles = Math.floor((edgeLong) / (otherParams.holesConst.value));
  if (numHoles<1){
    numHoles=1;
  }
qq=(edgeLong)/numHoles;





ZZ.push([0, 0]);
for (let i = 0; i < numHoles; i++) {
  ZZ.push([qq / 4 + i * qq, 0]);
  ZZ.push([qq / 4 + i * qq, -innerThick+tol]);
  ZZ.push([qq / 4 + i * qq +tol , -innerThick+0.1*s]);
  ZZ.push([3 * qq / 4-tol + i * qq, -innerThick+0.1*s ]);
  ZZ.push([3 * qq / 4 + i * qq, -innerThick+tol ]);
  ZZ.push([3 * qq / 4 + i * qq, 0]);
}


ZZ.push([edgeLong, 0]);
ZZ.push([edgeLong, zt-2*innerThick]);


for (let i = 0; i < numHoles; i++) { 
  ZZ.push([edgeLong-qq/4-i*qq, zt-2*innerThick]);
  ZZ.push([edgeLong-qq/4-i*qq, zt-2*innerThick-tol+innerThick]);
  ZZ.push([edgeLong-qq/4-i*qq-tol, zt-2*innerThick-0.1*s+innerThick]);
  ZZ.push([edgeLong-3*qq/4-i*qq+tol, zt-2*innerThick-0.1*s+innerThick]);
  ZZ.push([edgeLong-3*qq/4-i*qq, zt-2*innerThick-tol+innerThick]);
  ZZ.push([edgeLong-3*qq/4-i*qq, zt-2*innerThick]);
}
ZZ.push([0, zt-2*innerThick]);

let cutContours=[];





const svgNumber ="-0.0587,14.9406 7.3779,14.9406 7.3779,7.504 -0.0587,7.504 -0.0587,0.0673 7.3779,0.0673 "
let numberPosition={
  "x": (-edgeLong/2)/s,
  "y": (-(zt-innerThick))/s
}
let lineContours =[];
let lineContour1=transformPolygonPoints(svgNumber, numberPosition, s*0.7);;


lineContours.push(lineContour1);


let dxfpos=[];
let pos=0;
let rownumpos=[1];
let rownum=1;
for (let i=0; i<nodeDist4Holes.length; i++){
  if(pos>=(2*config.initialOveralSize.x*yt/config.initialOveralSize.y)){
    pos=-nodeDist4Holes[i]-10*s;
    rownum++
  }
pos+=nodeDist4Holes[i]+10*s;
dxfpos.push(pos)
rownumpos.push(rownum)
}
let volume=edgeLong*(zt-2*innerThick)*innerThick/1000000000/s/s/s;
let internalVolume=0;



    if (dataType === 'InitialPosition') {
      return [-config.initialOveralSize.y/config.initialOveralSize.y*yt/1.5,innerThick, (edgeNum-1)*2*innerThick];
    
    } else if (dataType === 'time2show') {
      return [edgeNum, 1];
    }else if (dataType === 'position') {
      
      return [yt/2-nodes4Holes[edgeNum][1]-innerThick*Math.cos(alpha)-refinSize*Math.sin(alpha),innerThick, config.initialOveralSize.x/config.initialOveralSize.y/2*yt-nodes4Holes[edgeNum][0]+innerThick*Math.sin(alpha)-refinSize*Math.cos(alpha)];
    }else if(dataType === 'InitialRotation'){
    
      return [0, Math.PI, 0];
 
    }
      else if (dataType === 'rotation') {
      
        return [0, (alpha+Math.PI/2), 0];
      
      }
else if (dataType === 'inFront') {
      // Return the internal or external part
      return 0;
} else if (dataType === 'dxfPos') {
  // Return the part position in dxf file
  return [dxfpos[edgeNum-1],-rownumpos[edgeNum]*(zt+10*s)];}
else if (dataType === 'cutContours') {
  
  return cutContours;
} else if (dataType === 'lineContours') {
  
  return lineContours;
} 
else if (dataType === 'volume') {
  
  return volume;
} else if (dataType === 'internalVolume') {
  
  return internalVolume;
} 
else {
  // Return the contour data
  return ZZ;
}
}

export default part1Func;
