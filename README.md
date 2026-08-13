# 🎲 The Storybook Die

*Every roll tells a story.*

Roll the die and the book narrates your fortune — or type the number you actually rolled at the table, and it will find the words for you.

**Live site:** https://storybook-die.pages.dev

---

## How it works

1. **Choose a die** — d4 through d20.
2. **Roll it** — the die tumbles, and a literary narration appears: five tiers from *critical* to *fumbled*.
3. **Or narrate a real roll** — rolled a 17 at the table? Type it in, and the book tells you what it meant.
4. **The book remembers** — your roll history persists in the browser (localStorage).

### The tiers

- **Critical** — *"Fortune, that fickle muse, kisses your blade."*
- **Favourable** — a steady hand and a kind wind.
- **Uncertain** — the middle of the page, where most of life is written.
- **Unfortunate** — the fates glance away, embarrassed for you.
- **Fumbled** — the dice gods laugh, and your dignity joins the floor.

---

## Development

```bash
npm install
npm test   # engine + UI suites
```

Single self-contained `index.html` — no build step, no server, deployable to any static host.

---

## Roadmap

- Advantage / disadvantage rolls
- Custom narration pools

---

*Penned by Daanish of Chaos Collective Labs — may your omens be kind and your dice be true.*
