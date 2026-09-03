# @bpmn-io/theme

[![CI](https://github.com/bpmn-io/themes/actions/workflows/CI.yml/badge.svg)](https://github.com/bpmn-io/themes/actions/workflows/CI.yml)

The design tokens behind bpmn.io, and the default look they produce.

This package is the source of truth, not a runtime dependency — no bpmn.io
library loads it at runtime.

## The contract

The semantic tokens — everything named `--bio-*`:

```css
--bio-border: hsl(225, 10%, 75%);
```

Those are the names a theme overrides and a library reads, so they are the part
that cannot change silently.

The defaults reproduce the current bpmn.io look, so adopting the layer is not a
visual change.

## How libraries use the theme

A library marks its own roots with `bio-theme-parent` — every element it renders
into, including the popups and tooltips it attaches to `document.body`.

On that selector it copies the tokens it reads, and the rest of its stylesheet
derives component variables from them:

```css
.bio-theme-parent {
  --bio-border: hsl(225, 10%, 75%);
}

.my-component {
  --input-border-color: var(--bio-border);
}
```

Names and values have to match this package exactly. A name it does not define is
dead weight no theme will reach, and a value that drifted makes the library
render unlike the rest of bpmn.io. A colour the library wants that no token
expresses stays a literal in its own stylesheet.

## Writing a theme

Libraries declare the tokens on their own roots, so a theme overrides them from
an ancestor scope:

```css
.my-theme .bio-theme-parent,
.my-theme.bio-theme-parent {
  --bio-primary: rebeccapurple;
  --bio-surface: #fff;
}
```

Both selectors are required. A custom property declared on an element always
beats one inherited from an ancestor, so a theme has to match the element the
library declared its tokens on — not merely sit above it.

Rebinding the tokens is what lets one theme cover every bpmn.io component at
once. Where a theme wants something the shared semantics don't express, it
overrides an individual component variable instead:

```css
.my-theme .bio-theme-parent,
.my-theme.bio-theme-parent {
  --popup-border-color: var(--bio-border);
}
```

Apply your theme class at the application root:

```html
<body class="my-theme">
```

It has to be the application root, not a wrapper around the canvas. Popups and
tooltips are appended to the end of `<body>`, outside the component that opened
them, and a theme only reaches what it contains.

## License

MIT
