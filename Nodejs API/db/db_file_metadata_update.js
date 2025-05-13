
// db_file_metadata_update.js

// This script assumes you are using MongoDB shell or Compass to manually update message documents
// If using Mongoose, you should define these fields in your message schema

// Example: Adding metadata to a single existing document for demonstration
db.messages.updateMany(
  { isFile: { $exists: false } },
  {
    $set: {
      isFile: false,
      fileType: null,
      fileName: null
    }
  }
);

// When inserting a new file message, ensure the schema includes these fields like:
// {
//   fromUserId: "USER1_ID",
//   toUserId: "USER2_ID",
//   message: "/uploads/photo.jpg",
//   isFile: true,
//   fileType: "image/jpeg",
//   fileName: "photo.jpg",
//   timestamp: ISODate(),
//   read: false
// }
