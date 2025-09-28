import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import { methods as authMethods } from "../controllers/authentication.controller.js";

dotenv.config();

async function soloAdmin(req, res, next) {
    const logueado = await revisarCookie(req);
    if (logueado) return next();
    return res.redirect("/");
}

async function soloPublico(req, res, next) {
    const logueado = await revisarCookie(req);
    if (!logueado) return next();
    return res.redirect("/admin");
}

async function revisarCookie(req) {
    try {
        // Check if the cookie exists first
        if (!req.headers.cookie || !req.headers.cookie.includes("jwt=")) {
            return false;
        }
        
        const cookieJWT = req.headers.cookie.split("; ")
            .find(cookie => cookie.startsWith("jwt="))
            .slice(4);
            
        const decodificada = jsonwebtoken.verify(cookieJWT, process.env.JWT_SECRET);
        console.log(decodificada);
        
        // Find user in MongoDB instead of the array
        const usuarioARevisar = await authMethods.findUserByUsername(decodificada.user);
        console.log(usuarioARevisar);
        
        if (!usuarioARevisar) {
            return false;
        }
        
        return true;
    }
    catch {
        return false;
    }
}

// New middleware to verify token and extract user ID for API routes
async function verifyToken(req, res, next) {
    try {
        // Check if the cookie exists first
        if (!req.headers.cookie || !req.headers.cookie.includes("jwt=")) {
            return res.status(401).send({ status: "Error", message: "No autorizado" });
        }
        
        const cookieJWT = req.headers.cookie.split("; ")
            .find(cookie => cookie.startsWith("jwt="))
            .slice(4);
            
        const decodificada = jsonwebtoken.verify(cookieJWT, process.env.JWT_SECRET);
        
        // Find user in MongoDB
        const usuario = await authMethods.findUserByUsername(decodificada.user);
        
        if (!usuario) {
            return res.status(401).send({ status: "Error", message: "No autorizado" });
        }
        
        // Add userId to the request object for use in task controller
        req.userId = usuario._id.toString();
        req.username = usuario.user;
        
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).send({ status: "Error", message: "No autorizado" });
    }
}

export const methods = {
    soloAdmin,
    soloPublico,
    verifyToken
};