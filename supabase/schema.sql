-- Pharmacy Management System - Database Schema
-- Supabase PostgreSQL Schema with RLS

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'staff');
CREATE TYPE prescription_status AS ENUM ('pending', 'approved', 'rejected', 'dispensed');
CREATE TYPE sale_status AS ENUM ('completed', 'cancelled', 'refunded');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drugs master table
CREATE TABLE drugs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    generic_name TEXT,
    dosage_form TEXT NOT NULL, -- tablet, capsule, injection, etc.
    strength TEXT NOT NULL, -- 500mg, 10ml, etc.
    manufacturer TEXT,
    category TEXT, -- antibiotic, painkiller, cardiovascular, etc.
    controlled_drug BOOLEAN DEFAULT FALSE,
    min_stock_level INTEGER DEFAULT 10,
    max_stock_level INTEGER DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory batches with FEFO tracking
CREATE TABLE inventory_batches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    drug_id UUID REFERENCES drugs(id) ON DELETE CASCADE,
    batch_number TEXT NOT NULL,
    expiry_date DATE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    cost_price DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    supplier TEXT,
    received_date DATE DEFAULT CURRENT_DATE,
    location TEXT, -- shelf, refrigerator, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique batch numbers per drug
    UNIQUE(drug_id, batch_number)
);

-- Sales transactions
CREATE TABLE sales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sale_number TEXT UNIQUE NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT, -- cash, card, insurance
    status sale_status DEFAULT 'completed',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sale items (individual products in a sale)
CREATE TABLE sale_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    drug_id UUID REFERENCES drugs(id),
    batch_id UUID REFERENCES inventory_batches(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions
CREATE TABLE prescriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prescription_number TEXT UNIQUE NOT NULL,
    patient_name TEXT NOT NULL,
    patient_age INTEGER,
    patient_weight DECIMAL(5,2), -- in kg
    doctor_name TEXT NOT NULL,
    diagnosis TEXT,
    status prescription_status DEFAULT 'pending',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescription items (drugs prescribed)
CREATE TABLE prescription_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
    drug_id UUID REFERENCES drugs(id),
    dosage TEXT NOT NULL, -- "1 tablet twice daily"
    frequency TEXT, -- BID, TID, QD, etc.
    duration INTEGER, -- number of days
    quantity_prescribed INTEGER NOT NULL,
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drug interactions safety rules
CREATE TABLE drug_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    drug_a_id UUID REFERENCES drugs(id) ON DELETE CASCADE,
    drug_b_id UUID REFERENCES drugs(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL, -- contraindication, caution, monitor
    severity TEXT NOT NULL, -- high, medium, low
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate interactions
    UNIQUE(drug_a_id, drug_b_id)
);

-- Dosage limits by patient characteristics
CREATE TABLE dosage_limits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    drug_id UUID REFERENCES drugs(id) ON DELETE CASCADE,
    patient_age_min INTEGER, -- minimum age in years (NULL = no minimum)
    patient_age_max INTEGER, -- maximum age in years (NULL = no maximum)
    patient_weight_min DECIMAL(5,2), -- minimum weight in kg (NULL = no minimum)
    patient_weight_max DECIMAL(5,2), -- maximum weight in kg (NULL = no maximum)
    max_dosage_per_day TEXT NOT NULL, -- "2 tablets" or "10ml"
    max_duration_days INTEGER, -- maximum treatment duration
    warning_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log for tracking changes
CREATE TABLE audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_inventory_batches_drug_id ON inventory_batches(drug_id);
CREATE INDEX idx_inventory_batches_expiry ON inventory_batches(expiry_date);
CREATE INDEX idx_inventory_batches_batch_number ON inventory_batches(batch_number);
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_sales_sale_number ON sales(sale_number);
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_drug_id ON sale_items(drug_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_prescriptions_created_at ON prescriptions(created_at);
CREATE INDEX idx_prescription_items_prescription_id ON prescription_items(prescription_id);
CREATE INDEX idx_drugs_name ON drugs(name);
CREATE INDEX idx_drugs_category ON drugs(category);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drugs_updated_at BEFORE UPDATE ON drugs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_batches_updated_at BEFORE UPDATE ON inventory_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate sale numbers
CREATE OR REPLACE FUNCTION generate_sale_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    date_prefix TEXT;
BEGIN
    date_prefix := TO_CHAR(NOW(), 'YYYYMMDD');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(sale_number FROM 9) AS INTEGER)), 0) + 1
    INTO next_number
    FROM sales
    WHERE sale_number LIKE date_prefix || '%';
    
    RETURN date_prefix || LPAD(next_number::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate prescription numbers
CREATE OR REPLACE FUNCTION generate_prescription_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    date_prefix TEXT;
BEGIN
    date_prefix := TO_CHAR(NOW(), 'YYYYMMDD');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(prescription_number FROM 9) AS INTEGER)), 0) + 1
    INTO next_number
    FROM prescriptions
    WHERE prescription_number LIKE date_prefix || '%';
    
    RETURN date_prefix || LPAD(next_number::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Auto-populate user data from auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'staff' -- default role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();