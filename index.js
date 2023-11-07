const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000; 
//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1tj4s8s.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const usersCollection = client.db('ThoughtHere').collection('users');
    const blogsCollection = client.db('ThoughtHere').collection('allBlogs')
    const wishlistCollection = client.db('ThoughtHere').collection('wishlist')

    app.get("/users", async (req, res) => {
        const result = await usersCollection.find().toArray();
        res.send(result);
      });  
    app.post("/users", async (req, res) => {
        const user = req.body;
        const query = { email: user.email };
        const existingUser = await usersCollection.findOne(query);
        if (existingUser) {
          return res.send({ message: "user already exists" });
        }
  
        const result = await usersCollection.insertOne(user);
        res.send(result);
      });     
    app.get("/blogs", async (req,res)=> {
    const result = await blogsCollection.find().toArray()
    res.send(result)
     })
    app.post('/blogs', async (req, res) => {
        
            const blogData = req.body;
            const result = await blogsCollection.insertOne(blogData);
            console.log(result)
            res.send(result)
            
        
     });

     app.post("/wishlist", async (req, res) => {
        
          const blog = req.body;
          blog.user = req.body.user;
          const result = await wishlistCollection.insertOne(blog);
          res.send(result)
     });

     app.delete("/wishlist/:blogTitle", async (req, res) => {
        try {
            
            const blogTitle = req.params.blogTitle;
            const result = await wishlistCollection.deleteOne({  title: blogTitle });
    
            if (result.deletedCount === 1) {
                res.status(200).json({ message: "Blog removed from wishlist." });
            } else {
                res.status(404).json({ error: "Blog not found in the wishlist." });
            }
        } catch (error) {
            console.error("Error removing the blog from the wishlist:", error);
            res.status(500).json({ error: "Failed to remove the blog from the wishlist" });
        }
    });

    

      app.get("/wishlist", async (req, res) => {
        try {
          const user = req.query.user; 
          const blogsInWishlist = await wishlistCollection.find({ user }).toArray();
          res.status(200).json(blogsInWishlist);
        } catch (error) {
          console.error("Error fetching blogs from the wishlist:", error);
          res.status(500).json({ error: "Failed to fetch blogs from the wishlist" });
        }
      });


    
    

  



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);














app.get('/',(req,res) =>{
    res.send('thoughts-here is running')
})

app.listen(port,()=>{
    console.log(`thoughts-here server is running on port ${port}`)
})