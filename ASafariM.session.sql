-- Clear stale Google Photos connections (wrong scopes + encrypted with old key).
-- Re-run the OAuth flow in Vionto after this to get a fresh token.
DELETE FROM "public"."GooglePhotosConnection";
