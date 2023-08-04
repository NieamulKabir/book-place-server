require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9sbaw.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const db = client.db("book-place");
    const bookCollection = db.collection("books");
    const userCollection = db.collection("users");
    const wishlistCollection = db.collection("wishlists");

    //books
    app.get("/books", async (req, res) => {
      const books = bookCollection.find({});
      const allBooks = await books.toArray();

      res.send({
        status: true,
        data: allBooks,
      });
    });

    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookCollection.findOne(query);

      res.send({
        status: true,
        data: result,
      });
    });

    //user
    app.post("/user", async (req, res) => {
      const user = req.body;

      const result = await userCollection.insertOne(user);

      res.send({
        status: true,
        data: result,
      });
    });
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find({});
      const result = await cursor.toArray();
      res.send({ status: true, data: result });
    });

    //wishlist
    // app.post("/addWishList", async (req, res) => {
    //   const { userId, bookId } = req.body;

    //   const userQuery = await userCollection.findOne({
    //     _id: new ObjectId(userId),
    //   });
    //   const bookQuery = await bookCollection.findOne({
    //     _id: new ObjectId(bookId),
    //   });
    //   if (!userQuery || !bookQuery) {
    //     res.status(404).json({ error: "Invalid request" });
    //   }
    //   const payload = {
    //     user: userQuery?._id,
    //     books: bookQuery?._id,
    //   };

    //   const newWishlist = await wishlistCollection.insertOne([payload]);
    //   newWishlistAllData = newWishlist[0];

    //   if (!newWishlist) {
    //     res.status(404).json({ error: "Invalid request" });
    //   }
    //   if (newWishlistAllData) {
    //     newWishlistAllData = await wishlistCollection.findOne({
    //       _id: newWishlistAllData._id,
    //     });
    //   }
    //   res.status(200).json({
    //     success: true,
    //     message: "successfully add to wishlist!",
    //     data: result,
    //   });
    // });
    app.post("/addWishList", async (req, res) => {
      const { userId, bookId } = req.body;
      // const payload = { userId, bookId };

      
      const user = await wishlistCollection.findOne({ userId });
      const alreadyAdded = user.find((id) => id.toString() === bookId);

      // const exist = await wishlistCollection.findOne({ userId });
      if (alreadyAdded) {
        const result = await wishlistCollection.findOneAndUpdate(
          { userId },
          { $pull: { books: bookId } },
          { new: true }
        );
        res.json(result);
      } else {
        const result = await wishlistCollection.findOneAndUpdate(
          { userId },
          { $push: { books: bookId } },
          { new: true }
        );
        res.json(result);
      }
    });
    app.get("/wishlist/:id", async (req, res) => {
      const userId = req.params.id;
      const result = await wishlistCollection.findOne({ userId });

      if (result) {
        return res.json(result);
      }

      res.status(404).json({ error: "Book not found" });
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
