import mongoose from 'mongoose';

const MONGO_URI = "mongodb://localhost:27017/zms";

const ProjectSchema = new mongoose.Schema({
  title: String,
  capacity: String,
  location: String,
  status: String,
  image: String
}, { strict: false });

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
    const projects = await Project.find({});
    console.log("Projects in DB:", JSON.stringify(projects.map(p => ({ title: p.title, image: p.image })), null, 2));

    const Blog = mongoose.models.Blog || mongoose.model('Blog', new mongoose.Schema({}, { strict: false }));
    const blogs = await Blog.find({});
    console.log("Blogs in DB:", JSON.stringify(blogs.map(b => ({ title: b.title || b.heading, image: b.image })), null, 2));

    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const products = await Product.find({});
    console.log("Products in DB:", JSON.stringify(products.map(p => ({ name: p.name, image: p.image })), null, 2));

    const Client = mongoose.models.Client || mongoose.model('Client', new mongoose.Schema({}, { strict: false }));
    const clients = await Client.find({});
    console.log("Clients in DB:", JSON.stringify(clients.map(c => ({ name: c.name, logo: c.logo })), null, 2));

  } catch (err) {
    console.error("Error connecting or querying:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

run();
