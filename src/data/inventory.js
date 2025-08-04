import { nanoid } from 'nanoid';

const categories = ['Electronics', 'Components', 'Accessories', 'Tools'];
const suppliers = ['TechSupply Co', 'Component Central', 'ElectroWorks Ltd', 'Industrial Parts Inc'];
const locations = ['A1-01', 'A1-02', 'B2-15', 'B2-16', 'C3-08', 'C3-09'];

const productNames = [
  'Widget Pro X1', 'Circuit Board Alpha', 'Sensor Module Beta', 'Display Unit Gamma',
  'Processor Core Delta', 'Memory Stick Epsilon', 'Cable Assembly Zeta', 'Adapter Hub Eta',
  'Testing Device Theta', 'Storage Unit Iota', 'Power Supply Kappa', 'Interface Card Lambda'
];

export const generateInventory = () => {
  const items = [];
  
  for (let i = 0; i < 156; i++) {
    const dailyDemand = Math.floor(Math.random() * 50) + 5;
    const reorderPoint = dailyDemand * (Math.floor(Math.random() * 10) + 5);
    const maxStock = reorderPoint * (Math.floor(Math.random() * 3) + 2);
    const currentStock = Math.floor(Math.random() * maxStock);
    const backorders = currentStock < reorderPoint ? Math.floor(Math.random() * dailyDemand * 3) : 0;
    
    let status = 'good';
    if (currentStock <= reorderPoint * 0.2) {
      status = 'critical';
    } else if (currentStock <= reorderPoint) {
      status = 'low';
    }
    
    items.push({
      id: nanoid(),
      sku: `SKU-${(i + 1).toString().padStart(4, '0')}`,
      name: `${productNames[i % productNames.length]} ${i > 11 ? 'v2' : ''}`,
      stock: currentStock,
      reorderPoint,
      dailyDemand,
      supplierETA_days: Math.floor(Math.random() * 20) + 5,
      backorders,
      unitCost: Math.floor(Math.random() * 500) + 10,
      category: categories[Math.floor(Math.random() * categories.length)],
      subcategory: 'Standard',
      supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
      maxStock,
      location: locations[Math.floor(Math.random() * locations.length)],
      avgMonthlyUsage: dailyDemand * 30,
      peakSeason: ['Q1', 'Q2', 'Q3', 'Q4'][Math.floor(Math.random() * 4)],
      turnoverRate: Math.floor(Math.random() * 10) + 2,
      qualityRating: Math.floor(Math.random() * 2) + 4,
      defectRate: Math.random() * 0.1,
      lastOrderDate: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
      status
    });
  }
  
  return items;
};

export const seedInventory = generateInventory();