-- ─── SEED FORUM QUESTIONS ─────────────────────────────────────────────────
-- Paste this entire block into Supabase SQL Editor and click Run

INSERT INTO forum_questions (username, question, created_at) VALUES
('rahul_dev',      'sir where and having both filter the data only right? then why two different clause? i tried using where with count() it gave error.. not understanding properly',                                                '2025-05-12 09:14:00+00'),
('priya_analyst',  'can anyone explain left join and inner join.. i know the definition but when i write actual query i get confused which one to use. is there any simple way to remember?',                                     '2025-05-18 11:42:00+00'),
('amit_sharma99',  'dense_rank and rank both giving rank only na? i ran same query with both and got different numbers for same salary people.. which one should i use in interview?',                                           '2025-05-25 14:07:00+00'),
('neha_sql',       'how to get second highest salary? i did SELECT MAX(salary) WHERE salary != MAX(salary) but it showed error. please help',                                                                                    '2025-06-02 10:33:00+00'),
('karan_tech',     'what is CTE exactly? in day 17 it says use WITH keyword.. is it same as subquery only or something different? which one is better for interview?',                                                          '2025-06-10 16:55:00+00'),
('divya_data',     'getting this error -- column must appear in GROUP BY clause or aggregate function. i added the column in select and now this error is coming. what i am doing wrong?',                                      '2025-06-17 08:22:00+00'),
('suresh_bi',      'delete truncate drop -- all 3 remove data only right? what is actual difference? interviewer asked this i said all remove data he said wrong lol',                                                         '2025-06-24 13:48:00+00'),
('ananya_m',       'window function syntax is very confusing for me.. ROW_NUMBER() OVER (PARTITION BY.. ORDER BY..) -- what is partition by doing here exactly? can someone explain with example',                              '2025-07-03 09:10:00+00'),
('vijay_sql',      'EXISTS vs IN -- when to use which? my interviewer asked this in last round i said both are same only he was not satisfied. is there performance difference also?',                                          '2025-07-11 15:30:00+00'),
('pooja_dev',      'normalization 1NF 2NF 3NF i am reading the definitions but not getting it practically.. if someone can give one real example it will be very helpful. getting confused between 2NF and 3NF mainly',        '2025-07-18 11:05:00+00'),
('rohit_analyst',  'how to find duplicate rows? i have employee table where same name and department is repeated multiple times.. i want to see which ones are duplicate. is there any direct way?',                           '2025-07-25 10:17:00+00'),
('sana_sql',       'union and union all difference i know union removes duplicate.. but in what case should i use union all? and is union all faster? asking because query was slow in my project',                             '2025-08-01 14:44:00+00'),
('arun_data',      'i have orders table with date and amount.. i want to show running total of sales day by day.. tried SUM but it gives total of everything not running.. which function to use?',                            '2025-08-08 09:58:00+00'),
('meena_tech',     'can we use alias in where clause? i gave alias name in SELECT and then used same alias in WHERE.. it gave error column does not exist.. why this is happening?',                                           '2025-08-15 12:20:00+00');

-- ─── SEED ADMIN ANSWERS ────────────────────────────────────────────────────

DO $$
DECLARE
  q1 UUID; q2 UUID; q3 UUID; q4 UUID; q5 UUID; q6 UUID; q7 UUID;
  q8 UUID; q9 UUID; q10 UUID; q11 UUID; q12 UUID; q13 UUID; q14 UUID;
BEGIN

