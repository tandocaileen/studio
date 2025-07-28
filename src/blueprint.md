# App Name: LTO Portal

## Core Features:

### User Roles & Authentication
- **Three distinct user roles**: Store Supervisor, Liaison, and Cashier. The Store Supervisor and Cashier roles share the same permissions.
- A login page allows users to select their role for a simulated sign-in experience.
- **Role-Based Access Control (RBAC)**: The application uses a `ProtectedPage` component to restrict access to pages and features based on the logged-in user's role. The sidebar navigation is also dynamically generated based on user permissions.

### Automated Status Workflow
The application follows a strict, automated status progression for each motorcycle, ensuring data integrity and clear tracking at every stage.
1.  **`Incomplete`**: The default status for a new motorcycle. This indicates that required "Insurance & Control" data (like COC number, policy number, etc.) is missing.
2.  **`Ready to Register`**: Automatically set when a Store Supervisor/Cashier successfully saves all the required "Insurance & Control" information. These units are now ready for endorsement.
3.  **`Endorsed`**: Automatically set when a unit is included in an endorsement and assigned to a liaison.
4.  **`Processing`**: Automatically set as soon as a Cash Advance (CA) is generated for the unit by a liaison.
5.  **`For Review`**: Automatically set when the liaison submits the liquidation details for the unit. This signifies that the registration process is complete from the liaison's perspective and is pending final review.

### Store Supervisor / Cashier Workflow
- **Dashboard**: Provides a high-level financial overview with key metrics.
  - **Tabbed View**: The dashboard is organized into two main tabs for clarity.
    - **"Endorsed Units with Incomplete Details" Tab**: This is the default view, highlighted in red to draw attention. It provides a prioritized work queue of units that have been endorsed but require insurance and control details before a CA can be generated.
    - **"Motorcycle Fleet" Tab**: Shows a comprehensive table of all motorcycles.
  - **Filtering**: The main motorcycle table defaults to showing "Unregistered" units, with a filter to easily "View All".
  - **Receive MC Docs**: A primary action on the dashboard allows for the bulk receiving of motorcycle documents from the main office. This interface allows them to input `HPG Control Number` and other key details for multiple motorcycles at once.
  - **Motorcycle Management**:
    - When viewing a motorcycle's details, the core information (make, model, plate number, etc.) is **read-only**.
    - The **"Insurance & Control"** section is editable, allowing the user to input required data like `SAR Code`, `COC Number`, `Policy Number`, etc. Saving this data transitions the motorcycle's status to `Ready to Register`.
- **Endorsements**: Assigns motorcycles with a `Ready to Register` status to specific liaisons for processing. This action changes the motorcycle's status to `Endorsed`.
- **Cash Advances**:
  - Views all cash advance requests from liaisons.
  - Can `Approve` or `Reject` pending CAs.
  - `Issues Check Vouchers` for approved CAs.
  - `Flags` when a Check Voucher (`CV`) has been received by the liaison.
  - Can view and print all Cash Advance requests and Liquidation Reports.
- **Liquidations**:
    - Has a read-only view of all liquidations.
    - Can switch between a view of individual motorcycles pending liquidation and a view grouped by Cash Advance.
    - Can view and generate a printable PDF report for any CA. If the CA is partially liquidated, the report is marked as "Initial" and unliquidated units are left blank.
    - Can generate a master report of all liquidated items.

### Liaison Workflow
- **Dashboard (Home)**: The dashboard is tailored to show only motorcycles assigned to the logged-in liaison with a status of `Endorsed` or `Processing`. A toggle allows them to view all assigned motorcycles.
- **Cash Advance (CA) Generation**:
  - Can select one or more `Endorsed` motorcycles to generate a single, consolidated cash advance request.
  - A preview dialog appears before submission. Submitting the request changes the motorcycle's status to `Processing`.
- **Cash Advances Tab**: Displays only the cash advances requested by the liaison. They can see the status as it's updated by the cashier (Approved, CV Released, etc.).
- **Liquidation**:
  - On the "Liquidations" page, the liaison sees a list of their individual motorcycles with a `Processing` status.
  - They can `liquidate` each motorcycle one by one, uploading the OR and inputting financial details. This is the only role that can perform the liquidation action. Submitting the liquidation changes the motorcycle's status to `For Review`.

## Style Guidelines:
- **Primary Color**: Deep blue (#3F51B5) for primary actions and highlights.
- **Background Color**: Light, desaturated blue-gray (#F0F2F5) for a clean and professional look.
- **Accent Color**: Contrasting orange (#FF9800) for alerts and important call-to-action buttons.
- **Font**: 'Inter' (sans-serif) is used throughout the application for headings and body text.
- **UI Framework**: Built with Next.js, React, ShadCN UI components, and Tailwind CSS for a modern and responsive interface.
- **Icons**: Uses `lucide-react` for consistent and professional iconography.
- **User Experience**: Designed to minimize clicks and provide a smooth, intuitive experience. All major tables include pagination to handle large datasets efficiently.
