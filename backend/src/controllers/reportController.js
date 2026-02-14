// Report Controller - Placeholder
const { sql } = require('../utils/db');

const getSalesSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = sql`
      SELECT 
        COUNT(*) as total_sales,
        SUM(final_amount) as total_revenue,
        AVG(final_amount) as average_sale,
        MIN(final_amount) as min_sale,
        MAX(final_amount) as max_sale
      FROM sales
      WHERE status = 'completed'
    `;
    
    if (startDate && endDate) {
      query = sql`
        SELECT 
          COUNT(*) as total_sales,
          SUM(final_amount) as total_revenue,
          AVG(final_amount) as average_sale,
          MIN(final_amount) as min_sale,
          MAX(final_amount) as max_sale
        FROM sales
        WHERE status = 'completed'
        AND created_at BETWEEN ${startDate} AND ${endDate}
      `;
    }
    
    const summary = await query;
    
    res.json({
      summary: summary[0]
    });
  } catch (error) {
    console.error('Get sales summary error:', error);
    res.status(500).json({
      error: 'Failed to fetch sales summary',
      message: error.message
    });
  }
};

const getTopSelling = async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    
    let query = sql`
      SELECT 
        d.name as drug_name,
        d.category,
        SUM(si.quantity) as total_sold,
        SUM(si.total_price) as total_revenue
      FROM sale_items si
      JOIN drugs d ON si.drug_id = d.id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.status = 'completed'
      GROUP BY d.id, d.name, d.category
      ORDER BY total_sold DESC
      LIMIT ${parseInt(limit)}
    `;
    
    if (startDate && endDate) {
      query = sql`
        SELECT 
          d.name as drug_name,
          d.category,
          SUM(si.quantity) as total_sold,
          SUM(si.total_price) as total_revenue
        FROM sale_items si
        JOIN drugs d ON si.drug_id = d.id
        JOIN sales s ON si.sale_id = s.id
        WHERE s.status = 'completed'
        AND s.created_at BETWEEN ${startDate} AND ${endDate}
        GROUP BY d.id, d.name, d.category
        ORDER BY total_sold DESC
        LIMIT ${parseInt(limit)}
      `;
    }
    
    const topSelling = await query;
    
    res.json({
      topSelling,
      count: topSelling.length
    });
  } catch (error) {
    console.error('Get top selling error:', error);
    res.status(500).json({
      error: 'Failed to fetch top selling drugs',
      message: error.message
    });
  }
};

const getExpiryAlerts = async (req, res) => {
  try {
    const { daysThreshold = 30 } = req.query;
    
    const expiryAlerts = await sql`
      SELECT 
        d.name as drug_name,
        d.category,
        ib.batch_number,
        ib.expiry_date,
        ib.quantity,
        CASE 
          WHEN ib.expiry_date < CURRENT_DATE THEN 'EXPIRED'
          WHEN ib.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'EXPIRING_SOON_CRITICAL'
          WHEN ib.expiry_date <= CURRENT_DATE + INTERVAL '${daysThreshold} days' THEN 'EXPIRING_SOON'
        END as alert_level
      FROM inventory_batches ib
      JOIN drugs d ON ib.drug_id = d.id
      WHERE ib.expiry_date <= CURRENT_DATE + INTERVAL '${daysThreshold} days'
      AND ib.quantity > 0
      ORDER BY ib.expiry_date ASC
    `;
    
    res.json({
      expiryAlerts,
      count: expiryAlerts.length
    });
  } catch (error) {
    console.error('Get expiry alerts error:', error);
    res.status(500).json({
      error: 'Failed to fetch expiry alerts',
      message: error.message
    });
  }
};

module.exports = {
  getSalesSummary,
  getTopSelling,
  getExpiryAlerts
};