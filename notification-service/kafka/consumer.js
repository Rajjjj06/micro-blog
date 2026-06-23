import kafka from "../config/kafka.js";
import pool from "../config/db.js";

const consumer = kafka.consumer({ groupId: "notification-service-group" });

const startConsumer = async () => {
  await consumer.connect();
  const topics = [
    "blog-created",
    "blog-updated",
    "blog-deleted",
    "comment-created",
    "user-created",
  ];
  for (const topic of topics) {
    await consumer.subscribe({ topic, fromBeginning: true });
  }

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(
        `Received message on topic ${topic}: ${message.value.toString()}`,
      );
      await pool.query(
        "INSERT INTO notifications (user_id, message) VALUES ($1, $2)",
        [1, `New event on topic ${topic}: ${message.value.toString()}`],
      );
    },
  });
};
export default startConsumer;
