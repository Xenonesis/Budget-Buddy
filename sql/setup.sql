/*
Budget Tracker Database Setup Guide

This file is a reference for setting up the Budget Tracker database.
Run the following SQL scripts in order:

1. setup-1-base.sql - Creates the base tables
2. setup-2-security.sql - Sets up row-level security
3. setup-3-functions.sql - Creates database functions
4. setup-transaction-fix.sql - Fixes transaction table issues
5. update-categories-schema.sql - Updates category schema
6. fix-income-transactions.sql - Fixes income transaction issues
7. update-timezone-schema.sql - Adds timezone support
8. create-recurring-transactions.sql - Adds recurring transactions

For income category setup, see INCOME_CATEGORIES_SETUP.md
*/ 