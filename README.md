# Muhammad Tahir Hussain / Portfolio v3

Live: <https://muhammadtahirhussain-official.github.io/portfolio-v3/>

Hand-written HTML, CSS and JavaScript. No framework, no build step.

## Projects update themselves

The Work section is not written in the HTML. On every visit the page asks the GitHub API for the
public repositories of `MuhammadTahirHussain-Official` and builds the list, the language filters,
the count and the poster covers from the answer (cached in the visitor's browser for 10 minutes).

| You do this on GitHub | The site does this |
| --- | --- |
| Create a new public repo | It appears in the list, newest push first |
| Set the repo description | That sentence is shown when the row is opened |
| Set the repo website | A "Live site" button is added |
| Add topics | Up to three are shown as tags |
| Add the topic `portfolio-hide` | The repo is left out |

Forks, archived repos and the portfolio repos are skipped. For a nicer title or fallback text, add a line to `META` at the top of `js/main.js`.

## Design

- Three flat colours: black `#0b0b0c`, bone `#efede6`, red `#ff2d2d`. Hard edges, no gradients.
- Type: Anton for display, JetBrains Mono for labels, Inter Tight for reading text.
- Portrait drawn in horizontal slices that shear with the pointer and with scrolling.
- Crosshair cursor with live coordinates.
- Statement uncovered line by line by a red block wipe.
- Work rows invert on hover, open in place, and a generated poster cover trails the pointer.
- Stack: three rings of type in 3D that turn on their own and can be dragged.
- Contact: letters stretch upward toward the pointer.
- Respects `prefers-reduced-motion`.

## Run locally

```bash
python -m http.server 4175
```
