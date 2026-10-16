# Local development

## Start the app

```bash
npm install
npm run dev
```

Open `http://localhost:3000/playbooks/steal-your-competitors-audience`.

## Where to make changes

- `src/app/playbooks/steal-your-competitors-audience/playbook.tsx` contains the interactive guide.
- `src/app/globals.css` contains the visual system and responsive rules.
- `src/app/layout.tsx` owns shared metadata and font setup.
- `public/` contains local static assets.

## Browser checks

Before handing off a visual change, verify:

1. The top navigation and hero align at desktop width.
2. The start-play form does not overlap its heading.
3. The prompt preview opens, copies, and closes.
4. The Instagram embed is only requested after selecting the load control.
5. The checklist still saves progress in the browser.
