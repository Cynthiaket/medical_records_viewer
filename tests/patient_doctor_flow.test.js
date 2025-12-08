const request = require('supertest');
const app = require('../src/app');

describe('Patient / Doctor flow', () => {
  let patient;
  let record;

  it('creates a patient', async () => {
    const res = await request(app).post('/api/patients').send({name:'Test Patient', dob:'1990-01-01'});
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    patient = res.body;
  });

  it('patient creates a record', async () => {
    const res = await request(app).post('/api/records').send({patientId:patient.id, conditions:['asthma']});
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    record = res.body;
  });

  it('doctor assigns medication', async () => {
    const res = await request(app).post('/api/assignments').send({recordId:record.id, doctor:'Dr. Who', medication:'Inhaler'});
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('doctor can view records with assignments', async () => {
    const res = await request(app).get('/api/doctors/records');
    expect(res.statusCode).toBe(200);
    const found = res.body.find(r=>r.id===record.id);
    expect(found).toBeTruthy();
    expect(found.assignments.length).toBeGreaterThan(0);
  });

  it('patient can view his records', async () => {
    const res = await request(app).get(`/api/patients/${patient.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.records.find(r=>r.id===record.id)).toBeTruthy();
  });
});
