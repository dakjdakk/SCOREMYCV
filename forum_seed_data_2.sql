-- ─── NEW FORUM QUESTIONS — JULY 2026 ─────────────────────────────────────
-- Paste into Supabase SQL Editor and Run

INSERT INTO forum_questions (username, question, created_at) VALUES
('tamil_sql',      'NULL value and empty string are same? i checked WHERE name = NULL and it returned nothing.. but there are null values in table. what is wrong?',                                                            '2026-07-01 10:22:00+00'),
('deepak_bi',      'COALESCE and ISNULL both replace null right? which one should i use and is there any difference between them?',                                                                                          '2026-07-03 09:05:00+00'),
('shruti_dev',     'primary key and unique key both dont allow duplicates.. then why do we need both? what is the real difference?',                                                                                         '2026-07-04 14:38:00+00'),
('nikhil_data',    'my query is very slow on a table with 2 lakh rows.. someone told me to add index. what is index exactly and how do i add it?',                                                                           '2026-07-06 11:17:00+00'),
('kavitha_sql',    'BETWEEN 10 AND 20 -- does this include 10 and 20 also or only values in between? getting confused because results are different from what i expected',                                                   '2026-07-08 16:44:00+00'),
('arjun_analyst',  'what is difference between CHAR(10) and VARCHAR(10)? both store 10 characters only right? why two data types for same thing',                                                                           '2026-07-09 08:30:00+00'),
('lakshmi_tech',   'what is a VIEW in sql? is it like a table? can we insert update data into a view? asked in interview and i said its like a virtual table but not sure if that is correct',                              '2026-07-11 13:55:00+00'),
('vishal_sql',     'CASE WHEN -- i understand simple if else but how to use it inside SELECT to create a new column based on conditions? can someone show with example',                                                     '2026-07-14 10:08:00+00'),
('bindhu_data',    'LAG and LEAD functions -- what do they do? saw it in day 22 but still confused. when would someone actually use these in real job?',                                                                    '2026-07-16 15:22:00+00'),
('ravi_analyst',   'how to write query to get employees who joined in last 30 days? i tried WHERE hire_date = LAST 30 DAYS but obviously that didnt work lol.. what is correct way?',                                     '2026-07-19 09:47:00+00');

-- ─── ANSWERS ──────────────────────────────────────────────────────────────

DO $$
DECLARE
  q1 UUID; q2 UUID; q3 UUID; q4 UUID; q5 UUID;
  q6 UUID; q7 UUID; q8 UUID; q9 UUID; q10 UUID;
BEGIN

SELECT id INTO q1  FROM forum_questions WHERE username='tamil_sql'     AND created_at='2026-07-01 10:22:00+00' LIMIT 1;
SELECT id INTO q2  FROM forum_questions WHERE username='deepak_bi'     AND created_at='2026-07-03 09:05:00+00' LIMIT 1;
SELECT id INTO q3  FROM forum_questions WHERE username='shruti_dev'    AND created_at='2026-07-04 14:38:00+00' LIMIT 1;
SELECT id INTO q4  FROM forum_questions WHERE username='nikhil_data'   AND created_at='2026-07-06 11:17:00+00' LIMIT 1;
SELECT id INTO q5  FROM forum_questions WHERE username='kavitha_sql'   AND created_at='2026-07-08 16:44:00+00' LIMIT 1;
SELECT id INTO q6  FROM forum_questions WHERE username='arjun_analyst' AND created_at='2026-07-09 08:30:00+00' LIMIT 1;
SELECT id INTO q7  FROM forum_questions WHERE username='lakshmi_tech'  AND created_at='2026-07-11 13:55:00+00' LIMIT 1;
SELECT id INTO q8  FROM forum_questions WHERE username='vishal_sql'    AND created_at='2026-07-14 10:08:00+00' LIMIT 1;
SELECT id INTO q9  FROM forum_questions WHERE username='bindhu_data'   AND created_at='2026-07-16 15:22:00+00' LIMIT 1;
SELECT id INTO q10 FROM forum_questions WHERE username='ravi_analyst'  AND created_at='2026-07-19 09:47:00+00' LIMIT 1;

