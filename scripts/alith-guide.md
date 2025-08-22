# Alith Getting Started Guide

## Overview
This guide will walk you through everything you need to get started with Alith. Whether you're building intelligent agents, integrating tools, or experimenting with language models, Alith provides a seamless experience across multiple programming languages. Below, you'll find installation instructions, quick start guides, and examples for Rust, Python, and Node.js.

## Install Dependency

### Alith dependency
```bash
npm install alith
# Or use pnpm
pnpm install alith
# Or use yarn
yarn install alith
```

## Write the Code

```typescript
import { Agent } from "alith";

const agent = new Agent({
  model: "gpt-4",
  preamble: "You are a comedian here to entertain the user using humour and jokes.",
});

console.log(await agent.prompt("Entertain me!"));
```

## Model Provider Settings
To configure different AI model providers, here we use the OpenAI model as an example.

### Unix
```bash
export OPENAI_API_KEY=<your API key>
```

### Windows
```cmd
$env:OPENAI_API_KEY = "<your API key>"
```

## Run the Code

### Using the provided example script
```bash
# Set your OpenAI API key first
export OPENAI_API_KEY=<your API key>

# Run the example script
npx tsx scripts/alith.ts
```

### For your own files
```bash
# Standard TypeScript compilation
tsc your-file.ts && node your-file.js

# Using tsx for direct TypeScript execution
npx tsx your-file.ts
```

## Example Script
We've included a ready-to-run example script at `scripts/alith.ts` that demonstrates the basic usage. The script includes error handling and environment variable checking for a better development experience.
