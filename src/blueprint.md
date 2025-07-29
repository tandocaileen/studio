# App Name: LTO Portal

## 1. Application Overview
LTO Portal is a specialized web application designed to streamline and manage the complex financial and documentation processes associated with motorcycle registration. It provides a centralized platform for tracking motorcycles, managing cash advances, and handling liquidations, with a clear, role-based workflow to ensure accountability and efficiency.

## 2. Core Features

### User Roles & Authentication
- **Three distinct user roles**: Store Supervisor, Liaison, and Cashier.
- A login page allows users to select their role for a simulated sign-in experience.
- **Role-Based Access Control (RBAC)**: The application uses a `ProtectedPage` component to restrict access to pages and features based on the logged-in user's role. The sidebar navigation is also dynamically generated based on user permissions.

### Automated Status Workflow
The application follows a strict, automated status progression for each motorcycle, ensuring data integrity and clear tracking at every stage:
1.  **`Incomplete`**: The default status for a new motorcycle that requires more details (like insurance, COC, etc.).
2.  **`Ready to Register`**: Automatically set when a Store Supervisor/Cashier saves all the required "Insurance & Control" information. These units are now ready for endorsement.
3.  **`Endorsed - Incomplete`**: Automatically set when an `Incomplete` unit is endorsed to a liaison.
4.  **`Endorsed - Ready`**: Automatically set when a `Ready to Register` unit is endorsed to a liaison. **Only units with this status are eligible for Cash Advance generation.**
5.  **`Processing`**: Automatically set as soon as a Cash Advance (CA) is generated for the unit by a liaison.
6.  **`For Review`**: Automatically set when the liaison submits the liquidation details for the unit. This signifies that the registration process is complete from the liaison's perspective and is pending final review.

### Motorcycle, Document, and Financial Management
- **Motorcycle Registry**: Add and store comprehensive motorcycle details (make, model, plate number, customer name, etc.).
- **Document Management**: Upload and track essential documents (OR/CR, COC, Insurance, etc.) with the ability to set expiration dates.
- **Endorsements**: A formal process to assign motorcycles to a specific liaison for handling.
- **Cash Advance (CA) Generation**: Liaisons can request cash advances for one or more motorcycles that are `Endorsed - Ready`. The system uses Genkit AI to generate a consolidated CA request with a unique ID and summarized purpose. It is assumed that a single Check Voucher (CV) can cover multiple CA requests.
- **Liquidation**: Liaisons can submit liquidation reports for their processed CAs by uploading receipts and detailing expenses.
- **Reporting**: The system can generate detailed, printable PDF reports for Cash Advances and Liquidations.

## 3. Roles and Responsibilities

### Store Supervisor / Cashier
This role is responsible for the initial data entry, financial oversight, and approval processes.

**Actions & Features:**
- **Dashboard**:
  - View a high-level financial overview with key metrics.
  - **Motorcycle Fleet Tab**: A comprehensive table of all motorcycles in the system. The view defaults to "Unendorsed" units (`Incomplete` or `Ready to Register`) to help prioritize units for the next step. A filter panel allows for viewing units of any status.
- **Receive MC Docs**:
  - From the dashboard, they can access a dialog to confirm the bulk reception of motorcycle documents.
- **Motorcycle Management**:
  - View and edit the "Insurance & Control" section for any motorcycle. Saving these details is the key step to change a unit's status from `Incomplete` to `Ready to Register` (or `Endorsed - Incomplete` to `Endorsed - Ready`).
- **Endorsements**:
  - Create new endorsements, assigning one or more motorcycles to a specific liaison.
  - View all past and present endorsements.
- **Cash Advances**:
  - View all cash advance requests from all liaisons, with a powerful filter panel to narrow down results. The view is pre-filtered based on the next action required for their role (e.g., 'Processing for CV' for Cashiers).
  - **Cashier**: Can bulk-release Check Vouchers for multiple CA requests at once.
  - **Supervisor/Cashier**: Can bulk-confirm the receipt of Check Vouchers.
- **Liquidations & Reporting**:
  - View all liquidation submissions and generate reports.
  - Can view reports by individual motorcycle or by cash advance.
  - Generate and print detailed PDF Liquidation Reports for any cash advance.
  - Generate a master report of all liquidated items.
- **User Management**:
  - View a list of all liaison users and their assigned branches.

