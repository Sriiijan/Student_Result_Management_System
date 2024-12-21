// Show the login modal based on the button clicked (Student or Teacher)
function showLogin(role) {
    var modal = document.getElementById('id01');
    modal.style.display = 'block';
  
    // Pre-fill the role in the dropdown based on the selected button (Student or Teacher)
    var roleSelect = document.getElementById('role');
    if (role === 'Student') {
      roleSelect.value = 'student';
    } else if (role === 'Teacher') {
      roleSelect.value = 'teacher';
    }
  }
  
  // Handle form submission (login)
  document.querySelector('.modal-content form').onsubmit = function(event) {
    event.preventDefault();  // Prevent default form submission
  
    // Get the input values for username, password, and role
    var username = document.querySelector('input[name="uname"]').value;
    var password = document.querySelector('input[name="psw"]').value;
    var role = document.querySelector('select[name="role"]').value;
  
    // Check if username and password are provided
    if (username === '' || password === '') {
      alert('Please fill in all fields.');
      return;
    }
  
    // Fetch data from data.json
    fetch('data.json')
      .then(response => response.json())
      .then(data => {
        // Validate login based on the role (Student or Teacher)
        let validUser = false;
        if (role === 'student') {
          validUser = data.students.some(student => student.username === username && student.password === password);
        } else if (role === 'teacher') {
          validUser = data.teachers.some(teacher => teacher.username === username && teacher.password === password);
        }
  
        // If user is valid
        if (validUser) {
          alert(`${role.charAt(0).toUpperCase() + role.slice(1)} Login Successful`);
          // Redirect based on role
          if (role === 'student') {
            window.location.href = 'C:\Users\User\OneDrive\Desktop\final\public\student-dashboard.html';  // Replace with actual student dashboard URL
          } else if (role === 'teacher') {
            window.location.href = 'C:\Users\User\OneDrive\Desktop\final\public\teacher-dashboard.html';  // Replace with actual teacher dashboard URL
          }
        } else {
          alert('Invalid credentials');
        }
      })
      .catch(err => {
        console.error('Error loading data.json:', err);
        alert('Error during login. Please try again later.');
      });
  
    // Close the modal after login attempt
    document.getElementById('id01').style.display = 'none';
  };
  
  // Close the modal when clicking outside
  window.onclick = function(event) {
    var modal = document.getElementById('id01');
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };
  