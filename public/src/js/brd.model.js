brd.model = (function() {
    'use strict';
    var modelType, initModule, send;

    send = function() {
        var method = this.valueOf();
        return brd.model[modelType][method].apply(null, arguments);
    };

    initModule = function(online) {
        modelType = online ? 'connected' : 'local';
        brd.model[modelType].initModule();
    };

    return {
        initModule: initModule,
        add: send.bind('add'),
        setSalary: send.bind('setSalary'),
        getSalary: send.bind('getSalary'),
        addMonth: send.bind('addMonth'),
        getMonthData: send.bind('getMonthData'),
        deleteTransaction: send.bind('deleteTransaction'),
        getMonthTransactions: send.bind('getMonthTransactions'),
        getTransaction: send.bind('getTransaction')
    };

}());