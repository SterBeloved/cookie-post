# Cookie Post V1.9 — Dedicated Send step

Only index.html, finish.js, and styles.css were changed.

1. Added step 6: Send to the studio progress navigation.
2. Package (step 5) keeps wrapping, from/to names, message, poetry generation, and PNG downloads; removed its Send button.
3. Send (step 6) displays the current card preview using the existing Canvas generator and has a button opening the existing EmailJS modal.
4. Package > Send and Send > Package work via Next/Back; clicking step 6 works once a shape exists.
5. No changes to mail.js, poetry.js, script.js, images, or backend configuration. **Sending remains blocked until Turnstile and Worker security are configured.**

The preview is generated locally and not uploaded; only pressing the actual Send button in a configured environment would start the mail flow.
