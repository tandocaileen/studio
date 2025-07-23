# App Name: LTO Portal

## Core Features:

### User Roles & Authentication
- **Three distinct user roles**: Store Supervisor, Liaison, and Cashier.
- A login page allows users to select their role for a simulated sign-in experience.
- **Role-Based Access Control (RBAC)**: The application uses a `ProtectedPage` component to restrict access to pages and features based on the logged-in user's role. The sidebar navigation is also dynamically generated based on user permissions.

### Store Supervisor Workflow
- **Dashboard**: The main view displays a comprehensive table of all motorcycles.
- **Motorcycle Management**:
  - Ability to add new motorcycle records, including detailed information like plate number, customer name, make, model, fees, and assigned liaison.
  - Can edit existing motorcycle details and manage their associated documents.
- **User Management**:
  - A dedicated page to manage liaison personnel.
  - Features a table displaying all liaisons with their assigned branch and default processing/OR fees.
  - An "Add Liaison" form allows the supervisor to create new liaison user profiles.

### Liaison Workflow
- **Dashboard (Home)**: The dashboard is tailored to show only unregistered motorcycles (`Incomplete` or `Ready to Register`) that are specifically assigned to the logged-in liaison.
- **Cash Advance (CA) Generation**:
  - Liaisons can select one or more motorcycles from their dashboard to generate a single cash advance request.
  - A preview dialog appears before submission, showing a breakdown of motorcycles, their associated fees, and the total cash advance amount.
  - The system prevents CA generation if any selected motorcycle has an "Incomplete" status.
- **Cash Advances Tab**: Displays only the cash advances requested by the liaison. The view is simplified to show customer and motorcycle details instead of internal personnel information. Administrative actions (approve, reject) are hidden.
- **Liquidation**:
  - On the "Liquidations" page, liaisons can process their approved or encashed advances.
  - Clicking "Liquidate" opens a detailed form to input LTO OR details, amounts, and remarks, and to upload a scanned copy of the official receipt.

### Cashier Workflow
- **Dashboard**: Provides a high-level financial overview with key metrics.
  - **Summary Cards**: Displays statistics for total motorcycles, upcoming document expirations, pending advances, and the total value of outstanding advances.
  - **Overdue Encashment Alerts**: A dedicated table highlights check vouchers that were released more than three days ago but have not been marked as "Encashed," prompting follow-up.
- **Cash Advances Tab**:
  - The cashier has a complete view of all cash advance requests across the organization.
  - The table is tailored to show the responsible liaison for each advance.
  - **Full Control**: The cashier has access to all actions: Approve, Reject, Release Check Voucher, and Mark as Encashed.

## Style Guidelines:
- **Primary Color**: Deep blue (#3F51B5) for primary actions and highlights.
- **Background Color**: Light, desaturated blue-gray (#F0F2F5) for a clean and professional look.
- **Accent Color**: Contrasting orange (#FF9800) for alerts and important call-to-action buttons.
- **Font**: 'Inter' (sans-serif) is used throughout the application for headings and body text.
- **UI Framework**: Built with Next.js, React, ShadCN UI components, and Tailwind CSS for a modern and responsive interface.
- **Icons**: Uses `lucide-react` for consistent and professional iconography.
