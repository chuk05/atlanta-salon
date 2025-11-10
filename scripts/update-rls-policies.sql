-- scripts/update-rls-policies.sql
-- Date: 2024-01-01
-- Purpose: Fix RLS policies for staff creation and admin access

-- Drop existing staff policies
DROP POLICY IF EXISTS "Admins can manage staff" ON staff;
DROP POLICY IF EXISTS "Anyone can view active staff" ON staff;
DROP POLICY IF EXISTS "Staff can view own profile" ON staff;

-- Drop existing profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view staff profiles" ON profiles;

-- Create new staff policies
CREATE POLICY "Anyone can view active staff" ON staff
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage staff" ON staff
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Staff can view own profile" ON staff
  FOR SELECT USING (user_id = auth.uid());

-- Create new profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Verify the changes
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('staff', 'profiles')
ORDER BY tablename, policyname;