### Liaison
This role is the "on-the-ground" agent responsible for processing vehicle registrations and managing the associated funds.

**Actions & Features:**
- **Home Page**:
  - A personalized dashboard showing all endorsements assigned to them, grouped by endorsement code.
  - Can expand each endorsement to see the individual motorcycle units.
  - A filter panel allows them to narrow down endorsements by date or by the endorsing supervisor/cashier.
- **Cash Advance Generation**:
  - Select one or more motorcycles with the `Endorsed - Ready` status from their endorsements to request funds. The selection is restricted to only these units.
  - The system uses AI to generate a consolidated cash advance request.
  - Submitting the request automatically changes the motorcycles' status to `Processing`.
- **Cash Advances Page**:
  - View and track the status of all cash advances, including their own and those of others. A comprehensive filter panel allows them to easily find specific requests.
- **Liquidations Page**:
  - This is the only role that can perform the liquidation action.
  - On the "Liquidations" page, they see a list of their individual motorcycles tied to a received cash advance, ready for liquidation.
  - They can liquidate each motorcycle one by one, submitting details like the LTO OR number, amounts, and uploading a copy of the receipt.
  - Submitting the liquidation changes the motorcycle's status to `For Review`.
  - Can view all liquidation reports.
- **Reporting**:
  - View and print their own Cash Advance requests and Liquidation Reports.


## 4. End-to-End Workflow Example

Here is a step-by-step flow of a motorcycle through the system:

1.  **Receive MC Docs (Store Supervisor/Cashier)**
    - A Supervisor navigates to the **Dashboard** and uses the **Receive MC Docs** action to add new motorcycles to the system.
    - These motorcycles are now in the system with a status of `Incomplete`.

2.  **Complete Motorcycle Details (Store Supervisor/Cashier)**
    - The Supervisor sees the newly received motorcycles in the main **Motorcycle List** table.
    - They click the **"Edit"** action for one of the `Incomplete` motorcycles.
    - They fill in the required "Insurance & Control" details.
    - Upon clicking **"Save Changes"**, the motorcycle's status automatically changes to **`Ready to Register`**.

3.  **Create Endorsement (Store Supervisor/Cashier)**
    - The Supervisor goes to the **Endorsements** page and clicks **"Create New Endorsement"**.
    - They see a list of all `Ready to Register` and `Incomplete` motorcycles.
    - They select one or more units and choose a **Receiving Liaison**.
    - If a `Ready to Register` unit is selected, its status becomes **`Endorsed - Ready`**. If an `Incomplete` unit is selected, its status becomes **`Endorsed - Incomplete`**.

4.  **Generate Cash Advance (Liaison)**
    - The **Liaison** logs in and sees the newly assigned motorcycles on their **Home** page, grouped by endorsement.
    - They can only select units that are `Endorsed - Ready`.
    - They click the **"Generate CA"** button. An AI-powered flow generates a single cash advance request.
    - The motorcycles' status automatically updates to **`Processing`**.

5.  **Process Check Voucher (Cashier & Supervisor)**
    - The **Cashier** sees the new request on the **Cash Advances** page (pre-filtered to 'Processing for CV').
    - They select one or more requests, click **"Bulk Actions"**, and enter a single Check Voucher number to release the funds. The status for all selected requests changes to **`CV Released`**.
    - The **Supervisor** or **Cashier** sees these on the Cash Advances page (pre-filtered to 'CV Released'). They select the requests and use the **"Bulk Actions"** menu to confirm the liaison has received the funds. The status changes to **`CV Received`**. The Liaison can also see these status changes on their Cash Advances page.

6.  **Liquidate Expenses (Liaison)**
    - After completing the registration, the Liaison navigates to the **Liquidations** page.
    - They see a list of their motorcycles that are linked to a received cash advance (`CV Received` status).
    - They click **"Liquidate"** for a specific unit, fill in the LTO OR details, amounts, and upload the receipt.
    - Upon submission, the motorcycle's status automatically changes to **`For Review`**.

7.  **View Liquidation Report (All Roles)**
    - Any user can navigate to the **Liquidations** page, switch to the "By Cash Advance" view, and find the relevant Cash Advance.
    - They can click **"View Full Report"**.
    - A detailed, printable PDF document is displayed, showing the breakdown of the cash advance and liquidated expenses.
