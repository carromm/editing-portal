export default async function handler(req, res) {
  const response = await fetch("https://api.carromm.com/automobile/qc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "addd4fa5-9c8e-45bc-98a0-7140267be21b"
    },

    body: JSON.stringify({
      sku_id: req.body.sku_id,
      qc_status: req.body.qc_status,
      qc_comment: req.body.qc_comment,
      batch_id: req.body.batch_id,
    }),
  });
  const data = await response.json();
  res.status(200).json(data);
}