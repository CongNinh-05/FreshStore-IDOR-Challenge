const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "freshstore-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 },
  })
);

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect("/login");
  next();
}

app.get("/", (req, res) => {
  if (req.session.userId) return res.redirect("/dashboard");
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.getUserByUsername(username, (err, user) => {
    if (err) return res.render("login", { error: "Server error" });
    if (!user || user.password !== password)
      return res.render("login", { error: "Invalid credentials" });
    req.session.userId = user.id;
    req.session.username = user.username;
    res.redirect("/dashboard");
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// Dashboard: shows invoices for the logged-in user only
app.get("/dashboard", requireAuth, (req, res) => {
  const userId = req.session.userId;
  db.getInvoicesByUserId(userId, (err, invoices) => {
    if (err) return res.send("Error loading invoices");
    res.render("dashboard", { username: req.session.username, invoices });
  });
});

// Vulnerable endpoint: only checks authentication, not ownership
app.get("/view_invoice", requireAuth, (req, res) => {
  const invoiceId = req.query.id;
  if (!invoiceId) return res.send("No invoice id provided");
  db.getInvoiceById(invoiceId, (err, invoice) => {
    if (err) return res.send("Error fetching invoice");
    if (!invoice) return res.send("Invoice not found");
    // Authorization check: ensure the logged-in user owns this invoice
    // if (invoice.user_id !== req.session.userId) {
    //   return res.status(403).send("Forbidden: you do not own this invoice");
    // }
    res.render("invoice", { invoice });
  });
});

app.listen(PORT, () => {
  console.log(`FreshStore IDOR challenge running on http://localhost:${PORT}`);
});

