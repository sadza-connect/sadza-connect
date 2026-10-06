-- ===========================================================================
-- 0010_shipping_settings.sql
-- Adds shipping_settings JSONB column to company_settings for dynamic,
-- database-backed delivery calculation and office pickup configuration.
-- ===========================================================================

alter table if exists public.company_settings
  add column if not exists shipping_settings jsonb not null default '{
    "pickup": {
      "enabled": true,
      "name": "MATECH Kano Central Office & Warehouse",
      "address": "Opposite BUK New Campus, Along Gwarzo Road, Kano, Kano State, Nigeria",
      "phone": "080 9909 3452 · 080 6892 1997 · 070 6426 9353",
      "hours": "Mon - Fri: 8:00 AM - 5:30 PM, Sat: 9:00 AM - 2:00 PM",
      "instructions": "Bring your Order Reference ID and a valid identification for immediate collection and loading."
    },
    "zones": {
      "zone0": {
        "id": "zone0",
        "name": "Zone 0: Local Kano Delivery",
        "baseFee": 2500,
        "estDays": "Same-day / 24 Hours",
        "states": ["Kano"]
      },
      "zone1": {
        "id": "zone1",
        "name": "Zone 1: North-West & North-Central Close Proximity",
        "baseFee": 9000,
        "estDays": "1 - 2 Business Days",
        "states": ["Kaduna", "Katsina", "Jigawa", "Bauchi", "Plateau", "Niger"]
      },
      "zone2": {
        "id": "zone2",
        "name": "Zone 2: Federal Capital (Abuja) & Middle Belt",
        "baseFee": 12500,
        "estDays": "2 - 3 Business Days",
        "states": ["FCT - Abuja", "Nasarawa", "Benue", "Kwara", "Kogi"]
      },
      "zone3": {
        "id": "zone3",
        "name": "Zone 3: South-West Commercial Hubs",
        "baseFee": 18500,
        "estDays": "2 - 4 Business Days",
        "states": ["Lagos", "Ogun", "Oyo", "Osun", "Ondo", "Ekiti"]
      },
      "zone4": {
        "id": "zone4",
        "name": "Zone 4: South-East, South-South & Far Outlying",
        "baseFee": 22000,
        "estDays": "3 - 5 Business Days",
        "states": [
          "Rivers", "Delta", "Edo", "Anambra", "Enugu", "Imo", "Abia",
          "Akwa Ibom", "Cross River", "Bayelsa", "Borno", "Adamawa",
          "Taraba", "Sokoto", "Kebbi", "Zamfara", "Yobe", "Gombe", "Ebonyi"
        ]
      }
    },
    "heavySurcharges": {
      "solarPanel": {
        "perUnitFee": 1500,
        "freeUnitsIncluded": 2
      },
      "battery": {
        "perUnitFee": 3500,
        "freeUnitsIncluded": 1
      },
      "inverterSystem": {
        "perUnitFee": 3000,
        "freeUnitsIncluded": 1
      }
    }
  }'::jsonb;
