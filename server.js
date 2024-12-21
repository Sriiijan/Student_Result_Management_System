const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 1008;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const readData = () => {
  try {
    return JSON.parse(fs.readFileSync('data.json'));
  } catch (err) {
    console.error('Error reading data file:', err);
    return { users: [], results: [] };
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing data file:', err);
  }
};

// Login Route
app.post('/login', (req, res) => {
  const { username, password, role } = req.body;
  console.log("Login Request Received:", { username, password, role }); // Debug log

  const data = readData();

  const user = data.users.find(
    (u) => u.username === username && u.password === password && u.role === role
  );

  if (user) {
    const redirectPath = role === 'teacher'
      ? '/teacher-dashboard.html'
      : `/student-dashboard.html?username=${username}`; // Add username to query string
    console.log("Redirect Path:", redirectPath); // Debug log
    res.json({ success: true, redirect: redirectPath });
  } else {
    console.error("Invalid credentials:", { username, password, role }); // Debug log
    res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
});

// Fetch Results based on Role
// Assuming data.json structure:
// {
//   "users": [...], 
//   "results": [
//     { "id": 1, "student_username": "student1", "subjectsMarks": [
//       { "subject": "Math", "marks": 85 },
//       { "subject": "English", "marks": 90 }
//     ] }
//   ]
// }

app.get('/results', (req, res) => {
  const { role, username } = req.query;
  console.log("Results Request:", { role, username }); // Debug log

  const data = readData();

  if (role === 'teacher') {
    res.json(data.results);
  } else if (role === 'student' && username) {
    const studentResults = data.results.find(
      (result) => result.student_username === username
    );
    res.json(studentResults ? studentResults.subjectsMarks : []);
  } else {
    console.error("Invalid role or username:", { role, username }); // Debug log
    res.status(400).json({ success: false, message: 'Invalid role or username.' });
  }
});




// Update Marks Route
app.put('/update-marks', (req, res) => {
  const { id, subject, marks } = req.body;
  const data = readData();

  const student = data.results.find((result) => result.id === parseInt(id));
  if (student) {
    const subjectToUpdate = student.subjectsMarks.find((sub) => sub.subject === subject);
    if (subjectToUpdate) {
      subjectToUpdate.marks = parseInt(marks);
      writeData(data);
      return res.json({ success: true, message: "Marks updated successfully." });
    }
  }
  res.status(404).json({ success: false, message: 'Student or subject not found.' });
});

// Add New Student Route
app.post('/add-student', (req, res) => {
  const { username, name, subjectsMarks } = req.body;
  const data = readData();

  // Check for valid inputs
  if (!username || !name || !Array.isArray(subjectsMarks) || subjectsMarks.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid input' });
  }

  // Ensure username is unique
  if (data.results.some((result) => result.student_username === username)) {
    return res.status(400).json({ success: false, message: 'Username already exists.' });
  }

  const newStudent = {
    id: Date.now(),
    student_username: username,
    name,
    subjectsMarks: subjectsMarks.map((sub) => ({
      subject: sub.subject,
      marks: parseInt(sub.marks),
    })),
  };

  data.results.push(newStudent);
  writeData(data);
  res.json({ success: true, message: 'Student added successfully.' });
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