INSERT INTO forum_answers (question_id, answer, created_at) VALUES

(q1,
'NULL is not same as empty string — this is a very important concept!

NULL means "value is unknown or missing". Empty string means the field exists but has no characters.

The problem with WHERE name = NULL is that NULL cannot be compared using = sign. It always returns false, even NULL = NULL is false in SQL.

Correct way to check NULL:
WHERE name IS NULL      -- finds NULL values
WHERE name IS NOT NULL  -- finds non-NULL values

Wrong way (never use):
WHERE name = NULL       -- always returns nothing!

To check empty string:
WHERE name = ''''

To check both NULL and empty:
WHERE name IS NULL OR name = ''''

Always use IS NULL or IS NOT NULL when dealing with NULL values.',
'2026-07-01 11:00:00+00'),

(q2,
'Both replace NULL but there are key differences:

ISNULL(value, replacement) — SQL Server only, takes exactly 2 arguments.
ISNULL(salary, 0)  -- if salary is NULL, return 0

COALESCE(val1, val2, val3...) — works in all databases (MySQL, PostgreSQL, SQL Server), takes multiple arguments and returns first non-NULL value.
COALESCE(salary, bonus, 0)  -- returns salary if not null, else bonus if not null, else 0

Recommendation: always use COALESCE — it works everywhere and is more flexible. If you are writing queries that may run on different databases, COALESCE is the safe choice.

COALESCE is also used in interviews more often.',
'2026-07-03 09:50:00+00'),

(q3,
'Good question — they look similar but have real differences:

PRIMARY KEY:
- Only ONE primary key per table
- Cannot be NULL
- Uniquely identifies each row
- Automatically creates a clustered index

UNIQUE KEY:
- Can have MULTIPLE unique keys in same table
- Can allow one NULL value (in most databases)
- Ensures no duplicates but is not the main identifier
- Creates a non-clustered index

Example:
CREATE TABLE employees (
  emp_id INT PRIMARY KEY,           -- main identifier, not null, one only
  email VARCHAR(100) UNIQUE,        -- unique but not primary
  pan_number VARCHAR(10) UNIQUE     -- can have multiple unique keys
);

Think of primary key as the "official ID" of the row. Unique key is like an alternate ID — still unique, but not the main one.',
'2026-07-04 15:20:00+00'),

(q4,
'Index is like a book index at the back — instead of reading every page to find a topic, you go to the index and jump directly to the right page.

Without index: SQL scans ALL 2 lakh rows one by one to find matches (called full table scan). Slow!
With index: SQL jumps directly to matching rows. Much faster.

How to create:
CREATE INDEX idx_employee_dept ON employees(department);

Now any query filtering by department will be fast:
SELECT * FROM employees WHERE department = ''HR'';

When to add index:
- Columns used in WHERE clause frequently
- Columns used in JOIN conditions
- Columns used in ORDER BY

When NOT to add index:
- Columns you rarely filter on
- Small tables (full scan is fine)
- Columns with very few unique values (like is_active — only true/false)

Too many indexes also slows down INSERT and UPDATE, so add only where needed.',
'2026-07-06 12:00:00+00'),

(q5,
'BETWEEN is inclusive on both ends — it includes 10 and 20 both.

WHERE salary BETWEEN 10000 AND 20000
-- same as: WHERE salary >= 10000 AND salary <= 20000

So if your result had 10 and 20 included, that is correct behavior!

Common confusion with dates:
WHERE order_date BETWEEN ''2025-01-01'' AND ''2025-01-31''

For dates with time, this may miss records on Jan 31 after midnight. Safer to write:
WHERE order_date >= ''2025-01-01'' AND order_date < ''2025-02-01''

For numeric values, BETWEEN is perfectly fine to use.',
'2026-07-08 17:15:00+00'),

