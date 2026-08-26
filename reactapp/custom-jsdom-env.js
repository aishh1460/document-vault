const JSDOMEnvironment = require('jest-environment-jsdom');

class CustomEnvironment extends JSDOMEnvironment {
  constructor(config, context) {
    const projectConfig = config.projectConfig || config;
    if (!projectConfig.testEnvironmentOptions) {
      projectConfig.testEnvironmentOptions = {};
    }
    super(projectConfig, context);
  }
}

module.exports = CustomEnvironment;
