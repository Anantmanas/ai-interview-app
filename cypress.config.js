module.exports = {
  projectId: "hourtf",

  e2e: {
    // 1. Safe Base URL: Points only to your local machine
    baseUrl: "http://localhost:3000",

    // 2. Prevent data pollution: Isolate cookies and storage between tests
    testIsolation: true,

    setupNodeEvents(on, config) {
      // Node event listeners go here if needed
    },
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
};
