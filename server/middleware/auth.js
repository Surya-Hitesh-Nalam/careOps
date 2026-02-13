import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) return res.status(401).json({ message: "Not authorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) return res.status(401).json({ message: "User not found" });

        req.user = user;
        next();
    } catch {
        res.status(401).json({ message: "Not authorized" });
    }
};

export const ownerOnly = (req, res, next) => {
    if (req.user.role !== "owner") return res.status(403).json({ message: "Owner access required" });
    next();
};

export const checkPermission = (perm) => (req, res, next) => {
    if (req.user.role === "owner") return next();
    const perms = typeof req.user.permissions === "string" ? JSON.parse(req.user.permissions) : req.user.permissions;
    if (perms[perm]) return next();
    res.status(403).json({ message: `No permission: ${perm}` });
};
