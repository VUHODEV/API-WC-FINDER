// Form Validation
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

function clearErrors() {
  const errors = document.getElementsByClassName("error-message");
  for (let error of errors) {
    error.style.display = "none";
  }
}

// Handle Login
function handleLogin(event) {
  event.preventDefault();
  clearErrors();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const remember = document.getElementById("remember").checked;

  let isValid = true;

  if (!validateEmail(email)) {
    showError("email-error", "Email không hợp lệ");
    isValid = false;
  }

  if (!validatePassword(password)) {
    showError("password-error", "Mật khẩu phải có ít nhất 6 ký tự");
    isValid = false;
  }

  if (isValid) {
    // Lưu remember me
    if (remember) {
      localStorage.setItem("rememberedEmail", email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    // Gửi request đăng nhập
    console.log("Login:", { email, password, remember });
    alert("Đăng nhập thành công!");
    window.location.href = "index.html";
  }
}

// Handle Register
function handleRegister(event) {
  event.preventDefault();
  clearErrors();

  const name = document.getElementById("reg-name").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  let isValid = true;

  if (name.length < 2) {
    showError("name-error", "Tên phải có ít nhất 2 ký tự");
    isValid = false;
  }

  if (!validateEmail(email)) {
    showError("reg-email-error", "Email không hợp lệ");
    isValid = false;
  }

  if (!validatePassword(password)) {
    showError("reg-password-error", "Mật khẩu phải có ít nhất 6 ký tự");
    isValid = false;
  }

  if (password !== confirmPassword) {
    showError("confirm-password-error", "Mật khẩu không khớp");
    isValid = false;
  }

  if (isValid) {
    console.log("Register:", { name, email, password });
    alert("Đăng ký thành công!");
    showLoginForm();
  }
}

// Toggle password visibility
document.querySelectorAll(".toggle-password").forEach((icon) => {
  icon.addEventListener("click", function () {
    const input = this.previousElementSibling;
    if (input.type === "password") {
      input.type = "text";
      this.classList.remove("fa-eye");
      this.classList.add("fa-eye-slash");
    } else {
      input.type = "password";
      this.classList.remove("fa-eye-slash");
      this.classList.add("fa-eye");
    }
  });
});

// Switch between login and register forms
function showRegisterForm() {
  document.querySelector(".login-form").style.display = "none";
  document.querySelector(".register-form").style.display = "block";
}

function showLoginForm() {
  document.querySelector(".register-form").style.display = "none";
  document.querySelector(".login-form").style.display = "block";
}

// Check for remembered email
document.addEventListener("DOMContentLoaded", function () {
  const rememberedEmail = localStorage.getItem("rememberedEmail");
  if (rememberedEmail) {
    document.getElementById("email").value = rememberedEmail;
    document.getElementById("remember").checked = true;
  }
});

// Social login handlers
document.querySelector(".google").addEventListener("click", function () {
  console.log("Google login clicked");
  // Implement Google OAuth
});

document.querySelector(".facebook").addEventListener("click", function () {
  console.log("Facebook login clicked");
  // Implement Facebook OAuth
});
