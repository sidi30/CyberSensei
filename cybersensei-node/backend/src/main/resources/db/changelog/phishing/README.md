# Phishing Simulation Module - Database Migrations

## Overview

This directory contains Liquibase migrations for the Phishing & Social Engineering Simulation module.

## Tables

| Table | Description |
|-------|-------------|
| `phishing_templates` | Email templates with HTML/text content and tracked links |
| `phishing_campaigns` | Campaign configuration (targeting, scheduling, privacy) |
| `phishing_campaign_runs` | Individual execution records of campaigns |
| `phishing_recipients` | Recipients with unique tracking tokens |
| `phishing_events` | Tracking events (delivered, opened, clicked, reported) |
| `phishing_results_daily` | Aggregated daily statistics |
| `settings_smtp` | SMTP server configuration (encrypted credentials) |
| `settings_branding` | Company branding for email templates |
| `phishing_audit_logs` | Security audit trail |

## Applying Migrations

The migrations are automatically applied when the Spring Boot application starts if Liquibase is enabled.

### Manual Application

```bash
# Using Maven
mvn liquibase:update -Dliquibase.changeLogFile=db/changelog/phishing/db.changelog-phishing-master.xml

# Or using Liquibase CLI
liquibase --changelog-file=db/changelog/phishing/db.changelog-phishing-master.xml update
```

## Seed Data

The `010-seed-phishing-data.xml` migration includes:
- 3 phishing email templates (IT Password Reset, Fake Invoice, CEO Fraud)
- Default branding placeholders
- Example campaign in DRAFT status

## Indexes

Key indexes for performance:
- `phishing_events(token)` - Fast token lookup for tracking
- `phishing_events(campaign_id, event_at)` - Efficient date-range queries
- `phishing_recipients(token)` - Token validation
- `phishing_campaigns(status)` - Campaign status queries
- `phishing_results_daily(campaign_id, day)` - Reporting queries