(q6,
'Looks similar but storage is completely different:

CHAR(10) — fixed length. Always stores exactly 10 characters, even if you store only 3 characters. Pads with spaces.
VARCHAR(10) — variable length. Stores only as many characters as you actually enter, up to 10 max.

Example:
CHAR(10) storing "Hi" → stores "Hi        " (8 spaces added) — always 10 bytes used
VARCHAR(10) storing "Hi" → stores "Hi" — only 2 bytes used

When to use which:
CHAR — when length is always fixed. Example: PAN number (always 10 chars), state code (always 2 chars), gender (M/F).
VARCHAR — when length varies. Example: name, email, address, description.

Using CHAR for variable data wastes storage. Using VARCHAR for fixed data is fine but CHAR is slightly faster for fixed-length lookups.',
'2026-07-09 09:10:00+00'),

(q7,
'Your answer was correct — VIEW is a virtual table!

A VIEW is a saved SELECT query that you can use like a table:
CREATE VIEW active_employees AS
SELECT emp_id, name, department, salary
FROM employees
WHERE is_active = 1;

-- Now use it like a table:
SELECT * FROM active_employees WHERE department = ''HR'';

Benefits:
- Simplifies complex queries — write once, reuse everywhere
- Security — hide sensitive columns (like salary) from certain users
- Always shows latest data — it runs the underlying query each time

Can you INSERT or UPDATE through a view?
Sometimes yes, but only for simple views (single table, no GROUP BY, no DISTINCT, no calculated columns). For complex views, usually no.

For interviews: "A VIEW is a virtual table based on a stored SELECT query. It does not store data itself, just the query definition."',
'2026-07-11 14:30:00+00'),

(q8,
'CASE WHEN works like if-else inside your SELECT. Here is a full example:

SELECT
  name,
  salary,
  CASE
    WHEN salary >= 80000 THEN ''Senior''
    WHEN salary >= 50000 THEN ''Mid-Level''
    WHEN salary >= 30000 THEN ''Junior''
    ELSE ''Intern''
  END AS salary_band
FROM employees;

This creates a new column called salary_band based on salary value.

Another common use — replace values:
SELECT
  name,
  CASE is_active
    WHEN 1 THEN ''Active''
    WHEN 0 THEN ''Inactive''
    ELSE ''Unknown''
  END AS status
FROM employees;

You can also use CASE inside ORDER BY, GROUP BY, and even inside aggregate functions:
SELECT COUNT(CASE WHEN is_active = 1 THEN 1 END) AS active_count FROM employees;

Very commonly asked in interviews — practice this!',
'2026-07-14 10:55:00+00'),

(q9,
'LAG and LEAD let you look at previous or next row values without doing a self-join.

LAG — gets value from previous row
LEAD — gets value from next row

Real use case — compare each month revenue with previous month:
SELECT
  month,
  revenue,
  LAG(revenue) OVER (ORDER BY month) AS prev_month_revenue,
  revenue - LAG(revenue) OVER (ORDER BY month) AS growth
FROM monthly_sales;

Another use — find employees hired after previous employee:
SELECT
  name,
  hire_date,
  LAG(hire_date) OVER (ORDER BY hire_date) AS prev_hire_date
FROM employees;

In real jobs LAG and LEAD are used in:
- Sales trend analysis (compare this month vs last month)
- Stock price movement (today vs yesterday)
- Detecting consecutive logins or streaks

Very common in analytics interviews at Amazon, Flipkart, Swiggy type companies.',
'2026-07-16 16:00:00+00'),

(q10,
'Haha the query attempt was creative! Here is the correct way using date functions:

-- MySQL / Most databases:
SELECT * FROM employees
WHERE hire_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);

-- PostgreSQL:
SELECT * FROM employees
WHERE hire_date >= CURRENT_DATE - INTERVAL ''30 days'';

-- SQL Server:
SELECT * FROM employees
WHERE hire_date >= DATEADD(DAY, -30, GETDATE());

-- SQLite (used in this course):
SELECT * FROM employees
WHERE hire_date >= DATE(''now'', ''-30 days'');

The logic is always same — get current date, subtract 30 days, filter hire_date that is greater than or equal to that.

For interviews, just explain the logic: "I would get today''s date, subtract 30 days, and filter hire_date >= that calculated date." Then write whichever syntax the interviewer''s DB uses.',
'2026-07-19 10:30:00+00');

END $$;
