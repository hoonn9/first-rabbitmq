import * as express from 'express';
import {getAmqpConnection, initializeAmqpConnection} from './amqp/connection';
import {publish} from './amqp/publisher';
import {consume} from './amqp/consumer';

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
  const routingKey = 'request';
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

  const requestQueueConsumer = consume(
    getAmqpConnection(),
    'processing.requests'
  );

  const channel = await getAmqpConnection().createChannel();
  await channel.prefetch(1);

  requestQueueConsumer(channel, (data: Payload) => {
    console.log('listener1:', data);
  });

  requestQueueConsumer(channel, (data: Payload) => {
    console.log('listener2: ', data);
  });
})();
