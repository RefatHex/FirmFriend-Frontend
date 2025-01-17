const ADMIN_BOOKINGS_API_URL =
  "http://localhost:8000/rentals/rent-item-orders/";

// Fetch all bookings
async function fetchAdminBookings() {
  try {
    const response = await fetch(ADMIN_BOOKINGS_API_URL);
    if (!response.ok) throw new Error("Failed to fetch bookings");
    const data = await response.json();

    const bookingsSection = document.getElementById("adminBookingsSection");
    const oldBookingsSection = document.getElementById(
      "adminOldBookingsSection"
    );
    bookingsSection.innerHTML = "";
    oldBookingsSection.innerHTML = "";

    if (data.results.length === 0) {
      bookingsSection.innerHTML =
        "<p class='no-bookings'>No bookings found.</p>";
      return;
    }

    const today = new Date();

    data.results.forEach((booking) => {
      const returnDate = new Date(booking.return_date);
      const daysRemaining = Math.ceil(
        (returnDate - today) / (1000 * 60 * 60 * 24)
      );

      const bookingCard = document.createElement("div");
      bookingCard.className = "card-booking";
      bookingCard.innerHTML = `
          <h3>${booking.title}</h3>
          <p><strong>Description:</strong> ${booking.description}</p>
          <p><strong>Price:</strong> $${booking.price}</p>
          <p><strong>Order Date:</strong> ${booking.order_date}</p>
          <p><strong>Return Date:</strong> ${booking.return_date}</p>
          ${
            booking.is_confirmed
              ? `<button class="btn-action" onclick="toggleConfirmation(${booking.id}, true)">Mark as Unconfirmed</button>`
              : `<button class="btn-action" onclick="toggleConfirmation(${booking.id}, false)">Mark as Confirmed</button>`
          }
          `;

      if (daysRemaining <= 0) {
        oldBookingsSection.appendChild(bookingCard);
      } else {
        bookingsSection.appendChild(bookingCard);
      }
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
  }
}

async function toggleConfirmation(bookingId, currentState) {
  try {
    const newConfirmationState = !currentState;

    const patchData = {
      is_confirmed: newConfirmationState,
    };

    const response = await fetch(`${ADMIN_BOOKINGS_API_URL}${bookingId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patchData),
    });

    if (response.ok) {
      alert(
        `Booking marked as ${
          newConfirmationState ? "confirmed" : "unconfirmed"
        }.`
      );
      fetchAdminBookings();
    } else {
      console.error(
        `Failed to toggle confirmation status:`,
        await response.text()
      );
      alert("Failed to toggle confirmation status. Please try again.");
    }
  } catch (error) {
    console.error("Error toggling confirmation status:", error);
    alert("An error occurred. Please try again later.");
  }
}

// Mark a booking as ready for pickup
async function markReadyForPickup(bookingId) {
  try {
    const patchData = {
      is_ready_for_pickup: true,
    };

    const response = await fetch(`${ADMIN_BOOKINGS_API_URL}${bookingId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patchData),
    });

    if (response.ok) {
      alert("Booking marked as ready for pickup.");
      fetchAdminBookings();
    } else {
      console.error(
        "Failed to mark booking as ready for pickup:",
        await response.text()
      );
      alert("Failed to mark booking as ready for pickup. Please try again.");
    }
  } catch (error) {
    console.error("Error marking booking as ready for pickup:", error);
    alert("An error occurred. Please try again later.");
  }
}

// Fetch bookings on page load
fetchAdminBookings();