SELECT id INTO q1 FROM forum_questions WHERE username='rahul_dev'      AND created_at='2025-05-12 09:14:00+00' LIMIT 1;
SELECT id INTO q2 FROM forum_questions WHERE username='priya_analyst'  AND created_at='2025-05-18 11:42:00+00' LIMIT 1;
SELECT id INTO q3 FROM forum_questions WHERE username='amit_sharma99'  AND created_at='2025-05-25 14:07:00+00' LIMIT 1;
SELECT id INTO q4 FROM forum_questions WHERE username='neha_sql'       AND created_at='2025-06-02 10:33:00+00' LIMIT 1;
SELECT id INTO q5 FROM forum_questions WHERE username='karan_tech'     AND created_at='2025-06-10 16:55:00+00' LIMIT 1;
SELECT id INTO q6 FROM forum_questions WHERE username='divya_data'     AND created_at='2025-06-17 08:22:00+00' LIMIT 1;
SELECT id INTO q7 FROM forum_questions WHERE username='suresh_bi'      AND created_at='2025-06-24 13:48:00+00' LIMIT 1;
SELECT id INTO q8 FROM forum_questions WHERE username='ananya_m'       AND created_at='2025-07-03 09:10:00+00' LIMIT 1;
SELECT id INTO q9 FROM forum_questions WHERE username='vijay_sql'      AND created_at='2025-07-11 15:30:00+00' LIMIT 1;
SELECT id INTO q10 FROM forum_questions WHERE username='pooja_dev'     AND created_at='2025-07-18 11:05:00+00' LIMIT 1;
SELECT id INTO q11 FROM forum_questions WHERE username='rohit_analyst' AND created_at='2025-07-25 10:17:00+00' LIMIT 1;
SELECT id INTO q12 FROM forum_questions WHERE username='sana_sql'      AND created_at='2025-08-01 14:44:00+00' LIMIT 1;
SELECT id INTO q13 FROM forum_questions WHERE username='arun_data'     AND created_at='2025-08-08 09:58:00+00' LIMIT 1;
SELECT id INTO q14 FROM forum_questions WHERE username='meena_tech'    AND created_at='2025-08-15 12:20:00+00' LIMIT 1;

INSERT INTO forum_answers (question_id, answer, created_at) VALUES
(q1,
'Good question Rahul! Yes both filter data but at different stages — that is the key point.

WHERE filters rows BEFORE grouping happens.
HAVING filters groups AFTER GROUP BY is applied.

That is why WHERE salary > 30000 works fine, but WHERE COUNT(*) > 5 gives error — because COUNT() runs after grouping, so WHERE does not know about it yet.

Example:
SELECT department, COUNT(*) as emp_count
FROM employees
WHERE salary > 30000        -- step 1: remove low salary rows
GROUP BY department
HAVING COUNT(*) > 5;        -- step 2: keep only big departments

Simple rule: if you are filtering on COUNT, SUM, AVG — use HAVING. Everything else use WHERE.',
'2025-05-12 10:00:00+00'),

(q2,
'Yes Priya, here is the easiest way to remember it:

INNER JOIN — only matching rows from both tables. Like a Venn diagram middle portion only.
LEFT JOIN — all rows from left table + matching from right. If no match, right side shows NULL.

Example:
-- INNER JOIN: employees who have a department assigned
SELECT e.name, d.dept_name
FROM employees e
INNER JOIN departments d ON e.dept_id = d.id;

-- LEFT JOIN: ALL employees even if dept not assigned yet
SELECT e.name, d.dept_name
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id;

Memory trick: LEFT JOIN = "left table is boss, show everyone from left side no matter what"

Use LEFT JOIN when you want to keep all records from main table regardless of match.',
'2025-05-18 12:30:00+00'),

(q3,
'Both give rank but handle ties differently — this is a very common interview question Amit!

RANK() — skips numbers after a tie.
DENSE_RANK() — never skips, always consecutive.

Example with tied salaries:
Name    Salary   RANK   DENSE_RANK
Alice   90000      1        1
Bob     80000      2        2
Carol   80000      2        2
Dave    70000      4        3   <-- RANK jumps to 4, DENSE_RANK goes to 3

For interview questions like "find Nth highest salary" — always use DENSE_RANK. Because with RANK, rank number 3 might not exist if there is a tie at 2.',
'2025-05-25 15:00:00+00'),

(q4,
'Neha the syntax you tried will not work because you cannot use MAX() inside WHERE like that. Here are the correct ways:

Method 1 — DENSE_RANK (best for interviews):
SELECT salary FROM (
  SELECT salary,
    DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM employees
) t WHERE rnk = 2;

Method 2 — Subquery (simple and clean):
SELECT MAX(salary) FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);

