# Mermaid custom themes and fonts

This test exercises mermaid theming and font overrides applied per-diagram via the
`%%{init}%%` directive, which mermaid parses at render time regardless of the
`mermaid-filter` configuration.

## Built-in theme: forest

```mermaid
%%{init: {"theme": "forest"}}%%
flowchart TD
    A[Start] --> B{Cached?}
    B -- Yes --> C[Serve from cache]
    B -- No --> D[Render diagram]
    D --> C
```

## Built-in theme: dark

```mermaid
%%{init: {"theme": "dark"}}%%
sequenceDiagram
    participant Client
    participant Filter
    participant Chrome
    Client->>Filter: mermaid code block
    Filter->>Chrome: render SVG
    Chrome-->>Filter: SVG/PDF
    Filter-->>Client: image
```

## Custom colors via base theme + themeVariables

Custom `themeVariables` only take effect with `theme: "base"`.

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#ffe0b2", "primaryBorderColor": "#e65100", "primaryTextColor": "#3e2723", "lineColor": "#6d4c41"}}}%%
flowchart LR
    Draft --> Review
    Review --> Approved
    Approved --> Published
```

## Custom font via themeVariables.fontFamily

The font must exist inside the container. The image ships `fonts-liberation`, so
`Liberation Serif` resolves; the generic `monospace` family is also exercised.

```mermaid
%%{init: {"theme": "base", "themeVariables": {"fontFamily": "Liberation Serif"}}}%%
flowchart TD
    A[Liberation Serif label] --> B[Another node]
    B --> C[Final node]
```

```mermaid
%%{init: {"theme": "neutral", "themeVariables": {"fontFamily": "monospace"}}}%%
stateDiagram-v2
    [*] --> Idle
    Idle --> Running : start
    Running --> Idle : stop
    Running --> [*] : exit
```
