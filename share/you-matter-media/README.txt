YOU MATTER MEDIA — WEBSITE
==========================

HOW TO OPEN
-----------
1. Extract you-matter-media.zip (right-click > Extract All...).
   Open it from the extracted folder, not from inside the zip.
2. Open the "you-matter-media" folder.
3. Double-click index.html. It opens in your web browser
   (Chrome or Edge recommended).

No installation, no server and no internet setup are needed.

PAGES
-----
  index.html      Home
  about.html      About
  services.html   Services
  work.html       Work
  clients.html    Clients
  contact.html    Contact

Any page can be opened directly; the menu moves between them.

WHAT NEEDS AN INTERNET CONNECTION
---------------------------------
The website itself, its images and its animations all work offline.
With a connection you also get:
  - The two brand fonts (League Gothic and Poppins, from Google Fonts).
    Offline, similar fonts already on the computer are used instead,
    so the text looks slightly different but everything still works.
  - The Google Maps link and the social media links (Facebook,
    Instagram, YouTube, LinkedIn, WhatsApp), which open those sites.

THE CONTACT FORM
----------------
The form checks what is typed, but it cannot send messages by itself:
sending needs an email/form service (for example Formspree), which
this package does not include. Until one is connected, pressing
"Start a Conversation" asks the visitor to call +91-90304 04445
instead, and nothing is lost or falsely reported as sent.
The phone number and "Call Now" buttons work normally (tel: links).

To connect a form service, a developer sets VITE_CONTACT_ENDPOINT in the
project source and rebuilds this package with: npm run build:static

FOLDERS
-------
  css/style.css   the site's styles
  js/script.js    the site's code (everything in one file)
  images/         every image, logo and icon the site uses
