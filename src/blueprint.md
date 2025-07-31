# App Name: LTO Portal

## 1. Application Overview
LTO Portal is a specialized web application designed to streamline and manage the complex financial and documentation processes associated with motorcycle registration. It provides a centralized platform for tracking motorcycles, managing cash advances, and handling liquidations, with a clear, role-based workflow to ensure accountability and efficiency.

## 2. Core Features

### User Roles & Authentication
- **Four distinct user roles**: Store Supervisor, Liaison, Cashier, and Accounting.
- A login page allows users to select their role for a simulated sign-in experience.
- **Role-Based Access Control (RBAC)**: The application uses a `ProtectedPage` component to restrict access to pages and features based on the logged-in user's role. The sidebar navigation is also dynamically generated based on user permissions.

### Automated Status Workflow
The application follows a strict, automated status progression for each motorcycle, ensuring data integrity and clear tracking at every stage:
1.  **`Lacking Requirements`**: The default status for a new motorcycle that requires more details (like insurance, COC, etc.). A Supervisor or Cashier must complete these details.
2.  **`Endorsed`**: Automatically set when a unit with complete details is endorsed to a liaison. **Only units with this status are eligible for Cash Advance generation.**
3.  **`For CA Approval`**: Automatically set as soon as a Cash Advance (CA) is generated for the unit by a liaison. The request is now pending approval from the Accounting role.
4.  **`For CV Issuance`**: Set when Accounting approves the CA. The request is now waiting for a Cashier to issue a Check Voucher (CV).
5.  **`Released CVs`**: Set when the Cashier issues the CV and a Supervisor/Cashier confirms the liaison has received it.
6.  **`For Liquidation`**: The status of the motorcycle once the CV has been released to the liaison, making it ready for the registration and liquidation process.
7.  **`For Verification`**: Automatically set when the liaison submits the liquidation details for the unit. This signifies that the registration process is complete from the liaison's perspective and is pending final review by Accounting.
8.  **`Completed`**: The final status, set by Accounting after verifying the liquidation report. The transaction is now closed.

### Motorcycle, Document, and Financial Management
- **Motorcycle Registry**: Add and store comprehensive motorcycle details (make, model, plate number, customer name, etc.).
- **Document Management**: Upload and track essential documents (OR/CR, COC, Insurance, etc.).
- **Automated Endorsements**: The system automatically endorses motorcycles with complete details to their assigned liaison.
- **Cash Advance (CA) Generation**: Liaisons can request cash advances for one or more endorsed motorcycles. The system uses Genkit AI to generate a consolidated CA request.
- **Liquidation**: Liaisons can submit liquidation reports for their processed CAs by uploading receipts and detailing expenses.
- **Reporting**: The system can generate detailed, printable PDF reports for Cash Advances and Liquidations.

## 3. Roles and Responsibilities

### Store Supervisor / Cashier
This group is responsible for initial data entry, financial oversight, and parts of the approval process.
- **`Store Supervisor`**: Can view and edit motorcycle details to make them ready for endorsement. Can confirm receipt of Check Vouchers. Manages liaison user information.
- **`Cashier`**: Has the same permissions as a Supervisor but is also responsible for issuing the Check Vouchers for approved Cash Advances.

**Actions & Features:**
- **Dashboard (`/pending`)**: View and manage all motorcycles, with a default view for units needing details (`Lacking Requirements`).
- **Endorsements (`/endorsements`)**: View all past and present automated endorsements.
- **Cash Advances**: View all cash advance requests.
  - **Cashier**: Can issue Check Vouchers for CAs with status `For CV Issuance`.
  - **Supervisor/Cashier**: Can confirm receipt of CVs, changing the status to `Released CVs`.
- **User Management (`/liaisons`)**: View a list of all liaison users and their assigned branches.
- **View Reports**: Can view completed liquidation reports.

### Liaison
This role is the "on-the-ground" agent responsible for processing vehicle registrations and managing the associated funds.

**Actions & Features:**
- **Home Page (`/endorsed-to-liaison`)**: A personalized dashboard showing all endorsements assigned to them.
- **Cash Advance Generation**: Select one or more endorsed motorcycles to request funds. Submitting the request changes the motorcycle's status to `For CA Approval`.
- **Track Cash Advances**: Monitor the status of their CAs from `For CA Approval` through to `Released CVs`.
- **Liquidations Page (`/for-liquidation`)**: This is the only role that can perform the liquidation action. They submit LTO OR details, amounts, and receipts for motorcycles linked to a released CV. Submitting changes the motorcycle's status to `For Verification`.
- **View Reports**: Can view and print their own Cash Advance requests and Liquidation Reports.

### Accounting
This role is responsible for the final financial verification and approval stages of the workflow.

**Actions & Features:**
- **Cash Advance Approval (`/for-ca-approval`)**: Reviews CA requests from liaisons. Approving a request changes its status to `For CV Issuance`.
- **Verification (`/for-verification`)**: The core responsibility. Reviews submitted liquidation reports from liaisons.
  - Can view a detailed breakdown of expenses vs. the advanced amount.
  - After review, they can mark the transaction as `Completed`, which is the final step in the workflow.
- **Reporting (`/completed`)**: Accesses and can generate final, verified liquidation reports for archival and auditing purposes.
- **Settings & Support**: Has access to the application's settings and support pages.

## 4. End-to-End Workflow Example

Here is a step-by-step flow of a motorcycle through the system:

1.  **Complete Motorcycle Details (Store Supervisor/Cashier)**
    - A Supervisor sees a new `Lacking Requirements` unit on their dashboard.
    - They edit the unit, fill in the required "Insurance & Control" details, and save. The motorcycle is now ready for endorsement.

2.  **Automated Endorsement (System)**
    - The system automatically gathers all complete units and creates an endorsement for the appropriate liaison. The motorcycle status changes to **`Endorsed`**.

3.  **Generate Cash Advance (Liaison)**
    - The **Liaison** sees the newly assigned motorcycles on their **Home** page.
    - They select one or more units and click **"Generate CA"**.
    - The motorcycles' status automatically updates to **`For CA Approval`**.

4.  **Approve CA (Accounting)**
    - **Accounting** sees the new request on the **For CA Approval** page.
    - They review and approve it. The status changes to **`For CV Issuance`**.

5.  **Process Check Voucher (Cashier & Supervisor)**
    - The **Cashier** sees the request on the **For CV Issuance** page, and issues a Check Voucher number. The status changes to **`Released CVs`**.
    - The **Supervisor** or **Cashier** then confirms the liaison has received the funds. The motorcycle status becomes **`For Liquidation`**.

6.  **Liquidate Expenses (Liaison)**
    - The Liaison navigates to the **For Liquidation** page.
    - They click **"View/Edit"** for a specific unit, fill in the LTO OR details, amounts, and upload the receipt.
    - Upon submission, the motorcycle's status changes to **`For Verification`**.

7.  **Final Verification (Accounting)**
    - **Accounting** sees the fully liquidated CA on their **For Verification** page.
    - They review the complete report, add remarks, and click **"Verify Transaction"**.
    - The motorcycle and CA statuses are updated to **`Completed`**. The process is finished.

8.  **View Completed Report (All Roles)**
    - Any user with permissions can now view the final, read-only `Completed Report` for the transaction.
