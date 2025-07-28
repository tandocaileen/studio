# App Name: LTO Portal

## 1. Application Overview
LTO Portal is a specialized web application designed to streamline and manage the complex financial and documentation processes associated with motorcycle registration. It provides a centralized platform for tracking motorcycles, managing cash advances, and handling liquidations, with a clear, role-based workflow to ensure accountability and efficiency.

## 2. Core Features

### User Roles & Authentication
- **Three distinct user roles**: Store Supervisor, Liaison, and Cashier. The Store Supervisor and Cashier roles share the same permissions and are often referred to collectively.
- A login page allows users to select their role for a simulated sign-in experience.
- **Role-Based Access Control (RBAC)**: The application uses a `ProtectedPage` component to restrict access to pages and features based on the logged-in user's role. The sidebar navigation is also dynamically generated based on user permissions.

### Automated Status Workflow
The application follows a strict, automated status progression for each motorcycle, ensuring data integrity and clear tracking at every stage:
1.  **`Incomplete`**: The default status for a new motorcycle. This indicates that required "Insurance & Control" data (like COC number, policy number, etc.) is missing.
2.  **`Ready to Register`**: Automatically set when a Store Supervisor/Cashier successfully saves all the required "Insurance & Control" information. These units are now ready for endorsement.
3.  **`Endorsed`**: Automatically set when a unit is included in an endorsement and assigned to a liaison.
4.  **`Processing`**: Automatically set as soon as a Cash Advance (CA) is generated for the unit by a liaison.
5.  **`For Review`**: Automatically set when the liaison submits the liquidation details for the unit. This signifies that the registration process is complete from the liaison's perspective and is pending final review.

### Motorcycle, Document, and Financial Management
- **Motorcycle Registry**: Add and store comprehensive motorcycle details (make, model, plate number, customer name, etc.).
- **Document Management**: Upload and track essential documents (OR/CR, COC, Insurance, etc.) with the ability to set expiration dates.
- **Endorsements**: A formal process to assign motorcycles that are `Ready to Register` to a specific liaison for handling.
- **Cash Advance (CA) Generation**: Liaisons can request cash advances for one or more motorcycles. The system uses Genkit AI to generate a consolidated CA request with a unique ID and summarized purpose.
- **Liquidation**: Liaisons can submit liquidation reports for their processed CAs by uploading receipts and detailing expenses.
- **Reporting**: The system can generate detailed, printable PDF reports for Cash Advances and Liquidations.

## 3. Roles and Responsibilities

### Store Supervisor / Cashier
This role is responsible for the initial data entry, financial oversight, and approval processes.

**Actions & Features:**
- **Dashboard**:
  - View a high-level financial overview with key metrics.
  - **"Endorsed Units with Incomplete Details" Tab**: A prioritized work queue of endorsed units that require insurance and control details before a CA can be generated.
  - **"Motorcycle Fleet" Tab**: A comprehensive table of all motorcycles in the system, with a default filter to show "Unregistered" units.
- **Receive MC Docs**:
  - From the dashboard, they can access a dialog to confirm the bulk reception of motorcycle documents and details from the main office (NIVI).
- **Motorcycle Management**:
  - Add new motorcycles to the system.
  - View and edit the "Insurance & Control" section for any motorcycle. Saving these details is the key step to change a unit's status from `Incomplete` to `Ready to Register`.
- **Endorsements**:
  - Create new endorsements, assigning one or more `Ready to Register` motorcycles to a specific liaison.
  - View all past and present endorsements.
- **Cash Advances**:
  - View all cash advance requests from all liaisons.
  - **Approve / Reject** pending CA requests.
  - Mark CAs as "Check Voucher Released" and later as "CV Received" to track the flow of funds.
- **Liquidations & Reporting**:
  - View all liquidation submissions from liaisons in a read-only format.
  - Generate and print detailed PDF Liquidation Reports for any cash advance.
  - Generate a master report of all liquidated items.
- **User Management**:
  - View a list of all liaison users and their assigned branches.

### Liaison
This role is the "on-the-ground" agent responsible for processing vehicle registrations and managing the associated funds.

