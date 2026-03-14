// Already added in init.js: status field

ALTER TABLE trips ADD COLUMN status TEXT DEFAULT 'completed';

