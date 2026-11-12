
const API_URL = "/api";

let authToken = null;
let currentUser = null;

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const userInfo = document.getElementById("userInfo");
const loggedInUser = document.getElementById("loggedInUser");
const invoiceList = document.getElementById("invoiceList");

function showMessage(elementId, message, type = "") {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.className = `message ${type}`;
}

async function apiRequest(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

// Login
document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const result = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });

    authToken = result.token;
    currentUser = result.user;

    loginSection.hidden = true;
    dashboardSection.hidden = false;
    userInfo.hidden = false;

    loggedInUser.textContent = `${currentUser.name} (${currentUser.role})`;

    showMessage("loginMessage", "");
    await loadInvoices();
  } catch (error) {
    showMessage("loginMessage", error.message, "error");
  }
});

// Create invoice
document.getElementById("invoiceForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const amount = Number(document.getElementById("amount").value);

  try {
    await apiRequest("/invoices", {
      method: "POST",
      body: JSON.stringify({ amount })
    });

    document.getElementById("amount").value = "";

    showMessage("invoiceMessage", "Invoice created successfully.", "success");
    await loadInvoices();
  } catch (error) {
    showMessage("invoiceMessage", error.message, "error");
  }
});

// Load invoices
async function loadInvoices() {
  try {
    const invoices = await apiRequest("/invoices");
    renderInvoices(invoices);
  } catch (error) {
    invoiceList.textContent = error.message;
  }
}

// Render invoices
function renderInvoices(invoices) {
  invoiceList.replaceChildren();

  if (invoices.length === 0) {
    invoiceList.textContent = "No invoices available.";
    return;
  }

  invoices.forEach((invoice) => {
    const card = document.createElement("article");
    card.className = "invoice-card";

    const heading = document.createElement("h3");
    heading.textContent = `Invoice ${invoice.id}`;

    const amount = document.createElement("p");
    amount.textContent = `Amount: ${invoice.amount.toLocaleString()}`;

    const status = document.createElement("span");
    status.className = `status ${invoice.status}`;
    status.textContent = invoice.status;

    const approvals = document.createElement("p");
    approvals.textContent = `Approvals received: ${invoice.approvals.length}`;

    card.append(heading, amount, status, approvals);

    if (invoice.status === "PENDING") {
      const button = document.createElement("button");
      button.textContent = "Approve";

      button.addEventListener("click", () => approveInvoice(invoice.id, button));

      const actions = document.createElement("div");
      actions.className = "invoice-actions";
      actions.append(button);
      card.append(actions);
    }

    invoiceList.append(card);
  });
}

// Approve invoice
async function approveInvoice(invoiceId, button) {
  button.disabled = true;

  try {
    await apiRequest(`/invoices/${invoiceId}/approve`, {
      method: "POST"
    });

    showMessage("invoiceMessage", "Approval recorded successfully.", "success");
    await loadInvoices();
  } catch (error) {
    showMessage("invoiceMessage", error.message, "error");
    button.disabled = false;
  }
}

// Refresh
document.getElementById("refreshButton").addEventListener("click", loadInvoices);

// Logout
document.getElementById("logoutButton").addEventListener("click", () => {
  authToken = null;
  currentUser = null;

  loginSection.hidden = false;
  dashboardSection.hidden = true;
  userInfo.hidden = true;

  document.getElementById("loginForm").reset();
  document.getElementById("invoiceForm").reset();
  showMessage("loginMessage", "");
  showMessage("invoiceMessage", "");
});

