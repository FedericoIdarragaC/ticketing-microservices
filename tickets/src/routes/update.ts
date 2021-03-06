import {
  BadRequestError,
  NotAuhorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from '@fitickets/common';
import express, { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';
import { showTicketRouter } from './show';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be provided and must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.orderId) {
      throw new BadRequestError('Cannot edit a reserved ticket');
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuhorizedError();
    }

    const { title, price } = req.body;
    ticket.set({
      title,
      price,
    });

    await ticket.save();

    await new TicketUpdatedPublisher(natsWrapper.client)
      .publish({
        id: ticket.id,
        version: ticket.version,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
      })
      .catch((err) => console.log(err));
    res.send(ticket);
  }
);

export { router as updateTicketRouter };
