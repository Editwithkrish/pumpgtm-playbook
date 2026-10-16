# PumpGTM competitor audience playbook

A polished, interactive lead-magnet playbook for finding relevant conversations in competitors' and industry accounts, reviewing the people behind them, and drafting a first message before anything is sent.

The playbook lives at:

```text
/playbooks/steal-your-competitors-audience
```

## What is included

- Editorial playbook layout with PumpGTM-inspired navigation and reading progress.
- Seven practical steps for moving from a buyer brief to a reviewed outreach draft.
- A small signal-review exercise that distinguishes useful context from vanity engagement.
- A first-message worksheet that generates an editable, local draft.
- A copyable PumpGTM research prompt and a longer AI-ready version of the full playbook.
- An opt-in Instagram video section that only loads the embed after the reader asks for it.
- A launch checklist that persists in the browser with `localStorage`.
- Share controls for copying the page URL and opening X or LinkedIn sharing flows.

The page is intentionally a review-first guide. It does not collect leads, enrich people, create sequences, or send messages. The PumpGTM links point readers to the product when they are ready to run the play.

## Stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- Plain CSS in `src/app/globals.css`
- Next.js `Image` for local brand assets

## Run locally

Prerequisites: Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000/playbooks/steal-your-competitors-audience](http://localhost:3000/playbooks/steal-your-competitors-audience).

## Useful commands

```bash
# Start the Turbopack development server
npm run dev

# Run ESLint
npm run lint

# Create a production build
npm run build

# Serve the production build
npm run start
```

## Project structure

```text
src/
  app/
    globals.css                                  # Shared styles and responsive layout
    layout.tsx                                   # Root layout, metadata, and font setup
    page.tsx                                     # Root redirect / entry point
    playbooks/
      steal-your-competitors-audience/
        page.tsx                                 # Route entry point
        playbook.tsx                             # Client-side interactive playbook
public/
  pumpgtm-mark.webp                              # PumpGTM mark used in the UI
```

## Product behavior

The worksheet and checklist run entirely in the browser:

- Building an outreach starter requires a buyer and a problem, then creates a local editable draft.
- Copy buttons use the browser clipboard API. If it is unavailable, the page tells the reader to select the visible text instead.
- Checklist progress is saved only in that browser under a local storage key.
- The Instagram embed is not requested until the reader selects **Load Instagram video**.

There is no database, authentication, server action, or outbound automation in this repository.

## Deployment

This is a standard Next.js Node.js deployment:

```bash
npm run build
npm run start
```

Deploy it to any hosting provider that supports a Next.js Node.js server. Ensure the deployed app can load the external Instagram embed when a reader opts in.

## References

- [PumpGTM](https://pumpgtm.com/)
- [Connect PumpGTM to your AI](https://pumpgtm.com/mcp)
- [AI-first multichannel outbound playbook](https://pumpgtm.com/playbooks/ai-first-multichannel-playbook)
