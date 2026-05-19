export const MOCK_CODE = `// Example insecure code
const express = require('express');
const app = express();

const API_KEY = "AKIA1234567890EXAMPLE"; // AWS Key exposed

app.get('/user', (req, res) => {
  const query = "SELECT * FROM users WHERE id = " + req.query.id; // SQL Injection
  db.execute(query);
  res.send("User updated");
});

app.listen(3000);
`;