Method 2 is easiest to understand. Method 1 is more flexible — you can change the 2 to any number to get Nth highest. Use Method 1 in interviews, it shows you know window functions!',
'2025-06-02 11:15:00+00'),

(q5,
'Karan, CTE and subquery give same result mostly but CTE is much cleaner to read and write.

CTE uses WITH keyword and gives the subquery a name:

-- Without CTE (hard to read):
SELECT * FROM (
  SELECT dept, AVG(salary) avg_sal FROM employees GROUP BY dept
) t WHERE avg_sal > 60000;

-- Same with CTE (easy to read):
WITH dept_avg AS (
  SELECT department, AVG(salary) AS avg_sal
  FROM employees GROUP BY department
)
SELECT * FROM dept_avg WHERE avg_sal > 60000;

Performance is similar in most cases. But in interviews always prefer CTE — it shows good coding style. Also if you need to use same subquery more than once in a query, CTE is much better because you write it only once.',
'2025-06-10 17:40:00+00'),

(q6,
'Divya this error is very common! The rule is —

Every column in SELECT must either be in GROUP BY, or inside an aggregate function (COUNT, SUM, MAX etc).

Your query is probably something like:
SELECT department, name, COUNT(*)  -- "name" is causing the problem
FROM employees
GROUP BY department;

SQL is confused — when you group by department, one department has many employees. Which employee name should it show? It does not know, so it gives error.

Fix:
Option 1 — add name to GROUP BY: GROUP BY department, name
Option 2 — remove name from SELECT
Option 3 — use MAX(name) if you just want any one name

Check your SELECT and make sure every column is either in GROUP BY or wrapped in aggregate.',
'2025-06-17 09:00:00+00'),

(q7,
'Haha Suresh your interviewer was right! They look similar but are very different:

DELETE — removes specific rows, can use WHERE condition, can be rolled back.
DELETE FROM employees WHERE id = 5;

TRUNCATE — removes ALL rows at once, no WHERE allowed, much faster than DELETE, cannot be rolled back.
TRUNCATE TABLE employees;

DROP — removes the entire table itself. Table is gone completely including structure.
DROP TABLE employees;

Easy way to remember:
DELETE = remove some pages from a notebook
TRUNCATE = erase all pages but keep the notebook
DROP = throw the entire notebook in dustbin

In interviews they also ask: which is faster? TRUNCATE is fastest because it does not log individual row deletions.',
'2025-06-24 14:30:00+00'),

(q8,
'Ananya window functions can look scary but once you understand the parts it becomes easy!

ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC)

Breaking it down:
- ROW_NUMBER() — assigns 1, 2, 3... to each row
- PARTITION BY department — restart the count for each department separately
- ORDER BY salary DESC — assign numbers from highest salary first

Full example:
SELECT name, department, salary,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS row_num
FROM employees;

This gives each employee a rank within their own department. Employee with row_num = 1 is the highest paid in that department.

Think of PARTITION BY like GROUP BY — but instead of collapsing rows, it just creates invisible groups for the window function to operate within.',
'2025-07-03 10:00:00+00'),

(q9,
'Vijay your interviewer wanted this answer — they are NOT the same!

EXISTS — checks if at least one row exists in subquery, stops immediately when found (short circuit). Better for large data.
SELECT * FROM employees e
WHERE EXISTS (SELECT 1 FROM departments d WHERE d.id = e.dept_id AND d.active = 1);

IN — fetches entire subquery result first, then compares. Slower if subquery returns many rows.
SELECT * FROM employees WHERE dept_id IN (SELECT id FROM departments WHERE active = 1);

Key difference also — IN does not handle NULL properly. If subquery returns even one NULL, IN can give wrong results. EXISTS handles NULLs safely.

So tell interviewer: "EXISTS is preferred when subquery result is large and for correlated subqueries. IN is fine for small fixed lists." That answer will satisfy them!',
'2025-07-11 16:15:00+00'),

