-- Migration 012: form_response_values.field_id CASCADE (30BN-ADMIN.17)
-- Changes the FK behavior on form_response_values.field_id from NO ACTION to
-- CASCADE. Consequence: deleting a form_fields row now cascade-deletes all
-- form_response_values rows that reference it. This is intentional — response
-- values for a deleted field are orphaned and meaningless.

ALTER TABLE form_response_values
DROP CONSTRAINT form_response_values_field_id_fkey;

ALTER TABLE form_response_values
ADD CONSTRAINT form_response_values_field_id_fkey
FOREIGN KEY (field_id)
REFERENCES form_fields(id)
ON DELETE CASCADE;
