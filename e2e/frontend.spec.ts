import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';
import config from '../playwright.config';
const BASE_URL = 'http://localhost:5050';
const RESOURCES_FILE = path.join(__dirname, '../utils/resources.json');
test.beforeAll(async () => {
  const projects: { name: string }[] = (config as any).projects ?? [];
  const browsers: string[] = projects.map(p => p.name);
  const initialData = browsers.flatMap((browserName: string) => [
    {
      id: `kb-${browserName}`,
      name: `Keyboard-${browserName}`,
      location: 'Room 101',
      description: 'Wireless keyboard',
      owner: 'admin@example.com'
    },
    {
      id: `mn-${browserName}`,
      name: `Monitor-${browserName}`,
      location: 'Room 101',
      description: 'HP Monitor',
      owner: 'admin@example.com'
    },
    {
      id: `lt-${browserName}`,
      name: `Laptop-${browserName}`,
      location: 'Room 101',
      description: 'Dell Laptop',
      owner: 'admin@example.com'
    },
  ]);
  await fs.writeFile(RESOURCES_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  console.log('resources.json initialized for browsers:', browsers.join(', '));
});
test.describe('Resource Mgmt CRUD Frontend Tests', () => {
  test('Create Resource', async ({ page, browserName }) => {
    await page.goto(BASE_URL);
    const resourceName = `Projector-${browserName}`;
    // Open modal
    await page.click('button:has-text("Add Resource")');
    // Fill form
    await page.fill('#name', resourceName);
    await page.fill('#location', 'Room 101');
    await page.fill('#description', 'HD Projector');
    await page.fill('#owner', 'admin@example.com');
    // Submit the new resource
    await page.click('button:has-text("Add New Resource")');
    // Accept confirmation dialog
    page.once('dialog', dialog => dialog.accept());
    // Wait for modal to close
    await page.waitForSelector('#resourceModal', { state: 'hidden', timeout: 10000 });
    // Wait for the new row in the table
    const row = page.locator('#tableContent tr', { hasText: resourceName });
    await row.waitFor({ state: 'visible', timeout: 10000 });
    // Assert it is visible
    await expect(row).toBeVisible();
  });
});