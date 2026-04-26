// devDependency required: "supertest": "7.0.0"
// Run: npm install --save-dev supertest

const request = require('supertest');
const app = require('../server');

describe('Todo API', () => {
  // Note: in-memory store persists across tests within this file.
  // Tests are ordered to account for shared state.

  let createdId;

  // --- CRUD happy path ---

  test('POST /api/todos creates a todo', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ title: 'Buy milk' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'Buy milk', done: false });
    expect(res.body.id).toBeDefined();
    createdId = res.body.id;
  });

  test('GET /api/todos lists todos', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(t => t.id === createdId)).toBe(true);
  });

  test('PATCH /api/todos/:id toggles done', async () => {
    const res = await request(app).patch(`/api/todos/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: createdId, done: true });
  });

  test('DELETE /api/todos/:id removes a todo', async () => {
    const res = await request(app).delete(`/api/todos/${createdId}`);
    expect(res.status).toBe(204);

    // Verify it's gone
    const list = await request(app).get('/api/todos');
    expect(list.body.find(t => t.id === createdId)).toBeUndefined();
  });

  // --- Error cases ---

  test('POST /api/todos without title returns 400', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({});
    expect(res.status).toBe(400);
  });

  test('PATCH /api/todos/:id with non-existent id returns 404', async () => {
    const res = await request(app).patch('/api/todos/99999');
    expect(res.status).toBe(404);
  });

  test('DELETE /api/todos/:id with non-existent id returns 404', async () => {
    const res = await request(app).delete('/api/todos/99999');
    expect(res.status).toBe(404);
  });
});
