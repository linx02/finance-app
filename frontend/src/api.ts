const baseUrl = `${import.meta.env.VITE_API_URL}/api`;

const GET = async (path: string) => {
    const response = await fetch(`${baseUrl}${path}`);
    console.log(baseUrl);
    return response.json();
};

const POST = async (path: string, data: any) => {
    const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response.json();
};

const PATCH = async (path: string, data: any) => {
    const response = await fetch(`${baseUrl}${path}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response.json();
}

export const DELETE = async (path: string) => {
    const response = await fetch(`${baseUrl}${path}`, {
        method: 'DELETE',
    });
    return response.json();
};

export const getAllInvoices = async () => {
    return GET('/invoices');
}

export const getInvoice = async (id: number) => {
    return GET(`/invoices/${id}`);
}

export const createInvoice = async (data: any) => {
    return POST('/invoices', data);
}

export const uploadInvoice = async (data: any) => {
    const response = await fetch(`${baseUrl}/invoices/upload`, {
        method: 'POST',
        body: data,
    });
    return response.json();
}

export const getStatistics = async () => {
    return GET('/statistics');
}

export const getAllExpenses = async () => {
    return GET('/expenses');
}

export const createExpense = async (data: any) => {
    return POST('/expenses', data);
}

export const createIncome = async (data: any) => {
    return POST('/incomes', data);
}

export const updateInvoice = async (data: any) => {
    return PATCH(`/invoices/${data.id}`, data);
}

export const deleteInvoice = async (id: number) => {
    return DELETE(`/invoices/${id}`);
}

export const getTransactions = async (fromDate: string, toDate: string) => {
    return GET(`/transactions/${fromDate}/${toDate}`);
}

export const getBalance = async () => {
    return GET('/balance');
}

export const getEmails = async () => {
    return GET('/emails');
}

export const deleteEmail = async (id: number) => {
    return DELETE(`/emails/${id}`);
}

export const updateExpense = async (data: any) => {
    return PATCH(`/expenses/${data.id}`, data);
}

export const deleteExpense = async (id: number) => {
    return DELETE(`/expenses/${id}`);
}

export const getExpense = async (id: number) => {
    return GET(`/expenses/${id}`);
}