import * as amqp from 'amqplib';

export function consume(connection: amqp.Connection, queue: string) {
  return function <T>(
    channel: amqp.Channel,
    listener: (data: T) => unknown | Promise<unknown>
  ) {
    return new Promise((resolve, reject) => {
      channel.consume(queue, async message => {
        if (!message) {
          return;
        }

        const payload: T = JSON.parse(message.content.toString('utf8'));

        // TODO Validate T
        listener(payload);
        channel.ack(message);
      });
      connection.on('close', err => {
        return reject(err);
      });
      connection.on('error', err => {
        if (err) {
          return reject(err);
        }
      });
    });
  };
}
