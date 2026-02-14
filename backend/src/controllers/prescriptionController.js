// Prescription Controller - Placeholder
const { sql } = require('../utils/db');

const createPrescription = async (req, res) => {
  try {
    const { patientName, patientAge, patientWeight, doctorName, diagnosis, items, notes } = req.body;
    const userId = req.user.id;
    
    // Generate prescription number
    const prescriptionNumberResult = await sql`SELECT generate_prescription_number() as prescription_number`;
    const prescriptionNumber = prescriptionNumberResult[0].prescription_number;
    
    // Create prescription record
    const prescription = await sql`
      INSERT INTO prescriptions (
        prescription_number, patient_name, patient_age, patient_weight,
        doctor_name, diagnosis, notes, created_by
      ) VALUES (
        ${prescriptionNumber}, ${patientName}, ${patientAge}, ${patientWeight},
        ${doctorName}, ${diagnosis}, ${notes}, ${userId}
      )
      RETURNING *
    `;
    
    // Create prescription items
    for (const item of items) {
      await sql`
        INSERT INTO prescription_items (
          prescription_id, drug_id, dosage, frequency, duration, 
          quantity_prescribed, instructions
        ) VALUES (
          ${prescription[0].id}, ${item.drugId}, ${item.dosage}, ${item.frequency},
          ${item.duration}, ${item.quantityPrescribed}, ${item.instructions}
        )
      `;
    }
    
    res.status(201).json({
      message: 'Prescription created successfully',
      prescription: prescription[0]
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      error: 'Failed to create prescription',
      message: error.message
    });
  }
};

const getPendingPrescriptions = async (req, res) => {
  try {
    const prescriptions = await sql`
      SELECT p.*, u.full_name as creator_name
      FROM prescriptions p
      JOIN users u ON p.created_by = u.id
      WHERE p.status = 'pending'
      ORDER BY p.created_at DESC
    `;
    
    res.json({
      prescriptions,
      count: prescriptions.length
    });
  } catch (error) {
    console.error('Get pending prescriptions error:', error);
    res.status(500).json({
      error: 'Failed to fetch pending prescriptions',
      message: error.message
    });
  }
};

const approvePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const updatedPrescription = await sql`
      UPDATE prescriptions
      SET status = 'approved', approved_by = ${userId}, approved_at = NOW()
      WHERE id = ${id} AND status = 'pending'
      RETURNING *
    `;
    
    if (updatedPrescription.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Pending prescription not found'
      });
    }
    
    res.json({
      message: 'Prescription approved successfully',
      prescription: updatedPrescription[0]
    });
  } catch (error) {
    console.error('Approve prescription error:', error);
    res.status(500).json({
      error: 'Failed to approve prescription',
      message: error.message
    });
  }
};

const rejectPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const updatedPrescription = await sql`
      UPDATE prescriptions
      SET status = 'rejected', notes = COALESCE(${notes}, notes)
      WHERE id = ${id} AND status = 'pending'
      RETURNING *
    `;
    
    if (updatedPrescription.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Pending prescription not found'
      });
    }
    
    res.json({
      message: 'Prescription rejected successfully',
      prescription: updatedPrescription[0]
    });
  } catch (error) {
    console.error('Reject prescription error:', error);
    res.status(500).json({
      error: 'Failed to reject prescription',
      message: error.message
    });
  }
};

module.exports = {
  createPrescription,
  getPendingPrescriptions,
  approvePrescription,
  rejectPrescription
};