-- Create enum for challenge status
CREATE TYPE challenge_status AS ENUM ('Active', 'Upcoming', 'Completed');

-- Create enum for challenge difficulty
CREATE TYPE challenge_difficulty AS ENUM ('Beginner', 'Intermediate', 'Advanced', 'Expert');

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  deadline timestamptz NOT NULL,
  prize_money integer NOT NULL,
  difficulty challenge_difficulty NOT NULL,
  tags text[] DEFAULT ARRAY[]::text[],
  participants_count integer DEFAULT 0,
  status challenge_status DEFAULT 'Upcoming',
  requirements text[] DEFAULT ARRAY[]::text[],
  evaluation_criteria jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Policies for challenges
CREATE POLICY "Companies can create challenges"
  ON challenges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = company_id AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'company'
  ));

CREATE POLICY "Companies can update their own challenges"
  ON challenges
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = company_id)
  WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Companies can view their own challenges"
  ON challenges
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = company_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'individual'
    )
  );

CREATE POLICY "Companies can delete their own challenges"
  ON challenges
  FOR DELETE
  TO authenticated
  USING (auth.uid() = company_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_challenges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE
  ON challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_challenges_updated_at();

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  repo_url text NOT NULL,
  deck_url text,
  video_url text,
  score integer,
  feedback text,
  status text DEFAULT 'Submitted',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Enable RLS for submissions
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Policies for submissions
CREATE POLICY "Users can create their own submissions"
  ON submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own submissions"
  ON submissions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM challenges
      WHERE challenges.id = challenge_id
      AND challenges.company_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own submissions"
  ON submissions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for submissions updated_at
CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE
  ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_challenges_updated_at();