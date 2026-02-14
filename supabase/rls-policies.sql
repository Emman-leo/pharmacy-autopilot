-- Pharmacy Management System - RLS Policies
-- Row Level Security implementation for all tables

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dosage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can only view and update their own record
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

CREATE POLICY "Admins can update any user" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- Drugs table policies
CREATE POLICY "All authenticated users can view drugs" ON drugs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage drugs" ON drugs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- Inventory batches policies
CREATE POLICY "Authenticated users can view inventory" ON inventory_batches
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can add inventory" ON inventory_batches
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid()
        )
    );

CREATE POLICY "Staff can update inventory" ON inventory_batches
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid()
        )
    );

CREATE POLICY "Staff can delete inventory" ON inventory_batches
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid()
        )
    );

-- Sales policies
CREATE POLICY "Authenticated users can view sales" ON sales
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can create sales" ON sales
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own sales" ON sales
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all sales" ON sales
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- Sale items policies
CREATE POLICY "Authenticated users can view sale items" ON sale_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can add sale items" ON sale_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid()
        ) AND
        EXISTS (
            SELECT 1 FROM sales s 
            WHERE s.id = sale_items.sale_id AND s.created_by = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all sale items" ON sale_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- Prescriptions policies
CREATE POLICY "Staff can view prescriptions" ON prescriptions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can create prescriptions" ON prescriptions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own prescriptions" ON prescriptions
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all prescriptions" ON prescriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- Prescription items policies
CREATE POLICY "Authenticated users can view prescription items" ON prescription_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can manage prescription items" ON prescription_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid()
        )
    );

-- Drug interactions policies
CREATE POLICY "Authenticated users can view drug interactions" ON drug_interactions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage drug interactions" ON drug_interactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- Dosage limits policies
CREATE POLICY "Authenticated users can view dosage limits" ON dosage_limits
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage dosage limits" ON dosage_limits
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- Audit log policies
CREATE POLICY "Users can view their own audit logs" ON audit_log
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert audit logs" ON audit_log
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can view all audit logs" ON audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- Functions for business logic enforcement

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION check_permission(required_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() AND u.role = required_role
    );
END;
$$ LANGUAGE plpgsql;

-- Function to automatically set created_by for new records
CREATE OR REPLACE FUNCTION set_created_by()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_by := auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically set created_by
CREATE TRIGGER set_sales_created_by 
    BEFORE INSERT ON sales
    FOR EACH ROW EXECUTE FUNCTION set_created_by();

CREATE TRIGGER set_prescriptions_created_by 
    BEFORE INSERT ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION set_created_by();

-- Function to check stock availability before sale
CREATE OR REPLACE FUNCTION check_stock_availability()
RETURNS TRIGGER AS $$
DECLARE
    available_quantity INTEGER;
BEGIN
    SELECT SUM(quantity) INTO available_quantity
    FROM inventory_batches
    WHERE drug_id = NEW.drug_id AND expiry_date >= CURRENT_DATE;
    
    IF available_quantity IS NULL OR available_quantity < NEW.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for drug ID %', NEW.drug_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to deduct stock after sale completion
CREATE OR REPLACE FUNCTION deduct_stock_after_sale()
RETURNS TRIGGER AS $$
DECLARE
    remaining_quantity INTEGER;
    batch_record RECORD;
BEGIN
    -- Only deduct stock for completed sales
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Get sale items for this sale
        FOR batch_record IN
            SELECT si.batch_id, si.quantity
            FROM sale_items si
            WHERE si.sale_id = NEW.id
        LOOP
            -- Deduct from the specific batch
            UPDATE inventory_batches
            SET quantity = quantity - batch_record.quantity
            WHERE id = batch_record.batch_id;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for stock management
CREATE TRIGGER check_stock_before_sale_item_insert
    BEFORE INSERT ON sale_items
    FOR EACH ROW EXECUTE FUNCTION check_stock_availability();

CREATE TRIGGER deduct_stock_after_sale_update
    AFTER UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION deduct_stock_after_sale();

-- Function to check prescription safety rules
CREATE OR REPLACE FUNCTION check_prescription_safety()
RETURNS TRIGGER AS $$
DECLARE
    patient_age INTEGER;
    patient_weight DECIMAL(5,2);
    dosage_limit RECORD;
    interaction_count INTEGER;
BEGIN
    -- Get patient info
    SELECT patient_age, patient_weight INTO patient_age, patient_weight
    FROM prescriptions
    WHERE id = NEW.prescription_id;
    
    -- Check dosage limits
    SELECT * INTO dosage_limit
    FROM dosage_limits dl
    WHERE dl.drug_id = NEW.drug_id
    AND (dl.patient_age_min IS NULL OR patient_age >= dl.patient_age_min)
    AND (dl.patient_age_max IS NULL OR patient_age <= dl.patient_age_max)
    AND (dl.patient_weight_min IS NULL OR patient_weight >= dl.patient_weight_min)
    AND (dl.patient_weight_max IS NULL OR patient_weight <= dl.patient_weight_max);
    
    IF FOUND THEN
        -- Here you would implement dosage calculation logic
        -- For now, we'll just log that a check occurred
        RAISE NOTICE 'Dosage limit check performed for drug %', NEW.drug_id;
    END IF;
    
    -- Check drug interactions (simplified)
    SELECT COUNT(*) INTO interaction_count
    FROM prescription_items pi
    JOIN drug_interactions di ON (
        (di.drug_a_id = pi.drug_id AND di.drug_b_id = NEW.drug_id) OR
        (di.drug_a_id = NEW.drug_id AND di.drug_b_id = pi.drug_id)
    )
    WHERE pi.prescription_id = NEW.prescription_id;
    
    IF interaction_count > 0 THEN
        RAISE EXCEPTION 'Drug interaction detected. Please review prescription.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for prescription safety
CREATE TRIGGER check_prescription_safety_trigger
    BEFORE INSERT ON prescription_items
    FOR EACH ROW EXECUTE FUNCTION check_prescription_safety();

-- Function to generate automatic alerts
CREATE OR REPLACE FUNCTION generate_alerts()
RETURNS TABLE(
    alert_type TEXT,
    drug_name TEXT,
    batch_number TEXT,
    message TEXT,
    severity TEXT
) AS $$
BEGIN
    -- Low stock alerts
    RETURN QUERY
    SELECT 
        'LOW_STOCK'::TEXT,
        d.name,
        ib.batch_number,
        'Stock level is below minimum threshold'::TEXT,
        'HIGH'::TEXT
    FROM inventory_batches ib
    JOIN drugs d ON ib.drug_id = d.id
    WHERE ib.quantity <= d.min_stock_level;
    
    -- Expiry alerts (within 30 days)
    RETURN QUERY
    SELECT 
        'EXPIRY_WARNING'::TEXT,
        d.name,
        ib.batch_number,
        'Batch expires soon'::TEXT,
        CASE 
            WHEN ib.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'HIGH'::TEXT
            ELSE 'MEDIUM'::TEXT
        END
    FROM inventory_batches ib
    JOIN drugs d ON ib.drug_id = d.id
    WHERE ib.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days';
    
    -- Expired stock alerts
    RETURN QUERY
    SELECT 
        'EXPIRED'::TEXT,
        d.name,
        ib.batch_number,
        'Batch has expired'::TEXT,
        'HIGH'::TEXT
    FROM inventory_batches ib
    JOIN drugs d ON ib.drug_id = d.id
    WHERE ib.expiry_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;