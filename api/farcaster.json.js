export default function handler(req, res) {
  const host = req.headers.host || 'realmind-mini.dailywiser.xyz';

  // Generate domain-specific farcaster.json configuration
  const config = {
    frame: {
      name: "Realmind",
      version: "1",
      iconUrl: `https://${host}/icon.png`,
      homeUrl: `https://${host}`,
      imageUrl: `https://${host}/icon.png`,
      splashImageUrl: `https://${host}/icon.png`,
      splashBackgroundColor: "#FFC117",
      webhookUrl: `https://${host}/api/webhook`,
      subtitle: "Interactive Learning",
      description: "Test your knowledge and earn rewards on Hyperion Testnet with interactive quiz games.",
      primaryCategory: "education",
      screenshotUrls: [
        `https://${host}/icon.png`
      ],
      tags: [
        "quiz",
        "learning",
        "education",
        "blockchain",
        "rewards"
      ],
      heroImageUrl: `https://${host}/quiz-preview.jpeg`,
      tagline: "Learn & Earn",
      ogTitle: "Realmind - Interactive Learning",
      ogDescription: "Test your knowledge and earn rewards on Hyperion Testnet!",
      ogImageUrl: `https://${host}/icon.png`,
      noindex: false
    },
    accountAssociation: {
      header: "eyJmaWQiOjIxNjM4MywidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDIxNEQxNzJDMERjNjBmQTUxNERmOTU0QTgyOGJjQzU1MkJlMzA4MTUifQ",
      payload: "eyJkb21haW4iOiJyZWFsbWluZC1taW5pLmRhaWx5d2lzZXIueHl6In0",
      signature: "MHg0ZmQzMjg3M2UxNmViNDM4ODJlNmI0YTczMjgzMjQwYzY5ODVjYmFmNGMxZTg5N2M0NTQ1YWUzZTQxOTgwYTQxNWUwMjJkMTZmNjUyNDEyYjFmM2Q1NDcwNmU5NmZiOTM1ZDllZTAwNGE2YmIxYTI2MzBiOGVhMWIzY2RkY2FiODFj"
    },
    baseBuilder: {
      allowedAddresses: [
        "0x1eA091521DC4A2035a586995f9fB7ca7b0F646ad"
      ]
    }
  };

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(config);
}
