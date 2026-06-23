import { kafka } from "../config/kafka.js";

const producer = kafka.producer();

export const connectProducer = async (topic, message) => {
  await producer.connect();
  console.log("Kafka producer connected");
};

export default producer;
