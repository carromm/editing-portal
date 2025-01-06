export default async function handler(req, res) {
  const response = await fetch("https://api.imagekoncept.com/automobile/editor", {
    method: "GET",
    headers: {
      "Authorization": req.headers.authorization

    }
  });
  const data = await response.json(); 
  res.status(200).json(data);
}