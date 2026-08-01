-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference VARCHAR(100) UNIQUE NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  service VARCHAR(255) NOT NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone VARCHAR(50) NOT NULL,
  patient_type VARCHAR(20) NOT NULL CHECK (patient_type IN ('new', 'existing')),
  urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('routine', 'urgent')),
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rescheduled', 'cancelled', 'completed', 'no_show')),
  google_calendar_event_id VARCHAR(255),
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_appointments_email ON appointments(email);
CREATE INDEX idx_appointments_phone ON appointments(phone);
CREATE INDEX idx_appointments_appointment_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_booking_reference ON appointments(booking_reference);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_patient_name ON appointments(patient_name);

-- Create unique constraint to prevent duplicate bookings
CREATE UNIQUE INDEX idx_unique_appointment_slot ON appointments(
  appointment_date,
  start_time,
  end_time
) WHERE status IN ('confirmed', 'pending');

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_users_email ON admin_users(email);

CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON admin_users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security) if using Supabase Auth
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Optional: Create policies (uncomment if using Supabase Auth)
-- CREATE POLICY "Allow anyone to read appointments"
--   ON appointments FOR SELECT
--   USING (true);

-- CREATE POLICY "Allow admin to update appointments"
--   ON appointments FOR UPDATE
--   USING (auth.role() = 'authenticated' AND email IN (SELECT email FROM admin_users));

-- CREATE POLICY "Allow admin to read admin_users"
--   ON admin_users FOR SELECT
--   USING (auth.role() = 'authenticated');
