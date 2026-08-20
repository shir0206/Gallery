const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Load raw JSON
const rawData = fs.readFileSync(path.join(__dirname, "data.json"), "utf8");
let data = JSON.parse(rawData);

// If the JSON is wrapped like { "Cards": { ... } }, unwrap it to get the inner data
if (data.Cards) {
  data = data.Cards;
}

async function uploadToFirestore() {
  const collectionRef = db.collection("Cards");
  console.log("Uploading data to Firestore...");

  // Helper to deep-convert to clean, plain JS object
  const sanitize = (obj) => JSON.parse(JSON.stringify(obj));

  if (Array.isArray(data)) {
    for (let index = 0; index < data.length; index++) {
      const item = data[index];
      if (!item || typeof item !== "object") continue;

      const cleanItem = sanitize(item);
      const docId = cleanItem.id ? String(cleanItem.id) : String(index);

      await collectionRef.doc(docId).set(cleanItem);
    }
  } else if (typeof data === "object" && data !== null) {
    for (const [key, value] of Object.entries(data)) {
      if (!value) continue;

      // If value is a primitive or array, wrap it so it forms a valid Firestore document
      const docData =
        typeof value === "object" && !Array.isArray(value)
          ? sanitize(value)
          : { value: sanitize(value) };

      await collectionRef.doc(String(key)).set(docData);
    }
  }

  console.log("Successfully uploaded all JSON data to Firestore!");
}

uploadToFirestore().catch(console.error);
