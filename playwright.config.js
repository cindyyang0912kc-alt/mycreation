import {defineConfig,devices} from '@playwright/test';
export default defineConfig({testDir:'./e2e',timeout:30000,use:{...devices['iPhone 13'],defaultBrowserType:'chromium',launchOptions:{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}},webServer:{command:'python3 -m http.server 3108 --directory dist',port:3108,reuseExistingServer:false},reporter:'list'});
