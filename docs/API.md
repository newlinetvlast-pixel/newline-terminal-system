app.patch("/api/trips/:id/status", (req, res) => {

&#x20;   const { id } = req.params;

&#x20;   const { status } = req.body;



&#x20;   const validStatuses = \["pending", "in\_progress", "completed", "cancelled"];

&#x20;   if (!validStatuses.includes(status)) {

&#x20;       return res.status(400).json({ success: false, error: "Invalid status" });

&#x20;   }



&#x20;   db.run("UPDATE trips SET status = ? WHERE id = ?", \[status, id], function(err) {

&#x20;       if (err) return res.status(500).json({ success: false, error: err.message });

&#x20;       res.json({ success: true, message: "Status updated" });

&#x20;   });

});

