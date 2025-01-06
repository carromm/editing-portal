export default async function handler(req, res) {
  const response = await fetch("https://api.carromm.com/automobile/editor", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "addd4fa5-9c8e-45bc-98a0-7140267be21b"
    },

    body: JSON.stringify({
      sku_id: req.body.sku_id,
      image_url: req.body.image_url,
      batch_id: req.body.batch_id,
    }),
  });
  const data = await response.json();
  res.status(200).json(data);
}