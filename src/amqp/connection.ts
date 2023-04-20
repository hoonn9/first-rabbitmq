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
