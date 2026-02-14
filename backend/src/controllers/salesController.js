// Sales Controller - Placeholder
const { sql } = require('../utils/db');

const checkout = async (req, res) => {
  try {
    const { customerName, customerPhone, items, paymentMethod, discountAmount = 0 } = req.body;
    const userId = req.user.id;
    
    // Generate sale number
    const saleNumberResult = await sql`SELECT generate_sale_number() as sale_number`;
    const saleNumber = saleNumberResult[0].sale_number;
    
    // Calculate totals
    let totalAmount = 0;
    const processedItems = [];
    
    // Process each item and apply FEFO logic
    for (const item of items) {
      const { drugId, quantity } = item;
      
      // Get available batches ordered by expiry date (FEFO)
      const batches = await sql`
        SELECT id, batch_number, expiry_date, quantity, selling_price
        FROM inventory_batches
        WHERE drug_id = ${drugId} 
        AND expiry_date >= CURRENT_DATE
        AND quantity > 0
        ORDER BY expiry_date ASC, received_date ASC
      `;
      
      if (batches.length === 0) {
        return res.status(400).json({
          error: 'Stock unavailable',
          message: `Insufficient stock for drug ID: ${drugId}`
        });
      }
      
      let remainingQuantity = quantity;
      let itemTotal = 0;
      
      // Apply FEFO selection
      for (const batch of batches) {
        if (remainingQuantity <= 0) break;
        
        const takeQuantity = Math.min(remainingQuantity, batch.quantity);
        const lineTotal = takeQuantity * batch.selling_price;
        
        processedItems.push({
          batchId: batch.id,
          drugId,
          quantity: takeQuantity,
          unitPrice: batch.selling_price,
          totalPrice: lineTotal,
          batchNumber: batch.batch_number
        });
        
        itemTotal += lineTotal;
        remainingQuantity -= takeQuantity;
      }
      
      if (remainingQuantity > 0) {
        return res.status(400).json({
          error: 'Stock unavailable',
          message: `Insufficient stock for drug ID: ${drugId}`
        });
      }
      
      totalAmount += itemTotal;
    }
    
    // Calculate final amount
    const taxAmount = totalAmount * 0.0; // No tax for now
    const finalAmount = totalAmount - discountAmount + taxAmount;
    
    // Create sale record
    const sale = await sql`
      INSERT INTO sales (
        sale_number, customer_name, customer_phone, total_amount,
        discount_amount, tax_amount, final_amount, payment_method, created_by
      ) VALUES (
        ${saleNumber}, ${customerName}, ${customerPhone}, ${totalAmount},
        ${discountAmount}, ${taxAmount}, ${finalAmount}, ${paymentMethod}, ${userId}
      )
      RETURNING *
    `;
    
    // Create sale items and update inventory
    for (const item of processedItems) {
      await sql`
        INSERT INTO sale_items (
          sale_id, drug_id, batch_id, quantity, unit_price, total_price
        ) VALUES (
          ${sale[0].id}, ${item.drugId}, ${item.batchId}, ${item.quantity}, ${item.unitPrice}, ${item.totalPrice}
        )
      `;
      
      // Update batch quantity
      await sql`
        UPDATE inventory_batches
        SET quantity = quantity - ${item.quantity}
        WHERE id = ${item.batchId}
      `;
    }
    
    res.status(201).json({
      message: 'Checkout completed successfully',
      sale: sale[0],
      items: processedItems
    });
    
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      error: 'Checkout failed',
      message: error.message
    });
  }
};

const getSalesHistory = async (req, res) => {
  try {
    const { startDate, endDate, limit = 50, offset = 0 } = req.query;
    
    let query = sql`
      SELECT s.*, u.full_name as cashier_name
      FROM sales s
      JOIN users u ON s.created_by = u.id
      ORDER BY s.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;
    
    if (startDate && endDate) {
      query = sql`
        SELECT s.*, u.full_name as cashier_name
        FROM sales s
        JOIN users u ON s.created_by = u.id
        WHERE s.created_at BETWEEN ${startDate} AND ${endDate}
        ORDER BY s.created_at DESC
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `;
    }
    
    const sales = await query;
    
    res.json({
      sales,
      count: sales.length
    });
  } catch (error) {
    console.error('Get sales history error:', error);
    res.status(500).json({
      error: 'Failed to fetch sales history',
      message: error.message
    });
  }
};

const getReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get sale details
    const sales = await sql`
      SELECT s.*, u.full_name as cashier_name
      FROM sales s
      JOIN users u ON s.created_by = u.id
      WHERE s.id = ${id}
    `;
    
    if (sales.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Sale not found'
      });
    }
    
    // Get sale items with drug details
    const items = await sql`
      SELECT si.*, d.name as drug_name, ib.batch_number
      FROM sale_items si
      JOIN drugs d ON si.drug_id = d.id
      JOIN inventory_batches ib ON si.batch_id = ib.id
      WHERE si.sale_id = ${id}
    `;
    
    res.json({
      sale: sales[0],
      items
    });
  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({
      error: 'Failed to fetch receipt',
      message: error.message
    });
  }
};

module.exports = {
  checkout,
  getSalesHistory,
  getReceipt
};