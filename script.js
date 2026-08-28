emailjs.init({
    publicKey: "qyf_5b8XbWsvfPYDq"
});

const form = document.getElementById("reportForm");
const successMessage = document.getElementById("successMessage");
const locationInput = document.getElementById("location");
const getLocationBtn = document.getElementById("getLocation");
const contactInput = document.getElementById("contact");

contactInput.addEventListener("input", () => {
    contactInput.value = contactInput.value
        .replace(/\D/g, "")
        .slice(0, 10);
});

const photoInput = document.getElementById("photo");
const photoLabel = document.getElementById("photoLabel");
const themeToggle = document.getElementById("themeToggle");

if (localStorage.getItem("animalTheme") === "light") {
    document.body.classList.add("light");
}

updateThemeButton();

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");

    const theme = document.body.classList.contains("light")
        ? "light"
        : "dark";

    localStorage.setItem("animalTheme", theme);
    updateThemeButton();
});

function updateThemeButton() {
    if (document.body.classList.contains("light")) {
        themeToggle.innerHTML = "🌙 <span>Dark</span>";
        themeToggle.setAttribute("aria-label", "Switch to dark theme");
    } else {
        themeToggle.innerHTML = "☀️ <span>Light</span>";
        themeToggle.setAttribute("aria-label", "Switch to light theme");
    }
}

photoInput.addEventListener("change", () => {
    if (photoInput.files.length > 0) {
        photoLabel.textContent = photoInput.files[0].name;
    } else {
        photoLabel.textContent = "Add a clear photo";
    }
});

getLocationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    getLocationBtn.textContent = "📍 Getting...";
    getLocationBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            locationInput.value = `${latitude}, ${longitude}`;
            getLocationBtn.textContent = "✓ Location Added";
            getLocationBtn.disabled = false;
        },
        (error) => {
            console.error("Location error:", error);

            let message = "Unable to get your location.";

            if (error.code === 1) {
                message = "Location permission was denied. Please allow location access in your browser.";
            } else if (error.code === 2) {
                message = "Your location could not be determined. Please enter it manually.";
            } else if (error.code === 3) {
                message = "Location request timed out. Please try again.";
            }

            alert(message);
            getLocationBtn.textContent = "📍 Auto-fetch";
            getLocationBtn.disabled = false;
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = document.querySelector(".submit-btn");

    // Get selected photo
    const photoFile = document.getElementById("photo").files[0];

    if (!photoFile) {
        alert("Please select an animal photo.");
        return;
    }

    submitButton.textContent = "Uploading Photo...";
    submitButton.disabled = true;

    try {
        const photoData = new FormData();

        photoData.append("file", photoFile);
        photoData.append("upload_preset", "animal_reports");

        const cloudinaryResponse = await fetch(
            "https://api.cloudinary.com/v1_1/nigwvbbm/image/upload",
            {
                method: "POST",
                body: photoData
            }
        );

        const cloudinaryResult = await cloudinaryResponse.json();

        if (!cloudinaryResult.secure_url) {
            throw new Error("Photo upload failed");
        }

        // This is the uploaded photo's URL
        const photoURL = cloudinaryResult.secure_url;

        submitButton.textContent = "Sending Report...";

        const templateParams = {
            animal: document.getElementById("animal").value,

            severity: document.querySelector(
                'input[name="severity"]:checked'
            ).value,

            location: document.getElementById("location").value,

            description: document.getElementById("description").value,

            name: document.getElementById("name").value,

            contact: document.getElementById("contact").value,

            photo: photoURL
        };

        await emailjs.send(
            "service_bzg5fay",
            "template_bbu7k1b",
            templateParams
        );

        form.classList.add("hidden");
        successMessage.classList.remove("hidden");
        document.body.classList.add("submitted");

    }

    catch (error) {

        console.error("Error:", error);

        alert(
            "Something went wrong. Please try again."
        );

        submitButton.textContent = "🚨 Submit Accident Report";
        submitButton.disabled = false;
    }

});
