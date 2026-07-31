# InstaPlus Stock Management System

## Overview

The InstaPlus Stock Management System is a web based enterprise application designed to manage inventory, stock requests, approvals, and reporting within an organizational environment.

It enables efficient tracking of stock levels, approval of stock requests, and monitoring of stock movements across different departments. The system improves transparency, reduces manual errors, and supports real time decision making in stock operations.

   

## Key Features

### 📦 Inventory Management

  Add, update, and manage product inventory
  
  Track available stock in real time
  
  Categorize stock items

### 📤 Stock Request & Approval Workflow

  Users can request stock items
  
  Admins can approve or reject requests
  
  Full approval history tracking

### 📊 Stock Tracking

  Monitor stock in (restocking / procurement)
  
  Monitor stock out (usage / distribution)
  
  Automatic stock balance updates

### 📈 Reporting & Analytics

  Stock movement reports
  
  Inventory status reports
  
  Approval history reports
  
  Downloadable reports (PDF/Excel if implemented)

### 👤 User Management

  Role based access control (Manager / Storekeeper /Admin)
  
  Secure authentication system
  
  Activity tracking

   

## Technologies Used

### Frontend

  Angular
  
  TypeScript
  
  HTML5
  
  CSS3

### Backend

  Spring Boot
  
  Java 21
  
  RESTful APIs

### Database

  MySQL

### Tools

  Git & GitHub
  
  Maven
  
  Postman

   

## System Architecture

The system follows a layered architecture:

  **Frontend (Angular):** User interface for stock requests and dashboards
  
  **Backend (Spring Boot):** Business logic, stock processing, and approvals
  
  **Database (MySQL):** Stores inventory, users, and transactions

  ## CI/CD Pipeline (GitHub Actions)

This project implements a CI/CD workflow using **GitHub Actions** to automate documentation deployment.

A workflow file is defined in:

gh-pages branch

.github/workflows/deploy-docs.yml


## Live Demo
https://youtu.be/UdebeXrJ5SU
