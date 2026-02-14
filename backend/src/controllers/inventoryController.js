// Inventory Controller - Placeholder
const { sql } = require('../utils/db');

const getDrugs = async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = sql`SELECT * FROM drugs ORDER BY name`;
    
    if (category) {
      query = sql`SELECT * FROM drugs WHERE category = ${category} ORDER BY name`;
    }
    
    if (search) {
      query = sql`SELECT * FROM drugs WHERE name ILIKE ${'%' + search + '%'} ORDER BY name`;
    }
    
    const drugs = await query;
    
    res.json({
      drugs,
      count: drugs.length
    });
  } catch (error) {
    console.error('Get drugs error:', error);
    res.status(500).json({
      error: 'Failed to fetch drugs',
      message: error.message
    });
  }
};

const createDrug = async (req, res) => {
  try {
    const { name, genericName, dosageForm, strength, manufacturer, category, controlledDrug, minStockLevel, maxStockLevel } = req.body;
    
    const newDrug = await sql`
      INSERT INTO drugs (
        name, generic_name, dosage_form, strength, manufacturer, 
        category, controlled_drug, min_stock_level, max_stock_level
      ) VALUES (
        ${name}, ${genericName}, ${dosageForm}, ${strength}, ${manufacturer},
        ${category}, ${controlledDrug || false}, ${minStockLevel || 10}, ${maxStockLevel || 1000}
      )
      RETURNING *
    `;
    
    res.status(201).json({
      message: 'Drug created successfully',
      drug: newDrug[0]
    });
  } catch (error) {
    console.error('Create drug error:', error);
    res.status(500).json({
      error: 'Failed to create drug',
      message: error.message
    });
  }
};

const updateDrug = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, genericName, dosageForm, strength, manufacturer, category, controlledDrug, minStockLevel, maxStockLevel } = req.body;
    
    const updatedDrug = await sql`
      UPDATE drugs SET
        name = ${name},
        generic_name = ${genericName},
        dosage_form = ${dosageForm},
        strength = ${strength},
        manufacturer = ${manufacturer},
        category = ${category},
        controlled_drug = ${controlledDrug},
        min_stock_level = ${minStockLevel},
        max_stock_level = ${maxStockLevel},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (updatedDrug.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Drug not found'
      });
    }
    
    res.json({
      message: 'Drug updated successfully',
      drug: updatedDrug[0]
    });
  } catch (error) {
    console.error('Update drug error:', error);
    res.status(500).json({
      error: 'Failed to update drug',
      message: error.message
    });
  }
};

const deleteDrug = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await sql`
      DELETE FROM drugs WHERE id = ${id}
    `;
    
    if (result.count === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Drug not found'
      });
    }
    
    res.json({
      message: 'Drug deleted successfully'
    });
  } catch (error) {
    console.error('Delete drug error:', error);
    res.status(500).json({
      error: 'Failed to delete drug',
      message: error.message
    });
  }
};

const getBatches = async (req, res) => {
  try {
    const { drugId, expired } = req.query;
    
    let query = sql`
      SELECT ib.*, d.name as drug_name 
      FROM inventory_batches ib
      JOIN drugs d ON ib.drug_id = d.id
      ORDER BY ib.expiry_date
    `;
    
    const batches = await query;
    
    res.json({
      batches,
      count: batches.length
    });
  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({
      error: 'Failed to fetch batches',
      message: error.message
    });
  }
};

const addBatch = async (req, res) => {
  try {
    const { drugId, batchNumber, expiryDate, quantity, costPrice, sellingPrice, supplier, location } = req.body;
    
    const newBatch = await sql`
      INSERT INTO inventory_batches (
        drug_id, batch_number, expiry_date, quantity, 
        cost_price, selling_price, supplier, location
      ) VALUES (
        ${drugId}, ${batchNumber}, ${expiryDate}, ${quantity},
        ${costPrice}, ${sellingPrice}, ${supplier}, ${location}
      )
      RETURNING *
    `;
    
    res.status(201).json({
      message: 'Batch added successfully',
      batch: newBatch[0]
    });
  } catch (error) {
    console.error('Add batch error:', error);
    res.status(500).json({
      error: 'Failed to add batch',
      message: error.message
    });
  }
};

const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { batchNumber, expiryDate, quantity, costPrice, sellingPrice, supplier, location } = req.body;
    
    const updatedBatch = await sql`
      UPDATE inventory_batches SET
        batch_number = ${batchNumber},
        expiry_date = ${expiryDate},
        quantity = ${quantity},
        cost_price = ${costPrice},
        selling_price = ${sellingPrice},
        supplier = ${supplier},
        location = ${location},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (updatedBatch.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Batch not found'
      });
    }
    
    res.json({
      message: 'Batch updated successfully',
      batch: updatedBatch[0]
    });
  } catch (error) {
    console.error('Update batch error:', error);
    res.status(500).json({
      error: 'Failed to update batch',
      message: error.message
    });
  }
};

const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await sql`
      DELETE FROM inventory_batches WHERE id = ${id}
    `;
    
    if (result.count === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Batch not found'
      });
    }
    
    res.json({
      message: 'Batch deleted successfully'
    });
  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({
      error: 'Failed to delete batch',
      message: error.message
    });
  }
};

const getAlerts = async (req, res) => {
  try {
    // Call the database function for alerts
    const alerts = await sql`SELECT * FROM generate_alerts()`;
    
    res.json({
      alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      error: 'Failed to fetch alerts',
      message: error.message
    });
  }
};

module.exports = {
  getDrugs,
  createDrug,
  updateDrug,
  deleteDrug,
  getBatches,
  addBatch,
  updateBatch,
  deleteBatch,
  getAlerts
};