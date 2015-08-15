brd.model.connected = (function() {
    'use strict'

    var state, initModule, add, setSalary, getSalary, addMonth, getMonthData, deleteTransaction, getMonthTransactions, getTransaction;


    return {
        initModule: initModule,
        add: add,
        setSalary: setSalary,
        getSalary: getSalary,
        addMonth: addMonth,
        getMonthData: getMonthData,
        deleteTransaction: deleteTransaction,
        getMonthTransactions: getMonthTransactions,
        getTransaction: getTransaction
    };

}());