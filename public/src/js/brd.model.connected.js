brd.model.connected = (function() {
    'use strict'
    var user = {
        name: undefined,
        salary: 0,
        salaryType: 'monthly',
        months: {

        }
    };

    var state, initModule, add, setSalary, getSalary, addMonth, getMonthData, deleteTransaction, getMonthTransactions, getTransaction,
        subtract;

    //Well-formed date ('YYYY-MM') assumed.
    //getMonthData does this and more.
    getMonthTransactions = function(date, callback) {
        var months = user.months;
        $.ajax({
            type: 'GET',
            url: '/transactions',
            data: date,
            success: function (data) {
                //any necessary checks? Convert data?
                months[date] = data;
                callback(months[date]);
            },
            error: function () {
                console.log('Error finding transactions');
                months[date] = {};
                callback(months[date]);
            }
        });
    };

    //Right now, transaction should be loaded into model already.
    getTransactionById = function(id, callback) {
        var months = user.months, month, date;
        for (date in user.months) {
            month = user.months[date];
            if (month.transactions.hasOwnProperty(id)) {
                callback(month.transactions[id]);
            }
            break;
        }
    };

    //Triggers two events.
    deleteTransaction = function(id, callback) {
        $.ajax({
            type: 'DELETE',
            url: '/transactions',
            data: id,
            success: function(id) {
                var months = user.months, month, date, transaction;
                for (date in months) {
                    month = user.months[date];
                    if (month.transactions.hasOwnProperty(id)) {
                        transaction = month.transactions[id];
                        delete month.transactions[id];
                    }
                    break;
                }

                subtract(transaction.amount, transaction.type, month);
                $.event.trigger(brd.event.transactionDeleted, [transaction]);
                $.event.trigger(brd.event.modelUpdate, [transaction, month.expenses, month.income + month.salary]);
                callback(transaction);
            },
            error: function() {
                console.log('Something went wrong...');
                callback(false);
            }
        });
    };

    subtract = function(amount, type, date) {
        var month = user.months[date];
        if (type === 'expense') {
            month.expenses -= amount;
        } else if (type === 'income') {
            month.income -= amount;
        }
    };

    getMonthData = function(date) {
        var months = user.months;
        if (months[date]) {
            return months[date];
        }
        $.ajax({
            type: 'GET',
            url: '/months',
            data: date,
            success: function (data) {
                //any necessary checks? Convert data?
                months[date] = data;
                callback(months[date]);
            },
            error: function () {
                console.log('Something went wrong when getting month data.');
                months[date] = {
                    salary: 0,
                    salaryType: 'monthly',
                    transactions: {}
                };
                callback(months[date]);
            }
        });

        //TODO: Need to handle months that have no data in the backend.


    };

    //Not needed anymore.
    //addMonth = function() {
    //
    //};

    //Will get user's set salary?
    //if date parameter, get date's salary?
    getSalary = function(/*date*/) {

    };

    //TODO: figure out how to handle setting salary
    //1-setting salary updates current month's salary as well as any later months that already have transactions
    //(and thus have a set salary).
    setSalary = function(salary) {

    };

    //TODO: do.
    add = function() {

    };

    initModule = function() {
        //Necessary?
    };

    return {
        initModule: initModule,
        add: add,
        setSalary: setSalary,
        getSalary: getSalary,
        addMonth: addMonth,
        getMonthData: getMonthData,
        deleteTransaction: deleteTransaction,
        getMonthTransactions: getMonthTransactions,
        getTransaction: getTransactionById
    };

}());