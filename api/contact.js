const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function send(res,status,body){
  res.status(status).setHeader('Content-Type','application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function clean(value,max=3000){
  return String(value||'').trim().slice(0,max);
}

async function saveLead(payload){
  const url=(process.env.SUPABASE_URL||'').replace(/\/$/,'');
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY||'';
  if(!url||!key) return {skipped:true};
  const r=await fetch(`${url}/rest/v1/website_leads`,{
    method:'POST',
    headers:{
      apikey:key,
      Authorization:`Bearer ${key}`,
      'Content-Type':'application/json',
      Prefer:'return=minimal'
    },
    body:JSON.stringify(payload)
  });
  if(!r.ok) throw new Error(`Supabase ${r.status}`);
  return {ok:true};
}

async function sendEmail(payload){
  const key=process.env.RESEND_API_KEY||'';
  const from=process.env.CONTACT_FROM_EMAIL||''; // p.ej. LINK <hola@tudominio.cl>
  const to=process.env.CONTACT_TO_EMAIL||'';     // inbox interna de LINK
  if(!key||!from||!to) return {skipped:true};
  const subject=`Nueva oportunidad · ${payload.business}`;
  const text=[
    'Nueva consulta desde la website LINK',
    '',
    `Nombre: ${payload.name}`,
    `Negocio: ${payload.business}`,
    `Correo: ${payload.email}`,
    `Servicio: ${payload.service}`,
    `Origen: ${payload.source}`,
    '',
    'Qué quiere resolver:',
    payload.need
  ].join('\n');
  const r=await fetch('https://api.resend.com/emails',{
    method:'POST',
    headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
    body:JSON.stringify({from,to:[to],reply_to:payload.email,subject,text})
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.message||`Resend ${r.status}`);
  return {ok:true,id:data.id||null};
}

export default async function handler(req,res){
  if(req.method!=='POST') return send(res,405,{ok:false,error:'Method not allowed'});
  try{
    const payload={
      name:clean(req.body?.name,120),
      business:clean(req.body?.business,180),
      email:clean(req.body?.email,220).toLowerCase(),
      need:clean(req.body?.need,3000),
      source:clean(req.body?.source||'website-link',80),
      service:clean(req.body?.service||'consulta-general',100),
      created_at:new Date().toISOString()
    };
    if(!payload.name||!payload.business||!EMAIL_RE.test(payload.email)||!payload.need){
      return send(res,400,{ok:false,error:'Datos incompletos o correo inválido'});
    }

    const results=await Promise.allSettled([saveLead(payload),sendEmail(payload)]);
    const failures=results.filter(x=>x.status==='rejected');
    const configured=Boolean(process.env.RESEND_API_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY);
    if(!configured) return send(res,503,{ok:false,error:'Contact gateway is not configured'});
    if(failures.length===results.length) return send(res,502,{ok:false,error:'No fue posible registrar la consulta'});
    return send(res,200,{ok:true});
  }catch(error){
    return send(res,500,{ok:false,error:'Contact gateway failed'});
  }
}
