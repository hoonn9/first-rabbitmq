import * as amqp from 'amqplib';

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
