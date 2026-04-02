// AUTO-GENERATED — do not edit by hand.
// Re-run `deno task codegen` to regenerate.
// Source: schemas/harvest-openapi.yaml
export interface paths {
    "/clients": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all clients
         * @description Returns a list of your clients. The clients are returned sorted by creation date, with the most recently created clients appearing first.
         *
         *     The response contains an object with a clients property that contains an array of up to per_page clients. Each entry in the array is a separate client object. If no more clients are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your clients.
         */
        get: operations["listClients"];
        put?: never;
        /**
         * Create a client
         * @description Creates a new client object. Returns a client object and a 201 Created response code if the call succeeded.
         */
        post: operations["createClient"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/clients/{clientId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a client
         * @description Retrieves the client with the given ID. Returns a client object and a 200 OK response code if a valid identifier was provided.
         */
        get: operations["retrieveClient"];
        put?: never;
        post?: never;
        /**
         * Delete a client
         * @description Delete a client. Deleting a client is only possible if it has no projects, invoices, or estimates associated with it. Returns a 200 OK response code if the call succeeded.
         */
        delete: operations["deleteClient"];
        options?: never;
        head?: never;
        /**
         * Update a client
         * @description Updates the specific client by setting the values of the parameters passed. Any parameters not provided will be left unchanged. Returns a client object and a 200 OK response code if the call succeeded.
         */
        patch: operations["updateClient"];
        trace?: never;
    };
    "/company": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a company
         * @description Retrieves the company for the currently authenticated user. Returns a
         *     company object and a 200 OK response code.
         */
        get: operations["retrieveCompany"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Update a company
         * @description Updates the company setting the values of the parameters passed. Any parameters not provided will be left unchanged. Returns a company object and a 200 OK response code if the call succeeded.
         */
        patch: operations["updateCompany"];
        trace?: never;
    };
    "/contacts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all contacts
         * @description Returns a list of your contacts. The contacts are returned sorted by creation date, with the most recently created contacts appearing first.
         *
         *     The response contains an object with a contacts property that contains an array of up to per_page contacts. Each entry in the array is a separate contact object. If no more contacts are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your contacts.
         */
        get: operations["listContacts"];
        put?: never;
        /**
         * Create a contact
         * @description Creates a new contact object. Returns a contact object and a 201 Created response code if the call succeeded.
         */
        post: operations["createContact"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/contacts/{contactId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a contact
         * @description Retrieves the contact with the given ID. Returns a contact object and a 200 OK response code if a valid identifier was provided.
         */
        get: operations["retrieveContact"];
        put?: never;
        post?: never;
        /**
         * Delete a contact
         * @description Delete a contact. Returns a 200 OK response code if the call succeeded.
         */
        delete: operations["deleteContact"];
        options?: never;
        head?: never;
        /**
         * Update a contact
         * @description Updates the specific contact by setting the values of the parameters passed. Any parameters not provided will be left unchanged. Returns a contact object and a 200 OK response code if the call succeeded.
         */
        patch: operations["updateContact"];
        trace?: never;
    };
    "/estimate_item_categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all estimate item categories
         * @description Returns a list of your estimate item categories. The estimate item categories are returned sorted by creation date, with the most recently created estimate item categories appearing first.
         *
         *     The response contains an object with a estimate_item_categories property that contains an array of up to per_page estimate item categories. Each entry in the array is a separate estimate item category object. If no more estimate item categories are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your estimate item categories.
         */
        get: operations["listEstimateItemCategories"];
        put?: never;
        /**
         * Create an estimate item category
         * @description Creates a new estimate item category object. Returns an estimate item category object and a 201 Created response code if the call succeeded.
         */
        post: operations["createEstimateItemCategory"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/estimate_item_categories/{estimateItemCategoryId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an estimate item category
         * @description Retrieves the estimate item category with the given ID. Returns an estimate item category object and a 200 OK response code if a valid identifier was provided.
         */
        get: operations["retrieveEstimateItemCategory"];
        put?: never;
        post?: never;
        /**
         * Delete an estimate item category
         * @description Delete an estimate item category. Returns a 200 OK response code if the call succeeded.
         */
        delete: operations["deleteEstimateItemCategory"];
        options?: never;
        head?: never;
        /**
         * Update an estimate item category
         * @description Updates the specific estimate item category by setting the values of the parameters passed. Any parameters not provided will be left unchanged. Returns an estimate item category object and a 200 OK response code if the call succeeded.
         */
        patch: operations["updateEstimateItemCategory"];
        trace?: never;
    };
    "/estimates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all estimates
         * @description Returns a list of your estimates. The estimates are returned sorted by issue date, with the most recently issued estimates appearing first.
         *
         *     The response contains an object with a estimates property that contains an array of up to per_page estimates. Each entry in the array is a separate estimate object. If no more estimates are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your estimates.
         */
        get: operations["listEstimates"];
        put?: never;
        /**
         * Create an estimate
         * @description Creates a new estimate object. Returns an estimate object and a 201 Created response code if the call succeeded.
         */
        post: operations["createEstimate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/estimates/{estimateId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an estimate
         * @description Retrieves the estimate with the given ID. Returns an estimate object and a 200 OK response code if a valid identifier was provided.
         */
        get: operations["retrieveEstimate"];
        put?: never;
        post?: never;
        /**
         * Delete an estimate
         * @description Delete an estimate. Returns a 200 OK response code if the call succeeded.
         */
        delete: operations["deleteEstimate"];
        options?: never;
        head?: never;
        /**
         * Update an estimate
         * @description Updates the specific estimate by setting the values of the parameters passed. Any parameters not provided will be left unchanged. Returns an estimate object and a 200 OK response code if the call succeeded.
         */
        patch: operations["updateEstimate"];
        trace?: never;
    };
    "/estimates/{estimateId}/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all messages for an estimate
         * @description Returns a list of messages associated with a given estimate. The estimate messages are returned sorted by creation date, with the most recently created messages appearing first.
         *
         *     The response contains an object with an estimate_messages property that contains an array of up to per_page messages. Each entry in the array is a separate message object. If no more messages are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your messages.
         */
        get: operations["listMessagesForEstimate"];
        put?: never;
        /**
         * Create an estimate message or change estimate status
         * @description Creates a new estimate message object. Returns an estimate message object and a 201 Created response code if the call succeeded.
         */
        post: operations["createEstimateMessage"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/estimates/{estimateId}/messages/{messageId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Delete an estimate message
         * @description Delete an estimate message. Returns a 200 OK response code if the call succeeded.
         */
        delete: operations["deleteEstimateMessage"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/expense_categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all expense categories
         * @description Returns a list of your expense categories. The expense categories are returned sorted by creation date, with the most recently created expense categories appearing first.
         *
         *     The response contains an object with a expense_categories property that contains an array of up to per_page expense categories. Each entry in the array is a separate expense category object. If no more expense categories are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your expense categories.
         */
        get: operations["listExpenseCategories"];
        put?: never;
        /**
         * Create an expense category
         * @description Creates a new expense category object. Returns an expense category object and a 201 Created response code if the call succeeded.
         */
        post: operations["createExpenseCategory"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/expense_categories/{expenseCategoryId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an expense category
         * @description Retrieves the expense category with the given ID. Returns an expense category object and a 200 OK response code if a valid identifier was provided.
         */
        get: operations["retrieveExpenseCategory"];
        put?: never;
        post?: never;
        /**
         * Delete an expense category
         * @description Delete an expense category. Returns a 200 OK response code if the call succeeded.
         */
        delete: operations["deleteExpenseCategory"];
        options?: never;
        head?: never;
        /**
         * Update an expense category
         * @description Updates the specific expense category by setting the values of the parameters passed. Any parameters not provided will be left unchanged. Returns an expense category object and a 200 OK response code if the call succeeded.
         */
        patch: operations["updateExpenseCategory"];
        trace?: never;
    };
    "/expenses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all expenses
         * @description Returns a list of your expenses. If accessing this endpoint as an Administrator, all expenses in the account will be returned. If accessing this endpoint as a Manager, all expenses for assigned teammates and managed projects will be returned. The expenses are returned sorted by the spent_at date, with the most recent expenses appearing first.
         *
         *     The response contains an object with a expenses property that contains an array of up to per_page expenses. Each entry in the array is a separate expense object. If no more expenses are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your expenses.
         */
        get: operations["listExpenses"];
        put?: never;
        /**
         * Create an expense
         * @description Creates a new expense object. Returns an expense object and a 201 Created response code if the call succeeded.
         */
        post: operations["createExpense"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/expenses/{expenseId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an expense
         * @description Retrieves the expense with the given ID. Returns an expense object and a 200 OK response code if a valid identifier was provided.
         */
        get: operations["retrieveExpense"];
        put?: never;
        post?: never;
        /**
         * Delete an expense
         * @description Delete an expense. Returns a 200 OK response code if the call succeeded.
         */
        delete: operations["deleteExpense"];
        options?: never;
        head?: never;
        /**
         * Update an expense
         * @description Updates the specific expense by setting the values of the parameters passed. Any parameters not provided will be left unchanged. Returns an expense object and a 200 OK response code if the call succeeded.
         *
         *     Note that changes to project_id and expense_category_id will be silently dropped if the expense is locked. Users with sufficient permissions are able to update the rest of a locked expense’s attributes.
         */
        patch: operations["updateExpense"];
        trace?: never;
    };
    "/invoice_item_categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all invoice item categories
         * @description Returns a list of your invoice item categories. The invoice item categories are returned sorted by creation date, with the most recently created invoice item categories appearing first.
         *
         *     The response contains an object with a invoice_item_categories property that contains an array of up to per_page invoice item categories. Each entry in the array is a separate invoice item category object. If no more invoice item categories are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your invoice item categories.
         */
        get: operations["listInvoiceItemCategories"];
        put?: never;
        /**
         * Create an invoice item category
         * @description Creates a new invoice item category object. Returns an invoice item category object and a 201 Created response code if the call succeeded.
         */
        post: operations["createInvoiceItemCategory"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/invoice_item_categories/{invoiceItemCategoryId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an invoice item category
         * @description Retrieves the invoice item category with the given ID. Returns an invoice item category object and a 200 OK response code if a valid identifier was provided.
         */
        get: operations["retrieveInvoiceItemCategory"];
        put?: never;
        post?: never;
        /**
         * Delete an invoice item category
         * @description Delete an invoice item category. Deleting an invoice item category is only possible if use_as_service and use_as_expense are both false. Returns a 200 OK response code if the call succeeded.
         */
        delete: operations["deleteInvoiceItemCategory"];
        options?: never;
        head?: never;
        /**
         * Update an invoice item category
         * @description Updates the specific invoice item category by setting the values of the parameters passed. Any parameters not provided will be left unchanged. Returns an invoice item category object and a 200 OK response code if the call succeeded.
         */
        patch: operations["updateInvoiceItemCategory"];
        trace?: never;
    };
    "/invoices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all invoices
         * @description Returns a list of your invoices. The invoices are returned sorted by issue date, with the most recently issued invoices appearing first.
         *
         *     The response contains an object with a invoices property that contains an array of up to per_page invoices. Each entry in the array is a separate invoice object. If no more invoices are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your invoices.
         */
        get: operations["listInvoices"];
        put?: never;
        /**
         * Create an invoice
         * @description Creates a new invoice object. Returns an invoice object and a 201 Created response code if the call succeeded.
         */
        post: operations["createInvoice"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/invoices/{invoiceId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an invoice
         * @description Retrieves the invoice with the given ID. Returns an invoice object and a 200 OK response code if a valid identifier was provided.
         */
        get: operations["retrieveInvoice"];
        put?: never;
        post?: never;
        /**
         * Delete an invoice
         * @description Delete an invoice. Returns a 200 OK response code if the call succeeded.
         */
        delete: operations["deleteInvoice"];
        options?: never;
        head?: never;
        /**
         * Update an invoice
         * @description Updates the specific invoice by setting the values of the parameters passed. Any parameters not provided will be left unchanged. Returns an invoice object and a 200 OK response code if the call succeeded.
         */
        patch: operations["updateInvoice"];
        trace?: never;
    };
    "/invoices/{invoiceId}/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all messages for an invoice
         * @description Returns a list of messages associated with a given invoice. The invoice messages are returned sorted by creation date, with the most recently created messages appearing first.
         *
         *     The response contains an object with an invoice_messages property that contains an array of up to per_page messages. Each entry in the array is a separate message object. If no more messages are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your messages.
         */
        get: operations["listMessagesForInvoice"];
        put?: never;
        /**
         * Create and send an invoice message
         * @description Creates a new invoice message object and sends it. Returns an invoice message object and a 201 Created response code if the call succeeded.
         *
         *     A note about the optional event_type parameter: If event_type is omitted in a request, its default value of null means the message will be sent. In such a request, if the recipients array is omitted or empty and send_me_a_copy is also omitted or set to false, the request will fail because the message has no recipients. When omitting event_type to create and send a message, be sure to include a recipients array as a parameter or ensure the send_me_a_copy parameter is included and set to true.
         */
        post: operations["createInvoiceMessage"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/invoices/{invoiceId}/messages/new": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve invoice message subject and body for specific invoice
         * @description Returns the subject and body text as configured in Harvest of an invoice message for a specific invoice and a 200 OK response code if the call succeeded. Does not create the invoice message. If no parameters are passed, will return the subject and body of a general invoice message for the specific invoice.
         */
        get: operations["retrieveInvoiceMessageSubjectAndBodyForSpecificInvoice"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/invoices/{invoiceId}/messages/{messageId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Delete an invoice message
         * @description Delete an invoice message. Returns a 200 OK response code if the call succeeded.
         */
        delete: operations["deleteInvoiceMessage"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/invoices/{invoiceId}/payments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all payments for an invoice
         * @description Returns a list of payments associate with a given invoice. The payments are returned sorted by creation date, with the most recently created payments appearing first.
         *
         *     The response contains an object with an invoice_payments property that contains an array of up to per_page payments. Each entry in the array is a separate payment object. If no more payments are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your payments.
         */
        get: operations["listPaymentsForInvoice"];
        put?: never;
        /**
         * Create an invoice payment
         * @description Creates a new invoice payment object. Returns an invoice payment object and a 201 Created response code if the call succeeded.
         */
        post: operations["createInvoicePayment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/invoices/{invoiceId}/payments/{paymentId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Delete an invoice payment
         * @description Delete an invoice payment. Returns a 200 OK response code if the call succeeded.
         */
        delete: operations["deleteInvoicePayment"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all projects
         * @description Returns a list of your projects. The projects are returned sorted by creation date, with the most recently created projects appearing first.
         *
         *     The response contains an object with a projects property that contains an array of up to per_page projects. Each entry in the array is a separate project object. If no more projects are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your projects.
         */
        get: operations["listProjects"];
        put?: never;
        /**
         * Create a project
         * @description Creates a new project object. Returns a project object and a 201 Created response code if the call succeeded.
         */
        post: operations["createProject"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a project
         * @description Retrieves the project with the given ID. Returns a project object and a 200 OK response code if a valid identifier was provided.
         */
        get: operations["retrieveProject"];
        put?: never;
        post?: never;
        /**
         * Delete a project
         * @description Deletes a project and any time entries or expenses tracked to it.
         *     However, invoices associated with the project will not be deleted.
         *     If you don’t want the project’s time entries and expenses to be deleted, you should archive the project instead.
         */
        delete: operations["deleteProject"];
        options?: never;
        head?: never;
        /**
         * Update a project
         * @description Updates the specific project by setting the values of the parameters passed. Any parameters not provided will be left unchanged. Returns a project object and a 200 OK response code if the call succeeded.
         */
        patch: operations["updateProject"];
        trace?: never;
    };
    "/projects/{projectId}/task_assignments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all task assignments for a specific project
         * @description Returns a list of your task assignments for the project identified by PROJECT_ID. The task assignments are returned sorted by creation date, with the most recently created task assignments appearing first.
         *
         *     The response contains an object with a task_assignments property that contains an array of up to per_page task assignments. Each entry in the array is a separate task assignment object. If no more task assignments are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your task assignments.
         */
        get: operations["listTaskAssignmentsForSpecificProject"];
        put?: never;
        /**
         * Create a task assignment
         * @description Creates a new task assignment object. Returns a task assignment object and a 201 Created response code if the call succeeded.
         */
        post: operations["createTaskAssignment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/task_assignments/{taskAssignmentId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a task assignment
         * @description Retrieves the task assignment with the given ID. Returns a task assignment object and a 200 OK response code if a valid identifier was provided.
         */
        get: operations["retrieveTaskAssignment"];
        put?: never;
        post?: never;
        /**
         * Delete a task assignment
         * @description Delete a task assignment. Deleting a task assignment is only possible if it has no time entries associated with it. Returns a 200 OK response code if the call succeeded.
         */
        delete: operations["deleteTaskAssignment"];
        options?: never;
        head?: never;
        /**
         * Update a task assignment
         * @description Updates the specific task assignment by setting the values of the parameters passed. Any parameters not provided will be left unchanged. Returns a task assignment object and a 200 OK response code if the call succeeded.
         */
        patch: operations["updateTaskAssignment"];
        trace?: never;
    };
    "/projects/{projectId}/user_assignments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all user assignments for a specific project
         * @description Returns a list of user assignments for the project identified by PROJECT_ID. The user assignments are returned sorted by creation date, with the most recently created user assignments appearing first.
         *
         *     The response contains an object with a user_assignments property that contains an array of up to per_page user assignments. Each entry in the array is a separate user assignment object. If no more user assignments are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your user assignments.
         */
        get: operations["listUserAssignmentsForSpecificProject"];
        put?: never;
        /**
         * Create a user assignment
         * @description Creates a new user assignment object. Returns a user assignment object and a 201 Created response code if the call succeeded.
         */
        post: operations["createUserAssignment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/user_assignments/{userAssignmentId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a user assignment
         * @description Retrieves the user assignment with the given ID. Returns a user assignment object and a 200 OK response code if a valid identifier was provided.
         */
        get: operations["retrieveUserAssignment"];
        put?: never;
        post?: never;
        /**
         * Delete a user assignment
         * @description Delete a user assignment. Deleting a user assignment is only possible if it has no time entries or expenses associated with it. Returns a 200 OK response code if the call succeeded.
         */
        delete: operations["deleteUserAssignment"];
        options?: never;
        head?: never;
        /**
         * Update a user assignment
         * @description Updates the specific user assignment by setting the values of the parameters passed. Any parameters not provided will be left unchanged. Returns a user assignment object and a 200 OK response code if the call succeeded.
         */
        patch: operations["updateUserAssignment"];
        trace?: never;
    };
    "/reports/expenses/categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Expense Categories Report */
        get: operations["expenseCategoriesReport"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/reports/expenses/clients": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Clients Report */
        get: operations["clientsExpensesReport"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/reports/expenses/projects": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Projects Report */
        get: operations["projectsExpensesReport"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/reports/expenses/team": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Team Report */
        get: operations["teamExpensesReport"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/reports/project_budget": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Project Budget Report
         * @description The response contains an object with a results property that contains an array of up to per_page results. Each entry in the array is a separate result object. If no more results are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your results.
         */
        get: operations["projectBudgetReport"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/reports/time/clients": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Clients Report */
        get: operations["clientsTimeReport"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/reports/time/projects": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Projects Report */
        get: operations["projectsTimeReport"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/reports/time/tasks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Tasks Report */
        get: operations["tasksReport"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/reports/time/team": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Team Report */
        get: operations["teamTimeReport"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/reports/uninvoiced": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Uninvoiced Report
         * @description The response contains an object with a results property that contains an array of up to per_page results. Each entry in the array is a separate result object. If no more results are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your results.
         *
         *     Note: Each request requires both the from and to parameters to be supplied in the URL’s query string. The timeframe supplied cannot exceed 1 year (365 days).
         */
        get: operations["uninvoicedReport"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/roles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all roles
         * @description Returns a list of roles in the account. The roles are returned sorted by creation date, with the most recently created roles appearing first.
         *
         *     The response contains an object with a roles property that contains an array of up to per_page roles. Each entry in the array is a separate role object. If no more roles are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your roles.
         */
        get: operations["listRoles"];
        put?: never;
        /**
         * Create a role
         * @description Creates a new role object. Returns a role object and a 201 Created response code if the call succeeded.
         */
        post: operations["createRole"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/roles/{roleId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a role
         * @description Retrieves the role with the given ID. Returns a role object and a 200 OK response code if a valid identifier was provided.
         */
        get: operations["retrieveRole"];
        put?: never;
        post?: never;
        /**
         * Delete a role
         * @description Delete a role. Deleting a role will unlink it from any users it was assigned to. Returns a 200 OK response code if the call succeeded.
         */
        delete: operations["deleteRole"];
        options?: never;
        head?: never;
        /**
         * Update a role
         * @description Updates the specific role by setting the values of the parameters passed. Any parameters not provided will be left unchanged. Returns a role object and a 200 OK response code if the call succeeded.
         */
        patch: operations["updateRole"];
        trace?: never;
    };
    "/task_assignments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all task assignments
         * @description Returns a list of your task assignments. The task assignments are returned sorted by creation date, with the most recently created task assignments appearing first.
         *
         *     The response contains an object with a task_assignments property that contains an array of up to per_page task assignments. Each entry in the array is a separate task assignment object. If no more task assignments are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your task assignments.
         */
        get: operations["listTaskAssignments"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tasks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all tasks
         * @description Returns a list of your tasks. The tasks are returned sorted by creation date, with the most recently created tasks appearing first.
         *
         *     The response contains an object with a tasks property that contains an array of up to per_page tasks. Each entry in the array is a separate task object. If no more tasks are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your tasks.
         */
        get: operations["listTasks"];
        put?: never;
        /**
         * Create a task
         * @description Creates a new task object. Returns a task object and a 201 Created response code if the call succeeded.
         */
        post: operations["createTask"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tasks/{taskId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a task
         * @description Retrieves the task with the given ID. Returns a task object and a 200 OK response code if a valid identifier was provided.
         */
        get: operations["retrieveTask"];
        put?: never;
        post?: never;
        /**
         * Delete a task
         * @description Delete a task. Deleting a task is only possible if it has no time entries associated with it. Returns a 200 OK response code if the call succeeded.
         */
        delete: operations["deleteTask"];
        options?: never;
        head?: never;
        /**
         * Update a task
         * @description Updates the specific task by setting the values of the parameters passed. Any parameters not provided will be left unchanged. Returns a task object and a 200 OK response code if the call succeeded.
         */
        patch: operations["updateTask"];
        trace?: never;
    };
    "/time_entries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all time entries
         * @description Returns a list of time entries. The time entries are returned sorted by spent_date date. At this time, the sort option can’t be customized.
         *
         *     The response contains an object with a time_entries property that contains an array of up to per_page time entries. Each entry in the array is a separate time entry object. If no more time entries are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your time entries.
         */
        get: operations["listTimeEntries"];
        put?: never;
        /**
         * Create a time entry
         * @description Creates a new time entry object. Returns a time entry object and a 201 Created response code if the call succeeded.
         *
         *     You should only use this method to create time entries when your account is configured to track time via duration. You can verify this by visiting the Settings page in your Harvest account or by checking if wants_timestamp_timers is false in the Company API.
         */
        post: operations["createTimeEntry"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/time_entries/{timeEntryId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a time entry
         * @description Retrieves the time entry with the given ID. Returns a time entry object and a 200 OK response code if a valid identifier was provided.
         */
        get: operations["retrieveTimeEntry"];
        put?: never;
        post?: never;
        /**
         * Delete a time entry
         * @description Delete a time entry. Deleting a time entry is only possible if it’s not closed and the associated project and task haven’t been archived.  However, Admins can delete closed entries. Returns a 200 OK response code if the call succeeded.
         */
        delete: operations["deleteTimeEntry"];
        options?: never;
        head?: never;
        /**
         * Update a time entry
         * @description Updates the specific time entry by setting the values of the parameters passed. Any parameters not provided will be left unchanged. Returns a time entry object and a 200 OK response code if the call succeeded.
         */
        patch: operations["updateTimeEntry"];
        trace?: never;
    };
    "/time_entries/{timeEntryId}/external_reference": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Delete a time entry’s external reference
         * @description Delete a time entry’s external reference. Returns a 200 OK response code if the call succeeded.
         */
        delete: operations["deleteTimeEntryExternalReference"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/time_entries/{timeEntryId}/restart": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Restart a stopped time entry
         * @description Restarting a time entry is only possible if it isn’t currently running. Returns a 200 OK response code if the call succeeded.
         */
        patch: operations["restartStoppedTimeEntry"];
        trace?: never;
    };
    "/time_entries/{timeEntryId}/stop": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Stop a running time entry
         * @description Stopping a time entry is only possible if it’s currently running. Returns a 200 OK response code if the call succeeded.
         */
        patch: operations["stopRunningTimeEntry"];
        trace?: never;
    };
    "/user_assignments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all user assignments
         * @description Returns a list of your projects user assignments, active and archived. The user assignments are returned sorted by creation date, with the most recently created user assignments appearing first.
         *
         *     The response contains an object with a user_assignments property that contains an array of up to per_page user assignments. Each entry in the array is a separate user assignment object. If no more user assignments are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your user assignments.
         */
        get: operations["listUserAssignments"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all users
         * @description Returns a list of your users. The users are returned sorted by creation date, with the most recently created users appearing first.
         *
         *     The response contains an object with a users property that contains an array of up to per_page users. Each entry in the array is a separate user object. If no more users are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your users.
         */
        get: operations["listUsers"];
        put?: never;
        /**
         * Create a user
         * @description Creates a new user object and sends an invitation email to the address specified in the email parameter. Returns a user object and a 201 Created response code if the call succeeded.
         */
        post: operations["createUser"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve the currently authenticated user
         * @description Retrieves the currently authenticated user. Returns a user object and a 200 OK response code.
         */
        get: operations["retrieveTheCurrentlyAuthenticatedUser"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me/project_assignments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List active project assignments for the currently authenticated user
         * @description Returns a list of your active project assignments for the currently authenticated user. The project assignments are returned sorted by creation date, with the most recently created project assignments appearing first.
         *
         *     The response contains an object with a project_assignments property that contains an array of up to per_page project assignments. Each entry in the array is a separate project assignment object. If no more project assignments are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your project assignments.
         */
        get: operations["listActiveProjectAssignmentsForTheCurrentlyAuthenticatedUser"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a user
         * @description Retrieves the user with the given ID. Returns a user object and a 200 OK response code if a valid identifier was provided.
         */
        get: operations["retrieveUser"];
        put?: never;
        post?: never;
        /**
         * Delete a user
         * @description Delete a user. Deleting a user is only possible if they have no time entries or expenses associated with them. Returns a 200 OK response code if the call succeeded.
         */
        delete: operations["deleteUser"];
        options?: never;
        head?: never;
        /**
         * Update a user
         * @description Updates the specific user by setting the values of the parameters passed. Any parameters not provided will be left unchanged. Returns a user object and a 200 OK response code if the call succeeded.
         */
        patch: operations["updateUser"];
        trace?: never;
    };
    "/users/{userId}/billable_rates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all billable rates for a specific user
         * @description Returns a list of billable rates for the user identified by USER_ID. The billable rates are returned sorted by start_date, with the oldest starting billable rates appearing first.
         *
         *     The response contains an object with a billable_rates property that contains an array of up to per_page billable rates. Each entry in the array is a separate billable rate object. If no more billable rates are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your billable rates.
         */
        get: operations["listBillableRatesForSpecificUser"];
        put?: never;
        /**
         * Create a billable rate
         * @description Creates a new billable rate object. Returns a billable rate object and a 201 Created response code if the call succeeded.
         *
         *
         *       Creating a billable rate with no start_date will replace a user’s existing rate(s).
         *       Creating a billable rate with a start_date that is before a user’s existing rate(s) will replace those billable rates with the new one.
         */
        post: operations["createBillableRate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{userId}/billable_rates/{billableRateId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a billable rate
         * @description Retrieves the billable rate with the given ID. Returns a billable rate object and a 200 OK response code if a valid identifier was provided.
         */
        get: operations["retrieveBillableRate"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{userId}/cost_rates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all cost rates for a specific user
         * @description Returns a list of cost rates for the user identified by USER_ID. The cost rates are returned sorted by start_date, with the oldest starting cost rates appearing first.
         *
         *     The response contains an object with a cost_rates property that contains an array of up to per_page cost rates. Each entry in the array is a separate cost rate object. If no more cost rates are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your cost rates.
         */
        get: operations["listCostRatesForSpecificUser"];
        put?: never;
        /**
         * Create a cost rate
         * @description Creates a new cost rate object. Returns a cost rate object and a 201 Created response code if the call succeeded.
         *
         *
         *       Creating a cost rate with no start_date will replace a user’s existing rate(s).
         *       Creating a cost rate with a start_date that is before a user’s existing rate(s) will replace those cost rates with the new one.
         */
        post: operations["createCostRate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{userId}/cost_rates/{costRateId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a cost rate
         * @description Retrieves the cost rate with the given ID. Returns a cost rate object and a 200 OK response code if a valid identifier was provided.
         */
        get: operations["retrieveCostRate"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{userId}/project_assignments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List active project assignments
         * @description Returns a list of active project assignments for the user identified by USER_ID. The project assignments are returned sorted by creation date, with the most recently created project assignments appearing first.
         *
         *     The response contains an object with a project_assignments property that contains an array of up to per_page project assignments. Each entry in the array is a separate project assignment object. If no more project assignments are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your project assignments.
         */
        get: operations["listActiveProjectAssignments"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{userId}/teammates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all assigned teammates for a specific user
         * @description Returns a list of assigned teammates for the user identified by USER_ID. The USER_ID must belong to a user that is a Manager, if not, a 422 Unprocessable Entity status code will be returned.
         *
         *     The response contains an object with a teammates property that contains an array of up to per_page teammates. Each entry in the array is a separate teammate object. If no more teammates are available, the resulting array will be empty. Several additional pagination properties are included in the response to simplify paginating your teammates.
         */
        get: operations["listAssignedTeammatesForSpecificUser"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Update a user’s assigned teammates
         * @description Updates the the assigned teammates for a specific user. Returns list of assigned teammates and a 200 OK response code if the call succeeded. The USER_ID must belong to a user that is a Manager, if not, a 422 Unprocessable Entity status code will be returned.
         *
         *     Adding teammates for the first time will add the people_manager access role to the Manager. Any IDs not included in the teammate_ids that are currently assigned will be unassigned from the Manager. Use an empty array to unassign all users. This will also remove the people_manager access role from the Manager.
         */
        patch: operations["updateUserAssignedTeammates"];
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        Contact: {
            /**
             * Format: int32
             * @description Unique ID for the contact.
             */
            id?: number | null;
            /** @description An object containing the contact’s client id and name. */
            client?: {
                id?: number | null;
                name?: string | null;
            } | null;
            /** @description The title of the contact. */
            title?: string | null;
            /** @description The first name of the contact. */
            first_name?: string | null;
            /** @description The last name of the contact. */
            last_name?: string | null;
            /**
             * Format: email
             * @description The contact’s email address.
             */
            email?: string | null;
            /** @description The contact’s office phone number. */
            phone_office?: string | null;
            /** @description The contact’s mobile phone number. */
            phone_mobile?: string | null;
            /** @description The contact’s fax number. */
            fax?: string | null;
            /**
             * Format: date-time
             * @description Date and time the contact was created.
             */
            created_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the contact was last updated.
             */
            updated_at?: string | null;
        };
        Client: {
            /**
             * Format: int32
             * @description Unique ID for the client.
             */
            id?: number | null;
            /** @description A textual description of the client. */
            name?: string | null;
            /** @description Whether the client is active or archived. */
            is_active?: boolean | null;
            /** @description The physical address for the client. */
            address?: string | null;
            /** @description Used to build a URL to your client’s invoice dashboard:https://{ACCOUNT_SUBDOMAIN}.harvestapp.com/client/statements/{STATEMENT_KEY} */
            statement_key?: string | null;
            /** @description The currency code associated with this client. */
            currency?: string | null;
            /**
             * Format: date-time
             * @description Date and time the client was created.
             */
            created_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the client was last updated.
             */
            updated_at?: string | null;
        };
        Company: {
            /** @description The Harvest URL for the company. */
            base_uri?: string | null;
            /** @description The Harvest domain for the company. */
            full_domain?: string | null;
            /** @description The name of the company. */
            name?: string | null;
            /** @description Whether the company is active or archived. */
            is_active?: boolean | null;
            /** @description The weekday used as the start of the week. Returns one of: Saturday, Sunday, or Monday. */
            week_start_day?: string | null;
            /** @description Whether time is tracked via duration or start and end times. */
            wants_timestamp_timers?: boolean | null;
            /** @description The format used to display time in Harvest. Returns either decimal or hours_minutes. */
            time_format?: string | null;
            /** @description The format used to display date in Harvest. Returns one of: %m/%d/%Y, %d/%m/%Y, %Y-%m-%d, %d.%m.%Y,.%Y.%m.%d or %Y/%m/%d. */
            date_format?: string | null;
            /** @description The type of plan the company is on. Examples: trial, free, or simple-v4 */
            plan_type?: string | null;
            /** @description Used to represent whether the company is using a 12-hour or 24-hour clock. Returns either 12h or 24h. */
            clock?: string | null;
            /** @description How to display the currency code when formatting currency. Returns one of: iso_code_none, iso_code_before, or iso_code_after. */
            currency_code_display?: string | null;
            /** @description How to display the currency symbol when formatting currency. Returns one of: symbol_none, symbol_before, or symbol_after. */
            currency_symbol_display?: string | null;
            /** @description Symbol used when formatting decimals. */
            decimal_symbol?: string | null;
            /** @description Separator used when formatting numbers. */
            thousands_separator?: string | null;
            /** @description The color scheme being used in the Harvest web client. */
            color_scheme?: string | null;
            /**
             * Format: int32
             * @description The weekly capacity in seconds.
             */
            weekly_capacity?: number | null;
            /** @description Whether the expense module is enabled. */
            expense_feature?: boolean | null;
            /** @description Whether the invoice module is enabled. */
            invoice_feature?: boolean | null;
            /** @description Whether the estimate module is enabled. */
            estimate_feature?: boolean | null;
            /** @description Whether the approval module is enabled. */
            approval_feature?: boolean | null;
            /** @description Whether the team module is enabled. */
            team_feature?: boolean | null;
        };
        InvoiceMessage: {
            /**
             * Format: int32
             * @description Unique ID for the message.
             */
            id?: number | null;
            /** @description Name of the user that created the message. */
            sent_by?: string | null;
            /** @description Email of the user that created the message. */
            sent_by_email?: string | null;
            /** @description Name of the user that the message was sent from. */
            sent_from?: string | null;
            /** @description Email of the user that message was sent from. */
            sent_from_email?: string | null;
            /** @description Array of invoice message recipients. */
            recipients?: components["schemas"]["InvoiceMessageRecipient"][] | null;
            /** @description The message subject. */
            subject?: string | null;
            /** @description The message body. */
            body?: string | null;
            /**
             * @deprecated
             * @description DEPRECATED This will be true when payment_options are assigned to the invoice and false when there are no payment_options.
             */
            include_link_to_client_invoice?: boolean | null;
            /** @description Whether to attach the invoice PDF to the message email. */
            attach_pdf?: boolean | null;
            /** @description Whether to email a copy of the message to the current user. */
            send_me_a_copy?: boolean | null;
            /** @description Whether this is a thank you message. */
            thank_you?: boolean | null;
            /** @description The type of invoice event that occurred with the message: close, draft, re-open, or send (marked the invoice as sent). If event_type was omitted in the request, a null value is returned, meaning the invoice was sent. */
            event_type?: string | null;
            /** @description Whether this is a reminder message. */
            reminder?: boolean | null;
            /**
             * Format: date
             * @description The date the reminder email will be sent.
             */
            send_reminder_on?: string | null;
            /**
             * Format: date-time
             * @description Date and time the message was created.
             */
            created_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the message was last updated.
             */
            updated_at?: string | null;
        };
        InvoiceMessageRecipient: {
            /** @description Name of the message recipient. */
            name?: string | null;
            /**
             * Format: email
             * @description Email of the message recipient.
             */
            email?: string | null;
        };
        InvoicePayment: {
            /**
             * Format: int32
             * @description Unique ID for the payment.
             */
            id?: number | null;
            /**
             * Format: float
             * @description The amount of the payment.
             */
            amount?: number | null;
            /**
             * Format: date-time
             * @description Date and time the payment was made.
             */
            paid_at?: string | null;
            /**
             * Format: date
             * @description Date the payment was made.
             */
            paid_date?: string | null;
            /** @description The name of the person who recorded the payment. */
            recorded_by?: string | null;
            /** @description The email of the person who recorded the payment. */
            recorded_by_email?: string | null;
            /** @description Any notes associated with the payment. */
            notes?: string | null;
            /** @description Either the card authorization or PayPal transaction ID. */
            transaction_id?: string | null;
            /** @description The payment gateway id and name used to process the payment. */
            payment_gateway?: {
                id?: number | null;
                name?: string | null;
            } | null;
            /**
             * Format: date-time
             * @description Date and time the payment was recorded.
             */
            created_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the payment was last updated.
             */
            updated_at?: string | null;
        };
        Invoice: {
            /**
             * Format: int32
             * @description Unique ID for the invoice.
             */
            id?: number | null;
            /** @description An object containing invoice’s client id and name. */
            client?: {
                id?: number | null;
                name?: string | null;
            } | null;
            /** @description Array of invoice line items. */
            line_items?: components["schemas"]["InvoiceLineItem"][] | null;
            /** @description An object containing the associated estimate’s id. */
            estimate?: {
                id?: number | null;
            } | null;
            /** @description An object containing the associated retainer’s id. */
            retainer?: {
                id?: number | null;
            } | null;
            /** @description An object containing the id and name of the person that created the invoice. */
            creator?: {
                id?: number | null;
                name?: string | null;
            } | null;
            /** @description Used to build a URL to the public web invoice for your client by adding /client/invoices/{CLIENT_KEY} to your account URL https://{SUBDOMAIN}.harvestapp.com/ Note: you can also add .pdf to the end of this URL to access a PDF version of the invoice. */
            client_key?: string | null;
            /** @description If no value is set, the number will be automatically generated. */
            number?: string | null;
            /** @description The purchase order number. */
            purchase_order?: string | null;
            /**
             * Format: float
             * @description The total amount for the invoice, including any discounts and taxes.
             */
            amount?: number | null;
            /**
             * Format: float
             * @description The total amount due at this time for this invoice.
             */
            due_amount?: number | null;
            /**
             * Format: float
             * @description This percentage is applied to the subtotal, including line items and discounts.
             */
            tax?: number | null;
            /**
             * Format: float
             * @description The first amount of tax included, calculated from tax. If no tax is defined, this value will be null.
             */
            tax_amount?: number | null;
            /**
             * Format: float
             * @description This percentage is applied to the subtotal, including line items and discounts.
             */
            tax2?: number | null;
            /**
             * Format: float
             * @description The amount calculated from tax2.
             */
            tax2_amount?: number | null;
            /**
             * Format: float
             * @description This percentage is subtracted from the subtotal.
             */
            discount?: number | null;
            /**
             * Format: float
             * @description The amount calculated from discount.
             */
            discount_amount?: number | null;
            /** @description The invoice subject. */
            subject?: string | null;
            /** @description Any additional notes included on the invoice. */
            notes?: string | null;
            /** @description The currency code associated with this invoice. */
            currency?: string | null;
            /** @description The current state of the invoice: draft, open, paid, or closed. */
            state?: string | null;
            /**
             * Format: date
             * @description Start of the period during which time entries were added to this invoice.
             */
            period_start?: string | null;
            /**
             * Format: date
             * @description End of the period during which time entries were added to this invoice.
             */
            period_end?: string | null;
            /**
             * Format: date
             * @description Date the invoice was issued.
             */
            issue_date?: string | null;
            /**
             * Format: date
             * @description Date the invoice is due.
             */
            due_date?: string | null;
            /** @description The timeframe in which the invoice should be paid. Options: upon receipt, net 15, net 30, net 45, net 60, or custom. */
            payment_term?: string | null;
            /** @description The list of payment options enabled for the invoice. Options: [ach, credit_card, paypal] */
            payment_options?: ("ach" | "credit_card" | "paypal")[] | null;
            /**
             * Format: date-time
             * @description Date and time the invoice was sent.
             */
            sent_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the invoice was paid.
             */
            paid_at?: string | null;
            /**
             * Format: date
             * @description Date the invoice was paid.
             */
            paid_date?: string | null;
            /**
             * Format: date-time
             * @description Date and time the invoice was closed.
             */
            closed_at?: string | null;
            /**
             * Format: int32
             * @description Unique ID of the associated recurring invoice.
             */
            recurring_invoice_id?: number | null;
            /**
             * Format: date-time
             * @description Date and time the invoice was created.
             */
            created_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the invoice was last updated.
             */
            updated_at?: string | null;
        };
        InvoiceLineItem: {
            /**
             * Format: int32
             * @description Unique ID for the line item.
             */
            id?: number | null;
            /** @description An object containing the associated project’s id, name, and code. */
            project?: {
                id?: number | null;
                name?: string | null;
                code?: string | null;
            } | null;
            /** @description The name of an invoice item category. */
            kind?: string | null;
            /** @description Text description of the line item. */
            description?: string | null;
            /**
             * Format: float
             * @description The unit quantity of the item.
             */
            quantity?: number | null;
            /**
             * Format: float
             * @description The individual price per unit.
             */
            unit_price?: number | null;
            /**
             * Format: float
             * @description The line item subtotal (quantity * unit_price).
             */
            amount?: number | null;
            /** @description Whether the invoice’s tax percentage applies to this line item. */
            taxed?: boolean | null;
            /** @description Whether the invoice’s tax2 percentage applies to this line item. */
            taxed2?: boolean | null;
        };
        InvoiceItemCategory: {
            /**
             * Format: int32
             * @description Unique ID for the invoice item category.
             */
            id?: number | null;
            /** @description The name of the invoice item category. */
            name?: string | null;
            /** @description Whether this invoice item category is used for billable hours when generating an invoice. */
            use_as_service?: boolean | null;
            /** @description Whether this invoice item category is used for expenses when generating an invoice. */
            use_as_expense?: boolean | null;
            /**
             * Format: date-time
             * @description Date and time the invoice item category was created.
             */
            created_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the invoice item category was last updated.
             */
            updated_at?: string | null;
        };
        EstimateMessage: {
            /**
             * Format: int32
             * @description Unique ID for the message.
             */
            id?: number | null;
            /** @description Name of the user that created the message. */
            sent_by?: string | null;
            /** @description Email of the user that created the message. */
            sent_by_email?: string | null;
            /** @description Name of the user that the message was sent from. */
            sent_from?: string | null;
            /** @description Email of the user that message was sent from. */
            sent_from_email?: string | null;
            /** @description Array of estimate message recipients. */
            recipients?: components["schemas"]["EstimateMessageRecipient"][] | null;
            /** @description The message subject. */
            subject?: string | null;
            /** @description The message body. */
            body?: string | null;
            /** @description Whether to email a copy of the message to the current user. */
            send_me_a_copy?: boolean | null;
            /** @description The type of estimate event that occurred with the message: send, accept, decline, re-open, view, or invoice. */
            event_type?: string | null;
            /**
             * Format: date-time
             * @description Date and time the message was created.
             */
            created_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the message was last updated.
             */
            updated_at?: string | null;
        };
        EstimateMessageRecipient: {
            /** @description Name of the message recipient. */
            name?: string | null;
            /**
             * Format: email
             * @description Email of the message recipient.
             */
            email?: string | null;
        };
        Estimate: {
            /**
             * Format: int32
             * @description Unique ID for the estimate.
             */
            id?: number | null;
            /** @description An object containing estimate’s client id and name. */
            client?: {
                id?: number | null;
                name?: string | null;
            } | null;
            /** @description Array of estimate line items. */
            line_items?: components["schemas"]["EstimateLineItem"][] | null;
            /** @description An object containing the id and name of the person that created the estimate. */
            creator?: {
                id?: number | null;
                name?: string | null;
            } | null;
            /** @description Used to build a URL to the public web invoice for your client:https://{ACCOUNT_SUBDOMAIN}.harvestapp.com/client/estimates/abc123456 */
            client_key?: string | null;
            /** @description If no value is set, the number will be automatically generated. */
            number?: string | null;
            /** @description The purchase order number. */
            purchase_order?: string | null;
            /**
             * Format: float
             * @description The total amount for the estimate, including any discounts and taxes.
             */
            amount?: number | null;
            /**
             * Format: float
             * @description This percentage is applied to the subtotal, including line items and discounts.
             */
            tax?: number | null;
            /**
             * Format: float
             * @description The first amount of tax included, calculated from tax. If no tax is defined, this value will be null.
             */
            tax_amount?: number | null;
            /**
             * Format: float
             * @description This percentage is applied to the subtotal, including line items and discounts.
             */
            tax2?: number | null;
            /**
             * Format: float
             * @description The amount calculated from tax2.
             */
            tax2_amount?: number | null;
            /**
             * Format: float
             * @description This percentage is subtracted from the subtotal.
             */
            discount?: number | null;
            /**
             * Format: float
             * @description The amount calculated from discount.
             */
            discount_amount?: number | null;
            /** @description The estimate subject. */
            subject?: string | null;
            /** @description Any additional notes included on the estimate. */
            notes?: string | null;
            /** @description The currency code associated with this estimate. */
            currency?: string | null;
            /** @description The current state of the estimate: draft, sent, accepted, or declined. */
            state?: string | null;
            /**
             * Format: date
             * @description Date the estimate was issued.
             */
            issue_date?: string | null;
            /**
             * Format: date-time
             * @description Date and time the estimate was sent.
             */
            sent_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the estimate was accepted.
             */
            accepted_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the estimate was declined.
             */
            declined_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the estimate was created.
             */
            created_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the estimate was last updated.
             */
            updated_at?: string | null;
        };
        EstimateLineItem: {
            /**
             * Format: int32
             * @description Unique ID for the line item.
             */
            id?: number | null;
            /** @description The name of an estimate item category. */
            kind?: string | null;
            /** @description Text description of the line item. */
            description?: string | null;
            /**
             * Format: float
             * @description The unit quantity of the item.
             */
            quantity?: number | null;
            /**
             * Format: float
             * @description The individual price per unit.
             */
            unit_price?: number | null;
            /**
             * Format: float
             * @description The line item subtotal (quantity * unit_price).
             */
            amount?: number | null;
            /** @description Whether the estimate’s tax percentage applies to this line item. */
            taxed?: boolean | null;
            /** @description Whether the estimate’s tax2 percentage applies to this line item. */
            taxed2?: boolean | null;
        };
        EstimateItemCategory: {
            /**
             * Format: int32
             * @description Unique ID for the estimate item category.
             */
            id?: number | null;
            /** @description The name of the estimate item category. */
            name?: string | null;
            /**
             * Format: date-time
             * @description Date and time the estimate item category was created.
             */
            created_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the estimate item category was last updated.
             */
            updated_at?: string | null;
        };
        Expense: {
            /**
             * Format: int32
             * @description Unique ID for the expense.
             */
            id?: number | null;
            /** @description An object containing the expense’s client id, name, and currency. */
            client?: {
                id?: number | null;
                name?: string | null;
                currency?: string | null;
            } | null;
            /** @description An object containing the expense’s project id, name, and code. */
            project?: {
                id?: number | null;
                name?: string | null;
                code?: string | null;
            } | null;
            /** @description An object containing the expense’s expense category id, name, unit_price, and unit_name. */
            expense_category?: {
                id?: number | null;
                name?: string | null;
                unit_price?: string | null;
                unit_name?: string | null;
            } | null;
            /** @description An object containing the id and name of the user that recorded the expense. */
            user?: {
                id?: number | null;
                name?: string | null;
            } | null;
            /** @description A user assignment object of the user that recorded the expense. */
            user_assignment?: (components["schemas"]["UserAssignment"] | null) | null;
            /** @description An object containing the expense’s receipt URL and file name. */
            receipt?: {
                url?: string | null;
                file_name?: string | null;
                /** Format: int32 */
                file_size?: number | null;
                content_type?: string | null;
            } | null;
            /** @description Once the expense has been invoiced, this field will include the associated invoice’s id and number. */
            invoice?: {
                id?: number | null;
                number?: string | null;
            } | null;
            /** @description Textual notes used to describe the expense. */
            notes?: string | null;
            /**
             * Format: int32
             * @description The quantity of units used to calculate the total_cost of the expense.
             */
            units?: number | null;
            /**
             * Format: float
             * @description The total amount of the expense.
             */
            total_cost?: number | null;
            /** @description Whether the expense is billable or not. */
            billable?: boolean | null;
            /** @description Whether the expense has been approved or not. Deprecated, use approval_status instead. */
            is_closed?: boolean | null;
            /** @description The approval status of the expense. Possible values: “unsubmitted”, “submitted”, or “approved”. */
            approval_status?: string | null;
            /** @description Whether the expense has been been invoiced, approved, or the project or person related to the expense is archived. */
            is_locked?: boolean | null;
            /** @description Whether or not the expense has been marked as invoiced. */
            is_billed?: boolean | null;
            /** @description An explanation of why the expense has been locked. */
            locked_reason?: string | null;
            /**
             * Format: date
             * @description Date the expense occurred.
             */
            spent_date?: string | null;
            /**
             * Format: date-time
             * @description Date and time the expense was created.
             */
            created_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the expense was last updated.
             */
            updated_at?: string | null;
        };
        ExpenseCategory: {
            /**
             * Format: int32
             * @description Unique ID for the expense category.
             */
            id?: number | null;
            /** @description The name of the expense category. */
            name?: string | null;
            /** @description The unit name of the expense category. */
            unit_name?: string | null;
            /**
             * Format: float
             * @description The unit price of the expense category.
             */
            unit_price?: number | null;
            /** @description Whether the expense category is active or archived. */
            is_active?: boolean | null;
            /**
             * Format: date-time
             * @description Date and time the expense category was created.
             */
            created_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the expense category was last updated.
             */
            updated_at?: string | null;
        };
        Task: {
            /**
             * Format: int32
             * @description Unique ID for the task.
             */
            id?: number | null;
            /** @description The name of the task. */
            name?: string | null;
            /** @description Used in determining whether default tasks should be marked billable when creating a new project. */
            billable_by_default?: boolean | null;
            /**
             * Format: float
             * @description The hourly rate to use for this task when it is added to a project.
             */
            default_hourly_rate?: number | null;
            /** @description Whether this task should be automatically added to future projects. */
            is_default?: boolean | null;
            /** @description Whether this task is active or archived. */
            is_active?: boolean | null;
            /**
             * Format: date-time
             * @description Date and time the task was created.
             */
            created_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the task was last updated.
             */
            updated_at?: string | null;
        };
        TimeEntry: {
            /** @description Unique ID for the time entry. */
            id?: number | null;
            /**
             * Format: date
             * @description Date of the time entry.
             */
            spent_date?: string | null;
            /** @description An object containing the id and name of the associated user. */
            user?: {
                id?: number | null;
                name?: string | null;
            } | null;
            /** @description A user assignment object of the associated user. */
            user_assignment?: (components["schemas"]["UserAssignment"] | null) | null;
            /** @description An object containing the id and name of the associated client. */
            client?: {
                id?: number | null;
                name?: string | null;
            } | null;
            /** @description An object containing the id and name of the associated project. */
            project?: {
                id?: number | null;
                name?: string | null;
            } | null;
            /** @description An object containing the id and name of the associated task. */
            task?: {
                id?: number | null;
                name?: string | null;
            } | null;
            /** @description A task assignment object of the associated task. */
            task_assignment?: (components["schemas"]["TaskAssignment"] | null) | null;
            /** @description An object containing the id, group_id, account_id, permalink, service, and service_icon_url of the associated external reference. */
            external_reference?: {
                id?: string | null;
                group_id?: string | null;
                account_id?: string | null;
                permalink?: string | null;
                service?: string | null;
                service_icon_url?: string | null;
            } | null;
            /** @description Once the time entry has been invoiced, this field will include the associated invoice’s id and number. */
            invoice?: {
                id?: number | null;
                number?: string | null;
            } | null;
            /**
             * Format: float
             * @description Number of (decimal time) hours tracked in this time entry.
             */
            hours?: number | null;
            /**
             * Format: float
             * @description Number of (decimal time) hours already tracked in this time entry, before the timer was last started.
             */
            hours_without_timer?: number | null;
            /**
             * Format: float
             * @description Number of (decimal time) hours tracked in this time entry used in summary reports and invoices. This value is rounded according to the Time Rounding setting in your Preferences.
             */
            rounded_hours?: number | null;
            /** @description Notes attached to the time entry. */
            notes?: string | null;
            /** @description Whether or not the time entry has been locked. */
            is_locked?: boolean | null;
            /** @description Why the time entry has been locked. */
            locked_reason?: string | null;
            /** @description Whether or not the time entry has been approved via Timesheet Approval. Deprecated, use approval_status instead. */
            is_closed?: boolean | null;
            /** @description The approval status of the time entry. Possible values: “unsubmitted”, “submitted”, or “approved”. */
            approval_status?: string | null;
            /** @description Whether or not the time entry has been marked as invoiced. */
            is_billed?: boolean | null;
            /**
             * Format: date-time
             * @description Date and time the running timer was started (if tracking by duration). Use the ISO 8601 Format. Returns null for stopped timers.
             */
            timer_started_at?: string | null;
            /** @description Time the time entry was started (if tracking by start/end times). */
            started_time?: string | null;
            /** @description Time the time entry was ended (if tracking by start/end times). */
            ended_time?: string | null;
            /** @description Whether or not the time entry is currently running. */
            is_running?: boolean | null;
            /** @description Whether or not the time entry is billable. */
            billable?: boolean | null;
            /** @description Whether or not the time entry counts towards the project budget. */
            budgeted?: boolean | null;
            /**
             * Format: float
             * @description The billable rate for the time entry.
             */
            billable_rate?: number | null;
            /**
             * Format: float
             * @description The cost rate for the time entry.
             */
            cost_rate?: number | null;
            /**
             * Format: date-time
             * @description Date and time the time entry was created. Use the ISO 8601 Format.
             */
            created_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the time entry was last updated. Use the ISO 8601 Format.
             */
            updated_at?: string | null;
        };
        UserAssignment: {
            /**
             * Format: int32
             * @description Unique ID for the user assignment.
             */
            id?: number | null;
            /** @description An object containing the id, name, and code of the associated project. */
            project?: {
                id?: number | null;
                name?: string | null;
                code?: string | null;
            } | null;
            /** @description An object containing the id and name of the associated user. */
            user?: {
                id?: number | null;
                name?: string | null;
            } | null;
            /** @description Whether the user assignment is active or archived. */
            is_active?: boolean | null;
            /** @description Determines if the user has Project Manager permissions for the project. */
            is_project_manager?: boolean | null;
            /** @description Determines which billable rate(s) will be used on the project for this user when bill_by is People. When true, the project will use the user’s default billable rates. When false, the project will use the custom rate defined on this user assignment. */
            use_default_rates?: boolean | null;
            /**
             * Format: float
             * @description Custom rate used when the project’s bill_by is People and use_default_rates is false.
             */
            hourly_rate?: number | null;
            /**
             * Format: float
             * @description Budget used when the project’s budget_by is person.
             */
            budget?: number | null;
            /**
             * Format: date-time
             * @description Date and time the user assignment was created.
             */
            created_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the user assignment was last updated.
             */
            updated_at?: string | null;
        };
        TaskAssignment: {
            /**
             * Format: int32
             * @description Unique ID for the task assignment.
             */
            id?: number | null;
            /** @description An object containing the id, name, and code of the associated project. */
            project?: {
                id?: number | null;
                name?: string | null;
                code?: string | null;
            } | null;
            /** @description An object containing the id and name of the associated task. */
            task?: {
                id?: number | null;
                name?: string | null;
            } | null;
            /** @description Whether the task assignment is active or archived. */
            is_active?: boolean | null;
            /** @description Whether the task assignment is billable or not. For example: if set to true, all time tracked on this project for the associated task will be marked as billable. */
            billable?: boolean | null;
            /**
             * Format: float
             * @description Rate used when the project’s bill_by is Tasks.
             */
            hourly_rate?: number | null;
            /**
             * Format: float
             * @description Budget used when the project’s budget_by is task or task_fees.
             */
            budget?: number | null;
            /**
             * Format: date-time
             * @description Date and time the task assignment was created.
             */
            created_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the task assignment was last updated.
             */
            updated_at?: string | null;
        };
        Project: {
            /**
             * Format: int32
             * @description Unique ID for the project.
             */
            id?: number | null;
            /** @description An object containing the project’s client id, name, and currency. */
            client?: {
                id?: number | null;
                name?: string | null;
                currency?: string | null;
            } | null;
            /** @description Unique name for the project. */
            name?: string | null;
            /** @description The code associated with the project. */
            code?: string | null;
            /** @description Whether the project is active or archived. */
            is_active?: boolean | null;
            /** @description Whether the project is billable or not. */
            is_billable?: boolean | null;
            /** @description Whether the project is a fixed-fee project or not. */
            is_fixed_fee?: boolean | null;
            /** @description The method by which the project is invoiced. */
            bill_by?: string | null;
            /**
             * Format: float
             * @description Rate for projects billed by Project Hourly Rate.
             */
            hourly_rate?: number | null;
            /** @description The method by which the project is budgeted. */
            budget_by?: string | null;
            /** @description Option to have the budget reset every month. */
            budget_is_monthly?: boolean | null;
            /**
             * Format: float
             * @description The budget in hours for the project when budgeting by time.
             */
            budget?: number | null;
            /**
             * Format: float
             * @description The monetary budget for the project when budgeting by money.
             */
            cost_budget?: number | null;
            /** @description Option for budget of Total Project Fees projects to include tracked expenses. */
            cost_budget_include_expenses?: boolean | null;
            /** @description Whether Project Managers should be notified when the project goes over budget. */
            notify_when_over_budget?: boolean | null;
            /**
             * Format: float
             * @description Percentage value used to trigger over budget email alerts.
             */
            over_budget_notification_percentage?: number | null;
            /**
             * Format: date
             * @description Date of last over budget notification. If none have been sent, this will be null.
             */
            over_budget_notification_date?: string | null;
            /** @description Option to show project budget to all employees. Does not apply to Total Project Fee projects. */
            show_budget_to_all?: boolean | null;
            /**
             * Format: float
             * @description The amount you plan to invoice for the project. Only used by fixed-fee projects.
             */
            fee?: number | null;
            /** @description Project notes. */
            notes?: string | null;
            /**
             * Format: date
             * @description Date the project was started.
             */
            starts_on?: string | null;
            /**
             * Format: date
             * @description Date the project will end.
             */
            ends_on?: string | null;
            /**
             * Format: date-time
             * @description Date and time the project was created.
             */
            created_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the project was last updated.
             */
            updated_at?: string | null;
        };
        Role: {
            /**
             * Format: int32
             * @description Unique ID for the role.
             */
            id?: number | null;
            /** @description The name of the role. */
            name?: string | null;
            /** @description The IDs of the users assigned to this role. */
            user_ids?: number[] | null;
            /**
             * Format: date-time
             * @description Date and time the role was created.
             */
            created_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the role was last updated.
             */
            updated_at?: string | null;
        };
        Teammate: {
            /** @description Unique ID for the teammate */
            id?: number | null;
            /** @description The first name of the teammate */
            first_name?: string | null;
            /** @description The last name of the teammate */
            last_name?: string | null;
            /**
             * Format: email
             * @description The email of the teammate
             */
            email?: string | null;
        };
        BillableRate: {
            /**
             * Format: int32
             * @description Unique ID for the billable rate.
             */
            id?: number | null;
            /**
             * Format: float
             * @description The amount of the billable rate.
             */
            amount?: number | null;
            /**
             * Format: date
             * @description The date the billable rate is effective.
             */
            start_date?: string | null;
            /**
             * Format: date
             * @description The date the billable rate is no longer effective. This date is calculated by Harvest.
             */
            end_date?: string | null;
            /**
             * Format: date-time
             * @description Date and time the billable rate was created.
             */
            created_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the billable rate was last updated.
             */
            updated_at?: string | null;
        };
        CostRate: {
            /**
             * Format: int32
             * @description Unique ID for the cost rate.
             */
            id?: number | null;
            /**
             * Format: float
             * @description The amount of the cost rate.
             */
            amount?: number | null;
            /**
             * Format: date
             * @description The date the cost rate is effective.
             */
            start_date?: string | null;
            /**
             * Format: date
             * @description The date the cost rate is no longer effective. This date is calculated by Harvest.
             */
            end_date?: string | null;
            /**
             * Format: date-time
             * @description Date and time the cost rate was created.
             */
            created_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the cost rate was last updated.
             */
            updated_at?: string | null;
        };
        ProjectAssignment: {
            /**
             * Format: int32
             * @description Unique ID for the project assignment.
             */
            id?: number | null;
            /** @description Whether the project assignment is active or archived. */
            is_active?: boolean | null;
            /** @description Determines if the user has Project Manager permissions for the project. */
            is_project_manager?: boolean | null;
            /** @description Determines which billable rate(s) will be used on the project for this user when bill_by is People. When true, the project will use the user’s default billable rates. When false, the project will use the custom rate defined on this user assignment. */
            use_default_rates?: boolean | null;
            /**
             * Format: float
             * @description Custom rate used when the project’s bill_by is People and use_default_rates is false.
             */
            hourly_rate?: number | null;
            /**
             * Format: float
             * @description Budget used when the project’s budget_by is person.
             */
            budget?: number | null;
            /**
             * Format: date-time
             * @description Date and time the project assignment was created.
             */
            created_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the project assignment was last updated.
             */
            updated_at?: string | null;
            /** @description An object containing the assigned project id, name, and code. */
            project?: {
                id?: number | null;
                name?: string | null;
                code?: string | null;
            } | null;
            /** @description An object containing the project’s client id and name. */
            client?: {
                id?: number | null;
                name?: string | null;
            } | null;
            /** @description Array of task assignment objects associated with the project. */
            task_assignments?: components["schemas"]["TaskAssignment"][] | null;
        };
        User: {
            /**
             * Format: int32
             * @description Unique ID for the user.
             */
            id?: number | null;
            /** @description The first name of the user. */
            first_name?: string | null;
            /** @description The last name of the user. */
            last_name?: string | null;
            /**
             * Format: email
             * @description The email address of the user.
             */
            email?: string | null;
            /** @description The user’s telephone number. */
            telephone?: string | null;
            /** @description The user’s timezone. */
            timezone?: string | null;
            /** @description Whether the user should be automatically added to future projects. */
            has_access_to_all_future_projects?: boolean | null;
            /** @description Whether the user is a contractor or an employee. */
            is_contractor?: boolean | null;
            /** @description Whether the user is active or archived. */
            is_active?: boolean | null;
            /**
             * Format: int32
             * @description The number of hours per week this person is available to work in seconds, in half hour increments. For example, if a person’s capacity is 35 hours, the API will return 126000 seconds.
             */
            weekly_capacity?: number | null;
            /**
             * Format: float
             * @description The billable rate to use for this user when they are added to a project.
             */
            default_hourly_rate?: number | null;
            /**
             * Format: float
             * @description The cost rate to use for this user when calculating a project’s costs vs billable amount.
             */
            cost_rate?: number | null;
            /** @description Descriptive names of the business roles assigned to this person. They can be used for filtering reports, and have no effect in their permissions in Harvest. */
            roles?: string[] | null;
            /** @description Access role(s) that determine the user’s permissions in Harvest. Possible values: administrator, manager or member. Users with the manager role can additionally be granted one or more of these roles: project_creator, billable_rates_manager, managed_projects_invoice_drafter, managed_projects_invoice_manager, client_and_task_manager, time_and_expenses_manager, estimates_manager. */
            access_roles?: string[] | null;
            /** @description The URL to the user’s avatar image. */
            avatar_url?: string | null;
            /**
             * Format: date-time
             * @description Date and time the user was created.
             */
            created_at?: string | null;
            /**
             * Format: date-time
             * @description Date and time the user was last updated.
             */
            updated_at?: string | null;
        };
        ExpenseReportsResult: {
            /**
             * Format: int32
             * @description The ID of the client associated with the reported expenses. Only returned in the Client and Project reports.
             */
            client_id?: number | null;
            /** @description The name of the client associated with the reported expenses. Only returned in the Client and Project reports. */
            client_name?: string | null;
            /**
             * Format: int32
             * @description The ID of the project associated with the reported expenses. Only returned in the Client and Project reports.
             */
            project_id?: number | null;
            /** @description The name of the project associated with the reported expenses. Only returned in the Client and Project reports. */
            project_name?: string | null;
            /**
             * Format: int32
             * @description The ID of the expense category associated with the reported expenses. Only returned in the Expense Category report.
             */
            expense_category_id?: number | null;
            /** @description The name of the expense category associated with the reported expenses. Only returned in the Expense Category report. */
            expense_category_name?: string | null;
            /**
             * Format: int32
             * @description The ID of the user associated with the reported expenses. Only returned in the Team report.
             */
            user_id?: number | null;
            /** @description The name of the user associated with the reported expenses. Only returned in the Team report. */
            user_name?: string | null;
            /** @description The contractor status of the user associated with the reported expenses. Only returned in the Team report. */
            is_contractor?: boolean | null;
            /**
             * Format: float
             * @description The totaled cost for all expenses for the given timeframe, subject (client, project, expense category, or user), and currency.
             */
            total_amount?: number | null;
            /**
             * Format: float
             * @description The totaled cost for billable expenses for the given timeframe, subject (client, project, expense category, or user), and currency.
             */
            billable_amount?: number | null;
            /** @description The currency code associated with the expenses for this result. */
            currency?: string | null;
        };
        UninvoicedReportResult: {
            /**
             * Format: int32
             * @description The ID of the client associated with the reported hours and expenses.
             */
            client_id?: number | null;
            /** @description The name of the client associated with the reported hours and expenses. */
            client_name?: string | null;
            /**
             * Format: int32
             * @description The ID of the project associated with the reported hours and expenses.
             */
            project_id?: number | null;
            /** @description The name of the project associated with the reported hours and expenses. */
            project_name?: string | null;
            /** @description The currency code associated with the tracked hours for this result. */
            currency?: string | null;
            /**
             * Format: float
             * @description The total hours for the given timeframe and project. If Time Rounding is turned on, the hours will be rounded according to your settings.
             */
            total_hours?: number | null;
            /**
             * Format: float
             * @description The total hours for the given timeframe and project that have not been invoiced. If Time Rounding is turned on, the hours will be rounded according to your settings.
             */
            uninvoiced_hours?: number | null;
            /**
             * Format: float
             * @description The total amount for billable expenses for the timeframe and project that have not been invoiced.
             */
            uninvoiced_expenses?: number | null;
            /**
             * Format: float
             * @description The total amount (time and expenses) for the timeframe and project that have not been invoiced.
             */
            uninvoiced_amount?: number | null;
        };
        TimeReportsResult: {
            /**
             * Format: int32
             * @description The ID of the client associated with the reported hours. Only returned in the Client and Project reports.
             */
            client_id?: number | null;
            /** @description The name of the client associated with the reported hours. Only returned in the Client and Project reports. */
            client_name?: string | null;
            /**
             * Format: int32
             * @description The ID of the project associated with the reported hours. Only returned in the Client and Project reports.
             */
            project_id?: number | null;
            /** @description The name of the project associated with the reported hours. Only returned in the Client and Project reports. */
            project_name?: string | null;
            /**
             * Format: int32
             * @description The ID of the task associated with the reported hours. Only returned in the Task report.
             */
            task_id?: number | null;
            /** @description The name of the task associated with the reported hours. Only returned in the Task report. */
            task_name?: string | null;
            /**
             * Format: int32
             * @description The ID of the user associated with the reported hours. Only returned in the Team report.
             */
            user_id?: number | null;
            /** @description The name of the user associated with the reported hours. Only returned in the Team report. */
            user_name?: string | null;
            /**
             * Format: int32
             * @description The number of hours per week this person is available to work in seconds, in half hour increments. For example, if a person’s capacity is 35 hours, the API will return 126000 seconds. Only returned in the Team report.
             */
            weekly_capacity?: number | null;
            /** @description The URL to the user’s avatar image. Only returned in the Team report. */
            avatar_url?: string | null;
            /** @description The contractor status of the user associated with the reported hours. Only returned in the Team report. */
            is_contractor?: boolean | null;
            /**
             * Format: float
             * @description The totaled hours for the given timeframe, subject (client, project, task, or user), and currency. If Time Rounding is turned on, the hours will be rounded according to your settings.
             */
            total_hours?: number | null;
            /**
             * Format: float
             * @description The totaled billable hours for the given timeframe, subject (client, project, task, or user), and currency. If Time Rounding is turned on, the hours will be rounded according to your settings.
             */
            billable_hours?: number | null;
            /** @description The currency code associated with the tracked hours for this result. Only visible to Administrators and Project Managers with the View billable rates and amounts permission. */
            currency?: string | null;
            /**
             * Format: float
             * @description The totaled billable amount for the billable hours above. Only visible to Administrators and Project Managers with the View billable rates and amounts permission.
             */
            billable_amount?: number | null;
        };
        ProjectBudgetReportResult: {
            /**
             * Format: int32
             * @description The ID of the client associated with this project.
             */
            client_id?: number | null;
            /** @description The name of the client associated with this project. */
            client_name?: string | null;
            /**
             * Format: int32
             * @description The ID of the project.
             */
            project_id?: number | null;
            /** @description The name of the project. */
            project_name?: string | null;
            /** @description Whether the budget is reset every month. */
            budget_is_monthly?: boolean | null;
            /** @description The method by which the project is budgeted. Options: project (Hours Per Project), project_cost (Total Project Fees), task (Hours Per Task), task_fees (Fees Per Task), person (Hours Per Person), none (No Budget). */
            budget_by?: string | null;
            /** @description Whether the project is active or archived. */
            is_active?: boolean | null;
            /**
             * Format: float
             * @description The budget in hours or money for the project when budgeting by time. If the project is budgeted by money, this value will only be visible to Administrators and Project Managers with the View billable rates and amounts permission.
             */
            budget?: number | null;
            /**
             * Format: float
             * @description The total hours or money spent against the project’s budget. If Time Rounding is turned on, the hours will be rounded according to your settings. If the project is budgeted by money, this value will only be visible to Administrators and Project Managers with the View billable rates and amounts permission.
             */
            budget_spent?: number | null;
            /**
             * Format: float
             * @description The total hours or money remaining in the project’s budget. If Time Rounding is turned on, the hours will be rounded according to your settings. If the project is budgeted by money, this value will only be visible to Administrators and Project Managers with the View billable rates and amounts permission.
             */
            budget_remaining?: number | null;
        };
        Contacts: {
            contacts: components["schemas"]["Contact"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        Clients: {
            clients: components["schemas"]["Client"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        Companies: {
            companies: components["schemas"]["Company"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        InvoiceMessages: {
            invoice_messages: components["schemas"]["InvoiceMessage"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        InvoiceMessageRecipients: {
            invoice_message_recipients: components["schemas"]["InvoiceMessageRecipient"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        InvoicePayments: {
            invoice_payments: components["schemas"]["InvoicePayment"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        Invoices: {
            invoices: components["schemas"]["Invoice"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        InvoiceLineItems: {
            invoice_line_items: components["schemas"]["InvoiceLineItem"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        InvoiceItemCategories: {
            invoice_item_categories: components["schemas"]["InvoiceItemCategory"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        EstimateMessages: {
            estimate_messages: components["schemas"]["EstimateMessage"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        EstimateMessageRecipients: {
            estimate_message_recipients: components["schemas"]["EstimateMessageRecipient"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        Estimates: {
            estimates: components["schemas"]["Estimate"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        EstimateLineItems: {
            estimate_line_items: components["schemas"]["EstimateLineItem"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        EstimateItemCategories: {
            estimate_item_categories: components["schemas"]["EstimateItemCategory"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        Expenses: {
            expenses: components["schemas"]["Expense"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        ExpenseCategories: {
            expense_categories: components["schemas"]["ExpenseCategory"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        Tasks: {
            tasks: components["schemas"]["Task"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        TimeEntries: {
            time_entries: components["schemas"]["TimeEntry"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        UserAssignments: {
            user_assignments: components["schemas"]["UserAssignment"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        TaskAssignments: {
            task_assignments: components["schemas"]["TaskAssignment"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        Projects: {
            projects: components["schemas"]["Project"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        Roles: {
            roles: components["schemas"]["Role"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        Teammates: {
            teammates: components["schemas"]["Teammate"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        BillableRates: {
            billable_rates: components["schemas"]["BillableRate"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        CostRates: {
            cost_rates: components["schemas"]["CostRate"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        ProjectAssignments: {
            project_assignments: components["schemas"]["ProjectAssignment"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        Users: {
            users: components["schemas"]["User"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        ExpenseReportsResults: {
            results: components["schemas"]["ExpenseReportsResult"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        UninvoicedReportResults: {
            results: components["schemas"]["UninvoicedReportResult"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        TimeReportsResults: {
            results: components["schemas"]["TimeReportsResult"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        ProjectBudgetReportResults: {
            results: components["schemas"]["ProjectBudgetReportResult"][];
            /** Format: int64 */
            per_page: number;
            /** Format: int64 */
            total_pages: number;
            /** Format: int64 */
            total_entries: number;
            /** Format: int64 */
            next_page: number | null;
            /** Format: int64 */
            previous_page: number | null;
            /** Format: int64 */
            page: number;
            links: components["schemas"]["PaginationLinks"];
        };
        Error: {
            code?: number;
            message?: string;
        };
        InvoiceMessageSubjectAndBody: {
            /** Format: int32 */
            invoice_id: number;
            subject: string;
            body: string;
            reminder: boolean;
            thank_you: boolean;
        };
        PaginationLinks: {
            /**
             * Format: url
             * @description First page
             */
            first: string;
            /**
             * Format: url
             * @description Last page
             */
            last: string;
            /**
             * Format: url
             * @description Previous page
             */
            previous?: string | null;
            /**
             * Format: url
             * @description Next page
             */
            next?: string | null;
        };
        TeammatesPatchResponse: {
            teammates: components["schemas"]["Teammate"][];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    listClients: {
        parameters: {
            query?: {
                /** @description Pass true to only return active clients and false to return inactive clients. */
                is_active?: boolean;
                /** @description Only return clients that have been updated since the given date and time. */
                updated_since?: string;
                /**
                 * @deprecated
                 * @description DEPRECATED The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1)
                 */
                page?: number;
                /** @description Pagination cursor */
                cursor?: string;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all clients */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "clients": [
                     *         {
                     *           "id": 5735776,
                     *           "name": "123 Industries",
                     *           "is_active": true,
                     *           "address": "123 Main St.\r\nAnytown, LA 71223",
                     *           "statement_key": "0a39d3e33c8058cf7c3f8097d854c64e",
                     *           "created_at": "2017-06-26T21:02:12Z",
                     *           "updated_at": "2017-06-26T21:34:11Z",
                     *           "currency": "EUR"
                     *         },
                     *         {
                     *           "id": 5735774,
                     *           "name": "ABC Corp",
                     *           "is_active": true,
                     *           "address": "456 Main St.\r\nAnytown, CT 06467",
                     *           "statement_key": "e42aa2cb60e85925ffe5d13ee7ee8706",
                     *           "created_at": "2017-06-26T21:01:52Z",
                     *           "updated_at": "2017-06-26T21:27:07Z",
                     *           "currency": "USD"
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 2,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/clients?page=1&per_page=2000",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/clients?page=1&per_page=2000"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Clients"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createClient: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /** @description A textual description of the client. */
                    name: string | null;
                    /** @description Whether the client is active, or archived. Defaults to true. */
                    is_active?: boolean | null;
                    /** @description A textual representation of the client’s physical address. May include new line characters. */
                    address?: string | null;
                    /** @description The currency used by the client. If not provided, the company’s currency will be used. See a list of supported currencies */
                    currency?: string | null;
                };
            };
        };
        responses: {
            /** @description Create a client */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 5737336,
                     *       "name": "Your New Client",
                     *       "is_active": true,
                     *       "address": null,
                     *       "statement_key": "82455699ad085d8cffc3e9a4e43ff7b8",
                     *       "created_at": "2017-06-26T21:39:35Z",
                     *       "updated_at": "2017-06-26T21:39:35Z",
                     *       "currency": "EUR"
                     *     }
                     */
                    "application/json": components["schemas"]["Client"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    retrieveClient: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                clientId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Retrieve a client */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 5735776,
                     *       "name": "123 Industries",
                     *       "is_active": true,
                     *       "address": "123 Main St.\r\nAnytown, LA 71223",
                     *       "statement_key": "0a39d3e33c8058cf7c3f8097d854c64e",
                     *       "created_at": "2017-06-26T21:02:12Z",
                     *       "updated_at": "2017-06-26T21:34:11Z",
                     *       "currency": "EUR"
                     *     }
                     */
                    "application/json": components["schemas"]["Client"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteClient: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                clientId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Delete a client */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateClient: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                clientId: string;
            };
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /** @description A textual description of the client. */
                    name?: string | null;
                    /** @description Whether the client is active, or archived. */
                    is_active?: boolean | null;
                    /** @description A textual representation of the client’s physical address. May include new line characters. */
                    address?: string | null;
                    /** @description The currency used by the client. See a list of supported currencies */
                    currency?: string | null;
                };
            };
        };
        responses: {
            /** @description Update a client */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 5737336,
                     *       "name": "Your New Client",
                     *       "is_active": false,
                     *       "address": null,
                     *       "statement_key": "82455699ad085d8cffc3e9a4e43ff7b8",
                     *       "created_at": "2017-06-26T21:39:35Z",
                     *       "updated_at": "2017-06-26T21:41:18Z",
                     *       "currency": "EUR"
                     *     }
                     */
                    "application/json": components["schemas"]["Client"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    retrieveCompany: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Retrieve a company */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "base_uri": "https://{ACCOUNT_SUBDOMAIN}.harvestapp.com",
                     *       "full_domain": "{ACCOUNT_SUBDOMAIN}.harvestapp.com",
                     *       "name": "API Examples",
                     *       "is_active": true,
                     *       "week_start_day": "Monday",
                     *       "wants_timestamp_timers": true,
                     *       "time_format": "hours_minutes",
                     *       "date_format": "%Y-%m-%d",
                     *       "plan_type": "sponsored",
                     *       "expense_feature": true,
                     *       "invoice_feature": true,
                     *       "estimate_feature": true,
                     *       "approval_feature": true,
                     *       "clock": "12h",
                     *       "currency_code_display": "iso_code_none",
                     *       "currency_symbol_display": "symbol_before",
                     *       "decimal_symbol": ".",
                     *       "thousands_separator": ",",
                     *       "color_scheme": "orange",
                     *       "weekly_capacity": 126000
                     *     }
                     */
                    "application/json": components["schemas"]["Company"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateCompany: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /** @description Whether time is tracked via duration or start and end times. */
                    wants_timestamp_timers?: boolean | null;
                    /**
                     * Format: int32
                     * @description The weekly capacity in seconds.
                     */
                    weekly_capacity?: number | null;
                };
            };
        };
        responses: {
            /** @description Update a company */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "base_uri": "https://{ACCOUNT_SUBDOMAIN}.harvestapp.com",
                     *       "full_domain": "{ACCOUNT_SUBDOMAIN}.harvestapp.com",
                     *       "name": "API Examples",
                     *       "is_active": true,
                     *       "week_start_day": "Monday",
                     *       "wants_timestamp_timers": false,
                     *       "time_format": "hours_minutes",
                     *       "date_format": "%Y-%m-%d",
                     *       "plan_type": "sponsored",
                     *       "expense_feature": true,
                     *       "invoice_feature": true,
                     *       "estimate_feature": true,
                     *       "approval_feature": true,
                     *       "clock": "12h",
                     *       "currency_code_display": "iso_code_none",
                     *       "currency_symbol_display": "symbol_before",
                     *       "decimal_symbol": ".",
                     *       "thousands_separator": ",",
                     *       "color_scheme": "orange",
                     *       "weekly_capacity": 108000
                     *     }
                     */
                    "application/json": components["schemas"]["Company"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listContacts: {
        parameters: {
            query?: {
                /** @description Only return contacts belonging to the client with the given ID. */
                client_id?: number;
                /** @description Only return contacts that have been updated since the given date and time. */
                updated_since?: string;
                /**
                 * @deprecated
                 * @description DEPRECATED The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1)
                 */
                page?: number;
                /** @description Pagination cursor */
                cursor?: string;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all contacts */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Contacts"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createContact: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: int32
                     * @description The ID of the client associated with this contact.
                     */
                    client_id: number | null;
                    /** @description The title of the contact. */
                    title?: string | null;
                    /** @description The first name of the contact. */
                    first_name: string | null;
                    /** @description The last name of the contact. */
                    last_name?: string | null;
                    /**
                     * Format: email
                     * @description The contact’s email address.
                     */
                    email?: string | null;
                    /** @description The contact’s office phone number. */
                    phone_office?: string | null;
                    /** @description The contact’s mobile phone number. */
                    phone_mobile?: string | null;
                    /** @description The contact’s fax number. */
                    fax?: string | null;
                };
            };
        };
        responses: {
            /** @description Create a contact */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Contact"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    retrieveContact: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                contactId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Retrieve a contact */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Contact"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteContact: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                contactId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Delete a contact */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateContact: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                contactId: string;
            };
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: int32
                     * @description The ID of the client associated with this contact.
                     */
                    client_id?: number | null;
                    /** @description The title of the contact. */
                    title?: string | null;
                    /** @description The first name of the contact. */
                    first_name?: string | null;
                    /** @description The last name of the contact. */
                    last_name?: string | null;
                    /**
                     * Format: email
                     * @description The contact’s email address.
                     */
                    email?: string | null;
                    /** @description The contact’s office phone number. */
                    phone_office?: string | null;
                    /** @description The contact’s mobile phone number. */
                    phone_mobile?: string | null;
                    /** @description The contact’s fax number. */
                    fax?: string | null;
                };
            };
        };
        responses: {
            /** @description Update a contact */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Contact"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listEstimateItemCategories: {
        parameters: {
            query?: {
                /** @description Only return estimate item categories that have been updated since the given date and time. */
                updated_since?: string;
                /**
                 * @deprecated
                 * @description DEPRECATED The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1)
                 */
                page?: number;
                /** @description Pagination cursor */
                cursor?: string;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all estimate item categories */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "estimate_item_categories": [
                     *         {
                     *           "id": 1378704,
                     *           "name": "Product",
                     *           "created_at": "2017-06-26T20:41:00Z",
                     *           "updated_at": "2017-06-26T20:41:00Z"
                     *         },
                     *         {
                     *           "id": 1378703,
                     *           "name": "Service",
                     *           "created_at": "2017-06-26T20:41:00Z",
                     *           "updated_at": "2017-06-26T20:41:00Z"
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 2,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/estimate_item_categories?page=1&per_page=2000",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/estimate_item_categories?page=1&per_page=2000"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["EstimateItemCategories"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createEstimateItemCategory: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /** @description The name of the estimate item category. */
                    name: string | null;
                };
            };
        };
        responses: {
            /** @description Create an estimate item category */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 1379244,
                     *       "name": "Hosting",
                     *       "created_at": "2017-06-27T16:06:35Z",
                     *       "updated_at": "2017-06-27T16:06:35Z"
                     *     }
                     */
                    "application/json": components["schemas"]["EstimateItemCategory"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    retrieveEstimateItemCategory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                estimateItemCategoryId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Retrieve an estimate item category */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 1378704,
                     *       "name": "Product",
                     *       "created_at": "2017-06-26T20:41:00Z",
                     *       "updated_at": "2017-06-26T20:41:00Z"
                     *     }
                     */
                    "application/json": components["schemas"]["EstimateItemCategory"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteEstimateItemCategory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                estimateItemCategoryId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Delete an estimate item category */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateEstimateItemCategory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                estimateItemCategoryId: string;
            };
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /** @description The name of the estimate item category. */
                    name?: string | null;
                };
            };
        };
        responses: {
            /** @description Update an estimate item category */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 1379244,
                     *       "name": "Transportation",
                     *       "created_at": "2017-06-27T16:06:35Z",
                     *       "updated_at": "2017-06-27T16:07:05Z"
                     *     }
                     */
                    "application/json": components["schemas"]["EstimateItemCategory"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listEstimates: {
        parameters: {
            query?: {
                /** @description Only return estimates belonging to the client with the given ID. */
                client_id?: number;
                /** @description Only return estimates that have been updated since the given date and time. */
                updated_since?: string;
                /** @description Only return estimates with an issue_date on or after the given date. */
                from?: string;
                /** @description Only return estimates with an issue_date on or before the given date. */
                to?: string;
                /** @description Only return estimates with a state matching the value provided. Options: draft, sent, accepted, or declined. */
                state?: string;
                /** @description The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1) */
                page?: number;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all estimates */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "estimates": [
                     *         {
                     *           "id": 1439818,
                     *           "client_key": "13dc088aa7d51ec687f186b146730c3c75dc7423",
                     *           "number": "1001",
                     *           "purchase_order": "5678",
                     *           "amount": 9630,
                     *           "tax": 5,
                     *           "tax_amount": 450,
                     *           "tax2": 2,
                     *           "tax2_amount": 180,
                     *           "discount": 10,
                     *           "discount_amount": 1000,
                     *           "subject": "Online Store - Phase 2",
                     *           "notes": "Some notes about the estimate",
                     *           "state": "sent",
                     *           "issue_date": "2017-06-01",
                     *           "sent_at": "2017-06-27T16:11:33Z",
                     *           "created_at": "2017-06-27T16:11:24Z",
                     *           "updated_at": "2017-06-27T16:13:56Z",
                     *           "accepted_at": null,
                     *           "declined_at": null,
                     *           "currency": "USD",
                     *           "client": {
                     *             "id": 5735776,
                     *             "name": "123 Industries"
                     *           },
                     *           "creator": {
                     *             "id": 1782884,
                     *             "name": "Bob Powell"
                     *           },
                     *           "line_items": [
                     *             {
                     *               "id": 53334195,
                     *               "kind": "Service",
                     *               "description": "Phase 2 of the Online Store",
                     *               "quantity": 100,
                     *               "unit_price": 100,
                     *               "amount": 10000,
                     *               "taxed": true,
                     *               "taxed2": true
                     *             }
                     *           ]
                     *         },
                     *         {
                     *           "id": 1439814,
                     *           "client_key": "a5ffaeb30c55776270fcd3992b70332d769f97e7",
                     *           "number": "1000",
                     *           "purchase_order": "1234",
                     *           "amount": 21000,
                     *           "tax": 5,
                     *           "tax_amount": 1000,
                     *           "tax2": null,
                     *           "tax2_amount": 0,
                     *           "discount": null,
                     *           "discount_amount": 0,
                     *           "subject": "Online Store - Phase 1",
                     *           "notes": "Some notes about the estimate",
                     *           "state": "accepted",
                     *           "issue_date": "2017-01-01",
                     *           "sent_at": "2017-06-27T16:10:30Z",
                     *           "created_at": "2017-06-27T16:09:33Z",
                     *           "updated_at": "2017-06-27T16:12:00Z",
                     *           "accepted_at": "2017-06-27T16:10:32Z",
                     *           "declined_at": null,
                     *           "currency": "USD",
                     *           "client": {
                     *             "id": 5735776,
                     *             "name": "123 Industries"
                     *           },
                     *           "creator": {
                     *             "id": 1782884,
                     *             "name": "Bob Powell"
                     *           },
                     *           "line_items": [
                     *             {
                     *               "id": 57531966,
                     *               "kind": "Service",
                     *               "description": "Phase 1 of the Online Store",
                     *               "quantity": 1,
                     *               "unit_price": 20000,
                     *               "amount": 20000,
                     *               "taxed": true,
                     *               "taxed2": false
                     *             }
                     *           ]
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 2,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/estimates?page=1&per_page=2000",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/estimates?page=1&per_page=2000"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Estimates"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createEstimate: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: int32
                     * @description The ID of the client this estimate belongs to.
                     */
                    client_id: number | null;
                    /** @description If no value is set, the number will be automatically generated. */
                    number?: string | null;
                    /** @description The purchase order number. */
                    purchase_order?: string | null;
                    /**
                     * Format: float
                     * @description This percentage is applied to the subtotal, including line items and discounts. Example: use 10.0 for 10.0%.
                     */
                    tax?: number | null;
                    /**
                     * Format: float
                     * @description This percentage is applied to the subtotal, including line items and discounts. Example: use 10.0 for 10.0%.
                     */
                    tax2?: number | null;
                    /**
                     * Format: float
                     * @description This percentage is subtracted from the subtotal. Example: use 10.0 for 10.0%.
                     */
                    discount?: number | null;
                    /** @description The estimate subject. */
                    subject?: string | null;
                    /** @description Any additional notes to include on the estimate. */
                    notes?: string | null;
                    /** @description The currency used by the estimate. If not provided, the client’s currency will be used. See a list of supported currencies */
                    currency?: string | null;
                    /**
                     * Format: date
                     * @description Date the estimate was issued. Defaults to today’s date.
                     */
                    issue_date?: string | null;
                    /** @description Array of line item parameters */
                    line_items?: {
                        /** @description The name of an estimate item category. */
                        kind: string;
                        /** @description Text description of the line item. */
                        description?: string;
                        /**
                         * Format: int32
                         * @description The unit quantity of the item. Defaults to 1.
                         */
                        quantity?: number;
                        /**
                         * Format: float
                         * @description The individual price per unit.
                         */
                        unit_price: number;
                        /** @description Whether the estimate’s tax percentage applies to this line item. Defaults to false. */
                        taxed?: boolean;
                        /** @description Whether the estimate’s tax2 percentage applies to this line item. Defaults to false. */
                        taxed2?: boolean;
                    }[] | null;
                };
            };
        };
        responses: {
            /** @description Create an estimate */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 1439827,
                     *       "client_key": "ddd4504a68fb7339138d0c2ea89ba05a3cf12aa8",
                     *       "number": "1002",
                     *       "purchase_order": null,
                     *       "amount": 5000,
                     *       "tax": null,
                     *       "tax_amount": 0,
                     *       "tax2": null,
                     *       "tax2_amount": 0,
                     *       "discount": null,
                     *       "discount_amount": 0,
                     *       "subject": "Project Quote",
                     *       "notes": null,
                     *       "state": "draft",
                     *       "issue_date": null,
                     *       "sent_at": null,
                     *       "created_at": "2017-06-27T16:16:24Z",
                     *       "updated_at": "2017-06-27T16:16:24Z",
                     *       "accepted_at": null,
                     *       "declined_at": null,
                     *       "currency": "USD",
                     *       "client": {
                     *         "id": 5735774,
                     *         "name": "ABC Corp"
                     *       },
                     *       "creator": {
                     *         "id": 1782884,
                     *         "name": "Bob Powell"
                     *       },
                     *       "line_items": [
                     *         {
                     *           "id": 53339199,
                     *           "kind": "Service",
                     *           "description": "Project Description",
                     *           "quantity": 1,
                     *           "unit_price": 5000,
                     *           "amount": 5000,
                     *           "taxed": false,
                     *           "taxed2": false
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["Estimate"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    retrieveEstimate: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                estimateId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Retrieve an estimate */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 1439818,
                     *       "client_key": "13dc088aa7d51ec687f186b146730c3c75dc7423",
                     *       "number": "1001",
                     *       "purchase_order": "5678",
                     *       "amount": 9630,
                     *       "tax": 5,
                     *       "tax_amount": 450,
                     *       "tax2": 2,
                     *       "tax2_amount": 180,
                     *       "discount": 10,
                     *       "discount_amount": 1000,
                     *       "subject": "Online Store - Phase 2",
                     *       "notes": "Some notes about the estimate",
                     *       "state": "sent",
                     *       "issue_date": "2017-06-01",
                     *       "sent_at": "2017-06-27T16:11:33Z",
                     *       "created_at": "2017-06-27T16:11:24Z",
                     *       "updated_at": "2017-06-27T16:13:56Z",
                     *       "accepted_at": null,
                     *       "declined_at": null,
                     *       "currency": "USD",
                     *       "client": {
                     *         "id": 5735776,
                     *         "name": "123 Industries"
                     *       },
                     *       "creator": {
                     *         "id": 1782884,
                     *         "name": "Bob Powell"
                     *       },
                     *       "line_items": [
                     *         {
                     *           "id": 53334195,
                     *           "kind": "Service",
                     *           "description": "Phase 2 of the Online Store",
                     *           "quantity": 100,
                     *           "unit_price": 100,
                     *           "amount": 10000,
                     *           "taxed": true,
                     *           "taxed2": true
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["Estimate"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteEstimate: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                estimateId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Delete an estimate */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateEstimate: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                estimateId: string;
            };
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: int32
                     * @description The ID of the client this estimate belongs to.
                     */
                    client_id?: number | null;
                    /** @description If no value is set, the number will be automatically generated. */
                    number?: string | null;
                    /** @description The purchase order number. */
                    purchase_order?: string | null;
                    /**
                     * Format: float
                     * @description This percentage is applied to the subtotal, including line items and discounts. Example: use 10.0 for 10.0%.
                     */
                    tax?: number | null;
                    /**
                     * Format: float
                     * @description This percentage is applied to the subtotal, including line items and discounts. Example: use 10.0 for 10.0%.
                     */
                    tax2?: number | null;
                    /**
                     * Format: float
                     * @description This percentage is subtracted from the subtotal. Example: use 10.0 for 10.0%.
                     */
                    discount?: number | null;
                    /** @description The estimate subject. */
                    subject?: string | null;
                    /** @description Any additional notes to include on the estimate. */
                    notes?: string | null;
                    /** @description The currency used by the estimate. If not provided, the client’s currency will be used. See a list of supported currencies */
                    currency?: string | null;
                    /**
                     * Format: date
                     * @description Date the estimate was issued.
                     */
                    issue_date?: string | null;
                    /** @description Array of line item parameters */
                    line_items?: {
                        /**
                         * Format: int32
                         * @description Unique ID for the line item.
                         */
                        id?: number;
                        /** @description The name of an estimate item category. */
                        kind?: string;
                        /** @description Text description of the line item. */
                        description?: string;
                        /**
                         * Format: int32
                         * @description The unit quantity of the item. Defaults to 1.
                         */
                        quantity?: number;
                        /**
                         * Format: float
                         * @description The individual price per unit.
                         */
                        unit_price?: number;
                        /** @description Whether the estimate’s tax percentage applies to this line item. Defaults to false. */
                        taxed?: boolean;
                        /** @description Whether the estimate’s tax2 percentage applies to this line item. Defaults to false. */
                        taxed2?: boolean;
                    }[] | null;
                };
            };
        };
        responses: {
            /** @description Update an estimate */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 1439827,
                     *       "client_key": "ddd4504a68fb7339138d0c2ea89ba05a3cf12aa8",
                     *       "number": "1002",
                     *       "purchase_order": "2345",
                     *       "amount": 5000,
                     *       "tax": null,
                     *       "tax_amount": 0,
                     *       "tax2": null,
                     *       "tax2_amount": 0,
                     *       "discount": null,
                     *       "discount_amount": 0,
                     *       "subject": "Project Quote",
                     *       "notes": null,
                     *       "state": "draft",
                     *       "issue_date": null,
                     *       "sent_at": null,
                     *       "created_at": "2017-06-27T16:16:24Z",
                     *       "updated_at": "2017-06-27T16:17:06Z",
                     *       "accepted_at": null,
                     *       "declined_at": null,
                     *       "currency": "USD",
                     *       "client": {
                     *         "id": 5735774,
                     *         "name": "ABC Corp"
                     *       },
                     *       "creator": {
                     *         "id": 1782884,
                     *         "name": "Bob Powell"
                     *       },
                     *       "line_items": [
                     *         {
                     *           "id": 53339199,
                     *           "kind": "Service",
                     *           "description": "Project Description",
                     *           "quantity": 1,
                     *           "unit_price": 5000,
                     *           "amount": 5000,
                     *           "taxed": false,
                     *           "taxed2": false
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["Estimate"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listMessagesForEstimate: {
        parameters: {
            query?: {
                /** @description Only return estimate messages that have been updated since the given date and time. */
                updated_since?: string;
                /**
                 * @deprecated
                 * @description DEPRECATED The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1)
                 */
                page?: number;
                /** @description Pagination cursor */
                cursor?: string;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path: {
                estimateId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all messages for an estimate */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "estimate_messages": [
                     *         {
                     *           "id": 2666236,
                     *           "sent_by": "Bob Powell",
                     *           "sent_by_email": "bobpowell@example.com",
                     *           "sent_from": "Bob Powell",
                     *           "sent_from_email": "bobpowell@example.com",
                     *           "send_me_a_copy": true,
                     *           "created_at": "2017-08-25T21:23:40Z",
                     *           "updated_at": "2017-08-25T21:23:40Z",
                     *           "recipients": [
                     *             {
                     *               "name": "Richard Roe",
                     *               "email": "richardroe@example.com"
                     *             },
                     *             {
                     *               "name": "Bob Powell",
                     *               "email": "bobpowell@example.com"
                     *             }
                     *           ],
                     *           "event_type": null,
                     *           "subject": "Estimate #1001 from API Examples",
                     *           "body": "---------------------------------------------\r\nEstimate Summary\r\n---------------------------------------------\r\nEstimate ID: 1001\r\nEstimate Date: 06/01/2017\r\nClient: 123 Industries\r\nP.O. Number: 5678\r\nAmount: $9,630.00\r\n\r\nYou can view the estimate here:\r\n\r\n%estimate_url%\r\n\r\nThank you!\r\n---------------------------------------------"
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 1,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/estimates/1439818/messages?page=1&per_page=2000",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/estimates/1439818/messages?page=1&per_page=2000"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["EstimateMessages"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createEstimateMessage: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                estimateId: string;
            };
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /** @description If provided, runs an event against the estimate. Options: “accept”, “decline”, “re-open”, or “send”. */
                    event_type?: string | null;
                    /** @description Array of recipient parameters. See below for details. */
                    recipients: {
                        /** @description Name of the message recipient. */
                        name?: string;
                        /**
                         * Format: email
                         * @description Email of the message recipient.
                         */
                        email: string;
                    }[] | null;
                    /** @description The message subject. */
                    subject?: string | null;
                    /** @description The message body. */
                    body?: string | null;
                    /** @description If set to true, a copy of the message email will be sent to the current user. Defaults to false. */
                    send_me_a_copy?: boolean | null;
                };
            };
        };
        responses: {
            /** @description Create an estimate message or change estimate status */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 2666240,
                     *       "sent_by": "Bob Powell",
                     *       "sent_by_email": "bobpowell@example.com",
                     *       "sent_from": "Bob Powell",
                     *       "sent_from_email": "bobpowell@example.com",
                     *       "send_me_a_copy": true,
                     *       "created_at": "2017-08-25T21:27:52Z",
                     *       "updated_at": "2017-08-25T21:27:52Z",
                     *       "recipients": [
                     *         {
                     *           "name": "Richard Roe",
                     *           "email": "richardroe@example.com"
                     *         },
                     *         {
                     *           "name": "Bob Powell",
                     *           "email": "bobpowell@example.com"
                     *         }
                     *       ],
                     *       "event_type": null,
                     *       "subject": "Estimate #1001",
                     *       "body": "Here is our estimate."
                     *     }
                     */
                    "application/json": components["schemas"]["EstimateMessage"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteEstimateMessage: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                estimateId: string;
                messageId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Delete an estimate message */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listExpenseCategories: {
        parameters: {
            query?: {
                /** @description Pass true to only return active expense categories and false to return inactive expense categories. */
                is_active?: boolean;
                /** @description Only return expense categories that have been updated since the given date and time. */
                updated_since?: string;
                /**
                 * @deprecated
                 * @description DEPRECATED The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1)
                 */
                page?: number;
                /** @description Pagination cursor */
                cursor?: string;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all expense categories */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "expense_categories": [
                     *         {
                     *           "id": 4197501,
                     *           "name": "Lodging",
                     *           "unit_name": null,
                     *           "unit_price": null,
                     *           "is_active": true,
                     *           "created_at": "2017-06-27T15:01:32Z",
                     *           "updated_at": "2017-06-27T15:01:32Z"
                     *         },
                     *         {
                     *           "id": 4195930,
                     *           "name": "Mileage",
                     *           "unit_name": "mile",
                     *           "unit_price": 0.535,
                     *           "is_active": true,
                     *           "created_at": "2017-06-26T20:41:00Z",
                     *           "updated_at": "2017-06-26T20:41:00Z"
                     *         },
                     *         {
                     *           "id": 4195928,
                     *           "name": "Transportation",
                     *           "unit_name": null,
                     *           "unit_price": null,
                     *           "is_active": true,
                     *           "created_at": "2017-06-26T20:41:00Z",
                     *           "updated_at": "2017-06-26T20:41:00Z"
                     *         },
                     *         {
                     *           "id": 4195926,
                     *           "name": "Meals",
                     *           "unit_name": null,
                     *           "unit_price": null,
                     *           "is_active": true,
                     *           "created_at": "2017-06-26T20:41:00Z",
                     *           "updated_at": "2017-06-26T20:41:00Z"
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 4,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/expense_categories?page=1&per_page=2000",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/expense_categories?page=1&per_page=2000"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["ExpenseCategories"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createExpenseCategory: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /** @description The name of the expense category. */
                    name: string | null;
                    /** @description The unit name of the expense category. */
                    unit_name?: string | null;
                    /**
                     * Format: float
                     * @description The unit price of the expense category.
                     */
                    unit_price?: number | null;
                    /** @description Whether the expense category is active or archived. Defaults to true. */
                    is_active?: boolean | null;
                };
            };
        };
        responses: {
            /** @description Create an expense category */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 4197514,
                     *       "name": "Other",
                     *       "unit_name": null,
                     *       "unit_price": null,
                     *       "is_active": true,
                     *       "created_at": "2017-06-27T15:04:23Z",
                     *       "updated_at": "2017-06-27T15:04:23Z"
                     *     }
                     */
                    "application/json": components["schemas"]["ExpenseCategory"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    retrieveExpenseCategory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                expenseCategoryId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Retrieve an expense category */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 4197501,
                     *       "name": "Lodging",
                     *       "unit_name": null,
                     *       "unit_price": null,
                     *       "is_active": true,
                     *       "created_at": "2017-06-27T15:01:32Z",
                     *       "updated_at": "2017-06-27T15:01:32Z"
                     *     }
                     */
                    "application/json": components["schemas"]["ExpenseCategory"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteExpenseCategory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                expenseCategoryId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Delete an expense category */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateExpenseCategory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                expenseCategoryId: string;
            };
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /** @description The name of the expense category. */
                    name?: string | null;
                    /** @description The unit name of the expense category. */
                    unit_name?: string | null;
                    /**
                     * Format: float
                     * @description The unit price of the expense category.
                     */
                    unit_price?: number | null;
                    /** @description Whether the expense category is active or archived. */
                    is_active?: boolean | null;
                };
            };
        };
        responses: {
            /** @description Update an expense category */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 4197514,
                     *       "name": "Other",
                     *       "unit_name": null,
                     *       "unit_price": null,
                     *       "is_active": false,
                     *       "created_at": "2017-06-27T15:04:23Z",
                     *       "updated_at": "2017-06-27T15:04:58Z"
                     *     }
                     */
                    "application/json": components["schemas"]["ExpenseCategory"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listExpenses: {
        parameters: {
            query?: {
                /** @description Only return expenses belonging to the user with the given ID. */
                user_id?: number;
                /** @description Only return expenses belonging to the client with the given ID. */
                client_id?: number;
                /** @description Only return expenses belonging to the project with the given ID. */
                project_id?: number;
                /** @description Pass true to only return expenses that have been invoiced and false to return expenses that have not been invoiced. */
                is_billed?: boolean;
                /** @description Only return expenses with the given approval status. Possible values: “unsubmitted”, “submitted”, or “approved”. */
                approval_status?: string;
                /** @description Only return expenses that have been updated since the given date and time. */
                updated_since?: string;
                /** @description Only return expenses with a spent_date on or after the given date. */
                from?: string;
                /** @description Only return expenses with a spent_date on or before the given date. */
                to?: string;
                /** @description The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1) */
                page?: number;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all expenses */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "expenses": [
                     *         {
                     *           "id": 15296442,
                     *           "notes": "Lunch with client",
                     *           "total_cost": 33.35,
                     *           "units": 1,
                     *           "is_closed": false,
                     *           "approval_status": "unsubmitted",
                     *           "is_locked": true,
                     *           "is_billed": true,
                     *           "locked_reason": "Expense is invoiced.",
                     *           "spent_date": "2017-03-03",
                     *           "created_at": "2017-06-27T15:09:54Z",
                     *           "updated_at": "2017-06-27T16:47:14Z",
                     *           "billable": true,
                     *           "receipt": {
                     *             "url": "https://{ACCOUNT_SUBDOMAIN}.harvestapp.com/expenses/15296442/receipt",
                     *             "file_name": "lunch_receipt.gif",
                     *             "file_size": 39410,
                     *             "content_type": "image/gif"
                     *           },
                     *           "user": {
                     *             "id": 1782959,
                     *             "name": "Kim Allen"
                     *           },
                     *           "user_assignment": {
                     *             "id": 125068553,
                     *             "is_project_manager": true,
                     *             "is_active": true,
                     *             "budget": null,
                     *             "created_at": "2017-06-26T22:32:52Z",
                     *             "updated_at": "2017-06-26T22:32:52Z",
                     *             "hourly_rate": 100
                     *           },
                     *           "project": {
                     *             "id": 14307913,
                     *             "name": "Marketing Website",
                     *             "code": "MW"
                     *           },
                     *           "expense_category": {
                     *             "id": 4195926,
                     *             "name": "Meals",
                     *             "unit_price": null,
                     *             "unit_name": null
                     *           },
                     *           "client": {
                     *             "id": 5735774,
                     *             "name": "ABC Corp",
                     *             "currency": "USD"
                     *           },
                     *           "invoice": {
                     *             "id": 13150403,
                     *             "number": "1001"
                     *           }
                     *         },
                     *         {
                     *           "id": 15296423,
                     *           "notes": "Hotel stay for meeting",
                     *           "total_cost": 100,
                     *           "units": 1,
                     *           "is_closed": true,
                     *           "approval_status": "approved",
                     *           "is_locked": true,
                     *           "is_billed": false,
                     *           "locked_reason": "The project is locked for this time period.",
                     *           "spent_date": "2017-03-01",
                     *           "created_at": "2017-06-27T15:09:17Z",
                     *           "updated_at": "2017-06-27T16:47:14Z",
                     *           "billable": true,
                     *           "receipt": null,
                     *           "user": {
                     *             "id": 1782959,
                     *             "name": "Kim Allen"
                     *           },
                     *           "user_assignment": {
                     *             "id": 125068554,
                     *             "is_project_manager": true,
                     *             "is_active": true,
                     *             "budget": null,
                     *             "created_at": "2017-06-26T22:32:52Z",
                     *             "updated_at": "2017-06-26T22:32:52Z",
                     *             "hourly_rate": 100
                     *           },
                     *           "project": {
                     *             "id": 14308069,
                     *             "name": "Online Store - Phase 1",
                     *             "code": "OS1"
                     *           },
                     *           "expense_category": {
                     *             "id": 4197501,
                     *             "name": "Lodging",
                     *             "unit_price": null,
                     *             "unit_name": null
                     *           },
                     *           "client": {
                     *             "id": 5735776,
                     *             "name": "123 Industries",
                     *             "currency": "EUR"
                     *           },
                     *           "invoice": null
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 2,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/expenses?page=1&per_page=2000",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/expenses?page=1&per_page=2000"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Expenses"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createExpense: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: int32
                     * @description The ID of the user associated with this expense. Defaults to the ID of the currently authenticated user.
                     */
                    user_id?: number | null;
                    /**
                     * Format: int32
                     * @description The ID of the project associated with this expense.
                     */
                    project_id: number | null;
                    /**
                     * Format: int32
                     * @description The ID of the expense category this expense is being tracked against.
                     */
                    expense_category_id: number | null;
                    /**
                     * Format: date
                     * @description Date the expense occurred.
                     */
                    spent_date: string | null;
                    /**
                     * Format: int32
                     * @description The quantity of units to use in calculating the total_cost of the expense.
                     */
                    units?: number | null;
                    /**
                     * Format: float
                     * @description The total amount of the expense.
                     */
                    total_cost?: number | null;
                    /** @description Textual notes used to describe the expense. */
                    notes?: string | null;
                    /** @description Whether this expense is billable or not. Defaults to true. */
                    billable?: boolean | null;
                    /** @description A receipt file to attach to the expense. If including a receipt, you must submit a multipart/form-data request. */
                    receipt?: string | null;
                };
            };
        };
        responses: {
            /** @description Create an expense */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 15297032,
                     *       "notes": null,
                     *       "total_cost": 13.59,
                     *       "units": 1,
                     *       "is_closed": false,
                     *       "approval_status": "unsubmitted",
                     *       "is_locked": false,
                     *       "is_billed": false,
                     *       "locked_reason": null,
                     *       "spent_date": "2017-03-01",
                     *       "created_at": "2017-06-27T15:42:27Z",
                     *       "updated_at": "2017-06-27T15:42:27Z",
                     *       "billable": true,
                     *       "receipt": null,
                     *       "user": {
                     *         "id": 1782959,
                     *         "name": "Kim Allen"
                     *       },
                     *       "user_assignment": {
                     *         "id": 125068553,
                     *         "is_project_manager": true,
                     *         "is_active": true,
                     *         "budget": null,
                     *         "created_at": "2017-06-26T22:32:52Z",
                     *         "updated_at": "2017-06-26T22:32:52Z",
                     *         "hourly_rate": 100
                     *       },
                     *       "project": {
                     *         "id": 14308069,
                     *         "name": "Online Store - Phase 1",
                     *         "code": "OS1"
                     *       },
                     *       "expense_category": {
                     *         "id": 4195926,
                     *         "name": "Meals",
                     *         "unit_price": null,
                     *         "unit_name": null
                     *       },
                     *       "client": {
                     *         "id": 5735776,
                     *         "name": "123 Industries",
                     *         "currency": "EUR"
                     *       },
                     *       "invoice": null
                     *     }
                     */
                    "application/json": components["schemas"]["Expense"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    retrieveExpense: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                expenseId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Retrieve an expense */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 15296442,
                     *       "notes": "Lunch with client",
                     *       "total_cost": 33.35,
                     *       "units": 1,
                     *       "is_closed": false,
                     *       "approval_status": "unsubmitted",
                     *       "is_locked": true,
                     *       "is_billed": true,
                     *       "locked_reason": "Expense is invoiced.",
                     *       "spent_date": "2017-03-03",
                     *       "created_at": "2017-06-27T15:09:54Z",
                     *       "updated_at": "2017-06-27T16:47:14Z",
                     *       "billable": true,
                     *       "receipt": {
                     *         "url": "https://{ACCOUNT_SUBDOMAIN}.harvestapp.com/expenses/15296442/receipt",
                     *         "file_name": "lunch_receipt.gif",
                     *         "file_size": 39410,
                     *         "content_type": "image/gif"
                     *       },
                     *       "user": {
                     *         "id": 1782959,
                     *         "name": "Kim Allen"
                     *       },
                     *       "user_assignment": {
                     *         "id": 125068553,
                     *         "is_project_manager": true,
                     *         "is_active": true,
                     *         "budget": null,
                     *         "created_at": "2017-06-26T22:32:52Z",
                     *         "updated_at": "2017-06-26T22:32:52Z",
                     *         "hourly_rate": 100
                     *       },
                     *       "project": {
                     *         "id": 14307913,
                     *         "name": "Marketing Website",
                     *         "code": "MW"
                     *       },
                     *       "expense_category": {
                     *         "id": 4195926,
                     *         "name": "Meals",
                     *         "unit_price": null,
                     *         "unit_name": null
                     *       },
                     *       "client": {
                     *         "id": 5735774,
                     *         "name": "ABC Corp",
                     *         "currency": "USD"
                     *       },
                     *       "invoice": {
                     *         "id": 13150403,
                     *         "number": "1001"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Expense"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteExpense: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                expenseId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Delete an expense */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateExpense: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                expenseId: string;
            };
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: int32
                     * @description The ID of the project associated with this expense.
                     */
                    project_id?: number | null;
                    /**
                     * Format: int32
                     * @description The ID of the expense category this expense is being tracked against.
                     */
                    expense_category_id?: number | null;
                    /**
                     * Format: date
                     * @description Date the expense occurred.
                     */
                    spent_date?: string | null;
                    /**
                     * Format: int32
                     * @description The quantity of units to use in calculating the total_cost of the expense.
                     */
                    units?: number | null;
                    /**
                     * Format: float
                     * @description The total amount of the expense.
                     */
                    total_cost?: number | null;
                    /** @description Textual notes used to describe the expense. */
                    notes?: string | null;
                    /** @description Whether this expense is billable or not. Defaults to true. */
                    billable?: boolean | null;
                    /** @description A receipt file to attach to the expense. If including a receipt, you must submit a multipart/form-data request. */
                    receipt?: string | null;
                    /** @description Whether an attached expense receipt should be deleted. Pass true to delete the expense receipt. */
                    delete_receipt?: boolean | null;
                };
            };
        };
        responses: {
            /** @description Update an expense */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 15297032,
                     *       "notes": "Dinner",
                     *       "total_cost": 13.59,
                     *       "units": 1,
                     *       "is_closed": false,
                     *       "approval_status": "unsubmitted",
                     *       "is_locked": false,
                     *       "is_billed": false,
                     *       "locked_reason": null,
                     *       "spent_date": "2017-03-01",
                     *       "created_at": "2017-06-27T15:42:27Z",
                     *       "updated_at": "2017-06-27T15:45:51Z",
                     *       "billable": true,
                     *       "receipt": {
                     *         "url": "https://{ACCOUNT_SUBDOMAIN}.harvestapp.com/expenses/15297032/receipt",
                     *         "file_name": "dinner_receipt.gif",
                     *         "file_size": 39410,
                     *         "content_type": "image/gif"
                     *       },
                     *       "user": {
                     *         "id": 1782959,
                     *         "name": "Kim Allen"
                     *       },
                     *       "user_assignment": {
                     *         "id": 125068553,
                     *         "is_project_manager": true,
                     *         "is_active": true,
                     *         "budget": null,
                     *         "created_at": "2017-06-26T22:32:52Z",
                     *         "updated_at": "2017-06-26T22:32:52Z",
                     *         "hourly_rate": 100
                     *       },
                     *       "project": {
                     *         "id": 14308069,
                     *         "name": "Online Store - Phase 1",
                     *         "code": "OS1"
                     *       },
                     *       "expense_category": {
                     *         "id": 4195926,
                     *         "name": "Meals",
                     *         "unit_price": null,
                     *         "unit_name": null
                     *       },
                     *       "client": {
                     *         "id": 5735776,
                     *         "name": "123 Industries",
                     *         "currency": "EUR"
                     *       },
                     *       "invoice": null
                     *     }
                     */
                    "application/json": components["schemas"]["Expense"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listInvoiceItemCategories: {
        parameters: {
            query?: {
                /** @description Only return invoice item categories that have been updated since the given date and time. */
                updated_since?: string;
                /**
                 * @deprecated
                 * @description DEPRECATED The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1)
                 */
                page?: number;
                /** @description Pagination cursor */
                cursor?: string;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all invoice item categories */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "invoice_item_categories": [
                     *         {
                     *           "id": 1466293,
                     *           "name": "Product",
                     *           "use_as_service": false,
                     *           "use_as_expense": true,
                     *           "created_at": "2017-06-26T20:41:00Z",
                     *           "updated_at": "2017-06-26T20:41:00Z"
                     *         },
                     *         {
                     *           "id": 1466292,
                     *           "name": "Service",
                     *           "use_as_service": true,
                     *           "use_as_expense": false,
                     *           "created_at": "2017-06-26T20:41:00Z",
                     *           "updated_at": "2017-06-26T20:41:00Z"
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 2,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/invoice_item_categories?page=1&per_page=2000",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/invoice_item_categories?page=1&per_page=2000"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["InvoiceItemCategories"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createInvoiceItemCategory: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /** @description The name of the invoice item category. */
                    name: string | null;
                };
            };
        };
        responses: {
            /** @description Create an invoice item category */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 1467098,
                     *       "name": "Hosting",
                     *       "use_as_service": false,
                     *       "use_as_expense": false,
                     *       "created_at": "2017-06-27T16:20:59Z",
                     *       "updated_at": "2017-06-27T16:20:59Z"
                     *     }
                     */
                    "application/json": components["schemas"]["InvoiceItemCategory"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    retrieveInvoiceItemCategory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                invoiceItemCategoryId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Retrieve an invoice item category */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 1466293,
                     *       "name": "Product",
                     *       "use_as_service": false,
                     *       "use_as_expense": true,
                     *       "created_at": "2017-06-26T20:41:00Z",
                     *       "updated_at": "2017-06-26T20:41:00Z"
                     *     }
                     */
                    "application/json": components["schemas"]["InvoiceItemCategory"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteInvoiceItemCategory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                invoiceItemCategoryId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Delete an invoice item category */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateInvoiceItemCategory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                invoiceItemCategoryId: string;
            };
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /** @description The name of the invoice item category. */
                    name?: string | null;
                };
            };
        };
        responses: {
            /** @description Update an invoice item category */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 1467098,
                     *       "name": "Expense",
                     *       "use_as_service": false,
                     *       "use_as_expense": false,
                     *       "created_at": "2017-06-27T16:20:59Z",
                     *       "updated_at": "2017-06-27T16:21:26Z"
                     *     }
                     */
                    "application/json": components["schemas"]["InvoiceItemCategory"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listInvoices: {
        parameters: {
            query?: {
                /** @description Only return invoices belonging to the client with the given ID. */
                client_id?: number;
                /** @description Only return invoices associated with the project with the given ID. */
                project_id?: number;
                /** @description Only return invoices that have been updated since the given date and time. */
                updated_since?: string;
                /** @description Only return invoices with an issue_date on or after the given date. */
                from?: string;
                /** @description Only return invoices with an issue_date on or before the given date. */
                to?: string;
                /** @description Only return invoices with a state matching the value provided. Options: draft, open, paid, or closed. */
                state?: string;
                /** @description The page number to use in pagination. For instance, if you make a list request and receive 100 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1) */
                page?: number;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 100) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all invoices */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "invoices": [
                     *         {
                     *           "id": 13150403,
                     *           "client_key": "21312da13d457947a217da6775477afee8c2eba8",
                     *           "number": "1001",
                     *           "purchase_order": "",
                     *           "amount": 288.9,
                     *           "due_amount": 288.9,
                     *           "tax": 5,
                     *           "tax_amount": 13.5,
                     *           "tax2": 2,
                     *           "tax2_amount": 5.4,
                     *           "discount": 10,
                     *           "discount_amount": 30,
                     *           "subject": "Online Store - Phase 1",
                     *           "notes": "Some notes about the invoice.",
                     *           "state": "open",
                     *           "period_start": "2017-03-01",
                     *           "period_end": "2017-03-01",
                     *           "issue_date": "2017-04-01",
                     *           "due_date": "2017-04-01",
                     *           "payment_term": "upon receipt",
                     *           "sent_at": "2017-08-23T22:25:59Z",
                     *           "paid_at": null,
                     *           "paid_date": null,
                     *           "closed_at": null,
                     *           "recurring_invoice_id": null,
                     *           "created_at": "2017-06-27T16:27:16Z",
                     *           "updated_at": "2017-08-23T22:25:59Z",
                     *           "currency": "EUR",
                     *           "payment_options": [
                     *             "credit_card"
                     *           ],
                     *           "client": {
                     *             "id": 5735776,
                     *             "name": "123 Industries"
                     *           },
                     *           "estimate": null,
                     *           "retainer": null,
                     *           "creator": {
                     *             "id": 1782884,
                     *             "name": "Bob Powell"
                     *           },
                     *           "line_items": [
                     *             {
                     *               "id": 53341602,
                     *               "kind": "Service",
                     *               "description": "03/01/2017 - Project Management: [9:00am - 11:00am] Planning meetings",
                     *               "quantity": 2,
                     *               "unit_price": 100,
                     *               "amount": 200,
                     *               "taxed": true,
                     *               "taxed2": true,
                     *               "project": {
                     *                 "id": 14308069,
                     *                 "name": "Online Store - Phase 1",
                     *                 "code": "OS1"
                     *               }
                     *             },
                     *             {
                     *               "id": 53341603,
                     *               "kind": "Service",
                     *               "description": "03/01/2017 - Programming: [1:00pm - 2:00pm] Importing products",
                     *               "quantity": 1,
                     *               "unit_price": 100,
                     *               "amount": 100,
                     *               "taxed": true,
                     *               "taxed2": true,
                     *               "project": {
                     *                 "id": 14308069,
                     *                 "name": "Online Store - Phase 1",
                     *                 "code": "OS1"
                     *               }
                     *             }
                     *           ]
                     *         },
                     *         {
                     *           "id": 13150378,
                     *           "client_key": "9e97f4a65c5b83b1fc02f54e5a41c9dc7d458542",
                     *           "number": "1000",
                     *           "purchase_order": "1234",
                     *           "amount": 10700,
                     *           "due_amount": 0,
                     *           "tax": 5,
                     *           "tax_amount": 500,
                     *           "tax2": 2,
                     *           "tax2_amount": 200,
                     *           "discount": null,
                     *           "discount_amount": 0,
                     *           "subject": "Online Store - Phase 1",
                     *           "notes": "Some notes about the invoice.",
                     *           "state": "paid",
                     *           "period_start": null,
                     *           "period_end": null,
                     *           "issue_date": "2017-02-01",
                     *           "due_date": "2017-03-03",
                     *           "payment_term": "custom",
                     *           "sent_at": "2017-02-01T07:00:00Z",
                     *           "paid_at": "2017-02-21T00:00:00Z",
                     *           "paid_date": "2017-02-21",
                     *           "closed_at": null,
                     *           "recurring_invoice_id": null,
                     *           "created_at": "2017-06-27T16:24:30Z",
                     *           "updated_at": "2017-06-27T16:24:57Z",
                     *           "currency": "USD",
                     *           "client": {
                     *             "id": 5735776,
                     *             "name": "123 Industries"
                     *           },
                     *           "estimate": {
                     *             "id": 1439814
                     *           },
                     *           "retainer": null,
                     *           "creator": {
                     *             "id": 1782884,
                     *             "name": "Bob Powell"
                     *           },
                     *           "line_items": [
                     *             {
                     *               "id": 53341450,
                     *               "kind": "Service",
                     *               "description": "50% of Phase 1 of the Online Store",
                     *               "quantity": 100,
                     *               "unit_price": 100,
                     *               "amount": 10000,
                     *               "taxed": true,
                     *               "taxed2": true,
                     *               "project": {
                     *                 "id": 14308069,
                     *                 "name": "Online Store - Phase 1",
                     *                 "code": "OS1"
                     *               }
                     *             }
                     *           ]
                     *         }
                     *       ],
                     *       "per_page": 100,
                     *       "total_pages": 1,
                     *       "total_entries": 2,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/invoices?page=1&per_page=100",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/invoices?page=1&per_page=100"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Invoices"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createInvoice: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: int32
                     * @description The ID of the client this invoice belongs to.
                     */
                    client_id: number | null;
                    /**
                     * Format: int32
                     * @description The ID of the estimate associated with this invoice.
                     */
                    estimate_id?: number | null;
                    /** @description If no value is set, the number will be automatically generated. */
                    number?: string | null;
                    /** @description The purchase order number. */
                    purchase_order?: string | null;
                    /**
                     * Format: float
                     * @description This percentage is applied to the subtotal, including line items and discounts. Example: use 10.0 for 10.0%.
                     */
                    tax?: number | null;
                    /**
                     * Format: float
                     * @description This percentage is applied to the subtotal, including line items and discounts. Example: use 10.0 for 10.0%.
                     */
                    tax2?: number | null;
                    /**
                     * Format: float
                     * @description This percentage is subtracted from the subtotal. Example: use 10.0 for 10.0%.
                     */
                    discount?: number | null;
                    /** @description The invoice subject. */
                    subject?: string | null;
                    /** @description Any additional notes to include on the invoice. */
                    notes?: string | null;
                    /** @description The currency used by the invoice. If not provided, the client’s currency will be used. See a list of supported currencies */
                    currency?: string | null;
                    /**
                     * Format: date
                     * @description Date the invoice was issued. Defaults to today’s date.
                     */
                    issue_date?: string | null;
                    /**
                     * Format: date
                     * @description Date the invoice is due. Defaults to the issue_date if no payment_term is specified. To set a custom due_date the payment_term must also be set to custom, otherwise the value supplied in the request for due_date will be ignored and the due_date will be calculated using the issue_date and the payment_term.
                     */
                    due_date?: string | null;
                    /** @description The timeframe in which the invoice should be paid. Defaults to custom. Options: upon receipt, net 15, net 30, net 45, net 60, or custom. */
                    payment_term?: string | null;
                    /** @description The payment options available to pay the invoice. Your account must be configured with the appropriate options under Settings > Integrations > Online payment to assign them. Options: [ach, credit_card, paypal] */
                    payment_options?: ("ach" | "credit_card" | "paypal")[] | null;
                    /** @description An line items import object */
                    line_items_import?: {
                        /** @description An array of the client’s project IDs you’d like to include time/expenses from. */
                        project_ids: number[];
                        /** @description An time import object. */
                        time?: {
                            /** @description How to summarize the time entries per line item. Options: project, task, people, or detailed. */
                            summary_type: string;
                            /**
                             * Format: date
                             * @description Start date for included time entries. Must be provided if to is present. If neither from or to are provided, all unbilled time entries will be included.
                             */
                            from?: string;
                            /**
                             * Format: date
                             * @description End date for included time entries. Must be provided if from is present. If neither from or to are provided, all unbilled time entries will be included.
                             */
                            to?: string;
                        };
                        /** @description An expense import object. */
                        expenses?: {
                            /** @description How to summarize the expenses per line item. Options: project, category, people, or detailed. */
                            summary_type: string;
                            /**
                             * Format: date
                             * @description Start date for included expenses. Must be provided if to is present. If neither from or to are provided, all unbilled expenses will be included.
                             */
                            from?: string;
                            /**
                             * Format: date
                             * @description End date for included expenses. Must be provided if from is present. If neither from or to are provided, all unbilled expenses will be included.
                             */
                            to?: string;
                            /** @description If set to true, a PDF containing an expense report with receipts will be attached to the invoice. Defaults to false. */
                            attach_receipt?: boolean;
                        };
                    } | null;
                    /**
                     * Format: int32
                     * @description The ID of the retainer you want to add funds to with this invoice. Note: retainers cannot be fully used (created, drawn against, closed, etc.) via the API at this time. The only available action is to add funds.
                     */
                    retainer_id?: number | null;
                    /** @description Array of line item parameters */
                    line_items?: {
                        /**
                         * Format: int32
                         * @description The ID of the project associated with this line item.
                         */
                        project_id?: number;
                        /** @description The name of an invoice item category. */
                        kind: string;
                        /** @description Text description of the line item. */
                        description?: string;
                        /**
                         * Format: float
                         * @description The unit quantity of the item. Defaults to 1.
                         */
                        quantity?: number;
                        /**
                         * Format: float
                         * @description The individual price per unit.
                         */
                        unit_price: number;
                        /** @description Whether the invoice’s tax percentage applies to this line item. Defaults to false. */
                        taxed?: boolean;
                        /** @description Whether the invoice’s tax2 percentage applies to this line item. Defaults to false. */
                        taxed2?: boolean;
                    }[] | null;
                };
            };
        };
        responses: {
            /** @description Create an invoice */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 13150453,
                     *       "client_key": "8b86437630b6c260c1bfa289f0154960f83b606d",
                     *       "number": "1002",
                     *       "purchase_order": null,
                     *       "amount": 5000,
                     *       "due_amount": 5000,
                     *       "tax": null,
                     *       "tax_amount": 0,
                     *       "tax2": null,
                     *       "tax2_amount": 0,
                     *       "discount": null,
                     *       "discount_amount": 0,
                     *       "subject": "ABC Project Quote",
                     *       "notes": null,
                     *       "state": "draft",
                     *       "period_start": null,
                     *       "period_end": null,
                     *       "issue_date": "2017-06-27",
                     *       "due_date": "2017-07-27",
                     *       "payment_term": "custom",
                     *       "sent_at": null,
                     *       "paid_at": null,
                     *       "paid_date": null,
                     *       "closed_at": null,
                     *       "recurring_invoice_id": null,
                     *       "created_at": "2017-06-27T16:34:24Z",
                     *       "updated_at": "2017-06-27T16:34:24Z",
                     *       "currency": "USD",
                     *       "payment_options": [
                     *         "credit_card"
                     *       ],
                     *       "client": {
                     *         "id": 5735774,
                     *         "name": "ABC Corp"
                     *       },
                     *       "estimate": null,
                     *       "retainer": null,
                     *       "creator": {
                     *         "id": 1782884,
                     *         "name": "Bob Powell"
                     *       },
                     *       "line_items": [
                     *         {
                     *           "id": 53341928,
                     *           "kind": "Service",
                     *           "description": "ABC Project",
                     *           "quantity": 1,
                     *           "unit_price": 5000,
                     *           "amount": 5000,
                     *           "taxed": false,
                     *           "taxed2": false,
                     *           "project": null
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["Invoice"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    retrieveInvoice: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                invoiceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Retrieve an invoice */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 13150378,
                     *       "client_key": "9e97f4a65c5b83b1fc02f54e5a41c9dc7d458542",
                     *       "number": "1000",
                     *       "purchase_order": "1234",
                     *       "amount": 10700,
                     *       "due_amount": 0,
                     *       "tax": 5,
                     *       "tax_amount": 500,
                     *       "tax2": 2,
                     *       "tax2_amount": 200,
                     *       "discount": null,
                     *       "discount_amount": 0,
                     *       "subject": "Online Store - Phase 1",
                     *       "notes": "Some notes about the invoice.",
                     *       "state": "paid",
                     *       "period_start": null,
                     *       "period_end": null,
                     *       "issue_date": "2017-02-01",
                     *       "due_date": "2017-03-03",
                     *       "payment_term": "custom",
                     *       "sent_at": "2017-02-01T07:00:00Z",
                     *       "paid_at": "2017-02-21T00:00:00Z",
                     *       "paid_date": "2017-02-21",
                     *       "closed_at": null,
                     *       "recurring_invoice_id": null,
                     *       "created_at": "2017-06-27T16:24:30Z",
                     *       "updated_at": "2017-06-27T16:24:57Z",
                     *       "currency": "USD",
                     *       "payment_options": [
                     *         "credit_card"
                     *       ],
                     *       "client": {
                     *         "id": 5735776,
                     *         "name": "123 Industries"
                     *       },
                     *       "estimate": {
                     *         "id": 1439814
                     *       },
                     *       "retainer": null,
                     *       "creator": {
                     *         "id": 1782884,
                     *         "name": "Bob Powell"
                     *       },
                     *       "line_items": [
                     *         {
                     *           "id": 53341450,
                     *           "kind": "Service",
                     *           "description": "50% of Phase 1 of the Online Store",
                     *           "quantity": 100,
                     *           "unit_price": 100,
                     *           "amount": 10000,
                     *           "taxed": true,
                     *           "taxed2": true,
                     *           "project": {
                     *             "id": 14308069,
                     *             "name": "Online Store - Phase 1",
                     *             "code": "OS1"
                     *           }
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["Invoice"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteInvoice: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                invoiceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Delete an invoice */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateInvoice: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                invoiceId: string;
            };
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: int32
                     * @description The ID of the client this invoice belongs to.
                     */
                    client_id?: number | null;
                    /**
                     * Format: int32
                     * @description The ID of the retainer associated with this invoice.
                     */
                    retainer_id?: number | null;
                    /**
                     * Format: int32
                     * @description The ID of the estimate associated with this invoice.
                     */
                    estimate_id?: number | null;
                    /** @description If no value is set, the number will be automatically generated. */
                    number?: string | null;
                    /** @description The purchase order number. */
                    purchase_order?: string | null;
                    /**
                     * Format: float
                     * @description This percentage is applied to the subtotal, including line items and discounts. Example: use 10.0 for 10.0%.
                     */
                    tax?: number | null;
                    /**
                     * Format: float
                     * @description This percentage is applied to the subtotal, including line items and discounts. Example: use 10.0 for 10.0%.
                     */
                    tax2?: number | null;
                    /**
                     * Format: float
                     * @description This percentage is subtracted from the subtotal. Example: use 10.0 for 10.0%.
                     */
                    discount?: number | null;
                    /** @description The invoice subject. */
                    subject?: string | null;
                    /** @description Any additional notes to include on the invoice. */
                    notes?: string | null;
                    /** @description The currency used by the invoice. If not provided, the client’s currency will be used. See a list of supported currencies */
                    currency?: string | null;
                    /**
                     * Format: date
                     * @description Date the invoice was issued.
                     */
                    issue_date?: string | null;
                    /**
                     * Format: date
                     * @description Date the invoice is due.
                     */
                    due_date?: string | null;
                    /** @description The timeframe in which the invoice should be paid. Options: upon receipt, net 15, net 30, net 45, or net 60. */
                    payment_term?: string | null;
                    /** @description The payment options available to pay the invoice. Your account must be configured with the appropriate options under Settings > Integrations > Online payment to assign them. Options: [ach, credit_card, paypal] */
                    payment_options?: ("ach" | "credit_card" | "paypal")[] | null;
                    /** @description Array of line item parameters */
                    line_items?: {
                        /**
                         * Format: int32
                         * @description Unique ID for the line item.
                         */
                        id?: number;
                        /**
                         * Format: int32
                         * @description The ID of the project associated with this line item.
                         */
                        project_id?: number;
                        /** @description The name of an invoice item category. */
                        kind?: string;
                        /** @description Text description of the line item. */
                        description?: string;
                        /**
                         * Format: float
                         * @description The unit quantity of the item. Defaults to 1.
                         */
                        quantity?: number;
                        /**
                         * Format: float
                         * @description The individual price per unit.
                         */
                        unit_price?: number;
                        /** @description Whether the invoice’s tax percentage applies to this line item. Defaults to false. */
                        taxed?: boolean;
                        /** @description Whether the invoice’s tax2 percentage applies to this line item. Defaults to false. */
                        taxed2?: boolean;
                    }[] | null;
                };
            };
        };
        responses: {
            /** @description Update an invoice */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 13150453,
                     *       "client_key": "8b86437630b6c260c1bfa289f0154960f83b606d",
                     *       "number": "1002",
                     *       "purchase_order": "2345",
                     *       "amount": 5000,
                     *       "due_amount": 5000,
                     *       "tax": null,
                     *       "tax_amount": 0,
                     *       "tax2": null,
                     *       "tax2_amount": 0,
                     *       "discount": null,
                     *       "discount_amount": 0,
                     *       "subject": "ABC Project Quote",
                     *       "notes": null,
                     *       "state": "draft",
                     *       "period_start": null,
                     *       "period_end": null,
                     *       "issue_date": "2017-06-27",
                     *       "due_date": "2017-07-27",
                     *       "payment_term": "custom",
                     *       "sent_at": null,
                     *       "paid_at": null,
                     *       "paid_date": null,
                     *       "closed_at": null,
                     *       "recurring_invoice_id": null,
                     *       "created_at": "2017-06-27T16:34:24Z",
                     *       "updated_at": "2017-06-27T16:36:33Z",
                     *       "currency": "USD",
                     *       "payment_options": [
                     *         "credit_card"
                     *       ],
                     *       "client": {
                     *         "id": 5735774,
                     *         "name": "ABC Corp"
                     *       },
                     *       "estimate": null,
                     *       "retainer": null,
                     *       "creator": {
                     *         "id": 1782884,
                     *         "name": "Bob Powell"
                     *       },
                     *       "line_items": [
                     *         {
                     *           "id": 53341928,
                     *           "kind": "Service",
                     *           "description": "ABC Project",
                     *           "quantity": 1,
                     *           "unit_price": 5000,
                     *           "amount": 5000,
                     *           "taxed": false,
                     *           "taxed2": false,
                     *           "project": null
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["Invoice"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listMessagesForInvoice: {
        parameters: {
            query?: {
                /** @description Only return invoice messages that have been updated since the given date and time. */
                updated_since?: string;
                /**
                 * @deprecated
                 * @description DEPRECATED The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1)
                 */
                page?: number;
                /** @description Pagination cursor */
                cursor?: string;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path: {
                invoiceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all messages for an invoice */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "invoice_messages": [
                     *         {
                     *           "id": 27835209,
                     *           "sent_by": "Bob Powell",
                     *           "sent_by_email": "bobpowell@example.com",
                     *           "sent_from": "Bob Powell",
                     *           "sent_from_email": "bobpowell@example.com",
                     *           "include_link_to_client_invoice": false,
                     *           "send_me_a_copy": false,
                     *           "thank_you": false,
                     *           "reminder": false,
                     *           "send_reminder_on": null,
                     *           "created_at": "2017-08-23T22:15:06Z",
                     *           "updated_at": "2017-08-23T22:15:06Z",
                     *           "attach_pdf": true,
                     *           "event_type": null,
                     *           "recipients": [
                     *             {
                     *               "name": "Richard Roe",
                     *               "email": "richardroe@example.com"
                     *             }
                     *           ],
                     *           "subject": "Past due invoice reminder: #1001 from API Examples",
                     *           "body": "Dear Customer,\r\n\r\nThis is a friendly reminder to let you know that Invoice 1001 is 144 days past due. If you have already sent the payment, please disregard this message. If not, we would appreciate your prompt attention to this matter.\r\n\r\nThank you for your business.\r\n\r\nCheers,\r\nAPI Examples"
                     *         },
                     *         {
                     *           "id": 27835207,
                     *           "sent_by": "Bob Powell",
                     *           "sent_by_email": "bobpowell@example.com",
                     *           "sent_from": "Bob Powell",
                     *           "sent_from_email": "bobpowell@example.com",
                     *           "include_link_to_client_invoice": false,
                     *           "send_me_a_copy": true,
                     *           "thank_you": false,
                     *           "reminder": false,
                     *           "send_reminder_on": null,
                     *           "created_at": "2017-08-23T22:14:49Z",
                     *           "updated_at": "2017-08-23T22:14:49Z",
                     *           "attach_pdf": true,
                     *           "event_type": null,
                     *           "recipients": [
                     *             {
                     *               "name": "Richard Roe",
                     *               "email": "richardroe@example.com"
                     *             },
                     *             {
                     *               "name": "Bob Powell",
                     *               "email": "bobpowell@example.com"
                     *             }
                     *           ],
                     *           "subject": "Invoice #1001 from API Examples",
                     *           "body": "---------------------------------------------\r\nInvoice Summary\r\n---------------------------------------------\r\nInvoice ID: 1001\r\nIssue Date: 04/01/2017\r\nClient: 123 Industries\r\nP.O. Number: \r\nAmount: €288.90\r\nDue: 04/01/2017 (upon receipt)\r\n\r\nThe detailed invoice is attached as a PDF.\r\n\r\nThank you!\r\n---------------------------------------------"
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 2,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/api/v2/invoices/13150403/messages?page=1&per_page=2000",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/invoices/13150403/messages?page=1&per_page=2000"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["InvoiceMessages"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createInvoiceMessage: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                invoiceId: string;
            };
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /** @description Omit when intending to create and send a message. If omitted, the default value is null and the message will be sent. See other sections below for including this parameter with the following options: close, draft, re-open, or send (which marks a draft invoice as sent, it does not send the message). */
                    event_type?: string | null;
                    /** @description Array of recipient parameters. See below for more details. */
                    recipients?: {
                        /** @description Name of the message recipient. */
                        name?: string;
                        /**
                         * Format: email
                         * @description Email of the message recipient.
                         */
                        email: string;
                    }[] | null;
                    /** @description The message subject. */
                    subject?: string | null;
                    /** @description The message body. */
                    body?: string | null;
                    /**
                     * @deprecated
                     * @description DEPRECATED A link to the client invoice URL will be automatically included in the message email if payment_options have been assigned to the invoice. Setting to true will be ignored. Setting to false will clear all payment_options on the invoice.
                     */
                    include_link_to_client_invoice?: boolean | null;
                    /** @description If set to true, a PDF of the invoice will be attached to the message email. Defaults to false. */
                    attach_pdf?: boolean | null;
                    /** @description If set to true, a copy of the message email will be sent to the current user. Defaults to false. */
                    send_me_a_copy?: boolean | null;
                    /** @description If set to true, a thank you message email will be sent. Defaults to false. */
                    thank_you?: boolean | null;
                };
            };
        };
        responses: {
            /** @description Create and send an invoice message */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 27835324,
                     *       "sent_by": "Bob Powell",
                     *       "sent_by_email": "bobpowell@example.com",
                     *       "sent_from": "Bob Powell",
                     *       "sent_from_email": "bobpowell@example.com",
                     *       "include_link_to_client_invoice": false,
                     *       "send_me_a_copy": true,
                     *       "thank_you": false,
                     *       "reminder": false,
                     *       "send_reminder_on": null,
                     *       "created_at": "2017-08-23T22:25:59Z",
                     *       "updated_at": "2017-08-23T22:25:59Z",
                     *       "attach_pdf": true,
                     *       "event_type": null,
                     *       "recipients": [
                     *         {
                     *           "name": "Richard Roe",
                     *           "email": "richardroe@example.com"
                     *         },
                     *         {
                     *           "name": "Bob Powell",
                     *           "email": "bobpowell@example.com"
                     *         }
                     *       ],
                     *       "subject": "Invoice #1001",
                     *       "body": "The invoice is attached below."
                     *     }
                     */
                    "application/json": components["schemas"]["InvoiceMessage"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    retrieveInvoiceMessageSubjectAndBodyForSpecificInvoice: {
        parameters: {
            query?: {
                /** @description Set to true to return the subject and body of a thank-you invoice message for the specific invoice. */
                thank_you?: boolean;
                /** @description Set to true to return the subject and body of a reminder invoice message for the specific invoice. */
                reminder?: boolean;
            };
            header?: never;
            path: {
                invoiceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Retrieve invoice message subject and body for specific invoice */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "invoice_id": 13150403,
                     *       "subject": "Past due invoice reminder: #1002 from API Examples",
                     *       "body": "Dear Customer,\n\nThis is a friendly reminder to let you know that Invoice 1002 is 20 days past due. If you have already sent the payment, please disregard this message. If not, we would appreciate your prompt attention to this matter.\n\nThank you for your business.\n\nCheers,\nAPI Examples\n",
                     *       "reminder": false,
                     *       "thank_you": false
                     *     }
                     */
                    "application/json": components["schemas"]["InvoiceMessageSubjectAndBody"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteInvoiceMessage: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                invoiceId: string;
                messageId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Delete an invoice message */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listPaymentsForInvoice: {
        parameters: {
            query?: {
                /** @description Only return invoice payments that have been updated since the given date and time. */
                updated_since?: string;
                /**
                 * @deprecated
                 * @description DEPRECATED The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1)
                 */
                page?: number;
                /** @description Pagination cursor */
                cursor?: string;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path: {
                invoiceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all payments for an invoice */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "invoice_payments": [
                     *         {
                     *           "id": 10112854,
                     *           "amount": 10700,
                     *           "paid_at": "2017-02-21T00:00:00Z",
                     *           "paid_date": "2017-02-21",
                     *           "recorded_by": "Alice Doe",
                     *           "recorded_by_email": "alice@example.com",
                     *           "notes": "Paid via check #4321",
                     *           "transaction_id": null,
                     *           "created_at": "2017-06-27T16:24:57Z",
                     *           "updated_at": "2017-06-27T16:24:57Z",
                     *           "payment_gateway": {
                     *             "id": 1234,
                     *             "name": "Linkpoint International"
                     *           }
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 1,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/invoices/13150378/payments?page=1&per_page=2000",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/invoices/13150378/payments?page=1&per_page=2000"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["InvoicePayments"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createInvoicePayment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                invoiceId: string;
            };
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: float
                     * @description The amount of the payment.
                     */
                    amount: number | null;
                    /**
                     * Format: date-time
                     * @description Date and time the payment was made. Pass either paid_at or paid_date, but not both.
                     */
                    paid_at?: string | null;
                    /**
                     * Format: date
                     * @description Date the payment was made. Pass either paid_at or paid_date, but not both.
                     */
                    paid_date?: string | null;
                    /** @description Any notes to be associated with the payment. */
                    notes?: string | null;
                    /** @description Whether or not to send a thank you email (if enabled for your account in Invoices > Configure > Messages). Only sends an email if the invoice will be fully paid after creating this payment. Defaults to true. */
                    send_thank_you?: boolean | null;
                };
            };
        };
        responses: {
            /** @description Create an invoice payment */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 10336386,
                     *       "amount": 1575.86,
                     *       "paid_at": "2017-07-24T13:32:18Z",
                     *       "paid_date": "2017-07-24",
                     *       "recorded_by": "Jane Bar",
                     *       "recorded_by_email": "jane@example.com",
                     *       "notes": "Paid by phone",
                     *       "transaction_id": null,
                     *       "created_at": "2017-07-28T14:42:44Z",
                     *       "updated_at": "2017-07-28T14:42:44Z",
                     *       "payment_gateway": {
                     *         "id": null,
                     *         "name": null
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["InvoicePayment"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteInvoicePayment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                invoiceId: string;
                paymentId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Delete an invoice payment */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listProjects: {
        parameters: {
            query?: {
                /** @description Pass true to only return active projects and false to return inactive projects. */
                is_active?: boolean;
                /** @description Only return projects belonging to the client with the given ID. */
                client_id?: number;
                /** @description Only return projects that have been updated since the given date and time. */
                updated_since?: string;
                /**
                 * @deprecated
                 * @description DEPRECATED The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1)
                 */
                page?: number;
                /** @description Pagination cursor */
                cursor?: string;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all projects */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "projects": [
                     *         {
                     *           "id": 14308069,
                     *           "name": "Online Store - Phase 1",
                     *           "code": "OS1",
                     *           "is_active": true,
                     *           "bill_by": "Project",
                     *           "budget": 200,
                     *           "budget_by": "project",
                     *           "budget_is_monthly": false,
                     *           "notify_when_over_budget": true,
                     *           "over_budget_notification_percentage": 80,
                     *           "over_budget_notification_date": null,
                     *           "show_budget_to_all": false,
                     *           "created_at": "2017-06-26T21:52:18Z",
                     *           "updated_at": "2017-06-26T21:54:06Z",
                     *           "starts_on": "2017-06-01",
                     *           "ends_on": null,
                     *           "is_billable": true,
                     *           "is_fixed_fee": false,
                     *           "notes": "",
                     *           "client": {
                     *             "id": 5735776,
                     *             "name": "123 Industries",
                     *             "currency": "EUR"
                     *           },
                     *           "cost_budget": null,
                     *           "cost_budget_include_expenses": false,
                     *           "hourly_rate": 100,
                     *           "fee": null
                     *         },
                     *         {
                     *           "id": 14307913,
                     *           "name": "Marketing Website",
                     *           "code": "MW",
                     *           "is_active": true,
                     *           "bill_by": "Project",
                     *           "budget": 50,
                     *           "budget_by": "project",
                     *           "budget_is_monthly": false,
                     *           "notify_when_over_budget": true,
                     *           "over_budget_notification_percentage": 80,
                     *           "over_budget_notification_date": null,
                     *           "show_budget_to_all": false,
                     *           "created_at": "2017-06-26T21:36:23Z",
                     *           "updated_at": "2017-06-26T21:54:46Z",
                     *           "starts_on": "2017-01-01",
                     *           "ends_on": "2017-03-31",
                     *           "is_billable": true,
                     *           "is_fixed_fee": false,
                     *           "notes": "",
                     *           "client": {
                     *             "id": 5735774,
                     *             "name": "ABC Corp",
                     *             "currency": "USD"
                     *           },
                     *           "cost_budget": null,
                     *           "cost_budget_include_expenses": false,
                     *           "hourly_rate": 100,
                     *           "fee": null
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 2,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/projects?page=1&per_page=2000",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/projects?page=1&per_page=2000"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Projects"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createProject: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: int32
                     * @description The ID of the client to associate this project with.
                     */
                    client_id: number | null;
                    /** @description The name of the project. */
                    name: string | null;
                    /** @description The code associated with the project. */
                    code?: string | null;
                    /** @description Whether the project is active or archived. Defaults to true. */
                    is_active?: boolean | null;
                    /** @description Whether the project is billable or not. */
                    is_billable: boolean | null;
                    /** @description Whether the project is a fixed-fee project or not. */
                    is_fixed_fee?: boolean | null;
                    /** @description The method by which the project is invoiced. Options: Project, Tasks, People, or none. */
                    bill_by: string | null;
                    /**
                     * Format: float
                     * @description Rate for projects billed by Project Hourly Rate.
                     */
                    hourly_rate?: number | null;
                    /** @description The method by which the project is budgeted. Options: project (Hours Per Project), project_cost (Total Project Fees), task (Hours Per Task), task_fees (Fees Per Task), person (Hours Per Person), none (No Budget). */
                    budget_by: string | null;
                    /** @description Option to have the budget reset every month. Defaults to false. */
                    budget_is_monthly?: boolean | null;
                    /**
                     * Format: float
                     * @description The budget in hours for the project when budgeting by time.
                     */
                    budget?: number | null;
                    /**
                     * Format: float
                     * @description The monetary budget for the project when budgeting by money.
                     */
                    cost_budget?: number | null;
                    /** @description Option for budget of Total Project Fees projects to include tracked expenses. Defaults to false. */
                    cost_budget_include_expenses?: boolean | null;
                    /** @description Whether Project Managers should be notified when the project goes over budget. Defaults to false. */
                    notify_when_over_budget?: boolean | null;
                    /**
                     * Format: float
                     * @description Percentage value used to trigger over budget email alerts. Example: use 10.0 for 10.0%.
                     */
                    over_budget_notification_percentage?: number | null;
                    /** @description Option to show project budget to all employees. Does not apply to Total Project Fee projects. Defaults to false. */
                    show_budget_to_all?: boolean | null;
                    /**
                     * Format: float
                     * @description The amount you plan to invoice for the project. Only used by fixed-fee projects.
                     */
                    fee?: number | null;
                    /** @description Project notes. */
                    notes?: string | null;
                    /**
                     * Format: date
                     * @description Date the project was started.
                     */
                    starts_on?: string | null;
                    /**
                     * Format: date
                     * @description Date the project will end.
                     */
                    ends_on?: string | null;
                };
            };
        };
        responses: {
            /** @description Create a project */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 14308112,
                     *       "name": "Your New Project",
                     *       "code": null,
                     *       "is_active": true,
                     *       "bill_by": "Project",
                     *       "budget": 10000,
                     *       "budget_by": "project",
                     *       "budget_is_monthly": false,
                     *       "notify_when_over_budget": false,
                     *       "over_budget_notification_percentage": 80,
                     *       "over_budget_notification_date": null,
                     *       "show_budget_to_all": false,
                     *       "created_at": "2017-06-26T21:56:52Z",
                     *       "updated_at": "2017-06-26T21:56:52Z",
                     *       "starts_on": null,
                     *       "ends_on": null,
                     *       "is_billable": true,
                     *       "is_fixed_fee": false,
                     *       "notes": "",
                     *       "client": {
                     *         "id": 5735776,
                     *         "name": "123 Industries",
                     *         "currency": "EUR"
                     *       },
                     *       "cost_budget": null,
                     *       "cost_budget_include_expenses": false,
                     *       "hourly_rate": 100,
                     *       "fee": null
                     *     }
                     */
                    "application/json": components["schemas"]["Project"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    retrieveProject: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Retrieve a project */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 14308069,
                     *       "name": "Online Store - Phase 1",
                     *       "code": "OS1",
                     *       "is_active": true,
                     *       "bill_by": "Project",
                     *       "budget": 200,
                     *       "budget_by": "project",
                     *       "budget_is_monthly": false,
                     *       "notify_when_over_budget": true,
                     *       "over_budget_notification_percentage": 80,
                     *       "over_budget_notification_date": null,
                     *       "show_budget_to_all": false,
                     *       "created_at": "2017-06-26T21:52:18Z",
                     *       "updated_at": "2017-06-26T21:54:06Z",
                     *       "starts_on": "2017-06-01",
                     *       "ends_on": null,
                     *       "is_billable": true,
                     *       "is_fixed_fee": false,
                     *       "notes": "",
                     *       "client": {
                     *         "id": 5735776,
                     *         "name": "123 Industries",
                     *         "currency": "EUR"
                     *       },
                     *       "cost_budget": null,
                     *       "cost_budget_include_expenses": false,
                     *       "hourly_rate": 100,
                     *       "fee": null
                     *     }
                     */
                    "application/json": components["schemas"]["Project"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteProject: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Delete a project */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateProject: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: int32
                     * @description The ID of the client to associate this project with.
                     */
                    client_id?: number | null;
                    /** @description The name of the project. */
                    name?: string | null;
                    /** @description The code associated with the project. */
                    code?: string | null;
                    /** @description Whether the project is active or archived. Defaults to true. */
                    is_active?: boolean | null;
                    /** @description Whether the project is billable or not. */
                    is_billable?: boolean | null;
                    /** @description Whether the project is a fixed-fee project or not. */
                    is_fixed_fee?: boolean | null;
                    /** @description The method by which the project is invoiced. Options: Project, Tasks, People, or none. */
                    bill_by?: string | null;
                    /**
                     * Format: float
                     * @description Rate for projects billed by Project Hourly Rate.
                     */
                    hourly_rate?: number | null;
                    /** @description The method by which the project is budgeted. Options: project (Hours Per Project), project_cost (Total Project Fees), task (Hours Per Task), task_fees (Fees Per Task), person (Hours Per Person), none (No Budget). */
                    budget_by?: string | null;
                    /** @description Option to have the budget reset every month. Defaults to false. */
                    budget_is_monthly?: boolean | null;
                    /**
                     * Format: float
                     * @description The budget in hours for the project when budgeting by time.
                     */
                    budget?: number | null;
                    /**
                     * Format: float
                     * @description The monetary budget for the project when budgeting by money.
                     */
                    cost_budget?: number | null;
                    /** @description Option for budget of Total Project Fees projects to include tracked expenses. Defaults to false. */
                    cost_budget_include_expenses?: boolean | null;
                    /** @description Whether Project Managers should be notified when the project goes over budget. Defaults to false. */
                    notify_when_over_budget?: boolean | null;
                    /**
                     * Format: float
                     * @description Percentage value used to trigger over budget email alerts. Example: use 10.0 for 10.0%.
                     */
                    over_budget_notification_percentage?: number | null;
                    /** @description Option to show project budget to all employees. Does not apply to Total Project Fee projects. Defaults to false. */
                    show_budget_to_all?: boolean | null;
                    /**
                     * Format: float
                     * @description The amount you plan to invoice for the project. Only used by fixed-fee projects.
                     */
                    fee?: number | null;
                    /** @description Project notes. */
                    notes?: string | null;
                    /**
                     * Format: date
                     * @description Date the project was started.
                     */
                    starts_on?: string | null;
                    /**
                     * Format: date
                     * @description Date the project will end.
                     */
                    ends_on?: string | null;
                };
            };
        };
        responses: {
            /** @description Update a project */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 14308112,
                     *       "name": "New project name",
                     *       "code": null,
                     *       "is_active": true,
                     *       "bill_by": "Project",
                     *       "budget": 10000,
                     *       "budget_by": "project",
                     *       "budget_is_monthly": false,
                     *       "notify_when_over_budget": false,
                     *       "over_budget_notification_percentage": 80,
                     *       "over_budget_notification_date": null,
                     *       "show_budget_to_all": false,
                     *       "created_at": "2017-06-26T21:56:52Z",
                     *       "updated_at": "2017-06-26T21:57:20Z",
                     *       "starts_on": null,
                     *       "ends_on": null,
                     *       "is_billable": true,
                     *       "is_fixed_fee": false,
                     *       "notes": "",
                     *       "client": {
                     *         "id": 5735776,
                     *         "name": "123 Industries",
                     *         "currency": "EUR"
                     *       },
                     *       "cost_budget": null,
                     *       "cost_budget_include_expenses": false,
                     *       "hourly_rate": 100,
                     *       "fee": null
                     *     }
                     */
                    "application/json": components["schemas"]["Project"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listTaskAssignmentsForSpecificProject: {
        parameters: {
            query?: {
                /** @description Pass true to only return active task assignments and false to return inactive task assignments. */
                is_active?: boolean;
                /** @description Only return task assignments that have been updated since the given date and time. */
                updated_since?: string;
                /** @description The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1) */
                page?: number;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all task assignments for a specific project */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "task_assignments": [
                     *         {
                     *           "id": 155505016,
                     *           "billable": false,
                     *           "is_active": true,
                     *           "created_at": "2017-06-26T21:52:18Z",
                     *           "updated_at": "2017-06-26T21:54:06Z",
                     *           "hourly_rate": 100,
                     *           "budget": null,
                     *           "project": {
                     *             "id": 14308069,
                     *             "name": "Online Store - Phase 1",
                     *             "code": "OS1"
                     *           },
                     *           "task": {
                     *             "id": 8083369,
                     *             "name": "Research"
                     *           }
                     *         },
                     *         {
                     *           "id": 155505015,
                     *           "billable": true,
                     *           "is_active": true,
                     *           "created_at": "2017-06-26T21:52:18Z",
                     *           "updated_at": "2017-06-26T21:52:18Z",
                     *           "hourly_rate": 100,
                     *           "budget": null,
                     *           "project": {
                     *             "id": 14308069,
                     *             "name": "Online Store - Phase 1",
                     *             "code": "OS1"
                     *           },
                     *           "task": {
                     *             "id": 8083368,
                     *             "name": "Project Management"
                     *           }
                     *         },
                     *         {
                     *           "id": 155505014,
                     *           "billable": true,
                     *           "is_active": true,
                     *           "created_at": "2017-06-26T21:52:18Z",
                     *           "updated_at": "2017-06-26T21:52:18Z",
                     *           "hourly_rate": 100,
                     *           "budget": null,
                     *           "project": {
                     *             "id": 14308069,
                     *             "name": "Online Store - Phase 1",
                     *             "code": "OS1"
                     *           },
                     *           "task": {
                     *             "id": 8083366,
                     *             "name": "Programming"
                     *           }
                     *         },
                     *         {
                     *           "id": 155505013,
                     *           "billable": true,
                     *           "is_active": true,
                     *           "created_at": "2017-06-26T21:52:18Z",
                     *           "updated_at": "2017-06-26T21:52:18Z",
                     *           "hourly_rate": 100,
                     *           "budget": null,
                     *           "project": {
                     *             "id": 14308069,
                     *             "name": "Online Store - Phase 1",
                     *             "code": "OS1"
                     *           },
                     *           "task": {
                     *             "id": 8083365,
                     *             "name": "Graphic Design"
                     *           }
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 4,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/projects/14308069/task_assignments?page=1&per_page=2000",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/projects/14308069/task_assignments?page=1&per_page=2000"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["TaskAssignments"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createTaskAssignment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: int32
                     * @description The ID of the task to associate with the project.
                     */
                    task_id: number | null;
                    /** @description Whether the task assignment is active or archived. Defaults to true. */
                    is_active?: boolean | null;
                    /** @description Whether the task assignment is billable or not. Defaults to false. */
                    billable?: boolean | null;
                    /**
                     * Format: float
                     * @description Rate used when the project’s bill_by is Tasks. Defaults to null when billing by task hourly rate, otherwise 0.
                     */
                    hourly_rate?: number | null;
                    /**
                     * Format: float
                     * @description Budget used when the project’s budget_by is task or task_fees.
                     */
                    budget?: number | null;
                };
            };
        };
        responses: {
            /** @description Create a task assignment */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 155506339,
                     *       "billable": true,
                     *       "is_active": true,
                     *       "created_at": "2017-06-26T22:10:43Z",
                     *       "updated_at": "2017-06-26T22:10:43Z",
                     *       "hourly_rate": 75.5,
                     *       "budget": null,
                     *       "project": {
                     *         "id": 14308069,
                     *         "name": "Online Store - Phase 1",
                     *         "code": "OS1"
                     *       },
                     *       "task": {
                     *         "id": 8083800,
                     *         "name": "Business Development"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["TaskAssignment"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    retrieveTaskAssignment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                taskAssignmentId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Retrieve a task assignment */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 155505016,
                     *       "billable": false,
                     *       "is_active": true,
                     *       "created_at": "2017-06-26T21:52:18Z",
                     *       "updated_at": "2017-06-26T21:54:06Z",
                     *       "hourly_rate": 100,
                     *       "budget": null,
                     *       "project": {
                     *         "id": 14308069,
                     *         "name": "Online Store - Phase 1",
                     *         "code": "OS1"
                     *       },
                     *       "task": {
                     *         "id": 8083369,
                     *         "name": "Research"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["TaskAssignment"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteTaskAssignment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                taskAssignmentId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Delete a task assignment */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateTaskAssignment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                taskAssignmentId: string;
            };
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /** @description Whether the task assignment is active or archived. */
                    is_active?: boolean | null;
                    /** @description Whether the task assignment is billable or not. */
                    billable?: boolean | null;
                    /**
                     * Format: float
                     * @description Rate used when the project’s bill_by is Tasks.
                     */
                    hourly_rate?: number | null;
                    /**
                     * Format: float
                     * @description Budget used when the project’s budget_by is task or task_fees.
                     */
                    budget?: number | null;
                };
            };
        };
        responses: {
            /** @description Update a task assignment */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 155506339,
                     *       "billable": true,
                     *       "is_active": true,
                     *       "created_at": "2017-06-26T22:10:43Z",
                     *       "updated_at": "2017-06-26T22:11:27Z",
                     *       "hourly_rate": 75.5,
                     *       "budget": 120,
                     *       "project": {
                     *         "id": 14308069,
                     *         "name": "Online Store - Phase 1",
                     *         "code": "OS1"
                     *       },
                     *       "task": {
                     *         "id": 8083800,
                     *         "name": "Business Development"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["TaskAssignment"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listUserAssignmentsForSpecificProject: {
        parameters: {
            query?: {
                /** @description Only return user assignments belonging to the user with the given ID. */
                user_id?: number;
                /** @description Pass true to only return active user assignments and false to return inactive user assignments. */
                is_active?: boolean;
                /** @description Only return user assignments that have been updated since the given date and time. */
                updated_since?: string;
                /** @description The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1) */
                page?: number;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all user assignments for a specific project */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "user_assignments": [
                     *         {
                     *           "id": 125068554,
                     *           "is_project_manager": true,
                     *           "is_active": true,
                     *           "use_default_rates": true,
                     *           "budget": null,
                     *           "created_at": "2017-06-26T22:32:52Z",
                     *           "updated_at": "2017-06-26T22:32:52Z",
                     *           "hourly_rate": 100,
                     *           "project": {
                     *             "id": 14308069,
                     *             "name": "Online Store - Phase 1",
                     *             "code": "OS1"
                     *           },
                     *           "user": {
                     *             "id": 1782959,
                     *             "name": "Kim Allen"
                     *           }
                     *         },
                     *         {
                     *           "id": 125066109,
                     *           "is_project_manager": true,
                     *           "is_active": true,
                     *           "use_default_rates": false,
                     *           "budget": null,
                     *           "created_at": "2017-06-26T21:52:18Z",
                     *           "updated_at": "2017-06-26T21:52:18Z",
                     *           "hourly_rate": 100,
                     *           "project": {
                     *             "id": 14308069,
                     *             "name": "Online Store - Phase 1",
                     *             "code": "OS1"
                     *           },
                     *           "user": {
                     *             "id": 1782884,
                     *             "name": "Jeremy Israelsen"
                     *           }
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 2,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/projects/14308069/user_assignments?page=1&per_page=2000",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/projects/14308069/user_assignments?page=1&per_page=2000"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["UserAssignments"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createUserAssignment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: int32
                     * @description The ID of the user to associate with the project.
                     */
                    user_id: number | null;
                    /** @description Whether the user assignment is active or archived. Defaults to true. */
                    is_active?: boolean | null;
                    /** @description Determines if the user has Project Manager permissions for the project. Defaults to false for users with Regular User permissions and true for those with Project Managers or Administrator permissions. */
                    is_project_manager?: boolean | null;
                    /** @description Determines which billable rate(s) will be used on the project for this user when bill_by is People. When true, the project will use the user’s default billable rates. When false, the project will use the custom rate defined on this user assignment. Defaults to true. */
                    use_default_rates?: boolean | null;
                    /**
                     * Format: float
                     * @description Custom rate used when the project’s bill_by is People and use_default_rates is false. Defaults to 0.
                     */
                    hourly_rate?: number | null;
                    /**
                     * Format: float
                     * @description Budget used when the project’s budget_by is person.
                     */
                    budget?: number | null;
                };
            };
        };
        responses: {
            /** @description Create a user assignment */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 125068758,
                     *       "is_project_manager": false,
                     *       "is_active": true,
                     *       "use_default_rates": false,
                     *       "budget": null,
                     *       "created_at": "2017-06-26T22:36:01Z",
                     *       "updated_at": "2017-06-26T22:36:01Z",
                     *       "hourly_rate": 75.5,
                     *       "project": {
                     *         "id": 14308069,
                     *         "name": "Online Store - Phase 1",
                     *         "code": "OS1"
                     *       },
                     *       "user": {
                     *         "id": 1782974,
                     *         "name": "Jim Allen"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["UserAssignment"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    retrieveUserAssignment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                userAssignmentId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Retrieve a user assignment */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 125068554,
                     *       "is_project_manager": true,
                     *       "is_active": true,
                     *       "use_default_rates": true,
                     *       "budget": null,
                     *       "created_at": "2017-06-26T22:32:52Z",
                     *       "updated_at": "2017-06-26T22:32:52Z",
                     *       "hourly_rate": 100,
                     *       "project": {
                     *         "id": 14308069,
                     *         "name": "Online Store - Phase 1",
                     *         "code": "OS1"
                     *       },
                     *       "user": {
                     *         "id": 1782959,
                     *         "name": "Kim Allen"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["UserAssignment"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteUserAssignment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                userAssignmentId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Delete a user assignment */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateUserAssignment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                userAssignmentId: string;
            };
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /** @description Whether the user assignment is active or archived. */
                    is_active?: boolean | null;
                    /** @description Determines if the user has Project Manager permissions for the project. */
                    is_project_manager?: boolean | null;
                    /** @description Determines which billable rate(s) will be used on the project for this user when bill_by is People. When true, the project will use the user’s default billable rates. When false, the project will use the custom rate defined on this user assignment. */
                    use_default_rates?: boolean | null;
                    /**
                     * Format: float
                     * @description Custom rate used when the project’s bill_by is People and use_default_rates is false.
                     */
                    hourly_rate?: number | null;
                    /**
                     * Format: float
                     * @description Budget used when the project’s budget_by is person.
                     */
                    budget?: number | null;
                };
            };
        };
        responses: {
            /** @description Update a user assignment */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 125068758,
                     *       "is_project_manager": false,
                     *       "is_active": true,
                     *       "use_default_rates": false,
                     *       "budget": 120,
                     *       "created_at": "2017-06-26T22:36:01Z",
                     *       "updated_at": "2017-06-26T22:36:35Z",
                     *       "hourly_rate": 75.5,
                     *       "project": {
                     *         "id": 14308069,
                     *         "name": "Online Store - Phase 1",
                     *         "code": "OS1"
                     *       },
                     *       "user": {
                     *         "id": 1782974,
                     *         "name": "Jim Allen"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["UserAssignment"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    expenseCategoriesReport: {
        parameters: {
            query: {
                /** @description Only report on expenses with a spent_date on or after the given date. */
                from: string;
                /** @description Only report on expenses with a spent_date on or before the given date. */
                to: string;
                /** @description The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1) */
                page?: number;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Expense Categories Report */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "results": [
                     *         {
                     *           "expense_category_id": 4197501,
                     *           "expense_category_name": "Lodging",
                     *           "total_amount": 100,
                     *           "billable_amount": 100,
                     *           "currency": "EUR"
                     *         },
                     *         {
                     *           "expense_category_id": 4195926,
                     *           "expense_category_name": "Meals",
                     *           "total_amount": 100,
                     *           "billable_amount": 100,
                     *           "currency": "EUR"
                     *         },
                     *         {
                     *           "expense_category_id": 4195926,
                     *           "expense_category_name": "Meals",
                     *           "total_amount": 33.35,
                     *           "billable_amount": 33.35,
                     *           "currency": "USD"
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 3,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/reports/expenses/categories?from=20170101&page=1&per_page=2000&to=20171231",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/reports/expenses/categories?from=20170101&page=1&per_page=2000&to=20171231"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["ExpenseReportsResults"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    clientsExpensesReport: {
        parameters: {
            query: {
                /** @description Only report on expenses with a spent_date on or after the given date. */
                from: string;
                /** @description Only report on expenses with a spent_date on or before the given date. */
                to: string;
                /** @description The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1) */
                page?: number;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Clients Report */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "results": [
                     *         {
                     *           "client_id": 5735776,
                     *           "client_name": "123 Industries",
                     *           "total_amount": 100,
                     *           "billable_amount": 100,
                     *           "currency": "EUR"
                     *         },
                     *         {
                     *           "client_id": 5735774,
                     *           "client_name": "ABC Corp",
                     *           "total_amount": 133.35,
                     *           "billable_amount": 133.35,
                     *           "currency": "USD"
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 2,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/reports/expenses/clients?from=20170101&page=1&per_page=2000&to=20171231",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/reports/expenses/clients?from=20170101&page=1&per_page=2000&to=20171231"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["ExpenseReportsResults"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    projectsExpensesReport: {
        parameters: {
            query: {
                /** @description Only report on expenses with a spent_date on or after the given date. */
                from: string;
                /** @description Only report on expenses with a spent_date on or before the given date. */
                to: string;
                /** @description The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1) */
                page?: number;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Projects Report */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "results": [
                     *         {
                     *           "client_id": 5735774,
                     *           "client_name": "ABC Corp",
                     *           "project_id": 14307913,
                     *           "project_name": "[MW] Marketing Website",
                     *           "total_amount": 133.35,
                     *           "billable_amount": 133.35,
                     *           "currency": "USD"
                     *         },
                     *         {
                     *           "client_id": 5735776,
                     *           "client_name": "123 Industries",
                     *           "project_id": 14308069,
                     *           "project_name": "[OS1] Online Store - Phase 1",
                     *           "total_amount": 100,
                     *           "billable_amount": 100,
                     *           "currency": "EUR"
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 2,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/reports/expenses/projects?from=20170101&page=1&per_page=2000&to=20171231",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/reports/expenses/projects?from=20170101&page=1&per_page=2000&to=20171231"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["ExpenseReportsResults"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    teamExpensesReport: {
        parameters: {
            query: {
                /** @description Only report on expenses with a spent_date on or after the given date. */
                from: string;
                /** @description Only report on expenses with a spent_date on or before the given date. */
                to: string;
                /** @description The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1) */
                page?: number;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Team Report */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "results": [
                     *         {
                     *           "user_id": 1782884,
                     *           "user_name": "Bob Powell",
                     *           "is_contractor": false,
                     *           "total_amount": 100,
                     *           "billable_amount": 100,
                     *           "currency": "USD"
                     *         },
                     *         {
                     *           "user_id": 1782959,
                     *           "user_name": "Kim Allen",
                     *           "is_contractor": false,
                     *           "total_amount": 100,
                     *           "billable_amount": 100,
                     *           "currency": "EUR"
                     *         },
                     *         {
                     *           "user_id": 1782959,
                     *           "user_name": "Kim Allen",
                     *           "is_contractor": false,
                     *           "total_amount": 33.35,
                     *           "billable_amount": 33.35,
                     *           "currency": "USD"
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 3,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/reports/expenses/team?from=20170101&page=1&per_page=2000&to=20171231",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/reports/expenses/team?from=20170101&page=1&per_page=2000&to=20171231"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["ExpenseReportsResults"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    projectBudgetReport: {
        parameters: {
            query?: {
                /** @description The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1) */
                page?: number;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
                /** @description Pass true to only return active projects and false to return inactive projects. */
                is_active?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Project Budget Report */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "results": [
                     *         {
                     *           "project_id": 14308069,
                     *           "project_name": "Online Store - Phase 1",
                     *           "client_id": 5735776,
                     *           "client_name": "123 Industries",
                     *           "budget_is_monthly": false,
                     *           "budget_by": "project",
                     *           "is_active": true,
                     *           "budget": 200,
                     *           "budget_spent": 4,
                     *           "budget_remaining": 196
                     *         },
                     *         {
                     *           "project_id": 14307913,
                     *           "project_name": "Marketing Website",
                     *           "client_id": 5735774,
                     *           "client_name": "ABC Corp",
                     *           "budget_is_monthly": false,
                     *           "budget_by": "project",
                     *           "is_active": true,
                     *           "budget": 50,
                     *           "budget_spent": 2,
                     *           "budget_remaining": 48
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 2,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/reports/project_budget?page=1&per_page=2000",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/reports/project_budget?page=1&per_page=2000"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["ProjectBudgetReportResults"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    clientsTimeReport: {
        parameters: {
            query: {
                /** @description Only report on time entries with a spent_date on or after the given date. */
                from: string;
                /** @description Only report on time entries with a spent_date on or before the given date. */
                to: string;
                /** @description When true, billable amounts will be calculated and included for fixed fee projects. */
                include_fixed_fee?: string;
                /** @description The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1) */
                page?: number;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Clients Report */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "results": [
                     *         {
                     *           "client_id": 5735776,
                     *           "client_name": "123 Industries",
                     *           "total_hours": 4.5,
                     *           "billable_hours": 3.5,
                     *           "currency": "EUR",
                     *           "billable_amount": 350
                     *         },
                     *         {
                     *           "client_id": 5735774,
                     *           "client_name": "ABC Corp",
                     *           "total_hours": 2,
                     *           "billable_hours": 2,
                     *           "currency": "USD",
                     *           "billable_amount": 200
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 2,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/reports/time/clients?from=20170101&page=1&per_page=2000&to=20171231",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/reports/time/clients?from=20170101&page=1&per_page=2000&to=20171231"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["TimeReportsResults"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    projectsTimeReport: {
        parameters: {
            query: {
                /** @description Only report on time entries with a spent_date on or after the given date. */
                from: string;
                /** @description Only report on time entries with a spent_date on or before the given date. */
                to: string;
                /** @description When true, billable amounts will be calculated and included for fixed fee projects. */
                include_fixed_fee?: string;
                /** @description The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1) */
                page?: number;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Projects Report */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "results": [
                     *         {
                     *           "project_id": 14307913,
                     *           "project_name": "[MW] Marketing Website",
                     *           "client_id": 5735774,
                     *           "client_name": "ABC Corp",
                     *           "total_hours": 2,
                     *           "billable_hours": 2,
                     *           "currency": "USD",
                     *           "billable_amount": 200
                     *         },
                     *         {
                     *           "project_id": 14308069,
                     *           "project_name": "[OS1] Online Store - Phase 1",
                     *           "client_id": 5735776,
                     *           "client_name": "123 Industries",
                     *           "total_hours": 4,
                     *           "billable_hours": 3,
                     *           "currency": "EUR",
                     *           "billable_amount": 300
                     *         },
                     *         {
                     *           "project_id": 14808188,
                     *           "project_name": "[TF] Task Force",
                     *           "client_id": 5735776,
                     *           "client_name": "123 Industries",
                     *           "total_hours": 0.5,
                     *           "billable_hours": 0.5,
                     *           "currency": "EUR",
                     *           "billable_amount": 50
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 3,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/reports/time/projects?from=20170101&page=1&per_page=2000&to=20171231",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/reports/time/projects?from=20170101&page=1&per_page=2000&to=20171231"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["TimeReportsResults"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    tasksReport: {
        parameters: {
            query: {
                /** @description Only report on time entries with a spent_date on or after the given date. */
                from: string;
                /** @description Only report on time entries with a spent_date on or before the given date. */
                to: string;
                /** @description When true, billable amounts will be calculated and included for fixed fee projects. */
                include_fixed_fee?: string;
                /** @description The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1) */
                page?: number;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Tasks Report */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "results": [
                     *         {
                     *           "task_id": 8083365,
                     *           "task_name": "Graphic Design",
                     *           "total_hours": 2,
                     *           "billable_hours": 2,
                     *           "currency": "USD",
                     *           "billable_amount": 200
                     *         },
                     *         {
                     *           "task_id": 8083366,
                     *           "task_name": "Programming",
                     *           "total_hours": 1.5,
                     *           "billable_hours": 1.5,
                     *           "currency": "EUR",
                     *           "billable_amount": 150
                     *         },
                     *         {
                     *           "task_id": 8083368,
                     *           "task_name": "Project Management",
                     *           "total_hours": 1.5,
                     *           "billable_hours": 1.5,
                     *           "currency": "EUR",
                     *           "billable_amount": 150
                     *         },
                     *         {
                     *           "task_id": 8083368,
                     *           "task_name": "Project Management",
                     *           "total_hours": 0.5,
                     *           "billable_hours": 0.5,
                     *           "currency": "USD",
                     *           "billable_amount": 50
                     *         },
                     *         {
                     *           "task_id": 8083369,
                     *           "task_name": "Research",
                     *           "total_hours": 1,
                     *           "billable_hours": 0,
                     *           "currency": "EUR",
                     *           "billable_amount": 0
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 5,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/reports/time/tasks?from=20170101&page=1&per_page=2000&to=20171231",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/reports/time/tasks?from=20170101&page=1&per_page=2000&to=20171231"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["TimeReportsResults"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    teamTimeReport: {
        parameters: {
            query: {
                /** @description Only report on time entries with a spent_date on or after the given date. */
                from: string;
                /** @description Only report on time entries with a spent_date on or before the given date. */
                to: string;
                /** @description When true, billable amounts will be calculated and included for fixed fee projects. */
                include_fixed_fee?: string;
                /** @description The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1) */
                page?: number;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Team Report */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "results": [
                     *         {
                     *           "user_id": 1795925,
                     *           "user_name": "Jane Smith",
                     *           "is_contractor": false,
                     *           "total_hours": 0.5,
                     *           "billable_hours": 0.5,
                     *           "currency": "EUR",
                     *           "billable_amount": 50,
                     *           "weekly_capacity": 126000,
                     *           "avatar_url": "https://cache.harvestapp.com/assets/profile_images/abraj_albait_towers.png?1498516481"
                     *         },
                     *         {
                     *           "user_id": 1782959,
                     *           "user_name": "Kim Allen",
                     *           "is_contractor": false,
                     *           "total_hours": 4,
                     *           "billable_hours": 3,
                     *           "currency": "EUR",
                     *           "billable_amount": 300,
                     *           "weekly_capacity": 126000,
                     *           "avatar_url": "https://cache.harvestapp.com/assets/profile_images/cornell_clock_tower.png?1498515345"
                     *         },
                     *         {
                     *           "user_id": 1782959,
                     *           "user_name": "Kim Allen",
                     *           "is_contractor": false,
                     *           "total_hours": 2,
                     *           "billable_hours": 2,
                     *           "currency": "USD",
                     *           "billable_amount": 200,
                     *           "weekly_capacity": 126000,
                     *           "avatar_url": "https://cache.harvestapp.com/assets/profile_images/allen_bradley_clock_tower.png?1498509661"
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 3,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/reports/time/team?from=20170101&page=1&per_page=2000&to=20171231",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/reports/time/team?from=20170101&page=1&per_page=2000&to=20171231"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["TimeReportsResults"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    uninvoicedReport: {
        parameters: {
            query: {
                /** @description Only report on time entries and expenses with a spent_date on or after the given date. */
                from: string;
                /** @description Only report on time entries and expenses with a spent_date on or before the given date. */
                to: string;
                /** @description Whether or not to include fixed-fee projects in the response. Fixed-fee uninvoiced fee amount will show as long as the selected date range is on or after the project start date (If project start date is not specified, it is project creation date). Otherwise, it will be 0. (Default: true) */
                include_fixed_fee?: boolean;
                /** @description The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1) */
                page?: number;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Uninvoiced Report */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "results": [
                     *         {
                     *           "client_id": 5735776,
                     *           "client_name": "123 Industries",
                     *           "project_id": 14308069,
                     *           "project_name": "Online Store - Phase 1",
                     *           "currency": "EUR",
                     *           "total_hours": 4,
                     *           "uninvoiced_hours": 0,
                     *           "uninvoiced_expenses": 100,
                     *           "uninvoiced_amount": 100
                     *         },
                     *         {
                     *           "client_id": 5735776,
                     *           "client_name": "123 Industries",
                     *           "project_id": 14808188,
                     *           "project_name": "Task Force",
                     *           "currency": "EUR",
                     *           "total_hours": 0.5,
                     *           "uninvoiced_hours": 0.5,
                     *           "uninvoiced_expenses": 0,
                     *           "uninvoiced_amount": 50
                     *         },
                     *         {
                     *           "client_id": 5735774,
                     *           "client_name": "ABC Corp",
                     *           "project_id": 14307913,
                     *           "project_name": "Marketing Website",
                     *           "currency": "USD",
                     *           "total_hours": 2,
                     *           "uninvoiced_hours": 0,
                     *           "uninvoiced_expenses": 0,
                     *           "uninvoiced_amount": 0
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 3,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/reports/uninvoiced?from=20170101&page=1&per_page=2000&to=20171231",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/reports/uninvoiced?from=20170101&page=1&per_page=2000&to=20171231"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["UninvoicedReportResults"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listRoles: {
        parameters: {
            query?: {
                /**
                 * @deprecated
                 * @description DEPRECATED The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1)
                 */
                page?: number;
                /** @description Pagination cursor */
                cursor?: string;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all roles */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "roles": [
                     *         {
                     *           "id": 618100,
                     *           "name": "Designer",
                     *           "created_at": "2020-04-17T10:09:41Z",
                     *           "updated_at": "2020-04-17T10:09:41Z",
                     *           "user_ids": []
                     *         },
                     *         {
                     *           "id": 618099,
                     *           "name": "Developer",
                     *           "created_at": "2020-04-17T10:08:43Z",
                     *           "updated_at": "2020-04-17T10:08:43Z",
                     *           "user_ids": []
                     *         },
                     *         {
                     *           "id": 617630,
                     *           "name": "Sales",
                     *           "created_at": "2020-04-16T16:59:59Z",
                     *           "updated_at": "2020-04-16T16:59:59Z",
                     *           "user_ids": [
                     *             2084359,
                     *             3122373,
                     *             3122374
                     *           ]
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 2,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/roles?page=1&per_page=2000",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/roles?page=1&per_page=2000"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Roles"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createRole: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /** @description The name of the role. */
                    name: string | null;
                    /** @description The IDs of the users assigned to this role. */
                    user_ids?: number[] | null;
                };
            };
        };
        responses: {
            /** @description Create a role */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 617670,
                     *       "name": "Marketing",
                     *       "created_at": "2020-04-16T18:18:30Z",
                     *       "updated_at": "2020-04-16T18:18:30Z",
                     *       "user_ids": [
                     *         3122374,
                     *         3122373,
                     *         2084359
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["Role"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    retrieveRole: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                roleId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Retrieve a role */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 617630,
                     *       "name": "Sales",
                     *       "created_at": "2020-04-16T16:59:59Z",
                     *       "updated_at": "2020-04-16T16:59:59Z",
                     *       "user_ids": [
                     *         2084359,
                     *         3122373,
                     *         3122374
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["Role"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteRole: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                roleId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Delete a role */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateRole: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                roleId: string;
            };
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /** @description The name of the role. */
                    name?: string | null;
                    /** @description The IDs of the users assigned to this role. */
                    user_ids?: number[] | null;
                };
            };
        };
        responses: {
            /** @description Update a role */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 618099,
                     *       "name": "HR",
                     *       "created_at": "2020-04-16T17:00:38Z",
                     *       "updated_at": "2020-04-16T17:00:57Z",
                     *       "user_ids": [
                     *         2084359
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["Role"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listTaskAssignments: {
        parameters: {
            query?: {
                /** @description Pass true to only return active task assignments and false to return inactive task assignments. */
                is_active?: boolean;
                /** @description Only return task assignments that have been updated since the given date and time. */
                updated_since?: string;
                /**
                 * @deprecated
                 * @description DEPRECATED The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1)
                 */
                page?: number;
                /** @description Pagination cursor */
                cursor?: string;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all task assignments */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "task_assignments": [
                     *         {
                     *           "id": 160726647,
                     *           "billable": false,
                     *           "is_active": true,
                     *           "created_at": "2017-08-22T17:36:54Z",
                     *           "updated_at": "2017-08-22T17:36:54Z",
                     *           "hourly_rate": 100,
                     *           "budget": null,
                     *           "project": {
                     *             "id": 14808188,
                     *             "name": "Task Force",
                     *             "code": "TF"
                     *           },
                     *           "task": {
                     *             "id": 8083369,
                     *             "name": "Research"
                     *           }
                     *         },
                     *         {
                     *           "id": 160726646,
                     *           "billable": true,
                     *           "is_active": true,
                     *           "created_at": "2017-08-22T17:36:54Z",
                     *           "updated_at": "2017-08-22T17:36:54Z",
                     *           "hourly_rate": 100,
                     *           "budget": null,
                     *           "project": {
                     *             "id": 14808188,
                     *             "name": "Task Force",
                     *             "code": "TF"
                     *           },
                     *           "task": {
                     *             "id": 8083368,
                     *             "name": "Project Management"
                     *           }
                     *         },
                     *         {
                     *           "id": 160726645,
                     *           "billable": true,
                     *           "is_active": true,
                     *           "created_at": "2017-08-22T17:36:54Z",
                     *           "updated_at": "2017-08-22T17:36:54Z",
                     *           "hourly_rate": 100,
                     *           "budget": null,
                     *           "project": {
                     *             "id": 14808188,
                     *             "name": "Task Force",
                     *             "code": "TF"
                     *           },
                     *           "task": {
                     *             "id": 8083366,
                     *             "name": "Programming"
                     *           }
                     *         },
                     *         {
                     *           "id": 160726644,
                     *           "billable": true,
                     *           "is_active": true,
                     *           "created_at": "2017-08-22T17:36:54Z",
                     *           "updated_at": "2017-08-22T17:36:54Z",
                     *           "hourly_rate": 100,
                     *           "budget": null,
                     *           "project": {
                     *             "id": 14808188,
                     *             "name": "Task Force",
                     *             "code": "TF"
                     *           },
                     *           "task": {
                     *             "id": 8083365,
                     *             "name": "Graphic Design"
                     *           }
                     *         },
                     *         {
                     *           "id": 155505153,
                     *           "billable": false,
                     *           "is_active": true,
                     *           "created_at": "2017-06-26T21:53:20Z",
                     *           "updated_at": "2017-06-26T21:54:31Z",
                     *           "hourly_rate": 100,
                     *           "budget": null,
                     *           "project": {
                     *             "id": 14307913,
                     *             "name": "Marketing Website",
                     *             "code": "MW"
                     *           },
                     *           "task": {
                     *             "id": 8083369,
                     *             "name": "Research"
                     *           }
                     *         },
                     *         {
                     *           "id": 155505016,
                     *           "billable": false,
                     *           "is_active": true,
                     *           "created_at": "2017-06-26T21:52:18Z",
                     *           "updated_at": "2017-06-26T21:54:06Z",
                     *           "hourly_rate": 100,
                     *           "budget": null,
                     *           "project": {
                     *             "id": 14308069,
                     *             "name": "Online Store - Phase 1",
                     *             "code": "OS1"
                     *           },
                     *           "task": {
                     *             "id": 8083369,
                     *             "name": "Research"
                     *           }
                     *         },
                     *         {
                     *           "id": 155505015,
                     *           "billable": true,
                     *           "is_active": true,
                     *           "created_at": "2017-06-26T21:52:18Z",
                     *           "updated_at": "2017-06-26T21:52:18Z",
                     *           "hourly_rate": 100,
                     *           "budget": null,
                     *           "project": {
                     *             "id": 14308069,
                     *             "name": "Online Store - Phase 1",
                     *             "code": "OS1"
                     *           },
                     *           "task": {
                     *             "id": 8083368,
                     *             "name": "Project Management"
                     *           }
                     *         },
                     *         {
                     *           "id": 155505014,
                     *           "billable": true,
                     *           "is_active": true,
                     *           "created_at": "2017-06-26T21:52:18Z",
                     *           "updated_at": "2017-06-26T21:52:18Z",
                     *           "hourly_rate": 100,
                     *           "budget": null,
                     *           "project": {
                     *             "id": 14308069,
                     *             "name": "Online Store - Phase 1",
                     *             "code": "OS1"
                     *           },
                     *           "task": {
                     *             "id": 8083366,
                     *             "name": "Programming"
                     *           }
                     *         },
                     *         {
                     *           "id": 155505013,
                     *           "billable": true,
                     *           "is_active": true,
                     *           "created_at": "2017-06-26T21:52:18Z",
                     *           "updated_at": "2017-06-26T21:52:18Z",
                     *           "hourly_rate": 100,
                     *           "budget": null,
                     *           "project": {
                     *             "id": 14308069,
                     *             "name": "Online Store - Phase 1",
                     *             "code": "OS1"
                     *           },
                     *           "task": {
                     *             "id": 8083365,
                     *             "name": "Graphic Design"
                     *           }
                     *         },
                     *         {
                     *           "id": 155502711,
                     *           "billable": true,
                     *           "is_active": true,
                     *           "created_at": "2017-06-26T21:36:23Z",
                     *           "updated_at": "2017-06-26T21:36:23Z",
                     *           "hourly_rate": 100,
                     *           "budget": null,
                     *           "project": {
                     *             "id": 14307913,
                     *             "name": "Marketing Website",
                     *             "code": "MW"
                     *           },
                     *           "task": {
                     *             "id": 8083368,
                     *             "name": "Project Management"
                     *           }
                     *         },
                     *         {
                     *           "id": 155502710,
                     *           "billable": true,
                     *           "is_active": true,
                     *           "created_at": "2017-06-26T21:36:23Z",
                     *           "updated_at": "2017-06-26T21:36:23Z",
                     *           "hourly_rate": 100,
                     *           "budget": null,
                     *           "project": {
                     *             "id": 14307913,
                     *             "name": "Marketing Website",
                     *             "code": "MW"
                     *           },
                     *           "task": {
                     *             "id": 8083366,
                     *             "name": "Programming"
                     *           }
                     *         },
                     *         {
                     *           "id": 155502709,
                     *           "billable": true,
                     *           "is_active": true,
                     *           "created_at": "2017-06-26T21:36:23Z",
                     *           "updated_at": "2017-06-26T21:36:23Z",
                     *           "hourly_rate": 100,
                     *           "budget": null,
                     *           "project": {
                     *             "id": 14307913,
                     *             "name": "Marketing Website",
                     *             "code": "MW"
                     *           },
                     *           "task": {
                     *             "id": 8083365,
                     *             "name": "Graphic Design"
                     *           }
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 12,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/task_assignments?page=1&per_page=2000",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/task_assignments?page=1&per_page=2000"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["TaskAssignments"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listTasks: {
        parameters: {
            query?: {
                /** @description Pass true to only return active tasks and false to return inactive tasks. */
                is_active?: boolean;
                /** @description Only return tasks that have been updated since the given date and time. */
                updated_since?: string;
                /**
                 * @deprecated
                 * @description DEPRECATED The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1)
                 */
                page?: number;
                /** @description Pagination cursor */
                cursor?: string;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all tasks */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "tasks": [
                     *         {
                     *           "id": 8083800,
                     *           "name": "Business Development",
                     *           "billable_by_default": false,
                     *           "default_hourly_rate": 0,
                     *           "is_default": false,
                     *           "is_active": true,
                     *           "created_at": "2017-06-26T22:08:25Z",
                     *           "updated_at": "2017-06-26T22:08:25Z"
                     *         },
                     *         {
                     *           "id": 8083369,
                     *           "name": "Research",
                     *           "billable_by_default": false,
                     *           "default_hourly_rate": 0,
                     *           "is_default": true,
                     *           "is_active": true,
                     *           "created_at": "2017-06-26T20:41:00Z",
                     *           "updated_at": "2017-06-26T21:53:34Z"
                     *         },
                     *         {
                     *           "id": 8083368,
                     *           "name": "Project Management",
                     *           "billable_by_default": true,
                     *           "default_hourly_rate": 100,
                     *           "is_default": true,
                     *           "is_active": true,
                     *           "created_at": "2017-06-26T20:41:00Z",
                     *           "updated_at": "2017-06-26T21:14:10Z"
                     *         },
                     *         {
                     *           "id": 8083366,
                     *           "name": "Programming",
                     *           "billable_by_default": true,
                     *           "default_hourly_rate": 100,
                     *           "is_default": true,
                     *           "is_active": true,
                     *           "created_at": "2017-06-26T20:41:00Z",
                     *           "updated_at": "2017-06-26T21:14:07Z"
                     *         },
                     *         {
                     *           "id": 8083365,
                     *           "name": "Graphic Design",
                     *           "billable_by_default": true,
                     *           "default_hourly_rate": 100,
                     *           "is_default": true,
                     *           "is_active": true,
                     *           "created_at": "2017-06-26T20:41:00Z",
                     *           "updated_at": "2017-06-26T21:14:02Z"
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 5,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/tasks?page=1&per_page=2000",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/tasks?page=1&per_page=2000"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Tasks"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createTask: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /** @description The name of the task. */
                    name: string | null;
                    /** @description Used in determining whether default tasks should be marked billable when creating a new project. Defaults to true. */
                    billable_by_default?: boolean | null;
                    /**
                     * Format: float
                     * @description The default hourly rate to use for this task when it is added to a project. Defaults to 0.
                     */
                    default_hourly_rate?: number | null;
                    /** @description Whether this task should be automatically added to future projects. Defaults to false. */
                    is_default?: boolean | null;
                    /** @description Whether this task is active or archived. Defaults to true. */
                    is_active?: boolean | null;
                };
            };
        };
        responses: {
            /** @description Create a task */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 8083782,
                     *       "name": "New Task Name",
                     *       "billable_by_default": true,
                     *       "default_hourly_rate": 0,
                     *       "is_default": false,
                     *       "is_active": true,
                     *       "created_at": "2017-06-26T22:04:31Z",
                     *       "updated_at": "2017-06-26T22:04:31Z"
                     *     }
                     */
                    "application/json": components["schemas"]["Task"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    retrieveTask: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                taskId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Retrieve a task */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 8083800,
                     *       "name": "Business Development",
                     *       "billable_by_default": false,
                     *       "default_hourly_rate": 0,
                     *       "is_default": false,
                     *       "is_active": true,
                     *       "created_at": "2017-06-26T22:08:25Z",
                     *       "updated_at": "2017-06-26T22:08:25Z"
                     *     }
                     */
                    "application/json": components["schemas"]["Task"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteTask: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                taskId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Delete a task */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateTask: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                taskId: string;
            };
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /** @description The name of the task. */
                    name?: string | null;
                    /** @description Used in determining whether default tasks should be marked billable when creating a new project. */
                    billable_by_default?: boolean | null;
                    /**
                     * Format: float
                     * @description The default hourly rate to use for this task when it is added to a project.
                     */
                    default_hourly_rate?: number | null;
                    /** @description Whether this task should be automatically added to future projects. */
                    is_default?: boolean | null;
                    /** @description Whether this task is active or archived. */
                    is_active?: boolean | null;
                };
            };
        };
        responses: {
            /** @description Update a task */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 8083782,
                     *       "name": "New Task Name",
                     *       "billable_by_default": true,
                     *       "default_hourly_rate": 0,
                     *       "is_default": true,
                     *       "is_active": true,
                     *       "created_at": "2017-06-26T22:04:31Z",
                     *       "updated_at": "2017-06-26T22:04:54Z"
                     *     }
                     */
                    "application/json": components["schemas"]["Task"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listTimeEntries: {
        parameters: {
            query?: {
                /** @description Only return time entries belonging to the user with the given ID. */
                user_id?: number;
                /** @description Only return time entries belonging to the client with the given ID. */
                client_id?: number;
                /** @description Only return time entries belonging to the project with the given ID. */
                project_id?: number;
                /** @description Only return time entries belonging to the task with the given ID. */
                task_id?: number;
                /** @description Only return time entries with the given external_reference ID. */
                external_reference_id?: string;
                /** @description Pass true to only return time entries that have been invoiced and false to return time entries that have not been invoiced. */
                is_billed?: boolean;
                /** @description Pass true to only return running time entries and false to return non-running time entries. */
                is_running?: boolean;
                /** @description Only return time entries with the given approval status. Possible values: “unsubmitted”, “submitted”, or “approved”. */
                approval_status?: string;
                /** @description Only return time entries that have been updated since the given date and time. Use the ISO 8601 Format. */
                updated_since?: string;
                /** @description Only return time entries with a spent_date on or after the given date. */
                from?: string;
                /** @description Only return time entries with a spent_date on or before the given date. */
                to?: string;
                /** @description The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1) */
                page?: number;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all time entries */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "time_entries": [
                     *         {
                     *           "id": 636709355,
                     *           "spent_date": "2017-03-02",
                     *           "user": {
                     *             "id": 1782959,
                     *             "name": "Kim Allen"
                     *           },
                     *           "client": {
                     *             "id": 5735774,
                     *             "name": "ABC Corp"
                     *           },
                     *           "project": {
                     *             "id": 14307913,
                     *             "name": "Marketing Website"
                     *           },
                     *           "task": {
                     *             "id": 8083365,
                     *             "name": "Graphic Design"
                     *           },
                     *           "user_assignment": {
                     *             "id": 125068553,
                     *             "is_project_manager": true,
                     *             "is_active": true,
                     *             "budget": null,
                     *             "created_at": "2017-06-26T22:32:52Z",
                     *             "updated_at": "2017-06-26T22:32:52Z",
                     *             "hourly_rate": 100
                     *           },
                     *           "task_assignment": {
                     *             "id": 155502709,
                     *             "billable": true,
                     *             "is_active": true,
                     *             "created_at": "2017-06-26T21:36:23Z",
                     *             "updated_at": "2017-06-26T21:36:23Z",
                     *             "hourly_rate": 100,
                     *             "budget": null
                     *           },
                     *           "hours": 2.11,
                     *           "hours_without_timer": 2.11,
                     *           "rounded_hours": 2.25,
                     *           "notes": "Adding CSS styling",
                     *           "created_at": "2017-06-27T15:50:15Z",
                     *           "updated_at": "2017-06-27T16:47:14Z",
                     *           "is_locked": true,
                     *           "locked_reason": "Item Approved and Locked for this Time Period",
                     *           "is_closed": true,
                     *           "approval_status": "approved",
                     *           "is_billed": false,
                     *           "timer_started_at": null,
                     *           "started_time": "3:00pm",
                     *           "ended_time": "5:00pm",
                     *           "is_running": false,
                     *           "invoice": null,
                     *           "external_reference": null,
                     *           "billable": true,
                     *           "budgeted": true,
                     *           "billable_rate": 100,
                     *           "cost_rate": 50
                     *         },
                     *         {
                     *           "id": 636708723,
                     *           "spent_date": "2017-03-01",
                     *           "user": {
                     *             "id": 1782959,
                     *             "name": "Kim Allen"
                     *           },
                     *           "client": {
                     *             "id": 5735776,
                     *             "name": "123 Industries"
                     *           },
                     *           "project": {
                     *             "id": 14308069,
                     *             "name": "Online Store - Phase 1"
                     *           },
                     *           "task": {
                     *             "id": 8083366,
                     *             "name": "Programming"
                     *           },
                     *           "user_assignment": {
                     *             "id": 125068554,
                     *             "is_project_manager": true,
                     *             "is_active": true,
                     *             "budget": null,
                     *             "created_at": "2017-06-26T22:32:52Z",
                     *             "updated_at": "2017-06-26T22:32:52Z",
                     *             "hourly_rate": 100
                     *           },
                     *           "task_assignment": {
                     *             "id": 155505014,
                     *             "billable": true,
                     *             "is_active": true,
                     *             "created_at": "2017-06-26T21:52:18Z",
                     *             "updated_at": "2017-06-26T21:52:18Z",
                     *             "hourly_rate": 100,
                     *             "budget": null
                     *           },
                     *           "hours": 1.35,
                     *           "hours_without_timer": 1.35,
                     *           "rounded_hours": 1.5,
                     *           "notes": "Importing products",
                     *           "created_at": "2017-06-27T15:49:28Z",
                     *           "updated_at": "2017-06-27T16:47:14Z",
                     *           "is_locked": true,
                     *           "locked_reason": "Item Invoiced and Approved and Locked for this Time Period",
                     *           "is_closed": true,
                     *           "approval_status": "approved",
                     *           "is_billed": true,
                     *           "timer_started_at": null,
                     *           "started_time": "1:00pm",
                     *           "ended_time": "2:00pm",
                     *           "is_running": false,
                     *           "invoice": {
                     *             "id": 13150403,
                     *             "number": "1001"
                     *           },
                     *           "external_reference": null,
                     *           "billable": true,
                     *           "budgeted": true,
                     *           "billable_rate": 100,
                     *           "cost_rate": 50
                     *         },
                     *         {
                     *           "id": 636708574,
                     *           "spent_date": "2017-03-01",
                     *           "user": {
                     *             "id": 1782959,
                     *             "name": "Kim Allen"
                     *           },
                     *           "client": {
                     *             "id": 5735776,
                     *             "name": "123 Industries"
                     *           },
                     *           "project": {
                     *             "id": 14308069,
                     *             "name": "Online Store - Phase 1"
                     *           },
                     *           "task": {
                     *             "id": 8083369,
                     *             "name": "Research"
                     *           },
                     *           "user_assignment": {
                     *             "id": 125068554,
                     *             "is_project_manager": true,
                     *             "is_active": true,
                     *             "budget": null,
                     *             "created_at": "2017-06-26T22:32:52Z",
                     *             "updated_at": "2017-06-26T22:32:52Z",
                     *             "hourly_rate": 100
                     *           },
                     *           "task_assignment": {
                     *             "id": 155505016,
                     *             "billable": false,
                     *             "is_active": true,
                     *             "created_at": "2017-06-26T21:52:18Z",
                     *             "updated_at": "2017-06-26T21:54:06Z",
                     *             "hourly_rate": 100,
                     *             "budget": null
                     *           },
                     *           "hours": 1,
                     *           "hours_without_timer": 1,
                     *           "rounded_hours": 1,
                     *           "notes": "Evaluating 3rd party libraries",
                     *           "created_at": "2017-06-27T15:49:17Z",
                     *           "updated_at": "2017-06-27T16:47:14Z",
                     *           "is_locked": true,
                     *           "locked_reason": "Item Approved and Locked for this Time Period",
                     *           "is_closed": true,
                     *           "approval_status": "approved",
                     *           "is_billed": false,
                     *           "timer_started_at": null,
                     *           "started_time": "11:00am",
                     *           "ended_time": "12:00pm",
                     *           "is_running": false,
                     *           "invoice": null,
                     *           "external_reference": null,
                     *           "billable": false,
                     *           "budgeted": true,
                     *           "billable_rate": null,
                     *           "cost_rate": 50
                     *         },
                     *         {
                     *           "id": 636707831,
                     *           "spent_date": "2017-03-01",
                     *           "user": {
                     *             "id": 1782959,
                     *             "name": "Kim Allen"
                     *           },
                     *           "client": {
                     *             "id": 5735776,
                     *             "name": "123 Industries"
                     *           },
                     *           "project": {
                     *             "id": 14308069,
                     *             "name": "Online Store - Phase 1"
                     *           },
                     *           "task": {
                     *             "id": 8083368,
                     *             "name": "Project Management"
                     *           },
                     *           "user_assignment": {
                     *             "id": 125068554,
                     *             "is_project_manager": true,
                     *             "is_active": true,
                     *             "budget": null,
                     *             "created_at": "2017-06-26T22:32:52Z",
                     *             "updated_at": "2017-06-26T22:32:52Z",
                     *             "hourly_rate": 100
                     *           },
                     *           "task_assignment": {
                     *             "id": 155505015,
                     *             "billable": true,
                     *             "is_active": true,
                     *             "created_at": "2017-06-26T21:52:18Z",
                     *             "updated_at": "2017-06-26T21:52:18Z",
                     *             "hourly_rate": 100,
                     *             "budget": null
                     *           },
                     *           "hours": 2,
                     *           "hours_without_timer": 2,
                     *           "rounded_hours": 2,
                     *           "notes": "Planning meetings",
                     *           "created_at": "2017-06-27T15:48:24Z",
                     *           "updated_at": "2017-06-27T16:47:14Z",
                     *           "is_locked": true,
                     *           "locked_reason": "Item Invoiced and Approved and Locked for this Time Period",
                     *           "is_closed": true,
                     *           "approval_status": "approved",
                     *           "is_billed": true,
                     *           "timer_started_at": null,
                     *           "started_time": "9:00am",
                     *           "ended_time": "11:00am",
                     *           "is_running": false,
                     *           "invoice": {
                     *             "id": 13150403,
                     *             "number": "1001"
                     *           },
                     *           "external_reference": null,
                     *           "billable": true,
                     *           "budgeted": true,
                     *           "billable_rate": 100,
                     *           "cost_rate": 50
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 4,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/time_entries?page=1&per_page=2000",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/time_entries?page=1&per_page=2000"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["TimeEntries"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createTimeEntry: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: int32
                     * @description The ID of the user to associate with the time entry. Defaults to the currently authenticated user’s ID.
                     */
                    user_id?: number | null;
                    /**
                     * Format: int32
                     * @description The ID of the project to associate with the time entry.
                     */
                    project_id: number | null;
                    /**
                     * Format: int32
                     * @description The ID of the task to associate with the time entry.
                     */
                    task_id: number | null;
                    /**
                     * Format: date
                     * @description The ISO 8601 formatted date the time entry was spent.
                     */
                    spent_date: string | null;
                    /** @description The time the entry started. Defaults to the current time. Example: “8:00am”. */
                    started_time?: string | null;
                    /** @description The time the entry ended. If provided, is_running will be set to false. If not provided, is_running will be set to true. */
                    ended_time?: string | null;
                    /** @description Any notes to be associated with the time entry. */
                    notes?: string | null;
                    /** @description An object containing the id, group_id, account_id, and permalink of the external reference. */
                    external_reference?: {
                        id?: string | null;
                        group_id?: string | null;
                        account_id?: string | null;
                        permalink?: string | null;
                    } | null;
                    /**
                     * Format: float
                     * @description The current amount of time tracked. If provided, the time entry will be created with the specified hours and is_running will be set to false. If not provided, hours will be set to 0.0 and is_running will be set to true.
                     */
                    hours?: number | null;
                };
            };
        };
        responses: {
            /** @description Create a time entry */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 636718192,
                     *       "spent_date": "2017-03-21",
                     *       "user": {
                     *         "id": 1782959,
                     *         "name": "Kim Allen"
                     *       },
                     *       "client": {
                     *         "id": 5735774,
                     *         "name": "ABC Corp"
                     *       },
                     *       "project": {
                     *         "id": 14307913,
                     *         "name": "Marketing Website"
                     *       },
                     *       "task": {
                     *         "id": 8083365,
                     *         "name": "Graphic Design"
                     *       },
                     *       "user_assignment": {
                     *         "id": 125068553,
                     *         "is_project_manager": true,
                     *         "is_active": true,
                     *         "budget": null,
                     *         "created_at": "2017-06-26T22:32:52Z",
                     *         "updated_at": "2017-06-26T22:32:52Z",
                     *         "hourly_rate": 100
                     *       },
                     *       "task_assignment": {
                     *         "id": 155502709,
                     *         "billable": true,
                     *         "is_active": true,
                     *         "created_at": "2017-06-26T21:36:23Z",
                     *         "updated_at": "2017-06-26T21:36:23Z",
                     *         "hourly_rate": 100,
                     *         "budget": null
                     *       },
                     *       "hours": 1,
                     *       "rounded_hours": 1,
                     *       "notes": null,
                     *       "created_at": "2017-06-27T16:01:23Z",
                     *       "updated_at": "2017-06-27T16:01:23Z",
                     *       "is_locked": false,
                     *       "locked_reason": null,
                     *       "is_closed": false,
                     *       "approval_status": "unsubmitted",
                     *       "is_billed": false,
                     *       "timer_started_at": null,
                     *       "started_time": null,
                     *       "ended_time": null,
                     *       "is_running": false,
                     *       "invoice": null,
                     *       "external_reference": null,
                     *       "billable": true,
                     *       "budgeted": true,
                     *       "billable_rate": 100,
                     *       "cost_rate": 50
                     *     }
                     */
                    "application/json": components["schemas"]["TimeEntry"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    retrieveTimeEntry: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                timeEntryId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Retrieve a time entry */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 636708723,
                     *       "spent_date": "2017-03-01",
                     *       "user": {
                     *         "id": 1782959,
                     *         "name": "Kim Allen"
                     *       },
                     *       "client": {
                     *         "id": 5735776,
                     *         "name": "123 Industries"
                     *       },
                     *       "project": {
                     *         "id": 14308069,
                     *         "name": "Online Store - Phase 1"
                     *       },
                     *       "task": {
                     *         "id": 8083366,
                     *         "name": "Programming"
                     *       },
                     *       "user_assignment": {
                     *         "id": 125068554,
                     *         "is_project_manager": true,
                     *         "is_active": true,
                     *         "budget": null,
                     *         "created_at": "2017-06-26T22:32:52Z",
                     *         "updated_at": "2017-06-26T22:32:52Z",
                     *         "hourly_rate": 100
                     *       },
                     *       "task_assignment": {
                     *         "id": 155505014,
                     *         "billable": true,
                     *         "is_active": true,
                     *         "created_at": "2017-06-26T21:52:18Z",
                     *         "updated_at": "2017-06-26T21:52:18Z",
                     *         "hourly_rate": 100,
                     *         "budget": null
                     *       },
                     *       "hours": 1,
                     *       "hours_without_timer": 1,
                     *       "rounded_hours": 1,
                     *       "notes": "Importing products",
                     *       "created_at": "2017-06-27T15:49:28Z",
                     *       "updated_at": "2017-06-27T16:47:14Z",
                     *       "is_locked": true,
                     *       "locked_reason": "Item Invoiced and Approved and Locked for this Time Period",
                     *       "is_closed": true,
                     *       "approval_status": "approved",
                     *       "is_billed": true,
                     *       "timer_started_at": null,
                     *       "started_time": "1:00pm",
                     *       "ended_time": "2:00pm",
                     *       "is_running": false,
                     *       "invoice": {
                     *         "id": 13150403,
                     *         "number": "1001"
                     *       },
                     *       "external_reference": null,
                     *       "billable": true,
                     *       "budgeted": true,
                     *       "billable_rate": 100,
                     *       "cost_rate": 50
                     *     }
                     */
                    "application/json": components["schemas"]["TimeEntry"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteTimeEntry: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                timeEntryId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Delete a time entry */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateTimeEntry: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                timeEntryId: string;
            };
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: int32
                     * @description The ID of the project to associate with the time entry.
                     */
                    project_id?: number | null;
                    /**
                     * Format: int32
                     * @description The ID of the task to associate with the time entry.
                     */
                    task_id?: number | null;
                    /**
                     * Format: date
                     * @description The ISO 8601 formatted date the time entry was spent.
                     */
                    spent_date?: string | null;
                    /** @description The time the entry started. Defaults to the current time. Example: “8:00am”. */
                    started_time?: string | null;
                    /** @description The time the entry ended. */
                    ended_time?: string | null;
                    /**
                     * Format: float
                     * @description The current amount of time tracked.
                     */
                    hours?: number | null;
                    /** @description Any notes to be associated with the time entry. */
                    notes?: string | null;
                    /** @description An object containing the id, group_id, account_id, and permalink of the external reference. */
                    external_reference?: {
                        id?: string | null;
                        group_id?: string | null;
                        account_id?: string | null;
                        permalink?: string | null;
                    } | null;
                };
            };
        };
        responses: {
            /** @description Update a time entry */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 636718192,
                     *       "spent_date": "2017-03-21",
                     *       "user": {
                     *         "id": 1782959,
                     *         "name": "Kim Allen"
                     *       },
                     *       "client": {
                     *         "id": 5735774,
                     *         "name": "ABC Corp"
                     *       },
                     *       "project": {
                     *         "id": 14307913,
                     *         "name": "Marketing Website"
                     *       },
                     *       "task": {
                     *         "id": 8083365,
                     *         "name": "Graphic Design"
                     *       },
                     *       "user_assignment": {
                     *         "id": 125068553,
                     *         "is_project_manager": true,
                     *         "is_active": true,
                     *         "budget": null,
                     *         "created_at": "2017-06-26T22:32:52Z",
                     *         "updated_at": "2017-06-26T22:32:52Z",
                     *         "hourly_rate": 100
                     *       },
                     *       "task_assignment": {
                     *         "id": 155502709,
                     *         "billable": true,
                     *         "is_active": true,
                     *         "created_at": "2017-06-26T21:36:23Z",
                     *         "updated_at": "2017-06-26T21:36:23Z",
                     *         "hourly_rate": 100,
                     *         "budget": null
                     *       },
                     *       "hours": 1,
                     *       "hours_without_timer": 1,
                     *       "rounded_hours": 1,
                     *       "notes": "Updated notes",
                     *       "created_at": "2017-06-27T16:01:23Z",
                     *       "updated_at": "2017-06-27T16:02:40Z",
                     *       "is_locked": false,
                     *       "locked_reason": null,
                     *       "is_closed": false,
                     *       "approval_status": "unsubmitted",
                     *       "is_billed": false,
                     *       "timer_started_at": null,
                     *       "started_time": null,
                     *       "ended_time": null,
                     *       "is_running": false,
                     *       "invoice": null,
                     *       "external_reference": null,
                     *       "billable": true,
                     *       "budgeted": true,
                     *       "billable_rate": 100,
                     *       "cost_rate": 50
                     *     }
                     */
                    "application/json": components["schemas"]["TimeEntry"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteTimeEntryExternalReference: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                timeEntryId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Delete a time entry’s external reference */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    restartStoppedTimeEntry: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                timeEntryId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Restart a stopped time entry */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 662204379,
                     *       "spent_date": "2017-03-21",
                     *       "user": {
                     *         "id": 1795925,
                     *         "name": "Jane Smith"
                     *       },
                     *       "client": {
                     *         "id": 5735776,
                     *         "name": "123 Industries"
                     *       },
                     *       "project": {
                     *         "id": 14808188,
                     *         "name": "Task Force"
                     *       },
                     *       "task": {
                     *         "id": 8083366,
                     *         "name": "Programming"
                     *       },
                     *       "user_assignment": {
                     *         "id": 130403296,
                     *         "is_project_manager": true,
                     *         "is_active": true,
                     *         "budget": null,
                     *         "created_at": "2017-08-22T17:36:54Z",
                     *         "updated_at": "2017-08-22T17:36:54Z",
                     *         "hourly_rate": 100
                     *       },
                     *       "task_assignment": {
                     *         "id": 160726645,
                     *         "billable": true,
                     *         "is_active": true,
                     *         "created_at": "2017-08-22T17:36:54Z",
                     *         "updated_at": "2017-08-22T17:36:54Z",
                     *         "hourly_rate": 100,
                     *         "budget": null
                     *       },
                     *       "hours": 0,
                     *       "hours_without_timer": 0,
                     *       "rounded_hours": 0,
                     *       "notes": null,
                     *       "created_at": "2017-08-22T17:40:24Z",
                     *       "updated_at": "2017-08-22T17:40:24Z",
                     *       "is_locked": false,
                     *       "locked_reason": null,
                     *       "is_closed": false,
                     *       "approval_status": "unsubmitted",
                     *       "is_billed": false,
                     *       "timer_started_at": "2017-08-22T17:40:24Z",
                     *       "started_time": "11:40am",
                     *       "ended_time": null,
                     *       "is_running": true,
                     *       "invoice": null,
                     *       "external_reference": null,
                     *       "billable": true,
                     *       "budgeted": false,
                     *       "billable_rate": 100,
                     *       "cost_rate": 75
                     *     }
                     */
                    "application/json": components["schemas"]["TimeEntry"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    stopRunningTimeEntry: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                timeEntryId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Stop a running time entry */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 662202797,
                     *       "spent_date": "2017-03-21",
                     *       "user": {
                     *         "id": 1795925,
                     *         "name": "Jane Smith"
                     *       },
                     *       "client": {
                     *         "id": 5735776,
                     *         "name": "123 Industries"
                     *       },
                     *       "project": {
                     *         "id": 14808188,
                     *         "name": "Task Force"
                     *       },
                     *       "task": {
                     *         "id": 8083366,
                     *         "name": "Programming"
                     *       },
                     *       "user_assignment": {
                     *         "id": 130403296,
                     *         "is_project_manager": true,
                     *         "is_active": true,
                     *         "budget": null,
                     *         "created_at": "2017-08-22T17:36:54Z",
                     *         "updated_at": "2017-08-22T17:36:54Z",
                     *         "hourly_rate": 100
                     *       },
                     *       "task_assignment": {
                     *         "id": 160726645,
                     *         "billable": true,
                     *         "is_active": true,
                     *         "created_at": "2017-08-22T17:36:54Z",
                     *         "updated_at": "2017-08-22T17:36:54Z",
                     *         "hourly_rate": 100,
                     *         "budget": null
                     *       },
                     *       "hours": 0.02,
                     *       "hours_without_timer": 0.02,
                     *       "rounded_hours": 0.25,
                     *       "notes": null,
                     *       "created_at": "2017-08-22T17:37:13Z",
                     *       "updated_at": "2017-08-22T17:38:31Z",
                     *       "is_locked": false,
                     *       "locked_reason": null,
                     *       "is_closed": false,
                     *       "approval_status": "unsubmitted",
                     *       "is_billed": false,
                     *       "timer_started_at": null,
                     *       "started_time": "11:37am",
                     *       "ended_time": "11:38am",
                     *       "is_running": false,
                     *       "invoice": null,
                     *       "external_reference": null,
                     *       "billable": true,
                     *       "budgeted": false,
                     *       "billable_rate": 100,
                     *       "cost_rate": 75
                     *     }
                     */
                    "application/json": components["schemas"]["TimeEntry"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listUserAssignments: {
        parameters: {
            query?: {
                /** @description Only return user assignments belonging to the user with the given ID. */
                user_id?: number;
                /** @description Pass true to only return active user assignments and false to return inactive user assignments. */
                is_active?: boolean;
                /** @description Only return user assignments that have been updated since the given date and time. */
                updated_since?: string;
                /**
                 * @deprecated
                 * @description DEPRECATED The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1)
                 */
                page?: number;
                /** @description Pagination cursor */
                cursor?: string;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all user assignments */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "user_assignments": [
                     *         {
                     *           "id": 130403297,
                     *           "is_project_manager": true,
                     *           "is_active": true,
                     *           "use_default_rates": false,
                     *           "budget": null,
                     *           "created_at": "2017-08-22T17:36:54Z",
                     *           "updated_at": "2017-08-22T17:36:54Z",
                     *           "hourly_rate": 100,
                     *           "project": {
                     *             "id": 14808188,
                     *             "name": "Task Force",
                     *             "code": "TF"
                     *           },
                     *           "user": {
                     *             "id": 1782959,
                     *             "name": "Kim Allen"
                     *           }
                     *         },
                     *         {
                     *           "id": 130403296,
                     *           "is_project_manager": true,
                     *           "is_active": true,
                     *           "use_default_rates": true,
                     *           "budget": null,
                     *           "created_at": "2017-08-22T17:36:54Z",
                     *           "updated_at": "2017-08-22T17:36:54Z",
                     *           "hourly_rate": 100,
                     *           "project": {
                     *             "id": 14808188,
                     *             "name": "Task Force",
                     *             "code": "TF"
                     *           },
                     *           "user": {
                     *             "id": 1795925,
                     *             "name": "Jason Dew"
                     *           }
                     *         },
                     *         {
                     *           "id": 125068554,
                     *           "is_project_manager": true,
                     *           "is_active": true,
                     *           "use_default_rates": true,
                     *           "budget": null,
                     *           "created_at": "2017-06-26T22:32:52Z",
                     *           "updated_at": "2017-06-26T22:32:52Z",
                     *           "hourly_rate": 100,
                     *           "project": {
                     *             "id": 14308069,
                     *             "name": "Online Store - Phase 1",
                     *             "code": "OS1"
                     *           },
                     *           "user": {
                     *             "id": 1782959,
                     *             "name": "Kim Allen"
                     *           }
                     *         },
                     *         {
                     *           "id": 125068553,
                     *           "is_project_manager": true,
                     *           "is_active": true,
                     *           "use_default_rates": true,
                     *           "budget": null,
                     *           "created_at": "2017-06-26T22:32:52Z",
                     *           "updated_at": "2017-06-26T22:32:52Z",
                     *           "hourly_rate": 100,
                     *           "project": {
                     *             "id": 14307913,
                     *             "name": "Marketing Website",
                     *             "code": "MW"
                     *           },
                     *           "user": {
                     *             "id": 1782959,
                     *             "name": "Kim Allen"
                     *           }
                     *         },
                     *         {
                     *           "id": 125066109,
                     *           "is_project_manager": true,
                     *           "is_active": true,
                     *           "use_default_rates": false,
                     *           "budget": null,
                     *           "created_at": "2017-06-26T21:52:18Z",
                     *           "updated_at": "2017-06-26T21:52:18Z",
                     *           "hourly_rate": 100,
                     *           "project": {
                     *             "id": 14308069,
                     *             "name": "Online Store - Phase 1",
                     *             "code": "OS1"
                     *           },
                     *           "user": {
                     *             "id": 1782884,
                     *             "name": "Jeremy Israelsen"
                     *           }
                     *         },
                     *         {
                     *           "id": 125063975,
                     *           "is_project_manager": true,
                     *           "is_active": true,
                     *           "use_default_rates": true,
                     *           "budget": null,
                     *           "created_at": "2017-06-26T21:36:23Z",
                     *           "updated_at": "2017-06-26T21:36:23Z",
                     *           "hourly_rate": 100,
                     *           "project": {
                     *             "id": 14307913,
                     *             "name": "Marketing Website",
                     *             "code": "MW"
                     *           },
                     *           "user": {
                     *             "id": 1782884,
                     *             "name": "Jeremy Israelsen"
                     *           }
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 6,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/user_assignments?page=1&per_page=2000",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/user_assignments?page=1&per_page=2000"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["UserAssignments"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listUsers: {
        parameters: {
            query?: {
                /** @description Pass true to only return active users and false to return inactive users. */
                is_active?: boolean;
                /** @description Only return users that have been updated since the given date and time. */
                updated_since?: string;
                /**
                 * @deprecated
                 * @description DEPRECATED The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1)
                 */
                page?: number;
                /** @description Pagination cursor */
                cursor?: string;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all users */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "users": [
                     *         {
                     *           "id": 3230547,
                     *           "first_name": "Jim",
                     *           "last_name": "Allen",
                     *           "email": "jimallen@example.com",
                     *           "telephone": "",
                     *           "timezone": "Mountain Time (US & Canada)",
                     *           "has_access_to_all_future_projects": false,
                     *           "is_contractor": false,
                     *           "is_active": true,
                     *           "created_at": "2020-05-01T22:34:41Z",
                     *           "updated_at": "2020-05-01T22:34:52Z",
                     *           "weekly_capacity": 126000,
                     *           "default_hourly_rate": 100,
                     *           "cost_rate": 50,
                     *           "roles": [
                     *             "Developer"
                     *           ],
                     *           "access_roles": [
                     *             "member"
                     *           ],
                     *           "avatar_url": "https://cache.harvestapp.com/assets/profile_images/abraj_albait_towers.png?1498516481"
                     *         },
                     *         {
                     *           "id": 1782959,
                     *           "first_name": "Kim",
                     *           "last_name": "Allen",
                     *           "email": "kimallen@example.com",
                     *           "telephone": "",
                     *           "timezone": "Eastern Time (US & Canada)",
                     *           "has_access_to_all_future_projects": true,
                     *           "is_contractor": false,
                     *           "is_active": true,
                     *           "created_at": "2020-05-01T22:15:45Z",
                     *           "updated_at": "2020-05-01T22:32:52Z",
                     *           "weekly_capacity": 126000,
                     *           "default_hourly_rate": 100,
                     *           "cost_rate": 50,
                     *           "roles": [
                     *             "Designer"
                     *           ],
                     *           "access_roles": [
                     *             "member"
                     *           ],
                     *           "avatar_url": "https://cache.harvestapp.com/assets/profile_images/cornell_clock_tower.png?1498515345"
                     *         },
                     *         {
                     *           "id": 1782884,
                     *           "first_name": "Bob",
                     *           "last_name": "Powell",
                     *           "email": "bobpowell@example.com",
                     *           "telephone": "",
                     *           "timezone": "Mountain Time (US & Canada)",
                     *           "has_access_to_all_future_projects": false,
                     *           "is_contractor": false,
                     *           "is_active": true,
                     *           "created_at": "2020-05-01T20:41:00Z",
                     *           "updated_at": "2020-05-01T20:42:25Z",
                     *           "weekly_capacity": 126000,
                     *           "default_hourly_rate": 100,
                     *           "cost_rate": 75,
                     *           "roles": [
                     *             "Founder",
                     *             "CEO"
                     *           ],
                     *           "access_roles": [
                     *             "administrator"
                     *           ],
                     *           "avatar_url": "https://cache.harvestapp.com/assets/profile_images/allen_bradley_clock_tower.png?1498509661"
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 3,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/users?page=1&per_page=2000",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/users?page=1&per_page=2000"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Users"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createUser: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /** @description The first name of the user. */
                    first_name: string | null;
                    /** @description The last name of the user. */
                    last_name: string | null;
                    /**
                     * Format: email
                     * @description The email address of the user.
                     */
                    email: string | null;
                    /** @description The user’s timezone. Defaults to the company’s timezone. See a list of supported time zones. */
                    timezone?: string | null;
                    /** @description Whether the user should be automatically added to future projects. Defaults to false. */
                    has_access_to_all_future_projects?: boolean | null;
                    /** @description Whether the user is a contractor or an employee. Defaults to false. */
                    is_contractor?: boolean | null;
                    /** @description Whether the user is active or archived. Defaults to true. */
                    is_active?: boolean | null;
                    /**
                     * Format: int32
                     * @description The number of hours per week this person is available to work in seconds. Defaults to 126000 seconds (35 hours).
                     */
                    weekly_capacity?: number | null;
                    /**
                     * Format: float
                     * @description The billable rate to use for this user when they are added to a project. Defaults to 0.
                     */
                    default_hourly_rate?: number | null;
                    /**
                     * Format: float
                     * @description The cost rate to use for this user when calculating a project’s costs vs billable amount. Defaults to 0.
                     */
                    cost_rate?: number | null;
                    /** @description Descriptive names of the business roles assigned to this person. They can be used for filtering reports, and have no effect in their permissions in Harvest. */
                    roles?: string[] | null;
                    /** @description Access role(s) that determine the user’s permissions in Harvest. Possible values: administrator, manager or member. Users with the manager role can additionally be granted one or more of these roles: project_creator, billable_rates_manager, managed_projects_invoice_drafter, managed_projects_invoice_manager, client_and_task_manager, time_and_expenses_manager, estimates_manager. */
                    access_roles?: string[] | null;
                };
            };
        };
        responses: {
            /** @description Create a user */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 3,
                     *       "first_name": "George",
                     *       "last_name": "Frank",
                     *       "email": "george@example.com",
                     *       "telephone": "",
                     *       "timezone": "Eastern Time (US & Canada)",
                     *       "has_access_to_all_future_projects": false,
                     *       "is_contractor": false,
                     *       "is_active": true,
                     *       "weekly_capacity": 126000,
                     *       "default_hourly_rate": 0,
                     *       "cost_rate": 0,
                     *       "roles": [],
                     *       "access_roles": [
                     *         "manager",
                     *         "project_creator",
                     *         "time_and_expenses_manager"
                     *       ],
                     *       "avatar_url": "https://{ACCOUNT_SUBDOMAIN}.harvestapp.com/assets/profile_images/big_ben.png?1485372046",
                     *       "created_at": "2020-01-25T19:20:46Z",
                     *       "updated_at": "2020-01-25T19:20:57Z"
                     *     }
                     */
                    "application/json": components["schemas"]["User"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    retrieveTheCurrentlyAuthenticatedUser: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Retrieve the currently authenticated user */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 1782884,
                     *       "first_name": "Bob",
                     *       "last_name": "Powell",
                     *       "email": "bobpowell@example.com",
                     *       "telephone": "",
                     *       "timezone": "Mountain Time (US & Canada)",
                     *       "has_access_to_all_future_projects": false,
                     *       "is_contractor": false,
                     *       "is_active": true,
                     *       "created_at": "2020-05-01T20:41:00Z",
                     *       "updated_at": "2020-05-01T20:42:25Z",
                     *       "weekly_capacity": 126000,
                     *       "default_hourly_rate": 100,
                     *       "cost_rate": 75,
                     *       "roles": [
                     *         "Founder",
                     *         "CEO"
                     *       ],
                     *       "access_roles": [
                     *         "administrator"
                     *       ],
                     *       "avatar_url": "https://cache.harvestapp.com/assets/profile_images/allen_bradley_clock_tower.png?1498509661"
                     *     }
                     */
                    "application/json": components["schemas"]["User"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listActiveProjectAssignmentsForTheCurrentlyAuthenticatedUser: {
        parameters: {
            query?: {
                /** @description The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1) */
                page?: number;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List active project assignments for the currently authenticated user */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "project_assignments": [
                     *         {
                     *           "id": 125066109,
                     *           "is_project_manager": true,
                     *           "is_active": true,
                     *           "use_default_rates": true,
                     *           "budget": null,
                     *           "created_at": "2017-06-26T21:52:18Z",
                     *           "updated_at": "2017-06-26T21:52:18Z",
                     *           "hourly_rate": 100,
                     *           "project": {
                     *             "id": 14308069,
                     *             "name": "Online Store - Phase 1",
                     *             "code": "OS1"
                     *           },
                     *           "client": {
                     *             "id": 5735776,
                     *             "name": "123 Industries"
                     *           },
                     *           "task_assignments": [
                     *             {
                     *               "id": 155505013,
                     *               "billable": true,
                     *               "is_active": true,
                     *               "created_at": "2017-06-26T21:52:18Z",
                     *               "updated_at": "2017-06-26T21:52:18Z",
                     *               "hourly_rate": 100,
                     *               "budget": null,
                     *               "task": {
                     *                 "id": 8083365,
                     *                 "name": "Graphic Design"
                     *               }
                     *             },
                     *             {
                     *               "id": 155505014,
                     *               "billable": true,
                     *               "is_active": true,
                     *               "created_at": "2017-06-26T21:52:18Z",
                     *               "updated_at": "2017-06-26T21:52:18Z",
                     *               "hourly_rate": 100,
                     *               "budget": null,
                     *               "task": {
                     *                 "id": 8083366,
                     *                 "name": "Programming"
                     *               }
                     *             },
                     *             {
                     *               "id": 155505015,
                     *               "billable": true,
                     *               "is_active": true,
                     *               "created_at": "2017-06-26T21:52:18Z",
                     *               "updated_at": "2017-06-26T21:52:18Z",
                     *               "hourly_rate": 100,
                     *               "budget": null,
                     *               "task": {
                     *                 "id": 8083368,
                     *                 "name": "Project Management"
                     *               }
                     *             },
                     *             {
                     *               "id": 155505016,
                     *               "billable": false,
                     *               "is_active": true,
                     *               "created_at": "2017-06-26T21:52:18Z",
                     *               "updated_at": "2017-06-26T21:54:06Z",
                     *               "hourly_rate": 100,
                     *               "budget": null,
                     *               "task": {
                     *                 "id": 8083369,
                     *                 "name": "Research"
                     *               }
                     *             }
                     *           ]
                     *         },
                     *         {
                     *           "id": 125063975,
                     *           "is_project_manager": true,
                     *           "is_active": true,
                     *           "use_default_rates": false,
                     *           "budget": null,
                     *           "created_at": "2017-06-26T21:36:23Z",
                     *           "updated_at": "2017-06-26T21:36:23Z",
                     *           "hourly_rate": 100,
                     *           "project": {
                     *             "id": 14307913,
                     *             "name": "Marketing Website",
                     *             "code": "MW"
                     *           },
                     *           "client": {
                     *             "id": 5735774,
                     *             "name": "ABC Corp"
                     *           },
                     *           "task_assignments": [
                     *             {
                     *               "id": 155502709,
                     *               "billable": true,
                     *               "is_active": true,
                     *               "created_at": "2017-06-26T21:36:23Z",
                     *               "updated_at": "2017-06-26T21:36:23Z",
                     *               "hourly_rate": 100,
                     *               "budget": null,
                     *               "task": {
                     *                 "id": 8083365,
                     *                 "name": "Graphic Design"
                     *               }
                     *             },
                     *             {
                     *               "id": 155502710,
                     *               "billable": true,
                     *               "is_active": true,
                     *               "created_at": "2017-06-26T21:36:23Z",
                     *               "updated_at": "2017-06-26T21:36:23Z",
                     *               "hourly_rate": 100,
                     *               "budget": null,
                     *               "task": {
                     *                 "id": 8083366,
                     *                 "name": "Programming"
                     *               }
                     *             },
                     *             {
                     *               "id": 155502711,
                     *               "billable": true,
                     *               "is_active": true,
                     *               "created_at": "2017-06-26T21:36:23Z",
                     *               "updated_at": "2017-06-26T21:36:23Z",
                     *               "hourly_rate": 100,
                     *               "budget": null,
                     *               "task": {
                     *                 "id": 8083368,
                     *                 "name": "Project Management"
                     *               }
                     *             },
                     *             {
                     *               "id": 155505153,
                     *               "billable": false,
                     *               "is_active": true,
                     *               "created_at": "2017-06-26T21:53:20Z",
                     *               "updated_at": "2017-06-26T21:54:31Z",
                     *               "hourly_rate": 100,
                     *               "budget": null,
                     *               "task": {
                     *                 "id": 8083369,
                     *                 "name": "Research"
                     *               }
                     *             }
                     *           ]
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 2,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/users/1782884/project_assignments?page=1&per_page=2000",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/users/1782884/project_assignments?page=1&per_page=2000"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["ProjectAssignments"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    retrieveUser: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Retrieve a user */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 3230547,
                     *       "first_name": "Jim",
                     *       "last_name": "Allen",
                     *       "email": "jimallen@example.com",
                     *       "telephone": "",
                     *       "timezone": "Mountain Time (US & Canada)",
                     *       "has_access_to_all_future_projects": false,
                     *       "is_contractor": false,
                     *       "is_active": true,
                     *       "created_at": "2020-05-01T22:34:41Z",
                     *       "updated_at": "2020-05-01T22:34:52Z",
                     *       "weekly_capacity": 126000,
                     *       "default_hourly_rate": 100,
                     *       "cost_rate": 50,
                     *       "roles": [
                     *         "Developer"
                     *       ],
                     *       "access_roles": [
                     *         "member"
                     *       ],
                     *       "avatar_url": "https://cache.harvestapp.com/assets/profile_images/abraj_albait_towers.png?1498516481"
                     *     }
                     */
                    "application/json": components["schemas"]["User"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteUser: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Delete a user */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateUser: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: string;
            };
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /** @description The first name of the user. Can’t be updated if the user is inactive. */
                    first_name?: string | null;
                    /** @description The last name of the user. Can’t be updated if the user is inactive. */
                    last_name?: string | null;
                    /**
                     * Format: email
                     * @description The email address of the user. Can’t be updated if the user is inactive.
                     */
                    email?: string | null;
                    /** @description The user’s timezone. Defaults to the company’s timezone. See a list of supported time zones. */
                    timezone?: string | null;
                    /** @description Whether the user should be automatically added to future projects. */
                    has_access_to_all_future_projects?: boolean | null;
                    /** @description Whether the user is a contractor or an employee. */
                    is_contractor?: boolean | null;
                    /** @description Whether the user is active or archived. */
                    is_active?: boolean | null;
                    /**
                     * Format: int32
                     * @description The number of hours per week this person is available to work in seconds.
                     */
                    weekly_capacity?: number | null;
                    /** @description Descriptive names of the business roles assigned to this person. They can be used for filtering reports, and have no effect in their permissions in Harvest. */
                    roles?: string[] | null;
                    /** @description Access role(s) that determine the user’s permissions in Harvest. Possible values: administrator, manager or member. Users with the manager role can additionally be granted one or more of these roles: project_creator, billable_rates_manager, managed_projects_invoice_drafter, managed_projects_invoice_manager, client_and_task_manager, time_and_expenses_manager, estimates_manager. */
                    access_roles?: string[] | null;
                };
            };
        };
        responses: {
            /** @description Update a user */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 3237198,
                     *       "first_name": "Gary",
                     *       "last_name": "Brookes",
                     *       "email": "gary@example.com",
                     *       "telephone": "",
                     *       "timezone": "Eastern Time (US & Canada)",
                     *       "has_access_to_all_future_projects": true,
                     *       "is_contractor": false,
                     *       "is_active": true,
                     *       "weekly_capacity": 126000,
                     *       "default_hourly_rate": 120,
                     *       "cost_rate": 50,
                     *       "roles": [
                     *         "Product Team"
                     *       ],
                     *       "access_roles": [
                     *         "manager",
                     *         "time_and_expenses_manager",
                     *         "billable_rates_manager"
                     *       ],
                     *       "avatar_url": "https://{ACCOUNT_SUBDOMAIN}.harvestapp.com/assets/profile_images/big_ben.png?1485372046",
                     *       "created_at": "2018-01-01T19:20:46Z",
                     *       "updated_at": "2019-01-25T19:20:57Z"
                     *     }
                     */
                    "application/json": components["schemas"]["User"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listBillableRatesForSpecificUser: {
        parameters: {
            query?: {
                /**
                 * @deprecated
                 * @description DEPRECATED The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1)
                 */
                page?: number;
                /** @description Pagination cursor */
                cursor?: string;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all billable rates for a specific user */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "billable_rates": [
                     *         {
                     *           "id": 1836493,
                     *           "amount": 8.25,
                     *           "start_date": "2019-01-01",
                     *           "end_date": "2019-05-31",
                     *           "created_at": "2020-05-01T13:17:42Z",
                     *           "updated_at": "2020-05-01T13:17:50Z"
                     *         },
                     *         {
                     *           "id": 1836494,
                     *           "amount": 9.5,
                     *           "start_date": "2019-06-01",
                     *           "end_date": "2019-12-31",
                     *           "created_at": "2020-05-01T13:17:50Z",
                     *           "updated_at": "2020-05-01T13:18:02Z"
                     *         },
                     *         {
                     *           "id": 1836495,
                     *           "amount": 9.5,
                     *           "start_date": "2020-01-01",
                     *           "end_date": "2020-04-30",
                     *           "created_at": "2020-05-01T13:18:02Z",
                     *           "updated_at": "2020-05-01T13:18:10Z"
                     *         },
                     *         {
                     *           "id": 1836496,
                     *           "amount": 15,
                     *           "start_date": "2020-05-01",
                     *           "end_date": null,
                     *           "created_at": "2020-05-01T13:18:10Z",
                     *           "updated_at": "2020-05-01T13:18:10Z"
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 4,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/users/3226125/billable_rates?page=1&per_page=2000",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/users/3226125/billable_rates?page=1&per_page=2000"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillableRates"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createBillableRate: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: string;
            };
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: float
                     * @description The amount of the billable rate.
                     */
                    amount: number | null;
                    /**
                     * Format: date
                     * @description The date the billable rate is effective. Cannot be a date in the future.
                     */
                    start_date?: string | null;
                };
            };
        };
        responses: {
            /** @description Create a billable rate */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillableRate"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    retrieveBillableRate: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: string;
                billableRateId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Retrieve a billable rate */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 1836493,
                     *       "amount": 8.25,
                     *       "start_date": "2019-01-01",
                     *       "end_date": "2019-05-31",
                     *       "created_at": "2020-05-01T13:17:42Z",
                     *       "updated_at": "2020-05-01T13:17:50Z"
                     *     }
                     */
                    "application/json": components["schemas"]["BillableRate"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listCostRatesForSpecificUser: {
        parameters: {
            query?: {
                /**
                 * @deprecated
                 * @description DEPRECATED The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1)
                 */
                page?: number;
                /** @description Pagination cursor */
                cursor?: string;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all cost rates for a specific user */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "cost_rates": [
                     *         {
                     *           "id": 825301,
                     *           "amount": 9.25,
                     *           "start_date": "2019-01-01",
                     *           "end_date": "2019-05-31",
                     *           "created_at": "2020-05-01T13:19:09Z",
                     *           "updated_at": "2020-05-01T13:19:17Z"
                     *         },
                     *         {
                     *           "id": 825302,
                     *           "amount": 11,
                     *           "start_date": "2019-06-01",
                     *           "end_date": "2019-12-31",
                     *           "created_at": "2020-05-01T13:19:17Z",
                     *           "updated_at": "2020-05-01T13:19:24Z"
                     *         },
                     *         {
                     *           "id": 825303,
                     *           "amount": 12.5,
                     *           "start_date": "2020-01-01",
                     *           "end_date": "2020-04-30",
                     *           "created_at": "2020-05-01T13:19:24Z",
                     *           "updated_at": "2020-05-01T13:19:31Z"
                     *         },
                     *         {
                     *           "id": 825304,
                     *           "amount": 15.25,
                     *           "start_date": "2020-05-01",
                     *           "end_date": null,
                     *           "created_at": "2020-05-01T13:19:31Z",
                     *           "updated_at": "2020-05-01T13:19:31Z"
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 4,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/users/3226125/cost_rates?page=1&per_page=2000",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/users/3226125/cost_rates?page=1&per_page=2000"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["CostRates"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createCostRate: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: string;
            };
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: float
                     * @description The amount of the cost rate.
                     */
                    amount: number | null;
                    /**
                     * Format: date
                     * @description The date the cost rate is effective. Cannot be a date in the future.
                     */
                    start_date?: string | null;
                };
            };
        };
        responses: {
            /** @description Create a cost rate */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 825305,
                     *       "amount": 13,
                     *       "start_date": "2020-04-05",
                     *       "end_date": null,
                     *       "created_at": "2020-05-01T13:23:27Z",
                     *       "updated_at": "2020-05-01T13:23:27Z"
                     *     }
                     */
                    "application/json": components["schemas"]["CostRate"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    retrieveCostRate: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: string;
                costRateId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Retrieve a cost rate */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": 825301,
                     *       "amount": 9.25,
                     *       "start_date": "2019-01-01",
                     *       "end_date": "2019-05-31",
                     *       "created_at": "2020-05-01T13:19:09Z",
                     *       "updated_at": "2020-05-01T13:19:17Z"
                     *     }
                     */
                    "application/json": components["schemas"]["CostRate"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listActiveProjectAssignments: {
        parameters: {
            query?: {
                /** @description Only return project assignments that have been updated since the given date and time. */
                updated_since?: string;
                /**
                 * @deprecated
                 * @description DEPRECATED The page number to use in pagination. For instance, if you make a list request and receive 2000 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1)
                 */
                page?: number;
                /** @description Pagination cursor */
                cursor?: string;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List active project assignments */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "project_assignments": [
                     *         {
                     *           "id": 125068554,
                     *           "is_project_manager": true,
                     *           "is_active": true,
                     *           "use_default_rates": true,
                     *           "budget": null,
                     *           "created_at": "2017-06-26T22:32:52Z",
                     *           "updated_at": "2017-06-26T22:32:52Z",
                     *           "hourly_rate": 100,
                     *           "project": {
                     *             "id": 14308069,
                     *             "name": "Online Store - Phase 1",
                     *             "code": "OS1"
                     *           },
                     *           "client": {
                     *             "id": 5735776,
                     *             "name": "123 Industries"
                     *           },
                     *           "task_assignments": [
                     *             {
                     *               "id": 155505013,
                     *               "billable": true,
                     *               "is_active": true,
                     *               "created_at": "2017-06-26T21:52:18Z",
                     *               "updated_at": "2017-06-26T21:52:18Z",
                     *               "hourly_rate": 100,
                     *               "budget": null,
                     *               "task": {
                     *                 "id": 8083365,
                     *                 "name": "Graphic Design"
                     *               }
                     *             },
                     *             {
                     *               "id": 155505014,
                     *               "billable": true,
                     *               "is_active": true,
                     *               "created_at": "2017-06-26T21:52:18Z",
                     *               "updated_at": "2017-06-26T21:52:18Z",
                     *               "hourly_rate": 100,
                     *               "budget": null,
                     *               "task": {
                     *                 "id": 8083366,
                     *                 "name": "Programming"
                     *               }
                     *             },
                     *             {
                     *               "id": 155505015,
                     *               "billable": true,
                     *               "is_active": true,
                     *               "created_at": "2017-06-26T21:52:18Z",
                     *               "updated_at": "2017-06-26T21:52:18Z",
                     *               "hourly_rate": 100,
                     *               "budget": null,
                     *               "task": {
                     *                 "id": 8083368,
                     *                 "name": "Project Management"
                     *               }
                     *             },
                     *             {
                     *               "id": 155505016,
                     *               "billable": false,
                     *               "is_active": true,
                     *               "created_at": "2017-06-26T21:52:18Z",
                     *               "updated_at": "2017-06-26T21:54:06Z",
                     *               "hourly_rate": 100,
                     *               "budget": null,
                     *               "task": {
                     *                 "id": 8083369,
                     *                 "name": "Research"
                     *               }
                     *             }
                     *           ]
                     *         },
                     *         {
                     *           "id": 125068553,
                     *           "is_project_manager": true,
                     *           "is_active": true,
                     *           "use_default_rates": false,
                     *           "budget": null,
                     *           "created_at": "2017-06-26T22:32:52Z",
                     *           "updated_at": "2017-06-26T22:32:52Z",
                     *           "hourly_rate": 100,
                     *           "project": {
                     *             "id": 14307913,
                     *             "name": "Marketing Website",
                     *             "code": "MW"
                     *           },
                     *           "client": {
                     *             "id": 5735774,
                     *             "name": "ABC Corp"
                     *           },
                     *           "task_assignments": [
                     *             {
                     *               "id": 155502709,
                     *               "billable": true,
                     *               "is_active": true,
                     *               "created_at": "2017-06-26T21:36:23Z",
                     *               "updated_at": "2017-06-26T21:36:23Z",
                     *               "hourly_rate": 100,
                     *               "budget": null,
                     *               "task": {
                     *                 "id": 8083365,
                     *                 "name": "Graphic Design"
                     *               }
                     *             },
                     *             {
                     *               "id": 155502710,
                     *               "billable": true,
                     *               "is_active": true,
                     *               "created_at": "2017-06-26T21:36:23Z",
                     *               "updated_at": "2017-06-26T21:36:23Z",
                     *               "hourly_rate": 100,
                     *               "budget": null,
                     *               "task": {
                     *                 "id": 8083366,
                     *                 "name": "Programming"
                     *               }
                     *             },
                     *             {
                     *               "id": 155502711,
                     *               "billable": true,
                     *               "is_active": true,
                     *               "created_at": "2017-06-26T21:36:23Z",
                     *               "updated_at": "2017-06-26T21:36:23Z",
                     *               "hourly_rate": 100,
                     *               "budget": null,
                     *               "task": {
                     *                 "id": 8083368,
                     *                 "name": "Project Management"
                     *               }
                     *             },
                     *             {
                     *               "id": 155505153,
                     *               "billable": false,
                     *               "is_active": true,
                     *               "created_at": "2017-06-26T21:53:20Z",
                     *               "updated_at": "2017-06-26T21:54:31Z",
                     *               "hourly_rate": 100,
                     *               "budget": null,
                     *               "task": {
                     *                 "id": 8083369,
                     *                 "name": "Research"
                     *               }
                     *             }
                     *           ]
                     *         }
                     *       ],
                     *       "per_page": 2000,
                     *       "total_pages": 1,
                     *       "total_entries": 2,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/users/1782959/project_assignments?page=1&per_page=2000",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/users/1782959/project_assignments?page=1&per_page=2000"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["ProjectAssignments"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listAssignedTeammatesForSpecificUser: {
        parameters: {
            query?: {
                /**
                 * @deprecated
                 * @description DEPRECATED The page number to use in pagination. For instance, if you make a list request and receive 100 records, your subsequent call can include page=2 to retrieve the next page of the list. (Default: 1)
                 */
                page?: number;
                /** @description Pagination cursor */
                cursor?: string;
                /** @description The number of records to return per page. Can range between 1 and 2000. (Default: 2000) */
                per_page?: number;
            };
            header?: never;
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all assigned teammates for a specific user */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "teammates": [
                     *         {
                     *           "id": 3230547,
                     *           "first_name": "Jim",
                     *           "last_name": "Allen",
                     *           "email": "jimallen@example.com"
                     *         },
                     *         {
                     *           "id": 1782884,
                     *           "first_name": "Bob",
                     *           "last_name": "Powell",
                     *           "email": "bobpowell@example.com"
                     *         }
                     *       ],
                     *       "per_page": 100,
                     *       "total_pages": 1,
                     *       "total_entries": 2,
                     *       "next_page": null,
                     *       "previous_page": null,
                     *       "page": 1,
                     *       "links": {
                     *         "first": "https://api.harvestapp.com/v2/users/1782959/teammates?page=1&per_page=100",
                     *         "next": null,
                     *         "previous": null,
                     *         "last": "https://api.harvestapp.com/v2/users/1782959/teammates?page=1&per_page=100"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Teammates"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateUserAssignedTeammates: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: string;
            };
            cookie?: never;
        };
        /** @description json payload */
        requestBody: {
            content: {
                "application/json": {
                    /** @description Full list of user IDs to be assigned to the Manager. */
                    teammate_ids: string[] | null;
                };
            };
        };
        responses: {
            /** @description Update a user’s assigned teammates */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "teammates": [
                     *         {
                     *           "id": 3230547,
                     *           "first_name": "Jim",
                     *           "last_name": "Allen",
                     *           "email": "jimallen@example.com"
                     *         },
                     *         {
                     *           "id": 3230575,
                     *           "first_name": "Gary",
                     *           "last_name": "Brookes",
                     *           "email": "gary@example.com"
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["TeammatesPatchResponse"];
                };
            };
            /** @description error payload */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
}
