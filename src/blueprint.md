# App Name: LTO Portal

## Core Features:

### User Roles & Authentication
- **Three distinct user roles**: Store Supervisor, Liaison, and Cashier. The Store Supervisor and Cashier roles share the same permissions.
- A login page allows users to select their role for a simulated sign-in experience.
- **Role-Based Access Control (RBAC)**: The application uses a `ProtectedPage` component to restrict access to pages and features based on the logged-in user's role. The sidebar navigation is also dynamically generated based on user permissions.

### Store Supervisor / Cashier Workflow
- **Dashboard**: Provides a high-level financial overview with key metrics.
  - **Summary Cards**: Displays statistics for total motorcycles, upcoming document expirations, pending advances, and the total value of outstanding advances.
  - **Overdue CV Reception Alert**: A dedicated table highlights check vouchers that were released more than three days ago but have not been marked as "CV Received," prompting follow-up.
- **Motorcycle Management**:
  - Ability to add new motorcycle records.
  - Manually encodes `SAR Code`, `COC Number`, `Policy Number`, and other insurance details upon receiving LTO documents.
- **Endorsements**: Assigns motorcycles to specific liaisons for processing.
- **Cash Advances**:
  - Views all cash advance requests from liaisons.
  - Can `Approve` or `Reject` pending CAs.
  - `Issues Check Vouchers` for approved CAs.
  - `Flags` when a Check Voucher (`CV`) has been received by the liaison.
  - Can view and print all Cash Advance requests and Liquidation Reports.
- **Liquidations**:
    - Has a read-only view of all liquidations.
    - Can switch between a view of individual motorcycles pending liquidation and a view grouped by Cash Advance.
    - Can view and generate a printable PDF report for any CA, regardless of whether it is partially or fully liquidated.
    - Can generate a master report of all liquidated items.

### Liaison Workflow
- **Dashboard (Home)**: The dashboard is tailored to show only unregistered motorcycles (`Incomplete` or `Ready to Register`) that are specifically assigned to the logged-in liaison. A toggle allows them to view all assigned motorcycles, including processed ones.
- **Cash Advance (CA) Generation**:
  - After receiving an endorsement from a supervisor/cashier, the liaison can select one or more motorcycles to generate a single, consolidated cash advance request.
  - A preview dialog appears before submission, showing a breakdown of motorcycles and the total requested amount.
- **Cash Advances Tab**: Displays only the cash advances requested by the liaison. They can see the status as it's updated by the cashier (Approved, CV Released, etc.).
- **Liquidation**:
  - On the "Liquidations" page, the liaison sees a list of their individual motorcycles that are ready for liquidation.
  - They can `liquidate` each motorcycle one by one, uploading the OR and inputting financial details. This is the only role that can perform the liquidation action.

## Style Guidelines:
- **Primary Color**: Deep blue (#3F51B5) for primary actions and highlights.
- **Background Color**: Light, desaturated blue-gray (#F0F2F5) for a clean and professional look.
- **Accent Color**: Contrasting orange (#FF9800) for alerts and important call-to-action buttons.
- **Font**: 'Inter' (sans-serif) is used throughout the application for headings and body text.
- **UI Framework**: Built with Next.js, React, ShadCN UI components, and Tailwind CSS for a modern and responsive interface.
- **Icons**: Uses `lucide-react` for consistent and professional iconography.
- **User Experience**: Designed to minimize clicks and provide a smooth, intuitive experience, making it accessible for users of all technical skill levels. All major tables include pagination to handle large datasets efficiently.
