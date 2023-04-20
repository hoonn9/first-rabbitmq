import * as amqp from 'amqplib';

let amqpConnection: amqp.Connection;

export function getAmqpConnection() {
  if (!amqpConnection) {
    throw new Error(
      'amqp is not connected. please initializeAmqpConnection call first.'
    );
  }
  return amqpConnection;
}

export async function initializeAmqpConnection() {
  if (!amqpConnection) {
    amqpConnection = await amqp.connect('amqp://localhost:5672');
  }
  return amqpConnection;
}

export function publish(
  exchangeName: string,
  routingKey: string,
  data: unknown
) {
  const buffer = Buffer.from(JSON.stringify(data));
  return function (channel: amqp.ConfirmChannel) {
    return new Promise<void>((resolve, reject) =>
      channel.publish(
        exchangeName,
        routingKey,
        buffer,
        {
          persistent: true,
        },
        err => {
          if (err) {
            reject(err);
          }

          resolve();
        }
      )
    );
  };
}

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
