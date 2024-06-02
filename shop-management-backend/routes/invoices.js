const express = require("express");
const auth = require("../middleware/auth");
const Invoice = require("../models/Invoice");
const router = express.Router();
const multer = require("multer");
const { check, validationResult } = require("express-validator");

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Only PDF files are allowed'), false);
      }
      cb(null, true);
    }
  });
  
  router.post(
    "/",
    auth(["admin", "employee"]),
    upload.single("file"),
    async (req, res) => {
      const errors = validationResult(req);
      if (!req.file) {
        return res.status(400).json({ errors: [{ msg: "PDF file is required" }] });
      }
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      console.log('invocie')
      try {
        const invoice = new Invoice({ data: req.file.buffer });
        await invoice.save();
        res.status(201).send({ message: "Invoice saved successfully", invoice });
      } catch (error) {
        console.error(error.message);
        res.status(500).send({ error: "Failed to save invoice" });
      }
    }
  );

// Fetch All Invoices
router.get("/", auth(["admin", "employee"]), async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// Fetch Single Invoice
router.get("/:id", auth(["admin", "employee"]), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).send({ error: "Invoice not found" });
    }
    res.set("Content-Type", "application/pdf");
    res.send(invoice.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Failed to fetch invoice" });
  }
});

module.exports = router;
