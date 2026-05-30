const {getDefaultConfig} = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files within the monorepo so Metro hot-reloads on changes to
// packages/shared without restarting the bundler.
config.watchFolders = [workspaceRoot];

// Tell Metro where to find modules — check the app's own node_modules first,
// then fall back to the workspace root's node_modules.
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
