import express from "express";
import { supabase } from "../supabaseClient.js";
import { generateId } from "../utils/idGenerator.js";

const router = express.Router();

// CREATE ORDER
router.post("/", async (req, res) => {
  try {
    const { user_id, product_id, amount, game_id, player_id } = req.body;

    if (!user_id || !product_id || !amount) {
      return res.status(400).json({ error: "user_id, product_id, and amount are required" });
    }

    // Get last order ID
    const { data: orders, error: selectError } = await supabase
      .from("orders")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1);

    if (selectError) return res.status(400).json({ error: selectError.message });

    const lastId = orders && orders.length > 0 ? orders[0].id : null;
    const newId = generateId("ORD", lastId);

    // Insert order
    const { error: insertError } = await supabase.from("orders").insert([
      {
        id: newId,
        user_id,
        product_id,
        amount,
        game_id: game_id || null,
        player_id: player_id || null,
        status: "pending",
      },
    ]);

    if (insertError) return res.status(400).json({ error: insertError.message });

    res.json({ message: "Order created", id: newId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LIST ALL ORDERS
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("orders").select("*");
    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ORDER BY ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return res.status(404).json({ error: "Order not found" });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE ORDER
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("orders").delete().eq("id", id);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE ORDER
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, amount, game_id, player_id } = req.body;

    const { error } = await supabase
      .from("orders")
      .update({ status, amount, game_id, player_id })
      .eq("id", id);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Order updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
