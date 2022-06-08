import { Publisher, Subjects, TicketUpdatedEvent } from '@fitickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
