import mongoose from 'mongoose';
import {app} from "./app";
import {natsWrapper} from "./nats-wrapper";
import {OrderCreatedListener} from "./events/listeners/order-created-listener";
import {OrderCancelledListener} from "./events/listeners/order-cancelled-listener";

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('Error JWT must be defined');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('Mongo URI must be defined')
    }
    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID must be defined')
    }
    if (!process.env.NATS_URL) {
        throw new Error('NATS_URLmust be defined')
    }
    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('MNATS_CLUSTER_ID must be defined')
    }
    try {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID,process.env.NATS_CLIENT_ID, process.env.NATS_URL);

        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed!');
            process.exit();
        })

        process.on('SIGNT', () =>  natsWrapper.client.close());
        process.on('SIGTERM', () =>  natsWrapper.client.close());

        new OrderCreatedListener(natsWrapper.client).listen(); //listen to the events
        new OrderCancelledListener(natsWrapper.client).listen(); //listen to the events

        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
    } catch (e) {
        console.log(e);
    }

    app.listen(3000, () => {
        console.log('[Auth Service] - Listening on port 3000 ');
    })
}

start();


