-- Permission grants only. Create the register table with alembic upgrade head.
-- Safe to rerun before or after the Alembic migration. Role name: Operatore = operator.
START TRANSACTION;
INSERT INTO permissions (code, description) VALUES ('BHA', 'Visualizza attività sanitarie')
ON DUPLICATE KEY UPDATE code = code;
INSERT INTO permissions (code, description) VALUES ('CHA', 'Aggiungi attività sanitaria')
ON DUPLICATE KEY UPDATE code = code;
INSERT INTO permissions (code, description) VALUES ('EHA', 'Modifica attività sanitaria')
ON DUPLICATE KEY UPDATE code = code;
INSERT INTO permissions (code, description) VALUES ('DHA', 'Elimina attività sanitaria')
ON DUPLICATE KEY UPDATE code = code;

INSERT INTO user_role_permissions (role_id, permission_code)
SELECT r.id, p.code FROM user_roles r CROSS JOIN permissions p
WHERE r.name = 'operator' AND p.code IN ('BHA', 'CHA', 'EHA', 'DHA')
AND NOT EXISTS (
    SELECT 1 FROM user_role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_code = p.code
);
COMMIT;
