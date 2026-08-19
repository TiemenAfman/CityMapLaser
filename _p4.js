const fs = require('fs');
let s = fs.readFileSync('citymap.html', 'utf8');

// ---------- 1. round joints / caps helper ----------
const anchorBar = 'function addBar(tris, a, b, w, z0, z1, clamp){';
if (!s.includes(anchorBar)) throw new Error('addBar niet gevonden');
s = s.replace(anchorBar,
`// Vertical cylinder: used as a round joint at bends and a round cap at dead
// ends, so a street never ends in a square nub.
function addDisc(tris, c, r, z0, z1, n){
  n = n || Math.max(8, Math.min(16, Math.round(r*10)));
  const ring = [];
  for(let i=0;i<n;i++){
    const a = i/n*2*Math.PI;
    ring.push([c[0]+r*Math.cos(a), c[1]+r*Math.sin(a)]);
  }
  for(let i=0;i<n;i++){
    const j=(i+1)%n, p=ring[i], q=ring[j];
    tris.push([[c[0],c[1],z1],[p[0],p[1],z1],[q[0],q[1],z1]]);      // top fan
    tris.push([[c[0],c[1],z0],[q[0],q[1],z0],[p[0],p[1],z0]]);      // bottom fan
    triAddQuad(tris, [p[0],p[1],z0],[q[0],q[1],z0],[q[0],q[1],z1],[p[0],p[1],z1]);
  }
}
${anchorBar}`);

// addBar gains per-end extension control: extend into joints, but leave a true
// dead end unextended so the round cap sits exactly on the endpoint.
s = s.replace('function addBar(tris, a, b, w, z0, z1, clamp){',
              'function addBar(tris, a, b, w, z0, z1, clamp, extA, extB){');
const oldExt = `  const e=w/2;                                     // extend ends so joints overlap
  const A=[a[0]-ux*e, a[1]-uy*e], B=[b[0]+ux*e, b[1]+uy*e];`;
const newExt = `  const ea = (extA === false) ? 0 : w/2;           // extend into joints only
  const eb = (extB === false) ? 0 : w/2;
  const A=[a[0]-ux*ea, a[1]-uy*ea], B=[b[0]+ux*eb, b[1]+uy*eb];`;
if (!s.includes(oldExt)) throw new Error('extend-regel niet gevonden');
s = s.replace(oldExt, newExt);

// ---------- 2. gentler width progression, no cap ----------
const oldW = '    const w = Math.min(roadW * (grp.rel/0.7), roadW*3);';
const newW = `    // Straight rel/0.7 scaling made major hit the cap and left a 71% jump
    // between neighbouring classes, which reads as a step at every junction.
    const w = roadW * (1 + 0.55*(grp.rel/0.7 - 1));`;
if (!s.includes(oldW)) throw new Error('breedte-regel niet gevonden');
s = s.replace(oldW, newW);

// ---------- 3. emit bars with joints and caps ----------
const oldEmit = `    for(const line of grp.polys){
      for(let i=0;i+1<line.length;i++) addBar(tris, P(line[i]), P(line[i+1]), w, baseT-sink, zTop, clamp);
    }`;
const newEmit = `    for(const line of grp.polys){
      const pts = line.map(P);
      const last = pts.length-1;
      for(let i=0;i<last;i++){
        addBar(tris, pts[i], pts[i+1], w, baseT-sink, zTop, clamp,
               i>0 || undefined, i+1<last || undefined);
      }
      // round cap on a genuine dead end; a road cut off at the plate edge keeps
      // its square end, otherwise the cap would bulge past the plate
      for(const end of [pts[0], pts[last]]) if(!onEdge(end)) addDisc(tris, end, w/2, baseT-sink, zTop);
      // round joint wherever the road actually turns
      for(let i=1;i<last;i++){
        const p=pts[i-1], c=pts[i], n=pts[i+1];
        const a1=Math.atan2(c[1]-p[1], c[0]-p[0]), a2=Math.atan2(n[1]-c[1], n[0]-c[0]);
        let d=Math.abs(a2-a1); if(d>Math.PI) d=2*Math.PI-d;
        if(d > 0.35) addDisc(tris, c, w/2, baseT-sink, zTop);   // ~20 degrees
      }
    }`;
if (!s.includes(oldEmit)) throw new Error('emit-blok niet gevonden');
s = s.replace(oldEmit, newEmit);

// onEdge helper, next to the clamp
const anchorClamp = '  const clamp = circle';
const edgeDef = `  const EPS = 0.05;
  const onEdge = circle
    ? (q => Math.abs(Math.hypot(q[0]-cCx, q[1]-cCy) - cR) < EPS)
    : (q => q[0]<EPS || q[1]<EPS || q[0]>fmt.w-EPS || q[1]>fmt.h-EPS);
${anchorClamp}`;
if (!s.includes(anchorClamp)) throw new Error('clamp-anker niet gevonden');
s = s.replace(anchorClamp, edgeDef);

fs.writeFileSync('citymap.html', s);
console.log('ronde verbindingen + breedtes aangepast');
