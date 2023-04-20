import * as express from 'express';
import {
  consume,
  getAmqpConnection,
  initializeAmqpConnection,
  publish,
} from './lib/amqp';

const app = express();

app.use(express.json());

let lastRequestId = 1;

interface Payload {
  requestId: number;
  user: {
    name: string;
    age: number;
  };
}

app.post('/publish', async (req, res) => {
  const channel = await getAmqpConnection().createConfirmChannel();

  const exchangeName = 'processing';
  const routingKey = 'Bye';
  const requestId = lastRequestId++;

  const payload: Payload = {
    requestId,
    user: {
      name: 'hoon',
      age: 28,
    },
  };

  await publish(exchangeName, routingKey, payload)(channel);

  res.json({
    requestId,
  });
});

app.listen(3000, () => {
  console.log('listening to port: 3000');
});

(async function () {
  await initializeAmqpConnection();

  const testQueueConsumer = consume(getAmqpConnection(), 'TestQueue');

  const channel = await getAmqpConnection().createChannel();
  await channel.prefetch(1);

  testQueueConsumer(channel, (data: Payload) => {
    console.log('listener1:', data);
  });

  testQueueConsumer(channel, (data: Payload) => {
    console.log('listener2: ', data);
  });
})();
