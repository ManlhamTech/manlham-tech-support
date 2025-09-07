# Manlham Tech Support

A lightweight dashboard-style site with localStorage auth, role-based UI, tickets manager, dark mode, and a **Formspree-powered contact form**.

## Folder Structure
```
manlham-tech-support/
├── index.html
├── login.html
├── signup.html
├── dashboard.html
├── css/
│   └── style.css
├── js/
│   └── main.js
└── assets/
    └── images/
```

## Quick Start
1. Put this folder on any web host (no PHP required, Formspree handles contact form).
2. Open `index.html` in a browser.
3. Sign up at `signup.html` → choose role **user** or **admin**.
4. Log in at `login.html`, then visit `dashboard.html`:
   - **Users**: can view and manage Tickets.
   - **Admins**: also see User Management + Settings.
5. Contact form:
   - Uses Formspree endpoint `https://formspree.io/f/xwpqydee`.
   - Messages are sent to your verified Formspree email (mts.manlham@gmail.com).
   - No backend setup required.

## Notes
- Authentication and tickets are demo-only (saved in `localStorage`).
- Dark mode preference is stored in `localStorage` under `darkMode`.
- Contact form works as long as your Formspree account is active and email is verified.
