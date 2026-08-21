-- Migration 041: Add banner_text column to qr_codes
-- Phase QRBANNER — QR Code Label Banner
ALTER TABLE qr_codes
  ADD COLUMN IF NOT EXISTS banner_text text;
