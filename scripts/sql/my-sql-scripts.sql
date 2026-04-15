SELECT * FROM "public"."User" LIMIT 100;

UPDATE "public"."User" 
SET "emailVerified" = '2026-04-15 12:00:00' 
WHERE "id" = 'cmo082d9l0000vka41ko2fl42';

UPDATE "public"."UserRole" 
SET "roleId" = 'cmo0bc6od000mvkr8epm9y1zl' 
WHERE "userId" = 'cmo082d9l0000vka41ko2fl42';
