# The Hidden Invoice — FreshStore (IDOR challenge)

This is a small intentionally vulnerable app to demonstrate an Insecure Direct Object Reference (IDOR).

How to run locally:

- Install dependencies: `npm install`
- Start server: `npm start`
- Open http://localhost:3000

Credentials:
- admin / adminpass (has invoice id 1 which contains the Flag)
- user / password (regular user, has invoices 15 and 16)

Challenge:
Log in as `user`, then try to access `/view_invoice?id=1` and read the secret note (the Flag).

Docker:
- Build: `docker build -t freshstore .`
- Run: `docker run -p 3000:3000 freshstore`
