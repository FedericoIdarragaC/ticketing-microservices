import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });

  await ticket.save();

  return ticket;
};

it('fetches orders for a paticular user', async () => {
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  const userOne = global.signin();
  const useTwo = global.signin();

  await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', useTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);

  const { body: orderTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', useTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201);

  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', useTwo)
    .expect(200);

  expect(response.body).toHaveLength(2);
  expect(response.body[0].id).toBe(orderOne.id);
  expect(response.body[1].id).toBe(orderTwo.id);
  expect(response.body[0].ticket.id).toBe(ticketTwo.id);
  expect(response.body[1].ticket.id).toBe(ticketThree.id);
});
