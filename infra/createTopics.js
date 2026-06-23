import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "topic-manager",
  brokers: ["localhost:9092"],
});

const admin = kafka.admin();

const createTopics = async () => {
  await admin.connect();

  const created = await admin.createTopics({
    waitForLeaders: true,
    topics: [
      { topic: "user-created", numPartitions: 1 },
      { topic: "blog-created", numPartitions: 1 },
      { topic: "blog-updated", numPartitions: 1 },
      { topic: "blog-deleted", numPartitions: 1 },
      { topic: "comment-created", numPartitions: 1 },
    ],
  });

  if (created) {
    console.log("Some topics were created");
  } else {
    console.log("Topics already exist");
  }

  await admin.disconnect();
};

createTopics().catch(console.error);
