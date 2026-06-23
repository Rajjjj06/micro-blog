import { kafka } from "../config/kafka.js";
import pool from "../config/db.js";

const consumer = kafka.consumer({ groupId: "blog-service-group" });

export const connectConsumer = async () => {
  await consumer.connect();
  console.log("Kafka consumer connected");
  await consumer.subscribe({ topic: "user-created", fromBeginning: true });
  console.log("Subscribed to user-created topic");
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const data = JSON.parse(message.value.toString());
      if (topic === "user-created") {
        await pool.query(
          `
                INSERT INTO user_profile (id, username)
                VALUES ($1, $2)
                ON CONFLICT (id) DO NOTHING
                `,
          [data.id, data.username],
        );
        console.log(
          `User with ID ${data.id} and username ${data.username} inserted into the database`,
        );
      }
    },
  });
};
