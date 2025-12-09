import express from "express";
import { supabase } from "../supabaseClient.js";
import { generateId } from "../utils/idGenerator.js";

const router = express.Router();

// ADD PRODUCT
router.post("/", async (req, res) => {
  try {
    const { title, description, price, stock, image_url } = req.body;

    // Get last product ID
    const { data: products, error: selectError } = await supabase
      .from("products")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1);

    if (selectError) return res.status(400).json({ error: selectError.message });

    const lastId = products && products.length > 0 ? products[0].id : null;
    const newId = generateId("PRD", lastId);

    // Insert product
    const { error: insertError } = await supabase
      .from("products")
      .insert({ id: newId, title, description, price, stock, image_url });

    if (insertError) return res.status(400).json({ error: insertError.message });

    res.json({ message: "Product added", id: newId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LIST PRODUCTS
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("products").select("*");
    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET PRODUCT BY ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return res.status(404).json({ error: "Product not found" });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE PRODUCT
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE PRODUCT
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, stock, image_url } = req.body;

    const { error } = await supabase
      .from("products")
      .update({ title, description, price, stock, image_url })
      .eq("id", id);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
