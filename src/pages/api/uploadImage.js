export default async function handler(req, res) {
  const { file_name, type } = req.body;
  console.log(file_name, type);
  const response = await fetch("https://api.carromm.com/s3/presigned-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      file_name,
      type
    })
  });

  const data = await response.json();
  res.status(200).json(data);
}