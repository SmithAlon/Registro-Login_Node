import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

// MongoDB Connection
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);
const dbName = "AuthenticationApp";
let db;

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    db = client.db(dbName);
    // Create indexes for faster lookups
    await db.collection("users").createIndex({ user: 1 }, { unique: true });
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

// Call this when your application starts
connectToDatabase();

async function login(req, res) {
    try {
        console.log(req.body);
        const user = req.body.user;
        const password = req.body.password;
        
        if (!user || !password) {
            return res.status(400).send({status: "Error", message: "Los campos están incompletos"});
        }
        
        // Find user in MongoDB
        const usuarioARevisar = await db.collection("users").findOne({ user: user });
        if (!usuarioARevisar) {
            return res.status(400).send({status: "Error", message: "Error durante login"});
        }
        
        const loginCorrecto = await bcryptjs.compare(password, usuarioARevisar.password);
        if (!loginCorrecto) {
            return res.status(400).send({status: "Error", message: "Error durante login"});
        }
        
        const token = jsonwebtoken.sign(
            {user: usuarioARevisar.user},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRATION}
        );
      
        const cookieOption = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
            path: "/"
        };
        
        res.cookie("jwt", token, cookieOption);
        res.send({status: "ok", message: "Usuario loggeado", redirect: "/admin"});
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send({status: "Error", message: "Error interno del servidor"});
    }
}

async function register(req, res) {
    try {
        console.log(req.body);
        const user = req.body.user;
        const password = req.body.password;
        const email = req.body.email;
        
        if (!user || !password || !email) {
            return res.status(400).send({status: "Error", message: "Los campos están incompletos"});
        }
        
        // Check if user already exists in MongoDB
        const usuarioExistente = await db.collection("users").findOne({ 
            $or: [{ user: user }, { email: email }]
        });
        
        if (usuarioExistente) {
            return res.status(400).send({status: "Error", message: "Usuario o email ya existente"});
        }
        
        const salt = await bcryptjs.genSalt(5);
        const hashPassword = await bcryptjs.hash(password, salt);
        
        const nuevoUsuario = {
            user, 
            email, 
            password: hashPassword,
            created: new Date()
        };
        
        // Insert new user into MongoDB
        await db.collection("users").insertOne(nuevoUsuario);
        console.log(`Usuario ${nuevoUsuario.user} registrado`);
        
        return res.status(201).send({status: "ok", message: `Usuario ${nuevoUsuario.user} agregado`, redirect: "/"});
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).send({status: "Error", message: "Error interno del servidor"});
    }
}

// Function to find a user by username (for authorization middleware)
async function findUserByUsername(username) {
    try {
        return await db.collection("users").findOne({ user: username });
    } catch (error) {
        console.error("Error finding user:", error);
        return null;
    }
}

export const methods = {
    login,
    register,
    findUserByUsername
};