**Actions & Features:**
- **Dashboard (Home)**:
  - A personalized view showing only the motorcycles assigned to them, with a default filter for "Pending Assignments" (`Endorsed` or `Processing` status).
- **Cash Advance Generation**:
  - Select one or more `Endorsed` motorcycles to request funds.
  - The system uses AI to generate a consolidated cash advance request.
  - Submitting the request automatically changes the motorcycle's status to `Processing`.
- **Cash Advances Tab**:
  - Track the status of their own cash advance requests as they are reviewed and processed by the Cashier.
- **Liquidation**:
  - This is the only role that can perform the liquidation action.
  - On the "Liquidations" page, they see a list of their individual motorcycles with a `Processing` status.
  - They can liquidate each motorcycle one by one, submitting details like the LTO OR number, amounts, and uploading a copy of the receipt.
  - Submitting the liquidation changes the motorcycle's status to `For Review`.
- **Reporting**:
  - View and print their own Cash Advance requests and Liquidation Reports.


## 4. End-to-End Workflow Example

Here is a step-by-step flow of a motorcycle through the system:

1.  **Receive MC Docs (Store Supervisor/Cashier)**
    - The Supervisor navigates to the **Dashboard**.
    - They click the **"Receive MC Docs"** button.
    - A dialog appears listing all units pending reception from NIVI.
    - The Supervisor selects the motorcycles that have been physically received and clicks **"Receive Selected"**. These motorcycles are now in the system but have a status of `Incomplete` because their insurance details are missing.

2.  **Complete Motorcycle Details (Store Supervisor/Cashier)**
    - The Supervisor sees the newly received motorcycles in the main **Motorcycle List** table.
    - They click the **"View / Edit Details"** action for one of the `Incomplete` motorcycles.
    - In the dialog, the main motorcycle details are read-only. The Supervisor navigates to the **"Insurance & Control"** section.
    - They fill in the required details (COC No., Policy No., etc.) and upload the necessary document files.
    - Upon clicking **"Save Changes"**, the system validates the input, and the motorcycle's status automatically changes to **`Ready to Register`**.

3.  **Create Endorsement (Store Supervisor/Cashier)**
    - The Supervisor goes to the **Endorsements** page and clicks **"Create New Endorsement"**.
    - They see a list of all motorcycles that are `Ready to Register`.
    - They select one or more units, choose a **Receiving Liaison** from a dropdown, add remarks, and confirm.
    - The selected motorcycles' status automatically changes to **`Endorsed`**, and they now appear on the assigned liaison's dashboard.

4.  **Generate Cash Advance (Liaison)**
    - The **Liaison** logs in and sees the newly assigned motorcycles on their **Home** page.
    - They select the `Endorsed` units they need to process.
    - They click the **"Generate CA"** button. A preview dialog appears, summarizing the units and total fees.
    - The Liaison confirms, and an AI-powered flow generates a single cash advance request. The motorcycles' status automatically updates to **`Processing`**.

5.  **Approve Cash Advance (Store Supervisor/Cashier)**
    - The Supervisor sees the new `Pending` request on the **Cash Advances** page.
    - They review the request and **Approve** it. The status changes to `Approved`.
    - They later issue a check and update the status to **`Check Voucher Released`**, and finally **`CV Received`** once the liaison confirms receipt.

6.  **Liquidate Expenses (Liaison)**
    - After completing the registration with the funds, the Liaison navigates to the **Liquidations** page.
    - They see a list of their `Processing` motorcycles.
    - They click **"Liquidate"** for a specific unit, fill in the LTO OR details, amounts, and upload the receipt.
    - Upon submission, the motorcycle's status automatically changes to **`For Review`**.

7.  **View Liquidation Report (All Roles)**
    - The Supervisor, Cashier, or Liaison can navigate to the **Liquidations** page or the **Reports** section.
    - They can find the relevant Cash Advance and click **"View Full Report"**.
    - A detailed, printable PDF document is displayed, showing the breakdown of the cash advance, the liquidated expenses, and any shortage or overage. If some units under the CA are not yet liquidated, they are clearly marked on the report.
