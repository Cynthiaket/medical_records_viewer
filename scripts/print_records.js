const store = require('../src/lib/store');
(async ()=>{
  const state = await store.read();
  const records = state.records || [];
  const patients = state.patients || [];
  const byId = new Map(patients.map(p=>[p.id,p]));
  const enriched = records.map(r=> ({...r, patient: byId.get(r.patientId)||null}));
  console.log(JSON.stringify(enriched, null, 2));
})();
