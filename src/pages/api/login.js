export default function handler(req, res) {
  const { username, password } = req.body;
  // Validate the username and password
  if (username === "admin" && password === "password") {
    // Set a cookie to indicate the user is authenticated
    res.setHeader(
      "Set-Cookie",
      "auth-token=123456; Path=/; HttpOnly; SameSite=Strict"
    );
    res.status(200).json({ message: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
}
