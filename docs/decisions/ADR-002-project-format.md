# ADR-002: Human-Readable JSON Project Format (.fiesta)

## Context
A digital audio workstation must persist complete multitrack arrangements, patterns, mixer routings, and metadata across user sessions and permit seamless export/import.

## Problem
Should FIesta Studio adopt a binary format (e.g. Protocol Buffers, custom binary chunk format) or a text-based format (JSON)?

## Options Considered
1. **Binary Blob Format (Protobuf/Custom):** Small file size, faster byte-level parsing, difficult to inspect or version control.
2. **Standard Schema-Validated JSON (.fiesta):** Human-readable, git-friendly, easily inspected, natively supported by browser `JSON.stringify/parse`.

## Decision
We adopted **Option 2: Schema-Validated JSON (.fiesta)**.

Audio sample assets are stored separately by reference or base64 encoded when small, while the arrangement and sequencer data are represented in clean, typed JSON.

## Consequences
- **Positive:** Developers and users can open `.fiesta` project files in any text editor, diff project revisions in Git, and build custom scripting utilities.
- **Positive:** Effortless integration with browser `localStorage` and `IndexedDB`.
- **Negative:** Slightly larger file sizes than binary formats (mitigated by HTTP gzip/brotli compression).