(q10,
'Pooja let me explain with one simple real example — a student records table.

BEFORE normalization (bad design):
StudentID | Name  | Subject  | Subject2 | TeacherName | TeacherPhone
1         | Rahul | Math     | Science  | Mr. Kumar   | 9876543210

Problems: repeating data, if Mr. Kumar changes phone you update 100 rows.

1NF — no repeating columns, each cell has one value only:
StudentID | Name  | Subject
1         | Rahul | Math
1         | Rahul | Science

2NF — remove partial dependency. TeacherName depends on Subject, not on StudentID. So create separate Subjects table with TeacherID.

3NF — remove transitive dependency. TeacherPhone depends on TeacherName, not on SubjectID. So TeacherPhone should be in Teachers table only.

Simple rule: 2NF removes columns that depend on PART of the key. 3NF removes columns that depend on another non-key column.',
'2025-07-18 12:00:00+00'),

(q11,
'Rohit here are two methods:

Method 1 — GROUP BY with HAVING (shows which combinations are duplicate):
SELECT name, department, COUNT(*) AS duplicate_count
FROM employees
GROUP BY name, department
HAVING COUNT(*) > 1;

Method 2 — ROW_NUMBER (shows actual duplicate rows):
SELECT * FROM (
  SELECT *,
    ROW_NUMBER() OVER (PARTITION BY name, department ORDER BY id) AS rn
  FROM employees
) t WHERE rn > 1;

Method 1 tells you which name+department combo is repeated and how many times.
Method 2 shows you the actual extra rows (first occurrence is kept, rest are flagged as duplicate).

If you want to delete duplicates later, use Method 2 — just change SELECT * to DELETE WHERE rn > 1.',
'2025-07-25 11:00:00+00'),

(q12,
'Good question Sana! Yes UNION ALL is faster and here is why:

UNION — combines results of two queries and removes duplicates (like doing DISTINCT). Extra step = slower.
UNION ALL — combines results and keeps everything including duplicates. No extra step = faster.

SELECT name FROM employees_india
UNION
SELECT name FROM employees_us;
-- removes duplicate names across both tables

SELECT name FROM employees_india
UNION ALL
SELECT name FROM employees_us;
-- keeps all names even if same name appears in both tables

For your slow query — if you know the two result sets do not overlap, always use UNION ALL. No reason to pay the cost of duplicate removal if there are no duplicates anyway.',
'2025-08-01 15:30:00+00'),

(q13,
'Arun you need SUM() as a window function with ORDER BY inside OVER() — that is what makes it running/cumulative:

SELECT
  order_date,
  amount,
  SUM(amount) OVER (ORDER BY order_date) AS running_total
FROM orders;

The ORDER BY inside OVER() tells SQL to add up amounts in date order, accumulating as it goes.

Without ORDER BY it just gives grand total for every row — which is what you were seeing!

If you want running total per customer separately:
SELECT
  customer_id,
  order_date,
  amount,
  SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS running_total
FROM orders;

PARTITION BY customer_id resets the running total for each customer.',
'2025-08-08 10:45:00+00'),

(q14,
'Meena this is a very common confusion! The reason is SQL execution order.

SQL does not run top to bottom. The actual order is:
FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY

WHERE runs before SELECT — so when WHERE is checking conditions, your alias does not exist yet!

This will fail:
SELECT salary * 1.1 AS new_salary
FROM employees
WHERE new_salary > 60000;  -- Error! new_salary not defined yet at WHERE stage

Fix option 1 — just repeat the expression in WHERE:
WHERE salary * 1.1 > 60000;

Fix option 2 — wrap in CTE or subquery:
WITH calc AS (
  SELECT salary * 1.1 AS new_salary FROM employees
)
SELECT * FROM calc WHERE new_salary > 60000;

Note: alias DOES work in ORDER BY because ORDER BY runs after SELECT. So ORDER BY new_salary will work fine.',
'2025-08-15 13:00:00+00');

END $$;
