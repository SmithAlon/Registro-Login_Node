// Select error message element
const mensajeError = document.getElementsByClassName("error")[0];
const loginForm = document.getElementById("login-form");
const loginButton = loginForm.querySelector('button[type="submit"]');

// Add loading state function
function setLoadingState(isLoading) {
  if (isLoading) {
    loginButton.disabled = true;
    loginButton.innerHTML = '<span class="spinner"></span> Iniciando sesión...';
  } else {
    loginButton.disabled = false;
    loginButton.innerHTML = 'Iniciar sesión';
  }
}

// Form submission handler
loginForm.addEventListener("submit", async(e) => {
    e.preventDefault();
    
    // Hide any previous error messages
    mensajeError.classList.add("escondido");
    
    // Get form values
    const user = e.target.elements.user.value.trim();
    const password = e.target.elements.password.value;
    
    // Basic validation
    if (!user || !password) {
      mensajeError.textContent = "Por favor complete todos los campos";
      mensajeError.classList.remove("escondido");
      return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        const res = await fetch("http://localhost:4000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user,
                password
            })
        });
        
        // Process response
        const data = await res.json();
        
        if (!res.ok) {
            // Server returned an error
            mensajeError.textContent = data.message || "Error al iniciar sesión";
            mensajeError.classList.remove("escondido");
        } else {
            // Login successful
            if (data.redirect) {
                // Store authentication status if needed
                localStorage.setItem("isAuthenticated", "true");
                
                // Redirect to the specified URL
                window.location.href = data.redirect;
            }
        }
    } catch (error) {
        // Network or other error
        console.error("Login error:", error);
        mensajeError.textContent = "Error de conexión. Intente nuevamente.";
        mensajeError.classList.remove("escondido");
    } finally {
        // Reset loading state
        setLoadingState(false);
    }
});

// Add input event listeners to hide error message when user starts typing
const inputFields = loginForm.querySelectorAll('input');
inputFields.forEach(input => {
    input.addEventListener('input', () => {
        mensajeError.classList.add("escondido");
    });
});