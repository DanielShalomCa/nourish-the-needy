# Nourish the Needy setup checklist

## Hosting (Netlify recommended)
- Create a Git repo and push this project.
- In Netlify, create a new site from the repo.
- Enable Netlify Identity and Git Gateway (Site settings -> Identity).
- Invite admins (your friend) from the Identity tab.
- Visit `/admin` on the live site to log in and manage posts.

## Admin posting
- In `/admin`, edit the Posts list.
- Upload photos or videos; they will be stored in `/uploads`.
- Save and publish to update `posts.json` automatically.

## Payment button
- Replace the placeholder links in `index.html` with your real provider URLs.
- If your provider gives an embed button, paste it into the "Payment button" card.

## Local preview
- Open `index.html` and `blog.html` in your browser.
