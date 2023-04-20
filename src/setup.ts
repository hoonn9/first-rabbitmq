import {getAmqpConnection, initializeAmqpConnection} from './amqp/connection';

export async function setup() {
  await initializeAmqpConnection();
  const channel = await getAmqpConnection().createChannel();

  // Create Exchange
  await channel.assertExchange('processing', 'direct', {durable: true});

  // Create Queue
  await channel.assertQueue('processing.requests', {durable: true});

  // Bind Queue
  // Queue, Exchange, Routing key
  await channel.bindQueue('processing.requests', 'processing', 'request');

  await getAmqpConnection().close();
  console.log('Setup Completed!');
}
setup();
