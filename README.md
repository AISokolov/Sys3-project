# SplitApp

SplitApp is an information system for sharing the cost of digital subscriptions between small groups of users such as friends, roommates, classmates, or family members.

The project was originally designed as a Systems III course project focused on making subscription sharing more transparent, organized, and affordable. The main idea is to reduce the manual work usually handled by one person in a group, such as tracking who participates, who paid, and how much each member owes.

## Problem Statement

Many popular services such as Netflix, Spotify, YouTube Premium, Microsoft 365, and similar platforms rely on recurring subscription payments. For students and other budget-conscious users, those monthly or yearly costs can become expensive. In practice, people often split those costs informally, but that creates avoidable friction:

- one person usually manages the whole subscription
- payment tracking is manual
- communication happens across chats and messages
- responsibilities are unclear
- group changes are hard to manage cleanly

SplitApp was proposed as a lightweight solution to make shared subscription management easier and fairer.

## Project Goals

- allow users to organize into groups
- create and manage shared subscription services
- split subscription costs between participating members
- keep payment information and payment status visible
- enforce access control based on group roles
- support future modular growth and backend integrations

## Core Features

Based on the report, the intended system includes the following functional areas:

### 1. User and Group Management

- registered users can create and manage groups
- users can join or leave groups
- each group has members and a group owner
- users can belong to multiple groups

### 2. Subscription Service Management

- create, edit, and delete shared subscription services
- store service name, total cost, billing period, start date, and optional description
- restrict management actions to users with sufficient permissions

### 3. Cost Splitting

- assign group members to a subscription
- split the total cost equally or by a custom distribution
- keep past records even if group membership changes later

### 4. Payment Tracking

- track whether members have paid their share
- store limited last-used payment card information for the owner
- provide visibility of payment status within the group

### 5. Notifications

- notify users about subscription creation or deletion
- remind users about billing dates or payment events
- notify users when group membership changes

### 6. Access Control

- only registered users can use the system
- user permissions depend on their role in a group
- users cannot access or edit data outside their scope

## Non-Functional Requirements

The report also defined several important non-functional requirements:

- performance: support at least 50 requests per second under normal load
- responsiveness: most page loads should complete within 1.5 seconds
- consistency: user and payment data should remain synchronized
- security: passwords must be hashed and access checks enforced
- economy: use open-source technologies such as Node.js and React
- maintainability: design the system so future upgrades are modular
- availability: target 24/7 access with 95% uptime
- compatibility: support both desktop and mobile browsers

## Data Model Overview

The report describes the following main entities:

- `user`
- `group`
- `payment_method`
- `subscription`
- `subscription_type_list`
- `notification`

These entities support the main flows of registration, group participation, subscription ownership, cost sharing, and payment/event tracking.

## Current Repository Status

This repository currently contains a frontend implementation of SplitApp built with:

- React
- Vite
- React Router

At the moment, the app is frontend-focused and uses local state for interaction flow. Backend integration can be added later.

Implemented UI flow in the current repository includes:

- landing page
- login modal
- subscriptions page
- add-service modal
- payment page
- profile page

## Getting Started

### Prerequisites

- Node.js
- npm

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Project Structure

```text
src/
  assets/
  components/
  context/
  pages/
  App.jsx
  main.jsx
public/
index.html
```

## Future Improvements

Possible next steps based on the report and current project direction:

- reconnect the frontend to a real backend API
- implement persistent authentication
- add group invitations and membership management
- support real payment tracking and reminders
- add role-based authorization on the server side
- implement notifications and billing-date workflows
- connect the logical and physical database design to production-ready APIs

## Author

Aleksandr Sokolov

## Academic Context

This project was developed as part of a Systems III course project focused on the design of an information system for sharing subscription costs across different services.
