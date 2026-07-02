-- Migration 003: Add requires_service_hours to volunteers table
-- Project: thirtyninetyvolunteers
-- Prompt: 30BN-ADMIN.4

ALTER TABLE public.volunteers
ADD COLUMN requires_service_hours
  boolean NOT NULL DEFAULT false;
