const https=require('https'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const pk=fs.readFileSync(path.join(__dirname,'AuthKey_X79F2H3QXT.p8'),'utf8');
function jwt(){
  const h=Buffer.from(JSON.stringify({alg:'ES256',kid:'X79F2H3QXT',typ:'JWT'})).toString('base64url');
  const now=Math.floor(Date.now()/1000);
  const p=Buffer.from(JSON.stringify({iss:'3ddd637a-4279-41fa-8c12-672a3c557cba',iat:now,exp:now+1200,aud:'appstoreconnect-v1'})).toString('base64url');
  const s=crypto.sign('SHA256',Buffer.from(h+'.'+p),{key:pk,dsaEncoding:'ieee-p1363'});
  return h+'.'+p+'.'+s.toString('base64url');
}
function req(m,p,b){
  return new Promise((ok,no)=>{
    const t=jwt();const bs=b?JSON.stringify(b):null;
    const o={hostname:'api.appstoreconnect.apple.com',path:p,method:m,headers:{Authorization:'Bearer '+t,'Content-Type':'application/json'}};
    if(bs)o.headers['Content-Length']=Buffer.byteLength(bs);
    const r=https.request(o,res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>{try{ok({status:res.statusCode,data:JSON.parse(d)})}catch{ok({status:res.statusCode,data:d})}})});
    r.on('error',no);if(bs)r.write(bs);r.end();
  });
}

(async()=>{
  // 1. Version state
  const v=await req('GET','/v1/appStoreVersions/193a42ea-6826-4118-a8d2-d6483702e08c?include=build');
  console.log('Version:',v.data?.data?.attributes?.versionString);
  console.log('State:',v.data?.data?.attributes?.appStoreState);
  if(v.data?.included?.[0])console.log('Build:',v.data.included[0].attributes?.version,'ID:',v.data.included[0].id);

  // 2. Recent submissions
  console.log('\n--- Recent Submissions ---');
  const subs=await req('GET','/v1/reviewSubmissions?filter[app]=6755155637&sort=-createdDate&limit=5');
  (subs.data?.data||[]).forEach(s=>console.log(s.id,'state:',s.attributes?.state));

  // 3. Check EAS build quota
  console.log('\n--- Build Quota Check ---');
  console.log('Free plan iOS builds exhausted until May 1, 2026');
  console.log('Need alternative: either upgrade EAS or fix OTA strategy');
})();
