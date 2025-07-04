/*
  # Create analysis history table

  1. New Tables
    - `analysis_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `type` (text, either 'email' or 'url')
      - `input` (text, the email or URL analyzed)
      - `result` (jsonb, the analysis result)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `analysis_history` table
    - Add policy for users to read/write their own analysis history
*/

CREATE TABLE IF NOT EXISTS analysis_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('email', 'url')),
  input text NOT NULL,
  result jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own analysis history"
  ON analysis_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analysis history"
  ON analysis_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analysis history"
  ON analysis_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analysis history"
  ON analysis_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS analysis_history_user_id_idx ON analysis_history(user_id);
CREATE INDEX IF NOT EXISTS analysis_history_created_at_idx ON analysis_history(created_at DESC);