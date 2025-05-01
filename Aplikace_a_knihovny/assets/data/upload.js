const sdk = require("node-appwrite");
const fs = require("fs");

const client = new sdk.Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("ENTER_YOUR_PROJECT_ID") // Replace with your project ID
    .setKey("ENTER_YOUR_API_KEY");   // Replace with your API key

const databases = new sdk.Databases(client);

const DATABASE_ID = "ENTER_YOUR_DATABASE_ID"; // Replace with your database ID
const COLLECTION_ID = "ENTER_YOUR_COLLECTION_ID"; // Replace with your collection ID

// Load your JSON data from file
const districtData = JSON.parse(fs.readFileSync("YOUR_FILE", "utf8"));

// Async function to upload each document
async function uploadDistricts() {
    for (const item of districtData) {
        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                sdk.ID.unique(), // Automatically generate a unique document ID
                {
                    breed: item.breed, // Replace with actual field names
                    type: "TYPE", // Replace with actual type if needed
                },
            );
        } catch (error) {
            console.error(`Error creating document for ${item}:`, error);
        }
    }
}

// Run the upload function
uploadDistricts()
    .then(() => console.log("Upload completed"))
    .catch((err) => console.error("Upload encountered an error:", err));
