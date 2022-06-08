import { Publisher, Subjects, TicketCreatedEvent } from '@fitickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
