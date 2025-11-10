-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view staff profiles" ON profiles
  FOR SELECT USING (role IN ('staff', 'admin'));

-- Services policies (public read, admin write)
CREATE POLICY "Anyone can view active services" ON services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage services" ON services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Staff policies (public read, admin write)
CREATE POLICY "Anyone can view active staff" ON staff
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage staff" ON staff
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Staff can view own profile" ON staff
  FOR SELECT USING (user_id = auth.uid());

-- Staff services policies
CREATE POLICY "Anyone can view staff services" ON staff_services
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage staff services" ON staff_services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Working hours policies
CREATE POLICY "Anyone can view working hours" ON working_hours
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage working hours" ON working_hours
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Appointments policies
CREATE POLICY "Customers can view own appointments" ON appointments
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Customers can create appointments" ON appointments
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Staff can view their appointments" ON appointments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM staff WHERE staff.id = appointments.staff_id AND staff.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all appointments" ON appointments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );