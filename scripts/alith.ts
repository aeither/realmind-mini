import { Agent } from "alith";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  try {
    // Check if OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ Error: OPENAI_API_KEY environment variable is not set");
      console.log("Please set your OpenAI API key:");
      console.log("Unix: export OPENAI_API_KEY=<your API key>");
      console.log("Windows: $env:OPENAI_API_KEY = \"<your API key>\"");
      process.exit(1);
    }

    console.log("🤖 Initializing Alith Agent...");
    
    const agent = new Agent({
      model: "gpt-4",
      preamble: "You are a comedian here to entertain the user using humour and jokes.",
    });

    console.log("🎭 Agent ready! Asking for entertainment...\n");
    
    const response = await agent.prompt("Entertain me!");
    
    console.log("🎪 Agent response:");
    console.log("─".repeat(50));
    console.log(response);
    console.log("─".repeat(50));
    console.log("\n✨ Done! Hope you enjoyed the entertainment!");
    
  } catch (error) {
    console.error("❌ Error running Alith script:", error);
    process.exit(1);
  }
}

// Run the main function
main();

